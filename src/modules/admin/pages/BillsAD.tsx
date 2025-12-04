import React, { useEffect, useMemo, useState } from "react";
import { Table, Tag, Typography, message, Row, Col, Statistic, Button, Modal, Image, Alert, Space, Input } from "antd";
import { FileTextOutlined, DollarOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Bill, BillStatus, BillType } from "../../../types/bill";
import type { Tenant } from "../../../types/tenant";
import type { Room } from "../../../types/room";
import dayjs from "dayjs";
import { adminBillService } from "../services/bill";
import { adminTenantService } from "../services/tenant";
import { adminRoomService } from "../services/room";
import BillDetailDrawer from "../components/BillDetailDrawer";
import "../../../assets/styles/roomAd.css";
import { useSearchParams } from "react-router-dom";

const { Title } = Typography;
const { TextArea } = Input;

interface Contract {
  _id: string;
  tenantId?: { fullName?: string } | string;
  roomId?: { roomNumber?: string } | string;
}

const BillsAD: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [contracts] = useState<Contract[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<BillStatus | "ALL">("ALL");

  // Drawer detail
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | undefined>(
    undefined
  );

  // State để theo dõi đã load các dữ liệu phụ chưa
  const [hasLoadedTenants, setHasLoadedTenants] = useState<boolean>(false);
  const [hasLoadedRooms, setHasLoadedRooms] = useState<boolean>(false);

  // Payment Confirmation Modal States
  const [confirmPaymentModalVisible, setConfirmPaymentModalVisible] = useState(false);
  const [confirmingBillId, setConfirmingBillId] = useState<string | null>(null);
  const [confirmingBillImage, setConfirmingBillImage] = useState<string | null>(null);
  
  // Reject Payment Modal States
  const [rejectPaymentModalVisible, setRejectPaymentModalVisible] = useState(false);
  const [rejectingBillId, setRejectingBillId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadBills();
  }, [statusFilter]);

  // Tự động mở drawer khi có billId trong URL
  useEffect(() => {
    const billId = searchParams.get("billId");
    if (billId && bills.length > 0) {
      setSelectedBillId(billId);
      setDetailVisible(true);
      // Xóa billId khỏi URL sau khi đã mở drawer
      searchParams.delete("billId");
      setSearchParams(searchParams);
    }
  }, [searchParams, bills]);

  // Load bills với filter - chỉ lấy MONTHLY bills
  const loadBills = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100, billType: "MONTHLY" }; // Chỉ lấy hóa đơn hàng tháng
      if (statusFilter && statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      const billsData = await adminBillService.getAll(params);
      // Filter thêm để đảm bảo chỉ có MONTHLY
      const monthlyBills = billsData.filter((b: Bill) => b.billType === "MONTHLY");
      setBills(monthlyBills);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Lỗi khi tải dữ liệu hóa đơn"
      );
    } finally {
      setLoading(false);
    }
  };

  // Load tenants chỉ khi cần (khi mở drawer detail)
  const loadTenantsIfNeeded = async () => {
    if (!hasLoadedTenants) {
      try {
        const tenantsData = await adminTenantService.getAll({ limit: 50 });
        setTenants(tenantsData);
        setHasLoadedTenants(true);
      } catch (error: any) {
        message.error(
          error?.response?.data?.message || "Lỗi khi tải dữ liệu người thuê"
        );
      }
    }
  };

  // Load rooms chỉ khi cần (khi mở drawer detail)
  const loadRoomsIfNeeded = async () => {
    if (!hasLoadedRooms) {
      try {
        const roomsData = await adminRoomService.getAll();
        setRooms(roomsData);
        setHasLoadedRooms(true);
      } catch (error: any) {
        message.error(
          error?.response?.data?.message || "Lỗi khi tải dữ liệu phòng"
        );
      }
    }
  };

  const filteredBills = useMemo(() => {
    // Chỉ hiển thị MONTHLY bills
    return bills.filter((b) => b.billType === "MONTHLY");
  }, [bills]);

  const paidCount = useMemo(
    () => bills.filter((b) => b.billType === "MONTHLY" && b.status === "PAID").length,
    [bills]
  );
  const unpaidCount = useMemo(
    () => bills.filter((b) => b.billType === "MONTHLY" && b.status === "UNPAID").length,
    [bills]
  );
  const partiallyPaidCount = useMemo(
    () => bills.filter((b) => b.billType === "MONTHLY" && b.status === "PARTIALLY_PAID").length,
    [bills]
  );

  const openDetail = async (bill: Bill) => {
    // Load tenants và rooms khi mở drawer detail (nếu chưa load)
    await Promise.all([loadTenantsIfNeeded(), loadRoomsIfNeeded()]);

    setSelectedBillId(bill._id);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedBillId(undefined);
  };

  const handleOpenConfirmModal = async (billId: string, bill: any) => {
    // Nếu bill chưa có metadata, load lại từ API
    if (!bill?.metadata) {
      try {
        const freshBill = await adminBillService.getById(billId);
        bill = freshBill;
      } catch (error) {
        console.error("Error loading bill:", error);
      }
    }
    
    // Lấy ảnh từ metadata
    const receiptImage = bill?.metadata?.cashPaymentRequest?.receiptImage;
    const imageUrl = receiptImage?.secure_url || receiptImage?.url || null;
    
    setConfirmingBillId(billId);
    setConfirmingBillImage(imageUrl);
    setConfirmPaymentModalVisible(true);
  };

  const handleConfirmCashPayment = async () => {
    if (!confirmingBillId) return;
    
    try {
      await adminBillService.confirmPayment(confirmingBillId);
      message.success("Xác nhận thanh toán thành công!");
      await loadBills();
      setConfirmPaymentModalVisible(false);
      setConfirmingBillId(null);
      setConfirmingBillImage(null);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi xác nhận thanh toán");
    }
  };

  const handleOpenRejectModal = () => {
    // Chuyển từ modal xác nhận sang modal từ chối
    setRejectingBillId(confirmingBillId);
    setRejectionReason("");
    setConfirmPaymentModalVisible(false);
    setRejectPaymentModalVisible(true);
  };

  const handleRejectCashPayment = async () => {
    if (!rejectingBillId || !rejectionReason.trim()) {
      message.error("Vui lòng nhập lý do từ chối");
      return;
    }
    
    try {
      await adminBillService.rejectPayment(rejectingBillId, rejectionReason);
      message.success("Đã từ chối thanh toán!");
      await loadBills();
      setRejectPaymentModalVisible(false);
      setRejectingBillId(null);
      setRejectionReason("");
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi từ chối thanh toán");
    }
  };

  // Helper function để lấy tên khách hàng từ contract
  const getTenantName = (
    contractId: string | Contract | null | undefined,
    _record: Bill
  ): string => {
    // Nếu contractId là object và đã được populate
    if (contractId && typeof contractId === "object" && contractId.tenantId) {
      if (
        typeof contractId.tenantId === "object" &&
        contractId.tenantId?.fullName
      ) {
        return contractId.tenantId.fullName;
      }
    }
    return "N/A";
  };

  // Helper function để lấy số phòng từ contract
  const getRoomNumber = (
    contractId: string | Contract | null | undefined,
    _record: Bill
  ): string => {
    // Nếu contractId là object và đã được populate
    if (contractId && typeof contractId === "object" && contractId.roomId) {
      if (
        typeof contractId.roomId === "object" &&
        contractId.roomId?.roomNumber
      ) {
        return contractId.roomId.roomNumber;
      }
    }
    return "N/A";
  };

  const columns: ColumnsType<Bill> = [
    {
      title: "Khách hàng",
      dataIndex: "contractId",
      key: "tenantName",
      width: 200,
      render: (contractId: string | Contract, record: Bill) => {
        return <span>{getTenantName(contractId, record)}</span>;
      },
    },
    {
      title: "Phòng",
      dataIndex: "contractId",
      key: "roomNumber",
      width: 120,
      align: "center",
      render: (contractId: string | Contract, record: Bill) => {
        return <span>{getRoomNumber(contractId, record)}</span>;
      },
    },
    {
      title: "Loại",
      dataIndex: "billType",
      key: "billType",
      align: "center",
      render: (type: BillType) => {
        const map: Record<BillType, { color: string; text: string }> = {
          RECEIPT: { color: "purple", text: "Phiếu thu" },
          CONTRACT: { color: "cyan", text: "Hợp đồng" },
          MONTHLY: { color: "magenta", text: "Hàng tháng" },
        };
        const m = map[type] || { color: "default", text: type };
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
    {
      title: "Ngày lập",
      dataIndex: "billingDate",
      key: "billingDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        { text: "Nháp", value: "DRAFT" },
        { text: "Đã thanh toán", value: "PAID" },
        { text: "Chưa thanh toán", value: "UNPAID" },
        { text: "Thanh toán một phần", value: "PARTIALLY_PAID" },
        { text: "Chờ xác nhận", value: "PENDING_CASH_CONFIRM" },
      ],
      onFilter: (val, record) => record.status === val,
      render: (s: BillStatus) => {
        const map: Record<string, { color: string; text: string }> = {
          DRAFT: { color: "orange", text: "Nháp" },
          PAID: { color: "green", text: "Đã thanh toán" },
          UNPAID: { color: "red", text: "Chưa thanh toán" },
          PARTIALLY_PAID: { color: "orange", text: "Một phần" },
          VOID: { color: "default", text: "Đã hủy" },
          PENDING_CASH_CONFIRM: {
            color: "gold",
            text: "Chờ xác nhận",
          },
        };
        const m = map[s] || { color: "default", text: s || "Trạng thái" };
        return (
          <Tag color={m.color} className="tag-hover">
            {m.text}
          </Tag>
        );
      },
    },
    {
      title: "Phải thu (₫)",
      dataIndex: "amountDue",
      key: "amountDue",
      align: "right",
      render: (_: any, record: Bill) => {
        const due =
          typeof record.amountDue === "number" && !isNaN(record.amountDue)
            ? record.amountDue
            : 0;
        const paid =
          typeof record.amountPaid === "number" && !isNaN(record.amountPaid)
            ? record.amountPaid
            : 0;
        let display = due;
        if (record.status === "PAID") display = 0;
        else if (record.status === "PARTIALLY_PAID")
          display = Math.max(due - paid, 0);
        return display.toLocaleString("vi-VN");
      },
    },
    {
      title: "Đã thu (₫)",
      dataIndex: "amountPaid",
      key: "amountPaid",
      align: "right",
      render: (_: any, record: Bill) => {
        const due =
          typeof record.amountDue === "number" && !isNaN(record.amountDue)
            ? record.amountDue
            : 0;
        const paid =
          typeof record.amountPaid === "number" && !isNaN(record.amountPaid)
            ? record.amountPaid
            : 0;
        let display = paid;
        if (record.status === "UNPAID") display = 0;
        else if (record.status === "PARTIALLY_PAID")
          display = Math.min(paid, due);
        return display.toLocaleString("vi-VN");
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 150,
      render: (_: any, record: Bill) => {
        // Hiển thị nút xác nhận cho bills chờ xác nhận hoặc chưa thanh toán (nếu có ảnh)
        const hasReceiptImage = record.metadata?.cashPaymentRequest?.receiptImage;
        const canConfirm = record.status === "PENDING_CASH_CONFIRM" || 
                          (record.status === "UNPAID" && hasReceiptImage);
        
        if (canConfirm) {
          return (
            <Button
              type="primary"
              icon={<DollarOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenConfirmModal(record._id, record);
              }}
            >
              Xác nhận
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title
              level={3}
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FileTextOutlined style={{ color: "#1890ff", fontSize: 28 }} />{" "}
              Quản lý Hóa đơn hàng tháng
            </Title>
          </Col>
        </Row>

        {/* Statistic - Status */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <div
              style={{ background: "#fafafa", padding: 16, borderRadius: 8 }}
            >
              <Title level={5} style={{ margin: "0 0 12px 0" }}>
                Lọc theo tình trạng thanh toán
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        statusFilter === "PAID"
                          ? "2px solid #52c41a"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setStatusFilter("PAID")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#52c41a",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Đã thanh toán"
                      value={paidCount}
                      valueStyle={{ color: "#52c41a", fontWeight: 600 }}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        statusFilter === "UNPAID"
                          ? "2px solid #ff4d4f"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setStatusFilter("UNPAID")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#ff4d4f",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Chưa thanh toán"
                      value={unpaidCount}
                      valueStyle={{ color: "#ff4d4f", fontWeight: 600 }}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        statusFilter === "PARTIALLY_PAID"
                          ? "2px solid #fa8c16"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setStatusFilter("PARTIALLY_PAID")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#fa8c16",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Một phần"
                      value={partiallyPaidCount}
                      valueStyle={{ color: "#fa8c16", fontWeight: 600 }}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        statusFilter === "ALL"
                          ? "2px solid #1890ff"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setStatusFilter("ALL")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#1890ff",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Tất cả"
                      value={bills.length}
                      valueStyle={{ color: "#1890ff", fontWeight: 600 }}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>



        {/* Table */}
        <Table<Bill>
          columns={columns}
          dataSource={filteredBills}
          rowKey={(r) => r._id}
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: [5, 8, 10, 20],
          }}
          size="middle"
          onRow={(record) => ({
            onClick: () => openDetail(record),
          })}
        />
      </div>

      {/* Drawer: Detail view */}
      <BillDetailDrawer
        open={detailVisible}
        onClose={closeDetail}
        billId={selectedBillId ?? null}
        contracts={contracts}
        tenants={tenants}
        rooms={rooms}
      />

      {/* Modal xác nhận thanh toán với preview ảnh */}
      <Modal
        title="Xác nhận đã nhận thanh toán"
        open={confirmPaymentModalVisible}
        onOk={handleConfirmCashPayment}
        onCancel={() => {
          setConfirmPaymentModalVisible(false);
          setConfirmingBillId(null);
          setConfirmingBillImage(null);
        }}
        footer={[
          <Button
            key="reject"
            danger
            onClick={handleOpenRejectModal}
          >
            Từ chối
          </Button>,
          <Button
            key="cancel"
            onClick={() => {
              setConfirmPaymentModalVisible(false);
              setConfirmingBillId(null);
              setConfirmingBillImage(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmCashPayment}
          >
            Xác nhận
          </Button>,
        ]}
        width={600}
      >
        {confirmingBillImage ? (
          <div>
            <Alert
              message="Ảnh bill chuyển khoản"
              description="Vui lòng kiểm tra ảnh bill trước khi xác nhận"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ textAlign: "center" }}>
              <Image
                src={confirmingBillImage}
                alt="Bill chuyển khoản"
                style={{ maxWidth: "100%", maxHeight: "500px" }}
                preview={{
                  mask: "Xem ảnh lớn",
                }}
              />
            </div>
          </div>
        ) : (
          <Alert
            message="Chưa có ảnh bill chuyển khoản"
            description="Khách hàng chưa upload ảnh bill. Bạn vẫn có thể xác nhận nếu đã kiểm tra."
            type="warning"
            showIcon
          />
        )}
      </Modal>

      {/* Modal từ chối thanh toán */}
      <Modal
        title="Từ chối thanh toán"
        open={rejectPaymentModalVisible}
        onOk={handleRejectCashPayment}
        onCancel={() => {
          setRejectPaymentModalVisible(false);
          setRejectingBillId(null);
          setRejectionReason("");
        }}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        width={500}
      >
        <Alert
          message="Lưu ý"
          description="Khi từ chối, bill sẽ chuyển về trạng thái 'Chờ thanh toán' và khách hàng có thể thanh toán lại."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <div style={{ marginBottom: 8 }}>
          <strong>Lý do từ chối <span style={{ color: "red" }}>*</span></strong>
        </div>
        <TextArea
          rows={4}
          placeholder="Nhập lý do từ chối thanh toán (ví dụ: Ảnh bill không rõ, Số tiền không khớp, Thông tin không đúng...)"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          maxLength={500}
          showCount
        />
      </Modal>
    </div>
  );
};

export default BillsAD;
