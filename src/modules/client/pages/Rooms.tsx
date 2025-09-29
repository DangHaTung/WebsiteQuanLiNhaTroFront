import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin } from "antd";
import api from "../services/api";
import type { Room } from "../../../types/room";

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get<Room[]>("/rooms")
      .then((res) => setRooms(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: "40px 20px", background: "#f5f7fa", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", marginBottom: 32, fontWeight: 700 }}>Danh sách phòng trọ</h2>
      <Row gutter={[24, 24]} justify="center">
        {rooms.map((room) => (
          <Col key={room.id} xs={24} sm={12} md={8}>
            <Card 
              hoverable
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: "20px" }}
            >
              <p>Giá: {room.price.toLocaleString()} đ/tháng</p>
              <p>Địa chỉ: {room.address}</p>
              <button style={{background: "#00B4D8"}}>Add</button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Rooms;
