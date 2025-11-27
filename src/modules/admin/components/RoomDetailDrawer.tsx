import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Image, Divider, Tag, Typography, Row, Col, Space, message, Spin } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined, ToolOutlined, HomeOutlined } from "@ant-design/icons";
import type { Room } from "../../../types/room";
import { adminRoomService } from "../services/room";

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
          setRoom(data);
        }
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
    OCCUPIED: { color: "#fa8c16", label: "Đang thuê", icon: <ExclamationCircleOutlined /> },
    MAINTENANCE: { color: "#8c8c8c", label: "Bảo trì", icon: <ToolOutlined /> },
  };

  const processedImages = room?.images?.map(img =>
    typeof img === "string" ? img : (img as any).url
  );
    // Render the Drawer component with room details

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
      width={500}
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
              {room && (
                <Tag
                  color={statusConfig[room.status].color}
                  style={{ fontSize: 14, padding: "4px 12px", borderRadius: 16 }}
                  icon={statusConfig[room.status].icon}
                >
                  {statusConfig[room.status].label}
                </Tag>
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
      )}
    </Drawer>
  );
};

export default RoomDetailDrawer;
