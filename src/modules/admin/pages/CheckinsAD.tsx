import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  DeleteOutlined,
  DollarOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { adminCheckinService } from "../services/checkin";
import { adminRoomService } from "../services/room";
import { adminBillService } from "../services/bill";
import type { Checkin, CheckinStatus } from "../../../types/checkin";
import type { Room } from "../../../types/room";
import ExpandableSearch from "../components/ExpandableSearch";
import BillDetailDrawer from "../components/BillDetailDrawer";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CheckinFormValues {
  roomId: string;
  checkinDate: Dayjs;
  duration: number;
  deposit: number;
  paymentMethod: "cash" | "online";
  fullName: string;
  phone: string;
  identityNo?: string;
  address?: string;
  tenantNote?: string;
  notes?: string;
}

const CheckinsAD: React.FC = () => {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<CheckinFormValues>();
  const [statusFilter, setStatusFilter] = useState<string | "ALL">("ALL");
  const [keyword, setKeyword] = useState<string>("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [moveOutRequests, setMoveOutRequests] = useState<any[]>([]);
  const [receiptDetailVisible, setReceiptDetailVisible] = useState(false);
  const [selectedReceiptBillId, setSelectedReceiptBillId] = useState<string | null>(null);

  useEffect(() => {
    loadCheckins();
    loadRooms();
    loadMoveOutRequests();
    
    // Kiểm tra URL params để hiển thị thông báo thanh toán
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const provider = urlParams.get("provider");
    const transactionId = urlParams.get("transactionId");
    
    if (paymentStatus === "success" && provider) {
      message.success({
        content: `Thanh toán ${provider.toUpperCase()} thành công! Mã GD: ${transactionId || "N/A"}`,
        duration: 5,
      });
      
      // Xóa params khỏi URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Reload data sau 1 giây để cập nhật trạng thái
      setTimeout(() => {
        loadCheckins();
      }, 1000);
    }
  }, []);

  const loadMoveOutRequests = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${apiUrl}/api/move-out-requests`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMoveOutRequests(data.data || []);
      }
    } catch (error: any) {
      console.error("Error loading move-out requests:", error);
    }
  };

  const loadCheckins = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await adminCheckinService.getAll({ page, limit });
      setCheckins(response.data);
      setPagination({
        current: response.pagination?.currentPage || 1,
        pageSize: response.pagination?.limit || 10,
        total: response.pagination?.totalRecords || 0,
      });
      // Load move-out requests để kiểm tra yêu cầu hoàn cọc
      await loadMoveOutRequests();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu check-in");
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const roomsData = await adminRoomService.getAll();
      setRooms(roomsData);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu phòng");
    }
  };

  const openModal = () => {
    form.resetFields();
    form.setFieldsValue({
      paymentMethod: "cash",
      checkinDate: dayjs(),
      duration: 6,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        roomId: values.roomId,
        checkinDate: values.checkinDate.toISOString(),
        duration: values.duration,
        deposit: values.deposit,
        notes: values.notes,
        fullName: values.fullName,
        phone: values.phone,
        identityNo: values.identityNo,
        address: values.address,
        tenantNote: values.tenantNote,
      };

      if (values.paymentMethod === "cash") {
        await adminCheckinService.createCash(payload);
        message.success("Tạo check-in thanh toán tiền mặt thành công!");
      } else {
        await adminCheckinService.createOnline(payload);
        message.success("Tạo check-in thanh toán online thành công!");
      }

      closeModal();
      loadCheckins(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await adminCheckinService.cancel(id, "Hủy bởi admin");
      message.success("Đã hủy check-in!");
      loadCheckins(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi hủy check-in");
    }
  };

  const handleDownloadDocx = async (id: string) => {
    try {
      const blob = await adminCheckinService.downloadSampleDocx(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `HopDongMau-${id}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("Tải hợp đồng mẫu thành công!");
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải hợp đồng mẫu");
    }
  };

  const handleConfirmCashPayment = async (receiptBillId: string) => {
    try {
      await adminBillService.confirmPayment(receiptBillId);
      message.success("Xác nhận thanh toán tiền mặt thành công!");
      loadCheckins(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi xác nhận thanh toán");
    }
  };

  const handleOnlinePayment = async (billId: string, amount: number) => {
    const createPayment = async (provider: "vnpay" | "momo" | "zalopay") => {
      try {
        const token = localStorage.getItem("admin_token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        
        const endpoint = provider === "zalopay" 
          ? `${apiUrl}/api/payment/zalopay/create`
          : `${apiUrl}/api/payment/${provider}/create`;

        console.log(`[${provider.toUpperCase()}] Calling endpoint:`, endpoint);
        console.log(`[${provider.toUpperCase()}] Request body:`, { billId, amount });

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ 
            billId, 
            amount,
            returnUrl: `${window.location.origin}/admin/checkins`
          }),
        });
        
        console.log(`[${provider.toUpperCase()}] Response status:`, response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[${provider.toUpperCase()}] Error response:`, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        console.log(`[${provider.toUpperCase()}] Response data:`, data);

        let paymentUrl = null;
        if (provider === "vnpay") {
          paymentUrl = data.url || data.paymentUrl;
        } else if (provider === "momo") {
          paymentUrl = data.payUrl || data.data?.payUrl;
        } else if (provider === "zalopay") {
          // ZaloPay có thể trả về order_url trong nhiều nơi
          paymentUrl = data.payUrl || data.zaloData?.order_url || data.order_url;
          console.log("[ZALOPAY] Extracted paymentUrl:", paymentUrl);
          console.log("[ZALOPAY] data.payUrl:", data.payUrl);
          console.log("[ZALOPAY] data.zaloData:", data.zaloData);
        }

        if (paymentUrl) {
          console.log(`[${provider.toUpperCase()}] Opening URL:`, paymentUrl);
          window.open(paymentUrl, "_blank");
          message.success(`Đã mở cổng thanh toán ${provider.toUpperCase()}`);
        } else {
          console.error("Payment error - No payment URL found:", data);
          message.error(data.message || data.error || "Lỗi tạo link thanh toán");
        }
      } catch (error: any) {
        message.error("Lỗi kết nối payment gateway");
      }
    };

    Modal.info({
      title: "Chọn phương thức thanh toán online",
      width: 500,
      content: (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>
            Số tiền: <strong style={{ color: "#1890ff" }}>{amount.toLocaleString("vi-VN")} đ</strong>
          </p>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button 
              type="primary" 
              block 
              size="large"
              onClick={() => {
                Modal.destroyAll();
                createPayment("vnpay");
              }}
              style={{ backgroundColor: "#1890ff" }}
            >
              💳 VNPAY
            </Button>
            <Button 
              type="primary" 
              block 
              size="large"
              onClick={() => {
                Modal.destroyAll();
                createPayment("momo");
              }}
              style={{ backgroundColor: "#a50064" }}
            >
              🟣 MOMO
            </Button>
            <Button 
              type="primary" 
              block 
              size="large"
              onClick={() => {
                Modal.destroyAll();
                createPayment("zalopay");
              }}
              style={{ backgroundColor: "#0068ff" }}
            >
              💙 ZaloPay
            </Button>
          </Space>
        </div>
      ),
      okText: "Đóng",
      onOk: () => Modal.destroyAll(),
    });
  };

  const handleComplete = async (id: string) => {
    try {
      await adminCheckinService.complete(id);
      message.success("Đã đánh dấu check-in hoàn thành!");
      loadCheckins(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi hoàn thành check-in");
    }
  };

  const getRoomNumber = (roomId: string | Room): string => {
    if (typeof roomId === "object" && roomId?.roomNumber) {
      return roomId.roomNumber;
    }
    const room = rooms.find((r) => r._id === roomId);
    return room?.roomNumber || (typeof roomId === "string" ? roomId : "N/A");
  };

  const getTenantName = (checkin: Checkin): string => {
    if (checkin.tenantSnapshot?.fullName) {
      return checkin.tenantSnapshot.fullName;
    }
    if (typeof checkin.tenantId === "object" && checkin.tenantId?.fullName) {
      return checkin.tenantId.fullName;
    }
    return "N/A";
  };

  const filteredCheckins = useMemo(() => {
    let data = [...checkins];

    if (statusFilter && statusFilter !== "ALL") {
      data = data.filter((c) => c.status === statusFilter);
    }

    if (keyword.trim() !== "") {
      const k = keyword.toLowerCase();
      data = data.filter((c) => {
        const tenantName = getTenantName(c).toLowerCase();
        const roomNumber = getRoomNumber(c.roomId).toLowerCase();
        const checkinId = c._id.toLowerCase();
        return tenantName.includes(k) || roomNumber.includes(k) || checkinId.includes(k);
      });
    }

    return data;
  }, [checkins, statusFilter, keyword]);

  const createdCount = useMemo(() => checkins.filter((c) => c.status === "CREATED").length, [checkins]);
  const completedCount = useMemo(() => checkins.filter((c) => c.status === "COMPLETED").length, [checkins]);
  const canceledCount = useMemo(() => checkins.filter((c) => c.status === "CANCELED").length, [checkins]);

  const getStatusTag = (status: CheckinStatus) => {
    const statusMap: Record<CheckinStatus, { color: string; text: string }> = {
      CREATED: { color: "#faad14", text: "Chờ xử lý" },
      COMPLETED: { color: "#52c41a", text: "Hoàn thành" },
      CANCELED: { color: "#ff4d4f", text: "Đã hủy" },
    };
    const s = statusMap[status];
    return (
      <Tag
        style={{
          fontWeight: 600,
          borderRadius: 12,
          color: "#fff",
          backgroundColor: s.color,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        {s.text}
      </Tag>
    );
  };

  const getDepositDispositionTag = (disposition?: string, record?: Checkin) => {
    // Nếu đã có depositDisposition, hiển thị trạng thái tương ứng
    if (disposition) {
    const map: Record<string, { color: string; text: string }> = {
      FORFEIT: { color: "#ff4d4f", text: "Mất cọc" },
      APPLIED: { color: "#1890ff", text: "Áp dụng" },
        REFUNDED: { color: "#52c41a", text: "Đã Hoàn Cọc" },
    };
    const d = map[disposition];
      if (!d) {
        return <Tag color="default" style={{ borderRadius: 8 }}>{disposition}</Tag>;
      }
    return (
      <Tag color={d.color} style={{ borderRadius: 8 }}>
        {d.text}
      </Tag>
    );
    }
    
    // Nếu chưa có depositDisposition, kiểm tra xem có yêu cầu hoàn cọc không
    if (record?.contractId) {
      const contractId = typeof record.contractId === 'object' 
        ? (record.contractId as any)?._id 
        : record.contractId;
      
      if (contractId) {
        // Kiểm tra xem có move-out-request nào cho contract này không
        const hasRequest = moveOutRequests.some((req: any) => {
          const reqContractId = typeof req.contractId === 'object' 
            ? req.contractId?._id 
            : req.contractId;
          return reqContractId === contractId;
        });
        
        if (hasRequest) {
          // Có yêu cầu nhưng chưa xử lý
          return <Tag color="warning" style={{ borderRadius: 8 }}>Chưa xử lý</Tag>;
        }
      }
    }
    
    // Chưa có yêu cầu hoàn cọc
    return <Tag color="default" style={{ borderRadius: 8 }}>Chưa có yêu cầu</Tag>;
  };

  const columns: ColumnsType<Checkin> = [
 
    {
      title: "Khách thuê",
      key: "tenant",
      render: (_: any, record: Checkin) => {
        const receiptBill = typeof record.receiptBillId === "object" 
          ? record.receiptBillId 
          : null;
        const hasReceipt = !!receiptBill;
        
        return (
          <span 
            style={{ 
              whiteSpace: "normal", 
              wordBreak: "break-word",
              cursor: hasReceipt ? "pointer" : "default",
              color: hasReceipt ? "#1890ff" : "inherit",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (hasReceipt) {
                const billId = typeof receiptBill === "object" 
                  ? (receiptBill as any)._id 
                  : receiptBill;
                setSelectedReceiptBillId(billId);
                setReceiptDetailVisible(true);
              }
            }}
          >
            {getTenantName(record)}
          </span>
        );
      },
    },
    {
      title: "Phòng",
      dataIndex: "roomId",
      key: "roomId",
      render: (v: string | Room) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {getRoomNumber(v)}
        </span>
      ),
    },
    {
      title: "Ngày Check-in",
      dataIndex: "checkinDate",
      key: "checkinDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Thời hạn",
      dataIndex: "durationMonths",
      key: "durationMonths",
      align: "center",
      render: (v: number) => `${v} tháng`,
    },
    {
      title: "Tiền cọc (VNĐ)",
      dataIndex: "deposit",
      key: "deposit",
      align: "right",
      render: (v: number) => v.toLocaleString("vi-VN"),
    },
    {
      title: "Tiền thuê (VNĐ)",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
      align: "right",
      render: (v: number) => v.toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (s: CheckinStatus) => getStatusTag(s),
    },
    {
      title: "Xử lý hoàn cọc",
      dataIndex: "depositDisposition",
      key: "depositDisposition",
      align: "center",
      render: (d?: string, record?: Checkin) => {
        // Ưu tiên lấy từ Checkin.depositDisposition
        let disposition = record?.depositDisposition || d;
        
        // Nếu Checkin chưa có depositDisposition, kiểm tra từ Contract.depositRefunded
        if (!disposition && record?.contractId) {
          const contract = typeof record.contractId === 'object' ? record.contractId : null;
          if (contract && (contract as any).depositRefunded) {
            disposition = "REFUNDED";
          }
        }
        
        return getDepositDispositionTag(disposition, record);
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 220,
      render: (_: any, record: Checkin) => {
        const receiptBill = typeof record.receiptBillId === "object" ? record.receiptBillId : null;
        const isPendingCash = receiptBill && (receiptBill as any).status === "PENDING_CASH_CONFIRM";
        const isPaid = receiptBill && (receiptBill as any).status === "PAID";

        return (
          <Space wrap>
            {(isPendingCash || (receiptBill && (receiptBill as any).status === "UNPAID")) && (
              <>
                <Tooltip title="Xác nhận đã nhận tiền mặt">
                  <Popconfirm
                    title="Xác nhận đã nhận tiền mặt?"
                    okText="Xác nhận"
                    cancelText="Hủy"
                    onConfirm={() => handleConfirmCashPayment((record.receiptBillId as any)._id)}
                  >
                    <Button
                      size="small"
                      type="primary"
                      icon={<DollarOutlined />}
                    >
                      TM
                    </Button>
                  </Popconfirm>
                </Tooltip>
                <Button
                  size="small"
                  type="default"
                  onClick={() => handleOnlinePayment((record.receiptBillId as any)._id, record.deposit)}
                >
                  Online
                </Button>
              </>
            )}
            {isPaid && record.status === "CREATED" && (
              <Tooltip title="Đánh dấu hoàn thành">
                <Popconfirm
                  title="Đánh dấu check-in hoàn thành?"
                  okText="Hoàn thành"
                  cancelText="Hủy"
                  onConfirm={() => handleComplete(record._id)}
                >
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckOutlined />}
                  >
                    Hoàn thành
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}
            <Tooltip title="Tải DOCX">
              <Button
                size="small"
                type="default"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadDocx(record._id)}
                disabled={record.status === "CANCELED" || !isPaid}
              />
            </Tooltip>
            {record.status === "CREATED" && (
              <Tooltip title="Hủy">
                <Popconfirm
                  title="Hủy check-in này? (Sẽ mất 100% tiền cọc)"
                  okText="Hủy"
                  cancelText="Không"
                  onConfirm={() => handleCancel(record._id)}
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircleOutlined style={{ color: "#1890ff", fontSize: 28 }} /> Quản lý phiếu thu
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={openModal}
              className="btn-hover-gradient"
            >
              Tạo phiếu thu
            </Button>
          </Col>
        </Row>

        {/* Statistic */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} sm={12} md={8}>
                <ExpandableSearch
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm khách thuê, phòng, mã check-in..."
                />
              </Col>

              <Col xs={24} sm={24} md={16}>
                <Row gutter={[16, 16]} justify="end">
                  {[
                    { title: "Chờ xử lý", color: "#faad14", value: createdCount, icon: <ClockCircleOutlined /> },
                    { title: "Hoàn thành", color: "#52c41a", value: completedCount, icon: <CheckCircleOutlined /> },
                    { title: "Đã hủy", color: "#ff4d4f", value: canceledCount, icon: <CloseCircleOutlined /> },
                  ].map((item, idx) => (
                    <Col xs={24} sm={12} md={7} key={idx}>
                      <Card
                        size="small"
                        bordered={false}
                        style={{
                          textAlign: "center",
                          borderRadius: 16,
                          background: "white",
                          boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
                          padding: 12,
                        }}
                      >
                        {React.cloneElement(item.icon as React.ReactElement<any>, {
                          style: { fontSize: 24, color: item.color, marginBottom: 4 },
                        })}
                        <Statistic
                          title={item.title}
                          value={item.value}
                          valueStyle={{ color: item.color, fontWeight: 600, fontSize: 18 }}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Table */}
        <Table<Checkin>
          columns={columns}
          dataSource={filteredCheckins}
          rowKey={(r) => r._id}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            onChange: (page, pageSize) => loadCheckins(page, pageSize),
          }}
          size="middle"
        />
      </div>

      {/* Modal Create Check-in */}
      <Modal
        title="Tạo phiếu thu mới"
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        okText="Tạo"
        cancelText="Hủy"
        width={800}
        centered
      >
        <Form<CheckinFormValues> form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Phòng" name="roomId" rules={[{ required: true, message: "Chọn phòng" }]}>
                <Select
                  showSearch
                  placeholder="Chọn phòng"
                  optionFilterProp="children"
                  onChange={(roomId) => {
                    const room = rooms.find((r) => r._id === roomId);
                    if (room && room.pricePerMonth) {
                      form.setFieldValue("deposit", Number(room.pricePerMonth));
                    }
                  }}
                >
                  {rooms
                    .filter((r) => r.status === "AVAILABLE")
                    .map((room) => (
                      <Option key={room._id} value={room._id}>
                        {room.roomNumber} - {room.type} - {Number(room.pricePerMonth || 0).toLocaleString("vi-VN")}₫
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ngày Check-in" name="checkinDate" rules={[{ required: true, message: "Chọn ngày" }]}>
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Thời hạn thuê (tháng)" name="duration" rules={[{ required: true, message: "Nhập thời hạn" }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tiền cọc (VNĐ)" name="deposit" rules={[{ required: true, message: "Nhập tiền cọc" }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Phương thức thanh toán" name="paymentMethod" rules={[{ required: true }]}>
                <Radio.Group>
                  <Radio value="cash">Tiền mặt</Radio>
                  <Radio value="online">Online</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Title level={5}>Thông tin khách thuê</Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: "Nhập họ tên" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Nhập số điện thoại" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="CMND/CCCD" name="identityNo">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Địa chỉ" name="address">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Ghi chú" name="tenantNote">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24}>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Receipt Detail Drawer */}
      <BillDetailDrawer
        open={receiptDetailVisible}
        onClose={() => {
          setReceiptDetailVisible(false);
          setSelectedReceiptBillId(null);
        }}
        billId={selectedReceiptBillId}
        contracts={[]}
        tenants={[]}
        rooms={rooms}
      />
    </div>
  );
};

export default CheckinsAD;
