import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Image, Divider, Tag, Typography, Row, Col, Space, message, Spin, Table, Tabs } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined, ToolOutlined, HomeOutlined, FileTextOutlined, PayCircleOutlined, DollarOutlined, InfoCircleOutlined, HistoryOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Room } from "../../../types/room";
import type { Checkin } from "../../../types/checkin";
import type { Contract } from "../../../types/contract";
import type { BillType, BillStatus } from "../../../types/bill";
import { adminRoomService } from "../services/room";
import { adminLogService } from "../services/log";
import dayjs from "dayjs";

interface RoomDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  roomId: string | null;
}

// Destructure Typography components for easier use
const { Title, Text } = Typography;

const RoomDetailDrawer: React.FC<RoomDetailDrawerProps> = ({ open, onClose, roomId }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchLogs = async () => {
    if (!roomId) return;
    setLogsLoading(true);
    try {
      const response = await adminLogService.getByEntity('ROOM', roomId, { limit: 50 });
      setLogs(response.data);
    } catch (error) {
      console.error("Load logs error:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId || !open) return;
      setLoading(true);
      console.log("Fetching roomId:", roomId);

      try {
        const data = await adminRoomService.getById(roomId);
        if (!data) {
          console.warn("Room data is null or undefined");
          message.warning("Không có dữ liệu phòng");
        } else {
          console.log("Room data received:", data);
          console.log("Contracts (finalContracts):", data.contracts);
          console.log("Contracts length:", data.contracts?.length);
          console.log("Receipt bills:", data.receiptBills);
          console.log("Bills:", data.bills);
          setRoom(data);
        }
        
        // Load logs
        fetchLogs();
      } catch (err: any) {
        console.error("API error:", err);
        message.error(err.message || "Lỗi khi lấy chi tiết phòng");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, open]);

  if (!room && !loading) return null;

  const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    AVAILABLE: { color: "#52c41a", label: "Còn trống", icon: <CheckCircleOutlined /> },
    DEPOSITED: { color: "#ff4d4f", label: "Đã được cọc", icon: <ExclamationCircleOutlined /> },
    OCCUPIED: { color: "#fa8c16", label: "Đang thuê", icon: <ExclamationCircleOutlined /> },
    MAINTENANCE: { color: "#8c8c8c", label: "Bảo trì", icon: <ToolOutlined /> },
  };

  const processedImages = room?.images?.map(img =>
    typeof img === "string" ? img : (img as any).url
  );
    // Render the Drawer component with room details

  // Helper functions for status tags

  const getBillStatusTag = (status: BillStatus) => {
    if (status === "PENDING_CASH_CONFIRM") {
      return <Tag color="gold">Chờ xác nhận tiền mặt</Tag>;
    }
    const map: Record<string, { color: string; text: string }> = {
      DRAFT: { color: "orange", text: "Nháp" },
      PAID: { color: "green", text: "Đã thanh toán" },
      UNPAID: { color: "red", text: "Chờ thanh toán" },
      PARTIALLY_PAID: { color: "orange", text: "Một phần" },
      VOID: { color: "default", text: "Đã hủy" },
    };
    const m = map[status] || { color: "default", text: status };
    return <Tag color={m.color}>{m.text}</Tag>;
  };

  const getContractStatusTag = (status: string, record?: any) => {
    // Nếu status là DRAFT và chưa có images (chưa upload file), hiển thị "Chờ upload file" màu vàng
    if (status === "DRAFT" && record && (!record.images || record.images.length === 0)) {
      return <Tag color="gold">Chờ upload file</Tag>;
    }
    
    const map: Record<string, { color: string; text: string }> = {
      ACTIVE: { color: "#52c41a", text: "Đã ký" },
      SIGNED: { color: "#52c41a", text: "Đã ký" },
      WAITING_SIGN: { color: "#faad14", text: "Chờ ký" },
      ENDED: { color: "default", text: "Đã kết thúc" },
      CANCELED: { color: "red", text: "Đã hủy" },
      DRAFT: { color: "default", text: "Nháp" },
    };
    const m = map[status] || { color: "default", text: status };
    return <Tag color={m.color}>{m.text}</Tag>;
  };

  const getBillTypeTag = (type: BillType) => {
    const map: Record<BillType, { color: string; text: string }> = {
      RECEIPT: { color: "purple", text: "Phiếu thu" },
      CONTRACT: { color: "cyan", text: "Hợp đồng" },
      MONTHLY: { color: "magenta", text: "Hàng tháng" },
    };
    const m = map[type] || { color: "default", text: type };
    return <Tag color={m.color}>{m.text}</Tag>;
  };

  // Table columns for contracts
  const contractColumns = [
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Người thuê",
      key: "tenant",
      render: (_: any, record: Contract) => {
        if (typeof record.tenantId === "object" && record.tenantId) {
          return record.tenantId.fullName || "N/A";
        }
        return "N/A";
      },
    },
    {
      title: "Tiền thuê/tháng",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
      render: (v: number) => v?.toLocaleString() + " VNĐ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => getContractStatusTag(status, record),
    },
  ];

  // Helper function to convert Decimal128 or string to number
  const convertToNumber = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    if (value && typeof value === 'object' && '$numberDecimal' in value) {
      return parseFloat(value.$numberDecimal) || 0;
    }
    return 0;
  };

  // Table columns for receipts (Phiếu thu) - không có cột "Đã thanh toán"
  const receiptColumns = [
    {
      title: "Loại",
      dataIndex: "billType",
      key: "billType",
      render: (type: BillType) => getBillTypeTag(type),
    },
    {
      title: "Ngày lập",
      dataIndex: "billingDate",
      key: "billingDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Số tiền",
      key: "amount",
      render: (_: any, record: any) => {
        // Lấy số tiền: nếu đã thanh toán thì lấy amountPaid, nếu chưa thì lấy amountDue
        const amountPaid = convertToNumber(record.amountPaid);
        const amountDue = convertToNumber(record.amountDue);
        // Ưu tiên hiển thị số tiền thực tế đã thanh toán nếu có, nếu không thì hiển thị số tiền phải thanh toán
        const amount = amountPaid > 0 ? amountPaid : amountDue;
        return (amount || 0).toLocaleString() + " VNĐ";
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: BillStatus) => getBillStatusTag(status),
    },
  ];

  // Table columns for bills (hóa đơn) - giữ nguyên có cột "Đã thanh toán"
  const billColumns = [
    {
      title: "Loại",
      dataIndex: "billType",
      key: "billType",
      render: (type: BillType) => getBillTypeTag(type),
    },
    {
      title: "Ngày lập",
      dataIndex: "billingDate",
      key: "billingDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Số tiền",
      dataIndex: "amountDue",
      key: "amountDue",
      render: (v: number) => v?.toLocaleString() + " VNĐ",
    },
    {
      title: "Đã thanh toán",
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (v: number) => v?.toLocaleString() + " VNĐ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: BillStatus) => getBillStatusTag(status),
    },
  ];

  return (
    <Drawer
      title={
        <Space>
          <HomeOutlined style={{ fontSize: 22, color: "#1677ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết phòng {room?.roomNumber || ""}
          </Title>
        </Space>
      }
      placement="right"
      width={800}
      onClose={() => {
        setRoom(null);
        onClose();
      }}
      open={open}
      styles={{
        header: { backgroundColor: "#f0f2f5", borderBottom: "1px solid #e8e8e8" },
        body: { backgroundColor: "#f9f9f9" },
      }}
    >
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: (
                <span>
                  <InfoCircleOutlined /> Thông tin cơ bản
                </span>
              ),
              children: (
        <>
          <Descriptions
            bordered
            column={1}
            size="middle"
            styles={{
              label: { fontWeight: 600, background: "#fafafa" },
              content: { background: "#fff" },
            }}
          >
            <Descriptions.Item label="Số phòng">{room?.roomNumber}</Descriptions.Item>
            <Descriptions.Item label="Loại phòng">{room?.type}</Descriptions.Item>
            <Descriptions.Item label="Giá thuê">
              <Text strong style={{ color: "#1677ff" }}>
                {room?.pricePerMonth?.toLocaleString()} VNĐ / tháng
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Diện tích">{room?.areaM2} m²</Descriptions.Item>
            <Descriptions.Item label="Tầng">{room?.floor}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
                      {room && room.status && statusConfig[room.status] ? (
                <Tag
                  color={statusConfig[room.status].color}
                  style={{ fontSize: 14, padding: "4px 12px", borderRadius: 16 }}
                  icon={statusConfig[room.status].icon}
                >
                  {statusConfig[room.status].label}
                </Tag>
                      ) : (
                        <Tag color="default">{room?.status || "Unknown"}</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" style={{ marginTop: 24 }}>
            Hình ảnh phòng
          </Divider>

          {processedImages && processedImages.length > 0 ? (
            <Row gutter={[12, 12]}>
              {processedImages.map((img, idx) => (
                <Col span={12} key={idx}>
                  <div
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      transition: "transform 0.3s ease",
                    }}
                    className="image-hover"
                  >
                    <Image
                      src={img}
                      width="100%"
                      height={160}
                      style={{ objectFit: "cover" }}
                      preview={{ mask: <span>Xem ảnh</span> }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Text type="secondary">Không có hình ảnh</Text>
          )}

          <style>{`
            .image-hover:hover {
              transform: scale(1.03);
              cursor: pointer;
            }
          `}</style>
        </>
              ),
            },
            {
              key: "2",
              label: (
                <span>
                  <PayCircleOutlined /> Phiếu thu ({room?.receiptBills?.length || 0})
                </span>
              ),
              children: (
                <>
                  {room?.receiptBills && room.receiptBills.length > 0 ? (
                    <Table
                      columns={receiptColumns}
                      dataSource={room.receiptBills}
                      rowKey="_id"
                      size="small"
                      pagination={{ pageSize: 10 }}
                      onRow={(record) => ({
                        onClick: () => {
                          // Đóng drawer và chuyển sang trang hóa đơn với billId
                          onClose();
                          navigate(`/admin/bills?billId=${record._id}`);
                        },
                        style: { cursor: 'pointer' }
                      })}
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Text type="secondary">Không có phiếu thu</Text>
                    </div>
                  )}
                </>
              ),
            },
            {
              key: "3",
              label: (
                <span>
                  <FileTextOutlined /> Hợp đồng đã ký ({room?.contracts?.length || 0})
                </span>
              ),
              children: (
                <>
                  {room?.contracts && room.contracts.length > 0 ? (
                    <Table
                      columns={contractColumns}
                      dataSource={room.contracts}
                      rowKey="_id"
                      size="small"
                      pagination={{ pageSize: 10 }}
                      onRow={() => ({
                        onClick: () => {
                          // Đóng drawer và chuyển sang trang hợp đồng
                          onClose();
                          navigate(`/admin/final-contracts`);
                        },
                        style: { cursor: 'pointer' }
                      })}
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Text type="secondary">Chưa có hợp đồng chính thức nào được ký</Text>
                    </div>
                  )}
                </>
              ),
            },
            {
              key: "4",
              label: (
                <span>
                  <DollarOutlined /> Hóa đơn ({room?.bills?.length || 0})
                </span>
              ),
              children: (
                <>
                  {room?.bills && room.bills.length > 0 ? (
                    <Table
                      columns={billColumns}
                      dataSource={room.bills}
                      rowKey="_id"
                      size="small"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Text type="secondary">Không có hóa đơn</Text>
                    </div>
                  )}
                </>
              ),
            },
            {
              key: "5",
              label: (
                <span>
                  <HistoryOutlined /> Lịch sử ({logs.length})
                </span>
              ),
              children: (
                <>
                  {logsLoading ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Spin />
                    </div>
                  ) : logs.length > 0 ? (
                    <Table
                      columns={[
                        {
                          title: "Thời gian",
                          dataIndex: "createdAt",
                          key: "createdAt",
                          width: 150,
                          render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
                        },
                        {
                          title: "Level",
                          dataIndex: "level",
                          key: "level",
                          width: 80,
                          render: (level: string) => (
                            <Tag color={level === 'ERROR' ? 'red' : level === 'WARN' ? 'orange' : 'blue'}>
                              {level}
                            </Tag>
                          ),
                        },
                        {
                          title: "Hành động",
                          dataIndex: "message",
                          key: "message",
                        },
                        {
                          title: "Người thực hiện",
                          dataIndex: ["context", "actorId"],
                          key: "actor",
                          width: 150,
                          render: (actor: any) => actor?.fullName || <Text type="secondary">System</Text>,
                        },
                      ]}
                      dataSource={logs}
                      rowKey="_id"
                      size="small"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Text type="secondary">Chưa có lịch sử</Text>
                    </div>
                  )}
                </>
              ),
            },
          ]}
        />
      )}
    </Drawer>
  );
};

export default RoomDetailDrawer;
