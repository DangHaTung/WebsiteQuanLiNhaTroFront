import React, { useEffect, useState, useMemo } from "react";
import { Drawer, Descriptions, Image, Divider, Tag, Typography, Row, Col, Space, message, Spin, Table, Tabs, Timeline, Empty, Card, Statistic } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined, ToolOutlined, HomeOutlined, FileTextOutlined, PayCircleOutlined, DollarOutlined, InfoCircleOutlined, HistoryOutlined, UserOutlined, IdcardOutlined, MailOutlined, PhoneOutlined, TeamOutlined, EditOutlined, PlusOutlined, CloseCircleOutlined, SwapOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Room } from "../../../types/room";
import type { Checkin } from "../../../types/checkin";
import type { Contract } from "../../../types/contract";
import type { BillType, BillStatus } from "../../../types/bill";
import { adminRoomService } from "../services/room";
import { adminLogService } from "../services/log";
import { adminCheckinService } from "../services/checkin";
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
          console.log("Checkins:", data.checkins);
          console.log("Checkins length:", data.checkins?.length);
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

  // Helper functions for status tags

  const getBillStatusTag = (status: BillStatus) => {
    if (status === "PENDING_CASH_CONFIRM") {
      return <Tag color="gold">Chờ xác nhận</Tag>;
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

  // Tạo timeline từ tất cả các sự kiện
  const timelineEvents = useMemo(() => {
    if (!room) return [];

    const events: Array<{
      date: Date;
      type: 'CONTRACT' | 'CHECKIN' | 'BILL' | 'RECEIPT' | 'STATUS_CHANGE' | 'PRICE_CHANGE' | 'OTHER';
      title: string;
      description?: string;
      data?: any;
      icon?: React.ReactNode;
      color?: string;
    }> = [];

    // 1. Thêm sự kiện từ hợp đồng
    room.contracts?.forEach((contract: Contract) => {
      // Ngày bắt đầu hợp đồng
      if (contract.startDate) {
        events.push({
          date: new Date(contract.startDate),
          type: 'CONTRACT',
          title: 'Bắt đầu hợp đồng',
          description: `Khách thuê: ${typeof contract.tenantId === 'object' ? contract.tenantId?.fullName : 'N/A'} - Giá: ${contract.monthlyRent?.toLocaleString()} VNĐ/tháng`,
          data: contract,
          icon: <FileTextOutlined />,
          color: 'green',
        });
      }

      // Ngày kết thúc hợp đồng
      if (contract.endDate && (contract.status === 'EXPIRED' || new Date(contract.endDate) < new Date())) {
        events.push({
          date: new Date(contract.endDate),
          type: 'CONTRACT',
          title: 'Kết thúc hợp đồng',
          description: `Khách thuê: ${typeof contract.tenantId === 'object' ? contract.tenantId?.fullName : 'N/A'}`,
          data: contract,
          icon: <CloseCircleOutlined />,
          color: 'gray',
        });
      }
    });

    // 2. Thêm sự kiện từ checkin
    room.checkins?.forEach((checkin: Checkin) => {
      events.push({
        date: new Date(checkin.checkinDate),
        type: 'CHECKIN',
        title: 'Checkin',
        description: `${typeof checkin.tenantId === 'object' ? checkin.tenantId?.fullName : 'N/A'} - Tiền cọc: ${checkin.deposit?.toLocaleString()} VNĐ`,
        data: checkin,
        icon: <CheckCircleOutlined />,
        color: 'blue',
      });
    });

    // 3. Thêm sự kiện từ phiếu thu
    room.receiptBills?.forEach((bill: any) => {
      events.push({
        date: new Date(bill.billingDate),
        type: 'RECEIPT',
        title: 'Phiếu thu',
        description: `${bill.billType === 'CONTRACT' ? 'Tiền cọc hợp đồng' : 'Phiếu thu'} - ${convertToNumber(bill.amountPaid || bill.amountDue).toLocaleString()} VNĐ`,
        data: bill,
        icon: <PayCircleOutlined />,
        color: 'purple',
      });
    });

    // 4. Thêm sự kiện từ hóa đơn hàng tháng
    room.bills?.filter((b: any) => b.billType === 'MONTHLY').forEach((bill: any) => {
      const isPaid = bill.status === 'PAID';
      events.push({
        date: new Date(bill.billingDate),
        type: 'BILL',
        title: isPaid ? 'Thanh toán hóa đơn' : 'Hóa đơn hàng tháng',
        description: `${dayjs(bill.billingDate).format('MM/YYYY')} - ${convertToNumber(bill.amountDue).toLocaleString()} VNĐ`,
        data: bill,
        icon: <DollarOutlined />,
        color: isPaid ? 'green' : 'orange',
      });
    });

    // 5. Thêm sự kiện từ logs
    logs.forEach((log: any) => {
      const message = log.message || '';
      let type: any = 'OTHER';
      let icon = <InfoCircleOutlined />;
      let color = 'blue';

      // Phân loại log theo message
      if (message.includes('trạng thái') || message.includes('status')) {
        type = 'STATUS_CHANGE';
        icon = <SwapOutlined />;
        color = 'cyan';
      } else if (message.includes('giá') || message.includes('price')) {
        type = 'PRICE_CHANGE';
        icon = <DollarOutlined />;
        color = 'gold';
      } else if (message.includes('Cập nhật')) {
        icon = <EditOutlined />;
        color = 'blue';
      } else if (message.includes('Tạo')) {
        icon = <PlusOutlined />;
        color = 'green';
      }

      events.push({
        date: new Date(log.createdAt),
        type,
        title: message,
        description: log.context?.actorId?.fullName ? `Bởi: ${log.context.actorId.fullName}` : undefined,
        data: log,
        icon,
        color,
      });
    });

    // Sắp xếp theo thời gian giảm dần (mới nhất trước)
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [room, logs]);

  // Thống kê lịch sử
  const historyStats = useMemo(() => {
    return {
      totalContracts: timelineEvents.filter(e => e.type === 'CONTRACT' && e.title.includes('Bắt đầu')).length,
      totalPayments: timelineEvents.filter(e => e.type === 'BILL' && e.title.includes('Thanh toán')).length,
      totalRevenue: room?.bills
        ?.filter((b: any) => b.status === 'PAID')
        .reduce((sum: number, b: any) => sum + convertToNumber(b.amountPaid), 0) || 0,
    };
  }, [timelineEvents, room]);

  // Tính toán thông tin người thuê và ảnh
  const { processedImages, firstCheckin, firstContract, tenant, tenantSnapshot, activeContract } = useMemo(() => {
    const images = room?.images?.map(img =>
      typeof img === "string" ? img : (img as any).url
    );
    
    const checkin = room?.checkins && room.checkins.length > 0 ? room.checkins[0] : null;
    const contract = room?.contracts && room.contracts.length > 0 ? room.contracts[0] : null;
    
    // Lấy activeContract (chứa coTenants) từ room
    const activeContractData = (room as any)?.activeContract || null;
    
    const tenantData = checkin && typeof checkin.tenantId === "object"
      ? checkin.tenantId
      : (contract && typeof contract.tenantId === "object"
        ? contract.tenantId
        : null);
    
    const snapshot = checkin?.tenantSnapshot || null;
    
    // Debug: Log contract data
    console.log("[RoomDetailDrawer] FinalContract:", contract);
    console.log("[RoomDetailDrawer] ActiveContract:", activeContractData);
    console.log("[RoomDetailDrawer] coTenants:", activeContractData?.coTenants);
    console.log("[RoomDetailDrawer] Checkin:", checkin);
    console.log("[RoomDetailDrawer] tenantSnapshot:", snapshot);
    console.log("[RoomDetailDrawer] tenant:", tenantData);
    
    return {
      processedImages: images,
      firstCheckin: checkin,
      firstContract: contract,
      tenant: tenantData,
      tenantSnapshot: snapshot,
      activeContract: activeContractData,
    };
  }, [room]);

  const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    AVAILABLE: { color: "#52c41a", label: "Còn trống", icon: <CheckCircleOutlined /> },
    DEPOSITED: { color: "#ff4d4f", label: "Đã được cọc", icon: <ExclamationCircleOutlined /> },
    OCCUPIED: { color: "#fa8c16", label: "Đang thuê", icon: <ExclamationCircleOutlined /> },
    MAINTENANCE: { color: "#8c8c8c", label: "Bảo trì", icon: <ToolOutlined /> },
  };

  if (!room && !loading) return null;

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

          {/* Thông tin người thuê */}
          {(tenant || tenantSnapshot) && (
            <>
              <Divider orientation="left" style={{ marginTop: 24 }}>
                <UserOutlined /> Thông tin người thuê
              </Divider>
              
              <Descriptions
                bordered
                column={1}
                size="middle"
                styles={{
                  label: { fontWeight: 600, background: "#fafafa", width: "200px" },
                  content: { background: "#fff" },
                }}
              >
                <Descriptions.Item label="Họ tên">
                  <Space>
                    <UserOutlined />
                    <Text strong>
                      {tenant?.fullName || tenantSnapshot?.fullName || "N/A"}
                    </Text>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Số điện thoại">
                  <Space>
                    <PhoneOutlined />
                    {tenant?.phone || tenantSnapshot?.phone || "N/A"}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    {tenant?.email || "N/A"}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="CMND/CCCD">
                  <Space>
                    <IdcardOutlined />
                    {tenantSnapshot?.identityNo || (tenant as any)?.identityNo || activeContract?.coTenants?.[0]?.identityNo || "Không có"}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ">
                  {tenantSnapshot?.address || (tenant as any)?.address || activeContract?.coTenants?.[0]?.address || "Không có"}
                </Descriptions.Item>

                <Descriptions.Item label="Ghi chú">
                  {tenantSnapshot?.note || "Không có"}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {/* Thông tin người ở cùng */}
          {activeContract?.coTenants && activeContract.coTenants.length > 0 && (
            <>
              <Divider orientation="left" style={{ marginTop: 24 }}>
                <TeamOutlined /> Người ở cùng
              </Divider>
              <Descriptions
                bordered
                column={1}
                size="middle"
                styles={{
                  label: { fontWeight: 600, background: "#fafafa", width: "200px" },
                  content: { background: "#fff" },
                }}
              >
                {activeContract.coTenants
                  .filter((ct: any) => ct.status === "ACTIVE")
                  .map((ct: any, idx: number) => (
                    <Descriptions.Item key={idx} label={`Người ở cùng ${idx + 1}`}>
                      <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <div>
                          <UserOutlined /> <Text strong>{ct.fullName || "N/A"}</Text>
                        </div>
                        <div>
                          <PhoneOutlined /> {ct.phone || "N/A"}
                        </div>
                        {ct.email && (
                          <div>
                            <MailOutlined /> {ct.email}
                          </div>
                        )}
                        {ct.identityNo && (
                          <div>
                            <IdcardOutlined /> {ct.identityNo}
                          </div>
                        )}
                        {ct.joinedAt && (
                          <div style={{ color: "#666", fontSize: 12 }}>
                            Tham gia: {dayjs(ct.joinedAt).format("DD/MM/YYYY")}
                          </div>
                        )}
                      </Space>
                    </Descriptions.Item>
                  ))}
              </Descriptions>
            </>
          )}

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
                        onClick: async () => {
                          // Tìm checkin có receiptBillId trùng với receipt bill _id
                          const receiptBillId = record._id;
                          let checkinId: string | null = null;
                         
                          // Tìm trong room.checkins trước (đã có sẵn)
                         if (room?.checkins && room.checkins.length > 0) {
                           const checkin = room.checkins.find((c: Checkin) => {
                             const cReceiptBillId = typeof c.receiptBillId === 'string'
                               ? c.receiptBillId
                               : (c.receiptBillId as any)?._id;
                             return cReceiptBillId === receiptBillId;
                           });
                           if (checkin) {
                             checkinId = checkin._id;
                           }
                         }
                       
                         // Nếu không tìm thấy trong room.checkins, gọi API để tìm
                         if (!checkinId) {
                           try {
                             const response = await adminCheckinService.getAll({ limit: 100 });
                             const allCheckins = response.data || [];
                             const checkin = allCheckins.find((c: Checkin) => {
                               const cReceiptBillId = typeof c.receiptBillId === 'string'
                                 ? c.receiptBillId
                                 : (c.receiptBillId as any)?._id;
                               return cReceiptBillId === receiptBillId;
                             });
                             if (checkin) {
                               checkinId = checkin._id;
                             }
                           } catch (error) {
                             console.error("Error finding checkin:", error);
                           }
                         }
                       
                         // Đóng drawer và chuyển sang trang checkins với checkinId
                          onClose();
                          if (checkinId) {
                            navigate(`/admin/checkins`, { state: { checkinId } });
                          } else {
                            message.warning("Không tìm thấy checkin liên quan đến phiếu thu này");
                          }
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
                      onRow={(record) => ({
                        onClick: () => {
                          // Đóng drawer và chuyển sang trang hợp đồng với contractId
                          const contractId = record._id;
                          onClose();
                          navigate(`/admin/final-contracts`, { state: { contractId } });
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
                  <DollarOutlined /> Hóa đơn ({room?.bills?.filter((b: any) => b.billType === "MONTHLY").length || 0})
                </span>
              ),
              children: (
                <>
                  {room?.bills && room.bills.filter((b: any) => b.billType === "MONTHLY").length > 0 ? (
                    <Table
                      columns={billColumns}
                      dataSource={room.bills.filter((b: any) => b.billType === "MONTHLY")}
                      rowKey="_id"
                      size="small"
                      pagination={{ pageSize: 10 }}
                      onRow={(record) => ({
                        onClick: () => {
                          // Đóng drawer và chuyển sang trang quản lý hóa đơn hàng tháng với billId
                          onClose();
                          navigate(`/admin/bills?billId=${record._id}`);
                        },
                        style: { cursor: 'pointer' }
                      })}
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Text type="secondary">Không có hóa đơn hàng tháng</Text>
                    </div>
                  )}
                </>
              ),
            },
            {
              key: "5",
              label: (
                <span>
                  <HistoryOutlined /> Lịch sử ({timelineEvents.length})
                </span>
              ),
              children: (
                <>
                  {logsLoading ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Spin />
                    </div>
                  ) : (
                    <>
                      {/* Thống kê tổng quan */}
                      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                          <Card size="small" bordered={false} style={{ background: '#f0f5ff' }}>
                            <Statistic
                              title="Số lần cho thuê"
                              value={historyStats.totalContracts}
                              prefix={<FileTextOutlined />}
                              valueStyle={{ color: '#1890ff' }}
                            />
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card size="small" bordered={false} style={{ background: '#f6ffed' }}>
                            <Statistic
                              title="Lần thanh toán"
                              value={historyStats.totalPayments}
                              prefix={<CheckCircleOutlined />}
                              valueStyle={{ color: '#52c41a' }}
                            />
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card size="small" bordered={false} style={{ background: '#fff7e6' }}>
                            <Statistic
                              title="Tổng doanh thu"
                              value={historyStats.totalRevenue}
                              prefix={<DollarOutlined />}
                              valueStyle={{ color: '#fa8c16' }}
                              suffix="VNĐ"
                            />
                          </Card>
                        </Col>
                      </Row>

                      {/* Timeline */}
                      {timelineEvents.length > 0 ? (
                        <div style={{ maxHeight: 600, overflowY: 'auto', paddingRight: 8 }}>
                          <Timeline
                            mode="left"
                            items={timelineEvents.map((event, idx) => ({
                              key: idx,
                              color: event.color,
                              dot: event.icon,
                              label: (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {dayjs(event.date).format('DD/MM/YYYY HH:mm')}
                                </Text>
                              ),
                              children: (
                                <Card
                                  size="small"
                                  bordered={false}
                                  style={{
                                    background: '#fafafa',
                                    cursor: event.type === 'CONTRACT' || event.type === 'BILL' || event.type === 'RECEIPT' || event.type === 'CHECKIN' ? 'pointer' : 'default',
                                  }}
                                  onClick={() => {
                                    if (event.type === 'CONTRACT' && event.data?._id) {
                                      onClose();
                                      navigate(`/admin/final-contracts`, { state: { contractId: event.data._id } });
                                    } else if (event.type === 'BILL' && event.data?._id) {
                                      onClose();
                                      navigate(`/admin/bills?billId=${event.data._id}`);
                                    } else if (event.type === 'RECEIPT' && event.data?._id) {
                                      // Tìm checkin liên quan
                                      const checkin = room?.checkins?.find((c: Checkin) => {
                                        const cReceiptBillId = typeof c.receiptBillId === 'string'
                                          ? c.receiptBillId
                                          : (c.receiptBillId as any)?._id;
                                        return cReceiptBillId === event.data._id;
                                      });
                                      if (checkin?._id) {
                                        onClose();
                                        navigate(`/admin/checkins`, { state: { checkinId: checkin._id } });
                                      }
                                    } else if (event.type === 'CHECKIN' && event.data?._id) {
                                      onClose();
                                      navigate(`/admin/checkins`, { state: { checkinId: event.data._id } });
                                    }
                                  }}
                                >
                                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                    <Text strong style={{ fontSize: 14 }}>
                                      {event.title}
                                    </Text>
                                    {event.description && (
                                      <Text type="secondary" style={{ fontSize: 13 }}>
                                        {event.description}
                                      </Text>
                                    )}
                                    <Tag color={event.color} style={{ marginTop: 4 }}>
                                      {event.type === 'CONTRACT' && 'Hợp đồng'}
                                      {event.type === 'CHECKIN' && 'Checkin'}
                                      {event.type === 'RECEIPT' && 'Phiếu thu'}
                                      {event.type === 'BILL' && 'Hóa đơn'}
                                      {event.type === 'STATUS_CHANGE' && 'Trạng thái'}
                                      {event.type === 'PRICE_CHANGE' && 'Giá phòng'}
                                      {event.type === 'OTHER' && 'Khác'}
                                    </Tag>
                                  </Space>
                                </Card>
                              ),
                            }))}
                          />
                        </div>
                      ) : (
                        <Empty
                          description={<Text type="secondary">Chưa có lịch sử</Text>}
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      )}
                    </>
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
