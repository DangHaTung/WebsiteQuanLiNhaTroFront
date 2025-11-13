import React, { useEffect, useState } from "react";
import { Button, Card, InputNumber, message, Space, Table, Tag, Typography, Row, Col, Statistic, Modal, Alert, Descriptions, Divider } from "antd";
import { FileTextOutlined, ThunderboltOutlined, CheckOutlined, EyeOutlined, CalculatorOutlined } from "@ant-design/icons";
import { roomFeeService, type FeeCalculation } from "../services/roomFee";
import type { ColumnsType } from "antd/es/table";
import type { Bill } from "../../../types/bill";
import type { Contract } from "../../../types/contract";
import dayjs from "dayjs";
import { adminBillService } from "../services/bill";

const { Title, Text } = Typography;

interface DraftBillWithElectricity extends Bill {
  electricityKwh?: number;
  occupantCount?: number;
}

const DraftBills: React.FC = () => {
  const [draftBills, setDraftBills] = useState<DraftBillWithElectricity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [calculatingBill, setCalculatingBill] = useState<string | null>(null);
  const [calculationResult, setCalculationResult] = useState<FeeCalculation | null>(null);
  const [calculationVisible, setCalculationVisible] = useState(false);

  useEffect(() => {
    loadDraftBills();
  }, []);

  const loadDraftBills = async () => {
    try {
      setLoading(true);
      const data = await adminBillService.getDrafts({ limit: 100 });
      // Initialize với electricityKwh = 0
      const billsWithElectricity = data.map(bill => ({
        ...bill,
        electricityKwh: 0,
        occupantCount: 1,
      }));
      setDraftBills(billsWithElectricity);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải hóa đơn nháp");
    } finally {
      setLoading(false);
    }
  };

  const handleElectricityChange = (billId: string, value: number | null) => {
    setDraftBills(prev =>
      prev.map(bill =>
        bill._id === billId ? { ...bill, electricityKwh: value || 0 } : bill
      )
    );
  };

  const handleOccupantChange = (billId: string, value: number | null) => {
    setDraftBills(prev =>
      prev.map(bill =>
        bill._id === billId ? { ...bill, occupantCount: value || 1 } : bill
      )
    );
  };

  const handleCalculate = async (bill: DraftBillWithElectricity) => {
    if (!bill.electricityKwh && bill.electricityKwh !== 0) {
      message.warning("Vui lòng nhập số điện trước");
      return;
    }

    const contractId = bill.contractId;
    if (typeof contractId !== "object" || !contractId.roomId) {
      message.error("Không tìm thấy thông tin phòng");
      return;
    }

    const roomId = typeof contractId.roomId === "object" ? contractId.roomId._id! : contractId.roomId;

    try {
      setCalculatingBill(bill._id);
      const result = await roomFeeService.calculateFees(roomId, bill.electricityKwh, bill.occupantCount || 1);
      setCalculationResult(result);
      setCalculationVisible(true);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tính toán chi phí");
    } finally {
      setCalculatingBill(null);
    }
  };

  const handlePublishSingle = async (bill: DraftBillWithElectricity) => {
    if (!bill.electricityKwh && bill.electricityKwh !== 0) {
      message.warning("Vui lòng nhập số điện");
      return;
    }

    try {
      setPublishing(true);
      await adminBillService.publishDraft(bill._id, {
        electricityKwh: bill.electricityKwh,
        occupantCount: bill.occupantCount || 1,
      });
      message.success("Phát hành hóa đơn thành công!");
      loadDraftBills();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi phát hành hóa đơn");
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishBatch = async () => {
    const billsToPublish = draftBills.filter(bill => selectedBills.includes(bill._id));
    
    if (billsToPublish.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 hóa đơn");
      return;
    }

    // Kiểm tra tất cả đã nhập số điện chưa
    const missingElectricity = billsToPublish.filter(bill => bill.electricityKwh === undefined || bill.electricityKwh === null);
    if (missingElectricity.length > 0) {
      message.warning("Vui lòng nhập số điện cho tất cả hóa đơn đã chọn");
      return;
    }

    try {
      setPublishing(true);
      const payload = billsToPublish.map(bill => ({
        billId: bill._id,
        electricityKwh: bill.electricityKwh!,
        occupantCount: bill.occupantCount || 1,
      }));

      const result = await adminBillService.publishBatch(payload);
      message.success(`Phát hành ${result.data.success.length} hóa đơn thành công!`);
      
      if (result.data.failed.length > 0) {
        message.warning(`${result.data.failed.length} hóa đơn thất bại`);
      }

      setSelectedBills([]);
      loadDraftBills();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi phát hành hóa đơn");
    } finally {
      setPublishing(false);
    }
  };

  const handlePreview = () => {
    const billsToPreview = draftBills.filter(bill => selectedBills.includes(bill._id));
    
    if (billsToPreview.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 hóa đơn");
      return;
    }

    const totalAmount = billsToPreview.reduce((sum, bill) => {
      // Tính tạm (chưa chính xác, cần call API để tính đúng)
      return sum + (bill.amountDue || 0);
    }, 0);

    setPreviewData({
      bills: billsToPreview,
      totalAmount,
      count: billsToPreview.length,
    });
    setPreviewVisible(true);
  };

  const getContractInfo = (contractId: string | Contract): { roomNumber: string; tenantName: string } => {
    if (typeof contractId === "object" && contractId) {
      const roomNumber = typeof contractId.roomId === "object" ? contractId.roomId?.roomNumber : "N/A";
      const tenantName = typeof contractId.tenantId === "object" ? contractId.tenantId?.fullName : "N/A";
      return { roomNumber, tenantName };
    }
    return { roomNumber: "N/A", tenantName: "N/A" };
  };

  const columns: ColumnsType<DraftBillWithElectricity> = [
    {
      title: "Phòng",
      dataIndex: "contractId",
      key: "room",
      width: 100,
      render: (contractId: string | Contract) => {
        const { roomNumber } = getContractInfo(contractId);
        return <b>{roomNumber}</b>;
      },
    },
    {
      title: "Người thuê",
      dataIndex: "contractId",
      key: "tenant",
      width: 150,
      render: (contractId: string | Contract) => {
        const { tenantName } = getContractInfo(contractId);
        return tenantName;
      },
    },
    {
      title: "Ngày lập",
      dataIndex: "billingDate",
      key: "billingDate",
      width: 120,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Số điện (kWh)",
      key: "electricity",
      width: 150,
      render: (_: any, record: DraftBillWithElectricity) => (
        <InputNumber
          min={0}
          value={record.electricityKwh}
          onChange={(value) => handleElectricityChange(record._id, value)}
          placeholder="Nhập số điện"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Số người",
      key: "occupant",
      width: 120,
      render: (_: any, record: DraftBillWithElectricity) => (
        <InputNumber
          min={1}
          value={record.occupantCount}
          onChange={(value) => handleOccupantChange(record._id, value)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Tiền phòng (₫)",
      dataIndex: "amountDue",
      key: "amountDue",
      align: "right",
      width: 150,
      render: (amount: number) => amount.toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 100,
      render: () => <Tag color="orange">Nháp</Tag>,
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      width: 200,
      render: (_: any, record: DraftBillWithElectricity) => (
        <Space>
          <Button
            size="small"
            icon={<CalculatorOutlined />}
            onClick={() => handleCalculate(record)}
            loading={calculatingBill === record._id}
            disabled={!record.electricityKwh && record.electricityKwh !== 0}
          >
            Tính
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handlePublishSingle(record)}
            loading={publishing}
            disabled={!record.electricityKwh && record.electricityKwh !== 0}
          >
            Phát hành
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedBills,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedBills(selectedRowKeys as string[]);
    },
  };

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <FileTextOutlined style={{ color: "#fa8c16", fontSize: 28 }} /> Hóa đơn nháp
            </Title>
          </Col>
        </Row>

        {/* Alert */}
        <Alert
          message="Hướng dẫn"
          description="Hóa đơn nháp được tạo tự động vào ngày 5 hàng tháng. Vui lòng nhập số điện tiêu thụ cho từng phòng và phát hành để tenant có thể thanh toán."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Tổng hóa đơn nháp"
                value={draftBills.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Đã chọn"
                value={selectedBills.length}
                prefix={<CheckOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  disabled={selectedBills.length === 0}
                  block
                >
                  Xem trước
                </Button>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={handlePublishBatch}
                  loading={publishing}
                  disabled={selectedBills.length === 0}
                  block
                  style={{ background: "#52c41a", borderColor: "#52c41a" }}
                >
                  Phát hành đã chọn
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Table<DraftBillWithElectricity>
          columns={columns}
          dataSource={draftBills}
          rowKey={(r) => r._id}
          loading={loading}
          rowSelection={rowSelection}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          size="middle"
        />
      </div>

      {/* Calculation Result Modal */}
      <Modal
        title="Chi tiết tính toán chi phí"
        open={calculationVisible}
        onCancel={() => setCalculationVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCalculationVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {calculationResult && (
          <div>
            <Alert
              message="Kết quả tính toán"
              description="Đây là chi tiết các khoản phí dựa trên số điện và số người đã nhập."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Descriptions title="Chi tiết từng khoản" column={1} bordered>
              {calculationResult.breakdown.map((item, index) => {
                const typeNames: Record<string, string> = {
                  electricity: "⚡ Tiền điện",
                  water: "💧 Tiền nước",
                  internet: "📡 Internet",
                  cleaning: "🧹 Phí dọn dẹp",
                  parking: "🚗 Phí đỗ xe",
                };

                return (
                  <Descriptions.Item key={index} label={typeNames[item.type] || item.type}>
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      {item.kwh !== undefined && <Text>Số điện: {item.kwh} kWh</Text>}
                      {item.occupantCount !== undefined && <Text>Số người: {item.occupantCount}</Text>}
                      {item.baseRate !== undefined && <Text>Đơn giá: {item.baseRate.toLocaleString("vi-VN")} ₫</Text>}
                      {item.subtotal !== undefined && <Text>Tiền điện: {item.subtotal.toLocaleString("vi-VN")} ₫</Text>}
                      {item.vat !== undefined && <Text>VAT: {item.vat.toLocaleString("vi-VN")} ₫</Text>}
                      <Text strong style={{ color: "#1890ff" }}>
                        Tổng: {item.total.toLocaleString("vi-VN")} ₫
                      </Text>
                    </Space>
                  </Descriptions.Item>
                );
              })}
            </Descriptions>

            <Divider />

            <div style={{ textAlign: "right" }}>
              <Space direction="vertical" size="small">
                <Text type="secondary">Tổng cộng:</Text>
                <Text strong style={{ fontSize: 24, color: "#52c41a" }}>
                  {calculationResult.total.toLocaleString("vi-VN")} ₫
                </Text>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Xem trước hóa đơn"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="publish"
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={() => {
              setPreviewVisible(false);
              handlePublishBatch();
            }}
            loading={publishing}
          >
            Xác nhận phát hành
          </Button>,
        ]}
        width={700}
      >
        {previewData && (
          <div>
            <Alert
              message={`Sẽ phát hành ${previewData.count} hóa đơn`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              dataSource={previewData.bills}
              rowKey="_id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Phòng",
                  dataIndex: "contractId",
                  render: (contractId: string | Contract) => {
                    const { roomNumber } = getContractInfo(contractId);
                    return roomNumber;
                  },
                },
                {
                  title: "Số điện",
                  dataIndex: "electricityKwh",
                  render: (v: number) => `${v} kWh`,
                },
                {
                  title: "Tạm tính",
                  dataIndex: "amountDue",
                  align: "right",
                  render: (v: number) => v.toLocaleString("vi-VN") + " ₫",
                },
              ]}
            />
            <div style={{ marginTop: 16, textAlign: "right", fontSize: 16, fontWeight: 600 }}>
              Tổng tạm tính: {previewData.totalAmount.toLocaleString("vi-VN")} ₫
            </div>
            <Alert
              message="Lưu ý"
              description="Số tiền trên chỉ là tạm tính. Số tiền chính xác sẽ được tính lại khi phát hành (bao gồm tiền điện theo bậc thang)."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DraftBills;
