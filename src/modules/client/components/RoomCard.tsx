import React from "react";
import { Card, Tag, Button } from "antd";
import { FullscreenOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Room } from "../../../types/room";

interface Props {
  room: Room;
}

const RoomCard: React.FC<Props> = ({ room }) => {
  const navigate = useNavigate();

  const formatCurrency = (v: string | number | undefined) => {
    if (v === undefined || v === null) return "0";
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return isNaN(num) ? "0" : num.toLocaleString("vi-VN");
  };

  return (
    <Card
      hoverable
      style={{
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      cover={
        <img
          alt={`Phòng ${room.roomNumber}`}
          src={room.image || `https://picsum.photos/id/${room._id.slice(-3)}/800/400`}
          style={{
            height: 220,
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      }
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header với tên phòng và trạng thái */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: 0,
              fontSize: 18,
              fontWeight: "bold",
              color: "#1f2937",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              Phòng {room.roomNumber}
            </h3>
            <p style={{
              margin: "4px 0 0 0",
              fontSize: 14,
              color: "#6b7280",
              fontWeight: 500
            }}>
              {room.type} • {room.district}
            </p>
          </div>
          <div style={{ marginLeft: 12 }}>
            {room.status === 'AVAILABLE' && <Tag color="green">Còn trống</Tag>}
            {room.status === 'OCCUPIED' && <Tag color="red">Đã thuê</Tag>}
            {room.status === 'MAINTENANCE' && <Tag color="orange">Bảo trì</Tag>}
          </div>
        </div>

        {/* Thông tin cơ bản */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          padding: "12px 0",
          borderTop: "1px solid #f3f4f6",
          borderBottom: "1px solid #f3f4f6"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <FullscreenOutlined style={{ color: "#3b82f6" }} />
              <span style={{ fontWeight: 500, fontSize: 14 }}>{room.areaM2}m²</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>🏠</span>
              <span style={{ fontWeight: 500, fontSize: 14 }}>Tầng {room.floor}</span>
            </div>
          </div>
          <div style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#059669"
          }}>
            {formatCurrency(room.pricePerMonth)}đ
          </div>
        </div>

        {/* Thông tin trạng thái */}
        {/* <div style={{ marginBottom: 16, flex: 1 }}>
          <div style={{
            fontSize: 12,
            color: "#6b7280",
            marginBottom: 8,
            fontWeight: 500
          }}>
            Trạng thái:
          </div>
          <div style={{
            padding: "8px 12px",
            background: room.status === 'AVAILABLE' ? "#f0fdf4" :
                       room.status === 'OCCUPIED' ? "#fef2f2" : "#fff7ed",
            borderRadius: 8,
            border: `1px solid ${room.status === 'AVAILABLE' ? "#bbf7d0" :
                               room.status === 'OCCUPIED' ? "#fecaca" : "#fed7aa"}`,
            textAlign: "center"
          }}>
            <span style={{
              fontSize: 14,
              fontWeight: 500,
              color: room.status === 'AVAILABLE' ? "#166534" :
                     room.status === 'OCCUPIED' ? "#991b1b" : "#9a3412"
            }}>
              {room.status === 'OCCUPIED' && room.currentContractSummary ?
                `Đã thuê bởi ${room.currentContractSummary.tenantName}` :
                room.status === 'MAINTENANCE' ? 'Đang bảo trì' : 'Sẵn sàng cho thuê'
              }
            </span>
          </div>
        </div> */}

        {/* Nút hành động - đẩy xuống cuối */}
        <div style={{ marginTop: "auto" }}>
          <Button
            type="primary"
            block
            className="btn-animated"
            onClick={() => navigate(`/rooms/${room._id}`)}
            disabled={room.status === 'MAINTENANCE'}
            style={{
              height: 44,
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              backgroundColor: room.status === 'MAINTENANCE' ? '#dc2626' : undefined,
              color: room.status === 'MAINTENANCE' ? '#ffffff' : undefined,
              borderColor: room.status === 'MAINTENANCE' ? '#dc2626' : undefined,
            }}
          >
            {room.status === 'MAINTENANCE' ? 'Đang bảo trì' : 'Xem chi tiết'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
export default RoomCard;
