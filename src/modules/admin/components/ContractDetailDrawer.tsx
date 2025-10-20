import React from "react";
import { Drawer, Descriptions, Divider, Tag, Typography, Row, Col, Space } from "antd";
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  HomeOutlined,
  DollarOutlined
} from "@ant-design/icons";
import type { Contract } from "../../../types/contract";
import type { Tenant } from "../../../types/tenant";
import type { Room } from "../../../types/room";
import dayjs from "dayjs";

interface ContractDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  contract: Contract | null;
  tenants: Tenant[];
  rooms: Room[];
}

const { Title, Text } = Typography;

const ContractDetailDrawer: React.FC<ContractDetailDrawerProps> = ({ 
  open, 
  onClose, 
  contract, 
  tenants, 
  rooms 
}) => {
  if (!contract) return null;

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

  const getTenantInfo = (tenantId: string | Tenant): Tenant | null => {
    if (typeof tenantId === "object" && tenantId?._id) {
      return tenantId;
    }
    return tenants.find((t) => t._id === tenantId) || null;
  };

  const getRoomInfo = (roomId: string | Room): Room | null => {
    // Ưu tiên lấy từ rooms array để có đầy đủ thông tin
    if (typeof roomId === "object" && roomId?._id) {
      const fullRoomInfo = rooms.find((r) => r._id === roomId._id);
      return fullRoomInfo || roomId; // fallback về populated data nếu không tìm thấy
    }
    return rooms.find((r) => r._id === roomId) || null;
  };

  const tenant = getTenantInfo(contract.tenantId);
  const room = getRoomInfo(contract.roomId);

  return (
    <Drawer
      title={
        <Space>
          <FileTextOutlined style={{ fontSize: 22, color: "#1677ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết hợp đồng {contract._id.substring(0, 8)}...
          </Title>
        </Space>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      styles={{
        body: { backgroundColor: "#f9f9f9" },
        header: { backgroundColor: "#f0f2f5", borderBottom: "1px solid #e8e8e8" },
      }}
    >
      {/* Thông tin hợp đồng */}
      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, background: "#fafafa" }}
        contentStyle={{ background: "#fff" }}
      >
        <Descriptions.Item label="Mã hợp đồng">
          <Text code>{contract._id}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">
          {dayjs(contract.startDate).format("DD/MM/YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày kết thúc">
          {dayjs(contract.endDate).format("DD/MM/YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Thời hạn">
          <Text strong style={{ color: "#1677ff" }}>
            {dayjs(contract.endDate).diff(dayjs(contract.startDate), 'day')} ngày
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag
            color={statusConfig[contract.status]?.color || "#8c8c8c"}
            style={{ fontSize: 14, padding: "4px 12px", borderRadius: 16 }}
            icon={statusConfig[contract.status]?.icon || <ClockCircleOutlined />}
          >
            {statusConfig[contract.status]?.label || contract.status}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tiền cọc">
          <Text strong style={{ color: "#fa8c16", fontSize: 16 }}>
            {Number(contract.deposit || 0).toLocaleString("vi-VN")} ₫
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Tiền thuê/tháng">
          <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
            {Number(contract.monthlyRent || 0).toLocaleString("vi-VN")} ₫
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
            labelStyle={{ fontWeight: 600, background: "#fafafa" }}
            contentStyle={{ background: "#fff" }}
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
            labelStyle={{ fontWeight: 600, background: "#fafafa" }}
            contentStyle={{ background: "#fff" }}
          >
            <Descriptions.Item label="Số phòng">
              <Text strong>{room.roomNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Loại phòng">
              <Tag 
                color={
                  room.type === "SINGLE" ? "green" :
                  room.type === "DOUBLE" ? "blue" :
                  room.type === "DORM" ? "orange" :
                  room.type === "STUDIO" ? "purple" :
                  room.type === "VIP" ? "red" : "default"
                } 
                style={{ borderRadius: 12, fontWeight: 600 }}
              >
                {room.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Diện tích">
              <Text strong style={{ color: "#1677ff" }}>
                {room.areaM2} m²
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tầng">
              <Text strong style={{ color: "#52c41a" }}>
                {room.floor}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Giá phòng">
              <Text strong style={{ color: "#ff4d4f", fontSize: 16 }}>
                {Number(room.pricePerMonth || 0).toLocaleString("vi-VN")} ₫/tháng
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tình trạng phòng">
              <Tag
                color={
                  room.status === "AVAILABLE" ? "#52c41a" :
                  room.status === "OCCUPIED" ? "#fa8c16" : "#8c8c8c"
                }
                style={{ borderRadius: 12, fontWeight: 600 }}
              >
                {room.status === "AVAILABLE" ? "Còn trống" :
                 room.status === "OCCUPIED" ? "Đang thuê" : "Bảo trì"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </>
      )}

      {/* Thống kê */}
      <Divider orientation="left" style={{ marginTop: 24 }}>
        <DollarOutlined /> Thống kê tài chính
      </Divider>
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ 
            background: "#fff", 
            padding: 16, 
            borderRadius: 8, 
            textAlign: "center",
            border: "1px solid #e8e8e8"
          }}>
            <Text type="secondary">Tổng tiền thuê</Text>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#52c41a", marginTop: 4 }}>
              {Number(contract.monthlyRent || 0).toLocaleString("vi-VN")} ₫
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ 
            background: "#fff", 
            padding: 16, 
            borderRadius: 8, 
            textAlign: "center",
            border: "1px solid #e8e8e8"
          }}>
            <Text type="secondary">Tiền cọc</Text>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fa8c16", marginTop: 4 }}>
              {Number(contract.deposit || 0).toLocaleString("vi-VN")} ₫
            </div>
          </div>
        </Col>
      </Row>

      <style>{`
        .ant-descriptions-item-label {
          font-weight: 600 !important;
        }
      `}</style>
    </Drawer>
  );
};

export default ContractDetailDrawer;
