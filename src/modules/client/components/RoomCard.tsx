import React from "react";
import { Card, Tag, Button, Space } from "antd";
import {
  FullscreenOutlined,
  EnvironmentOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Room } from "../../../types/room";

interface Props {
  room: Room;
}

const RoomCard: React.FC<Props> = ({ room }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "green";
      case "DEPOSITED":
        return "red";
      case "OCCUPIED":
        return "red";
      case "MAINTENANCE":
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Còn trống";
      case "DEPOSITED":
        return "Được cọc";
      case "OCCUPIED":
        return "Đã thuê";
      case "MAINTENANCE":
        return "Bảo trì";
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "SINGLE":
        return "Phòng đơn";
      case "DOUBLE":
        return "Phòng đôi";
      case "STUDIO":
        return "Studio";
      case "VIP":
        return "Phòng VIP";
      default:
        return type;
    }
  };

  const handleImageClick = () => {
    if (room.status !== "MAINTENANCE") {
      navigate(`/rooms/${room._id}`);
    }
  };

  return (
    <Card
      hoverable
      className="room-card"
      cover={
        <div
          onClick={handleImageClick}
          style={{
            cursor: room.status === "MAINTENANCE" ? "not-allowed" : "pointer",
            position: "relative",
          }}
        >
          <img
            alt={`Phòng ${room.roomNumber || 'N/A'}`}
            src={room.image || 'https://via.placeholder.com/300x180?text=No+Image'}
            style={{
              height: 180,
              objectFit: "cover",
              transition: "transform 0.3s ease",
              width: "100%",
            }}
            onMouseOver={(e) => room.status !== "MAINTENANCE" && (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          {room.status === "MAINTENANCE" && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Đang bảo trì
            </div>
          )}
        </div>
      }
    >
      {/* Tiêu đề + trạng thái */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 600, fontSize: 17 }}>
          Phòng {room.roomNumber}
        </h3>
        <Tag color={getStatusColor(room.status)}>
          {getStatusText(room.status)}
        </Tag>
      </div>

      {/* Loại */}
      <div style={{ fontSize: 14, color: "#555", marginBottom: 4 }}>
        {getTypeText(room.type || 'SINGLE')}
      </div>

      {/* Diện tích & tầng */}
      <Space
        style={{
          fontSize: 14,
          color: "#666",
          marginBottom: 8,
        }}
      >
        <span>
          <FullscreenOutlined /> {room.areaM2 || 0}m²
        </span>
        <span>
          <HomeOutlined /> Tầng {room.floor || 1}
        </span>
      </Space>

      {/* Giá */}
      <div
        style={{
          fontWeight: 700,
          color: "#16a34a",
          fontSize: 18,
        }}
      >
        {new Intl.NumberFormat('vi-VN').format(room.pricePerMonth || 0)}₫
      </div>
    </Card>
  );
};

export default RoomCard;
