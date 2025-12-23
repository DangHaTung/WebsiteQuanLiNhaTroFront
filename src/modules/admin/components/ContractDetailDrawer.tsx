import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Divider, Tag, Typography, Row, Col, Space, Spin, message } from "antd";
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, UserOutlined, HomeOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Contract } from "../../../types/contract";
import type { Tenant } from "../../../types/tenant";
import type { Room } from "../../../types/room";
import { adminContractService } from "../services/contract";

interface ContractDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  contractId: string | null;
}

const { Title, Text } = Typography;

const ContractDetailDrawer: React.FC<ContractDetailDrawerProps> = ({
  open,
  onClose,
  contractId,
}) => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);

  // Cấu hình trạng thái hợp đồng
  const statusConfig: Record<
    string,
    { color: string; label: string; icon: React.ReactNode }
  > = {
    ACTIVE: {
      color: "#52c41a",
      label: "Đang hiệu lực",
      icon: <CheckCircleOutlined />,
    },
    ENDED: {
      color: "#8c8c8c",
      label: "Đã kết thúc",
      icon: <ClockCircleOutlined />,
    },
    CANCELED: {
      color: "#ff4d4f",
      label: "Đã hủy",
      icon: <ExclamationCircleOutlined />,
    },
  };

  useEffect(() => {
    const fetchContract = async () => {
      if (!contractId || !open) return;
      setLoading(true);
      try {
        const data = await adminContractService.getById(contractId);
        console.log("API contract detail:", data);
        if (!data) {
          message.warning("Không tìm thấy dữ liệu hợp đồng");
        } else {
          setContract(data);
        }
      } catch (err: any) {
        console.error("Lỗi API:", err);
        message.error(err.message || "Lỗi khi lấy chi tiết hợp đồng");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId, open]);

  if (!contract && !loading) return null;

  const tenant = typeof contract?.tenantId === "object" ? (contract.tenantId as Tenant) : null;
  const room = typeof contract?.roomId === "object" ? (contract.roomId as Room) : null;

  return (
    <Drawer
      title={
        <Space>
          <FileTextOutlined style={{ fontSize: 22, color: "#1677ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết hợp đồng {contract?._id?.substring(0, 8)}...
          </Title>
        </Space>
      }
      placement="right"
      width={600}
      onClose={() => {
        setContract(null);
        onClose();
      }}
      open={open}
      styles={{
        header: { backgroundColor: "#f0f2f5", borderBottom: "1px solid #e8e8e8" },
        body: { backgroundColor: "#f9f9f9" },
      }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Thông tin hợp đồng */}
          <Descriptions
            bordered
            column={1}
            size="middle"
            styles={{
              label: { fontWeight: 600, background: "#fafafa" },
              content: { background: "#fff" },
            }}
          >
            <Descriptions.Item label="Mã hợp đồng">
              <Text code>{contract?._id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {dayjs(contract?.startDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {dayjs(contract?.endDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Thời hạn">
              <Text strong style={{ color: "#1677ff" }}>
                {dayjs(contract?.endDate).diff(
                  dayjs(contract?.startDate),
                  "day"
                )}{" "}
                ngày
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {contract && (
                <Tag
                  color={statusConfig[contract.status]?.color}
                  style={{
                    fontSize: 14,
                    padding: "4px 12px",
                    borderRadius: 16,
                  }}
                  icon={statusConfig[contract.status]?.icon}
                >
                  {statusConfig[contract.status]?.label || contract.status}
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tiền cọc">
              <Text strong style={{ color: "#fa8c16", fontSize: 16 }}>
                {Number(contract?.deposit || 0).toLocaleString("vi-VN")} ₫
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tiền thuê/tháng">
              <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                {Number(contract?.monthlyRent || 0).toLocaleString("vi-VN")} ₫
              </Text>
            </Descriptions.Item>
          </Descriptions>

          {/* Thông tin người thuê */}
          {tenant && (
            <>
              <Divider orientation="left" style={{ marginTop: 24 }}>
                <UserOutlined /> Thông tin người thuê
              </Divider>
              <Descriptions
                bordered
                column={1}
                size="small"
                styles={{
                  label: { fontWeight: 600, background: "#fafafa" },
                  content: { background: "#fff" },
                }}
              >
                <Descriptions.Item label="Họ tên">
                  <Text strong>{tenant.fullName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {tenant.email || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <Text strong style={{ color: "#1677ff" }}>
                    {tenant.phone || "Chưa cập nhật"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="CCCD/CMND">
                  <Text strong style={{ color: "#52c41a" }}>
                    {tenant.identityNo || "Chưa cập nhật"}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {/* Thông tin phòng */}
          {room && (
            <>
              <Divider orientation="left" style={{ marginTop: 24 }}>
                <HomeOutlined /> Thông tin phòng
              </Divider>
              <Descriptions
                bordered
                column={1}
                size="small"
                styles={{
                  label: { fontWeight: 600, background: "#fafafa" },
                  content: { background: "#fff" },
                }}
              >
                <Descriptions.Item label="Số phòng">
                  <Text strong>{room.roomNumber}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại phòng">{room.type}</Descriptions.Item>
                <Descriptions.Item label="Diện tích">{room.areaM2} m²</Descriptions.Item>
                <Descriptions.Item label="Tầng">{room.floor}</Descriptions.Item>
                <Descriptions.Item label="Giá phòng">
                  <Text strong style={{ color: "#ff4d4f", fontSize: 16 }}>
                    {Number(room.pricePerMonth || 0).toLocaleString("vi-VN")} ₫/tháng
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tình trạng">
                  <Tag
                    color={
                      room.status === "AVAILABLE"
                        ? "#52c41a"
                        : room.status === "OCCUPIED"
                          ? "#fa8c16"
                          : "#8c8c8c"
                    }
                    style={{ borderRadius: 12, fontWeight: 600 }}
                  >
                    {room.status === "AVAILABLE"
                      ? "Còn trống"
                      : room.status === "OCCUPIED"
                        ? "Đang thuê"
                        : "Bảo trì"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {/* Thống kê tài chính */}
          <Divider orientation="left" style={{ marginTop: 24 }}>
            <DollarOutlined /> Thống kê tài chính
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
              <div
                style={{
                  background: "#fff",
                  padding: 16,
                  borderRadius: 8,
                  textAlign: "center",
                  border: "1px solid #e8e8e8",
                }}
              >
                <Text type="secondary">Tiền thuê</Text>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#52c41a",
                    marginTop: 4,
                  }}
                >
                  {Number(contract?.monthlyRent || 0).toLocaleString("vi-VN")} ₫
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  background: "#fff",
                  padding: 16,
                  borderRadius: 8,
                  textAlign: "center",
                  border: "1px solid #e8e8e8",
                }}
              >
                <Text type="secondary">Tiền cọc</Text>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#fa8c16",
                    marginTop: 4,
                  }}
                >
                  {Number(contract?.deposit || 0).toLocaleString("vi-VN")} ₫
                </div>
              </div>
            </Col>
          </Row>
        </>
      )}
    </Drawer>
  );
};

export default ContractDetailDrawer;
