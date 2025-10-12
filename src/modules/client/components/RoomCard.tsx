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
      case "OCCUPIED":
        return "Đã thuê";
      case "MAINTENANCE":
        return "Bảo trì";
      default:
        return status;
    }
  };

  return (
    <Card
      hoverable
      className="room-card"
      cover={
        <img
          alt={`Phòng ${room.roomNumber}`}
          src={room.image}
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

      {/* Loại & vị trí */}
      <div style={{ fontSize: 14, color: "#555", marginBottom: 4 }}>
        {room.type} • {room.district}
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
          <FullscreenOutlined /> {room.areaM2}m²
        </span>
        <span>
          <HomeOutlined /> Tầng {room.floor}
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
        {Number(room.pricePerMonth).toLocaleString()}đ
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
