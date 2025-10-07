import React, { useEffect, useState } from "react";
import { Row, Col, Spin, Typography } from "antd";
import api from "../services/api";
import type { Room } from "../../../types/room";
import RoomCard from "../components/RoomCard";

const { Title } = Typography;

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api
      .get<Room[]>("/rooms")
      .then((res) => setRooms(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải danh sách phòng..." />
      </div>
    );

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Banner có ảnh nền + chữ đè lên ảnh */}
      <div
        style={{
          position: "relative",
          height: 280,
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          background: "url(https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop) center/cover no-repeat",
          marginBottom: 24,
        }}
      >
        {/* overlay làm tối ảnh để chữ dễ đọc */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
        {/* nội dung chữ đè lên ảnh */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 16px",
          }}
        >
          <Title level={2} style={{ color: "#fff", margin: 0, fontWeight: 800 }}>
            Danh Sách Phòng Trọ
          </Title>
        </div>
      </div>

      <Row gutter={[24, 24]} style={{ padding: "0 24px" }}>
        {rooms.map((room) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={room.id}>
            <RoomCard room={room} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Rooms;
