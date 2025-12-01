// Import các thư viện cần thiết
import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Descriptions,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { adminMoveOutRequestService } from "../services/moveOutRequest";
import { adminContractService } from "../services/contract";
import type { MoveOutRequest } from "../../client/services/moveOutRequest";
import api from "../services/api";
import { roomFeeService, type FeeCalculation } from "../services/roomFee";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Helper function để convert Decimal128 sang number
const dec = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v) || 0;
  if (typeof v === "object") {
    // MongoDB Decimal128 có thể có $numberDecimal
    if (typeof (v as any).$numberDecimal === "string") return Number((v as any).$numberDecimal) || 0;
    // Hoặc có method toString()
    if (typeof (v as any).toString === "function") {
      const s = (v as any).toString();
      const n = Number(s);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
};

/**
 * Component quản lý các yêu cầu chuyển đi của người dùng (Admin)
 * - Hiển thị danh sách yêu cầu chuyển đi
 * - Xử lý phê duyệt/từ chối yêu cầu
 * - Tính toán và xử lý hoàn tiền
 */
const MoveOutRequestsAD: React.FC = () => {
  const [requests, setRequests] = useState<MoveOutRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<MoveOutRequest | null>(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundForm] = Form.useForm();
  const [calculatedServiceFee, setCalculatedServiceFee] = useState<FeeCalculation | null>(null);
  const [roomOccupantCount, setRoomOccupantCount] = useState<number>(1);
  const [totalDepositPaid, setTotalDepositPaid] = useState<number>(0); // Tổng tiền cọc đã thanh toán từ RECEIPT + CONTRACT bills
  
  // Theo dõi giá trị damageAmount từ form để tự động cập nhật hiển thị
  const damageAmount = Form.useWatch("damageAmount", refundForm) || 0;

  // Load lại danh sách yêu cầu khi thay đổi bộ lọc trạng thái
  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  /**
   * Tải danh sách yêu cầu chuyển đi từ API
   * Sử dụng bộ lọc trạng thái nếu được chọn
   */
  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "ALL" ? { status: statusFilter } : {};
      const data = await adminMoveOutRequestService.getAll(params);
      setRequests(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý phê duyệt yêu cầu chuyển đi
   * @param id - ID của yêu cầu cần phê duyệt
   */
  const handleApprove = async (id: string) => {
    try {
      await adminMoveOutRequestService.updateStatus(id, { status: "APPROVED" });
      message.success("Đã duyệt yêu cầu");
      loadRequests();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi duyệt yêu cầu");
    }
  };

  /**
   * Xử lý từ chối yêu cầu chuyển đi
   * @param id - ID của yêu cầu cần từ chối
   * @param adminNote - Ghi chú từ admin khi từ chối
   */
  const handleReject = async (id: string, adminNote?: string) => {
    try {
      await adminMoveOutRequestService.updateStatus(id, {
        status: "REJECTED",
        adminNote,
      });
      message.success("Đã từ chối yêu cầu");
      loadRequests();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi từ chối yêu cầu");
    }
  };

  /**
   * Mở modal xử lý hoàn tiền
   * @param request - Yêu cầu chuyển đi cần xử lý hoàn tiền
   */
  const handleOpenRefundModal = async (request: MoveOutRequest) => {
    setSelectedRequest(request);
    setRefundModalVisible(true);
    refundForm.resetFields();
    setCalculatedServiceFee(null);
    setTotalDepositPaid(0);
    
    // Load room để lấy số người ở (giống DraftBills) và load tổng tiền cọc
    try {
      const contractId = request.contractId._id;
      const contract = await adminContractService.getById(contractId);
      const roomId = typeof contract.roomId === 'object' ? contract.roomId._id : contract.roomId;
      
      // Load tổng tiền cọc từ 2 bills: RECEIPT + CONTRACT
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("admin_token");
      
      let totalDeposit = 0;
      
      // 1. Lấy RECEIPT bill (Cọc giữ phòng)
      const receiptBillsResponse = await fetch(`${apiUrl}/api/bills?contractId=${contractId}&billType=RECEIPT&status=PAID&limit=10`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (receiptBillsResponse.ok) {
        const receiptBillsData = await receiptBillsResponse.json();
        const receiptBills = receiptBillsData.data || [];
        if (receiptBills.length > 0) {
          const receiptPaid = dec(receiptBills[0].amountPaid) || 0;
          totalDeposit += receiptPaid;
          console.log(`[MoveOutRequestsAD] Found RECEIPT bill: amountPaid=${receiptPaid}`);
        }
      }
      
      // 2. Lấy CONTRACT bill (Cọc 1 tháng tiền phòng) - có thể qua finalContractId
      // Tìm FinalContract
      const finalContractsResponse = await fetch(`${apiUrl}/api/final-contracts?originContractId=${contractId}&limit=10`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (finalContractsResponse.ok) {
        const finalContractsData = await finalContractsResponse.json();
        const finalContracts = finalContractsData.data || [];
        
        // Tìm FinalContract SIGNED hoặc có bill CONTRACT đã thanh toán
        for (const fc of finalContracts) {
          const finalContractId = typeof fc._id === 'string' ? fc._id : fc._id;
          const contractBillsResponse = await fetch(`${apiUrl}/api/bills?finalContractId=${finalContractId}&billType=CONTRACT&status=PAID&limit=10`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          
          if (contractBillsResponse.ok) {
            const contractBillsData = await contractBillsResponse.json();
            const contractBills = contractBillsData.data || [];
            if (contractBills.length > 0) {
              const contractPaid = dec(contractBills[0].amountPaid) || 0;
              totalDeposit += contractPaid;
              console.log(`[MoveOutRequestsAD] Found CONTRACT bill: amountPaid=${contractPaid}`);
              break; // Chỉ lấy bill đầu tiên
            }
          }
        }
      }
      
      // Fallback: nếu không tìm thấy, dùng contract.deposit
      if (totalDeposit === 0) {
        totalDeposit = dec(contract.deposit) || 0;
        console.log(`[MoveOutRequestsAD] No paid bills found, using contract.deposit=${totalDeposit}`);
      }
      
      setTotalDepositPaid(totalDeposit);
      console.log(`[MoveOutRequestsAD] Total deposit paid: ${totalDeposit}`);
      
      if (roomId) {
        // Load tất cả rooms với pagination để lấy occupantCount (giống DraftBills)
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("admin_token");
        
        let allRooms: any[] = [];
        let page = 1;
        const limit = 100;
        let hasMore = true;
        
        while (hasMore) {
          try {
            const roomsResponse = await fetch(`${apiUrl}/api/rooms?page=${page}&limit=${limit}`, {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            
            if (!roomsResponse.ok) break;
            
            const roomsData = await roomsResponse.json();
            if (!roomsData.success) break;
            
            const rooms = roomsData.data || [];
            allRooms = [...allRooms, ...rooms];
            
            const pagination = roomsData.pagination;
            hasMore = pagination && page < pagination.totalPages;
            page++;
          } catch (error: any) {
            console.error("Error loading rooms:", error);
            break;
          }
        }
        
        // Tìm room và lấy occupantCount
        const room = allRooms.find((r: any) => String(r._id) === String(roomId));
        if (room && room.occupantCount !== undefined) {
          setRoomOccupantCount(room.occupantCount);
          console.log(`[MoveOutRequestsAD] Loaded occupantCount=${room.occupantCount} for room ${roomId}`);
        } else {
          setRoomOccupantCount(1);
        }
        
        // Tự động tính toán với giá trị mặc định (điện = 0, xe = 0) để bảng tính luôn hiện ra
        setTimeout(() => {
          calculateServiceFee({ electricityKwh: 0, vehicleCount: 0 });
        }, 100);
      }
    } catch (error: any) {
      console.error("Error loading room occupant count:", error);
      setRoomOccupantCount(1);
    }
  };

  /**
   * Tính toán phí dịch vụ dựa trên số điện và số xe
   * @param values - Đối tượng chứa số điện (kWh) và số xe
   */
  const calculateServiceFee = async (values: {
    electricityKwh: number;
    vehicleCount?: number;
  }) => {
    if (!selectedRequest) return;

    try {
      const contractId = selectedRequest.contractId._id;
      const contract = await adminContractService.getById(contractId);
      const roomId = typeof contract.roomId === 'object' ? contract.roomId._id : contract.roomId;

      if (!roomId) {
        message.error("Không tìm thấy thông tin phòng");
        return;
      }

      // Sử dụng roomFeeService để tính toán giống DraftBills
      // Số người tự động lấy từ roomOccupantCount (đã load khi mở modal)
      const result = await roomFeeService.calculateFees(
        roomId,
        values.electricityKwh || 0,
        roomOccupantCount, // Tự động lấy từ room
        values.vehicleCount || 0
      );

      setCalculatedServiceFee(result);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tính phí dịch vụ");
    }
  };

  /**
   * Xử lý hoàn tiền cọc cho người thuê
   * @param values - Đối tượng chứa thông tin hoàn tiền (số điện, số xe, tiền bồi thường, v.v.)
   */
  const handleRefund = async (values: any) => {
    if (!selectedRequest) return;

    try {
      const contractId = selectedRequest.contractId._id;
      await adminContractService.refundDeposit(contractId, {
        electricityKwh: values.electricityKwh || 0,
        waterM3: 0, // Không cần nhập nước, tính tự động
        occupantCount: roomOccupantCount, // Tự động lấy từ room
        vehicleCount: values.vehicleCount || 0,
        damageAmount: values.damageAmount || 0,
        damageNote: values.damageNote,
        method: values.method || "BANK",
        transactionId: values.transactionId,
        note: values.note,
      });

      if (selectedRequest?._id) {
        await adminMoveOutRequestService.complete(selectedRequest._id);
      }
      message.success("Hoàn cọc thành công");
      setRefundModalVisible(false);
      refundForm.resetFields();
      setCalculatedServiceFee(null);
      setRoomOccupantCount(1);
      loadRequests();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi hoàn cọc");
    }
  };

  /**
   * Tạo tag hiển thị trạng thái yêu cầu với màu sắc tương ứng
   * @param status - Trạng thái của yêu cầu (PENDING, APPROVED, REJECTED, COMPLETED)
   * @returns ReactNode - Thẻ Tag với màu sắc và văn bản phù hợp
   */
  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      PENDING: { color: "processing", text: "Chờ xử lý" },
      APPROVED: { color: "success", text: "Đã duyệt" },
      REJECTED: { color: "error", text: "Từ chối" },
      COMPLETED: { color: "default", text: "Đã hoàn tất" },
    };
    const s = map[status] || { color: "default", text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  // Cấu hình các cột cho bảng hiển thị danh sách yêu cầu
  const columns: ColumnsType<MoveOutRequest> = [
    {
      title: "Phòng",
      dataIndex: ["roomId", "roomNumber"],
      key: "roomNumber",
    },
    {
      title: "Người thuê",
      key: "tenant",
      render: (_: any, record: MoveOutRequest) => (
        <div>
          <div>{record.tenantId.fullName}</div>
          <small style={{ color: "#666" }}>{record.tenantId.phone}</small>
        </div>
      ),
    },
    {
      title: "Ngày dự kiến chuyển đi",
      dataIndex: "moveOutDate",
      key: "moveOutDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: MoveOutRequest) => (
        <Space>
          {record.status === "PENDING" && (
            <>
              <Button
                size="small"
                type="primary"
                onClick={() => handleApprove(record._id)}
              >
                Duyệt
              </Button>
              <Button
                size="small"
                danger
                onClick={() => {
                  Modal.confirm({
                    title: "Từ chối yêu cầu",
                    content: (
                      <Input
                        placeholder="Nhập lý do từ chối (tùy chọn)"
                        onChange={(e) => {
                          const note = e.target.value;
                          Modal.destroyAll();
                          handleReject(record._id, note);
                        }}
                      />
                    ),
                    onOk: () => {},
                  });
                }}
              >
                Từ chối
              </Button>
            </>
          )}
          {record.status === "APPROVED" && (
            <Button
              size="small"
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => handleOpenRefundModal(record)}
            >
              Hoàn cọc
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Lọc danh sách yêu cầu dựa trên bộ lọc trạng thái
  const filteredRequests = statusFilter === "ALL"
    ? requests
    : requests.filter(r => r.status === statusFilter);

  // Đếm số lượng yêu cầu theo từng trạng thái để hiển thị thống kê
  const pendingCount = requests.filter(r => r.status === "PENDING").length;
  const approvedCount = requests.filter(r => r.status === "APPROVED").length;
  const completedCount = requests.filter(r => r.status === "COMPLETED").length;

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý Yêu cầu Chuyển đi / Hoàn cọc
            </Title>
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 200 }}
            >
              <Select.Option value="ALL">Tất cả</Select.Option>
              <Select.Option value="PENDING">Chờ xử lý</Select.Option>
              <Select.Option value="APPROVED">Đã duyệt</Select.Option>
              <Select.Option value="REJECTED">Từ chối</Select.Option>
              <Select.Option value="COMPLETED">Đã hoàn tất</Select.Option>
            </Select>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Chờ xử lý"
                value={pendingCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đã duyệt"
                value={approvedCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đã hoàn tất"
                value={completedCount}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record: MoveOutRequest) => (
              <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 8 }}>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Ngày tạo">
                    {dayjs(record.requestedAt).format("DD/MM/YYYY HH:mm")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lý do">
                    {record.reason}
                  </Descriptions.Item>
                  {record.adminNote && (
                    <Descriptions.Item label="Ghi chú từ admin" span={2}>
                      {record.adminNote}
                    </Descriptions.Item>
                  )}
                  {record.processedBy && (
                    <Descriptions.Item label="Người xử lý">
                      {record.processedBy.fullName}
                    </Descriptions.Item>
                  )}
                  {record.processedAt && (
                    <Descriptions.Item label="Thời gian xử lý">
                      {dayjs(record.processedAt).format("DD/MM/YYYY HH:mm")}
                    </Descriptions.Item>
                  )}
                  {record.status === "COMPLETED" && record.contractId.depositRefund && (() => {
                    const deposit = dec(record.contractId.deposit);
                    const serviceFee = dec(record.contractId.depositRefund.finalMonthServiceFee || 0);
                    const damage = dec(record.contractId.depositRefund.damageAmount || 0);
                    // Tính lại số tiền hoàn lại để đảm bảo đúng (tiền cọc - dịch vụ - thiệt hại)
                    const calculatedRefund = deposit - serviceFee - damage;
                    const savedRefund = dec(record.contractId.depositRefund.amount);
                    
                    return (
                      <>
                        <Descriptions.Item label="Tiền cọc ban đầu">
                          <strong style={{ color: "#1890ff", fontSize: 16 }}>
                            {deposit.toLocaleString("vi-VN")} ₫
                          </strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Dịch vụ tháng cuối (không bao gồm tiền phòng)">
                          <span style={{ color: "#ff4d4f" }}>
                            - {serviceFee.toLocaleString("vi-VN")} ₫
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Thiệt hại">
                          <span style={{ color: "#ff4d4f" }}>
                            - {damage.toLocaleString("vi-VN")} ₫
                          </span>
                        </Descriptions.Item>
                        <Divider style={{ margin: "8px 0" }} />
                        <Descriptions.Item label="Số tiền hoàn lại">
                          <strong style={{ color: "#52c41a", fontSize: 18 }}>
                            {calculatedRefund.toLocaleString("vi-VN")} ₫
                          </strong>
                          {Math.abs(calculatedRefund - savedRefund) > 1 && (
                            <div style={{ fontSize: 12, color: "#ff4d4f", marginTop: 4 }}>
                              (Đã sửa: {savedRefund.toLocaleString("vi-VN")} ₫ → {calculatedRefund.toLocaleString("vi-VN")} ₫)
                            </div>
                          )}
                        </Descriptions.Item>
                      </>
                    );
                  })()}
                </Descriptions>
              </div>
            ),
          }}
        />
      </div>

      {/* Modal Hoàn cọc */}
      <Modal
        title="Hoàn cọc"
        open={refundModalVisible}
        onCancel={() => {
          setRefundModalVisible(false);
          refundForm.resetFields();
          setCalculatedServiceFee(null);
          setRoomOccupantCount(1);
        }}
        onOk={() => refundForm.submit()}
        width={800}
      >
        {selectedRequest && (
          <Form
            form={refundForm}
            layout="vertical"
            onFinish={handleRefund}
            onValuesChange={(changedValues, allValues) => {
              // Tự động tính toán khi thay đổi số điện hoặc số xe
              if (changedValues.electricityKwh !== undefined || 
                  changedValues.vehicleCount !== undefined) {
                calculateServiceFee(allValues);
              }
            }}
          >
            <Descriptions title="Thông tin hợp đồng" bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Phòng">
                {selectedRequest.roomId.roomNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Người thuê">
                {selectedRequest.tenantId.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Tiền cọc ban đầu">
                <strong style={{ color: "#1890ff", fontSize: 16 }}>
                  {selectedRequest.contractId.deposit.toLocaleString("vi-VN")} ₫
                </strong>
              </Descriptions.Item>
            </Descriptions>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Số điện (kWh)"
                  name="electricityKwh"
                  initialValue={0}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: "100%" }} 
                    placeholder="Nhập số điện"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Số xe"
                  name="vehicleCount"
                  initialValue={0}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: "100%" }} 
                    placeholder="Nhập số xe"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Số người ở">
              <InputNumber 
                value={roomOccupantCount} 
                disabled 
                style={{ width: "100%" }}
              />
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                (Tự động lấy từ quản lý phòng)
              </div>
            </Form.Item>

            {calculatedServiceFee && calculatedServiceFee.breakdown && calculatedServiceFee.breakdown.length > 0 && (
              <Card size="small" style={{ marginBottom: 16, background: "#f0f2f5" }}>
                <Alert
                  message="Chi tiết dịch vụ tháng cuối"
                  description="Đây là chi tiết các khoản phí dựa trên số điện, số người và số xe đã nhập."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Descriptions title="Chi tiết từng khoản" column={1} bordered>
                  {calculatedServiceFee.breakdown
                    .filter((item) => item.type !== "rent") // Bỏ tiền thuê phòng
                    .map((item, index) => {
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
                            {item.vehicleCount !== undefined && <Text>Số xe: {item.vehicleCount}</Text>}
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
                    <Text type="secondary">Tổng dịch vụ (không bao gồm tiền phòng):</Text>
                    <Text strong style={{ fontSize: 20, color: "#52c41a" }}>
                      {calculatedServiceFee.breakdown
                        .filter((item) => item.type !== "rent")
                        .reduce((sum, item) => sum + (item.total || 0), 0)
                        .toLocaleString("vi-VN")} ₫
                    </Text>
                  </Space>
                </div>
              </Card>
            )}

            <Form.Item
              label="Thiệt hại (VNĐ)"
              name="damageAmount"
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Ghi chú thiệt hại"
              name="damageNote"
            >
              <TextArea rows={2} maxLength={500} />
            </Form.Item>

            <Form.Item
              label="Phương thức hoàn cọc"
              name="method"
              initialValue="BANK"
            >
              <Select>
                <Select.Option value="BANK">Chuyển khoản</Select.Option>
                <Select.Option value="CASH">Tiền mặt</Select.Option>
                <Select.Option value="OTHER">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Mã giao dịch"
              name="transactionId"
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Ghi chú"
              name="note"
            >
              <TextArea rows={2} maxLength={500} />
            </Form.Item>

            {(calculatedServiceFee || damageAmount) && selectedRequest && (
              <Card size="small" style={{ marginTop: 16, background: "#e6f7ff" }}>
                <Descriptions title="Tính toán hoàn cọc" bordered column={1} size="small">
                  <Descriptions.Item label="Tiền cọc ban đầu (Cọc giữ phòng + Cọc 1 tháng tiền phòng)">
                    <strong style={{ color: "#1890ff", fontSize: 16 }}>
                      {(totalDepositPaid || dec(selectedRequest.contractId.deposit) || 0).toLocaleString("vi-VN")} ₫
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Dịch vụ tháng cuối (không bao gồm tiền phòng)">
                    <span style={{ color: "#ff4d4f" }}>
                      - {(calculatedServiceFee?.breakdown
                        ?.filter((item) => item.type !== "rent")
                        .reduce((sum, item) => sum + (item.total || 0), 0) || 0)
                        .toLocaleString("vi-VN")} ₫
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thiệt hại">
                    <span style={{ color: "#ff4d4f" }}>
                      - {Number(damageAmount || 0).toLocaleString("vi-VN")} ₫
                    </span>
                  </Descriptions.Item>
                  <Divider style={{ margin: "8px 0" }} />
                  <Descriptions.Item label="Số tiền hoàn lại">
                    <strong style={{ color: "#52c41a", fontSize: 18 }}>
                      {(
                        (totalDepositPaid || dec(selectedRequest.contractId.deposit) || 0) -
                        (calculatedServiceFee?.breakdown
                          ?.filter((item) => item.type !== "rent")
                          .reduce((sum, item) => sum + (item.total || 0), 0) || 0) -
                        Number(damageAmount || 0)
                      ).toLocaleString("vi-VN")} ₫
                    </strong>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default MoveOutRequestsAD;

