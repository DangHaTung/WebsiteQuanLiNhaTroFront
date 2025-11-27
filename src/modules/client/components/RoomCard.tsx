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

  return (
    <Card
      hoverable
      className="room-card"
      cover={
        <img
          alt={`Phòng ${room.roomNumber || 'N/A'}`}
          src={room.image || 'https://via.placeholder.com/300x180?text=No+Image'}
          style={{
            height: 180,
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
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
          marginBottom: 10,
        }}
      >
        {new Intl.NumberFormat('vi-VN').format(room.pricePerMonth || 0)}₫
      </div>

      {/* Nút hành động - phòng bảo trì không thể xem chi tiết */}
      {room.status === "MAINTENANCE" ? (
        <Button
          block
          disabled
          style={{
            backgroundColor: "#faad14",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "not-allowed",
          }}
        >
          Đang bảo trì
        </Button>
      ) : (
        <Button
          type="primary"
          block
          className="btn-animated"
          onClick={() => navigate(`/rooms/${room._id}`)}
        >
          Xem chi tiết
        </Button>
      )}
    </Card>
  );
};

export default RoomCard;
