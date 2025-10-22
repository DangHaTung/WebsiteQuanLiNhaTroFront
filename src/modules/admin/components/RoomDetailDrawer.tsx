import React from "react";
import { Drawer, Descriptions, Image, Divider, Tag, Typography, Row, Col, Space } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined, ToolOutlined, HomeOutlined } from "@ant-design/icons";
import type { Room } from "../../../types/room";

interface RoomDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  room: Room | null;
}

const { Title, Text } = Typography;

const RoomDetailDrawer: React.FC<RoomDetailDrawerProps> = ({ open, onClose, room }) => {
  if (!room) return null;

  const statusConfig: Record<
    string,
    { color: string; label: string; icon: React.ReactNode }
  > = {
    AVAILABLE: {
      color: "#52c41a",
      label: "Còn trống",
      icon: <CheckCircleOutlined />,
    },
    OCCUPIED: {
      color: "#fa8c16",
      label: "Đang thuê",
      icon: <ExclamationCircleOutlined />,
    },
    MAINTENANCE: {
      color: "#8c8c8c",
      label: "Bảo trì",
      icon: <ToolOutlined />,
    },
  };

  return (
    <Drawer
      title={
        <Space>
          <HomeOutlined style={{ fontSize: 22, color: "#1677ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết phòng {room.roomNumber}
          </Title>
        </Space>
      }
      placement="right"
      width={500}
      onClose={onClose}
      open={open}
      styles={{
        body: { backgroundColor: "#f9f9f9" },
        header: { backgroundColor: "#f0f2f5", borderBottom: "1px solid #e8e8e8" },
      }}
    >
      {/* Thông tin phòng */}
      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, background: "#fafafa" }}
        contentStyle={{ background: "#fff" }}
      >
        <Descriptions.Item label="Số phòng">{room.roomNumber}</Descriptions.Item>
        <Descriptions.Item label="Loại phòng">{room.type}</Descriptions.Item>
        <Descriptions.Item label="Giá thuê">
          <Text strong style={{ color: "#1677ff" }}>
            {room.pricePerMonth?.toLocaleString()} VNĐ / tháng
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Diện tích">{room.areaM2} m²</Descriptions.Item>
        <Descriptions.Item label="Tầng">{room.floor}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag
            color={statusConfig[room.status].color}
            style={{ fontSize: 14, padding: "4px 12px", borderRadius: 16 }}
            icon={statusConfig[room.status].icon}
          >
            {statusConfig[room.status].label}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left" style={{ marginTop: 24 }}>
        Hình ảnh phòng
      </Divider>

      {/* Thư viện ảnh */}
      {room.images?.length ? (
        <Row gutter={[12, 12]}>
          {room.images.map((img, idx) => (
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
                  style={{
                    objectFit: "cover",
                  }}
                  preview={{
                    mask: <span>Xem ảnh</span>,
                  }}
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
    </Drawer>
  );
};

export default RoomDetailDrawer;
