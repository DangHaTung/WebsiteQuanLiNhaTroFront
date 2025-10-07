import React from "react";
import { Card, Tag, Button } from "antd";
import { HomeOutlined, RestOutlined, FullscreenOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Room } from "../../../types/room";

interface Props {
  room: Room;
}

const RoomCard: React.FC<Props> = ({ room }) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        transition: "all 0.3s",
      }}
      cover={
        <img
          alt={room.title}
          src={room.image}
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0, fontWeight: "bold", fontSize: 18 }}>
          {room.title}
        </h3>
        <div>
          {room.isHot && <Tag color="red">HOT</Tag>}
          {room.isNew && <Tag color="green">NEW</Tag>}
        </div>
      </div>

      <p style={{ color: "#888", marginBottom: 8 }}>{room.address}</p>

      <p style={{ fontWeight: "bold", color: "#1677ff", fontSize: 16 }}>
        {room.price.toLocaleString()} VNĐ / tháng
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontSize: 14,
          color: "#555",
        }}
      >
        <span>
          <HomeOutlined /> {room.bedrooms} PN
        </span>
        <span>
          <RestOutlined /> {room.bathrooms} PT
        </span>
        <span>
          <FullscreenOutlined /> {room.area} m²
        </span>
      </div>

      <Button
        type="primary"
        block
        style={{
          marginTop: 14,
          borderRadius: 8,
          fontWeight: "bold",
        }}
        onClick={() => navigate(`/rooms/${room.id}`)}
      >
        Xem chi tiết »
      </Button>
    </Card>
  );
};

export default RoomCard;
