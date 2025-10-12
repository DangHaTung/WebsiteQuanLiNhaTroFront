import React, { useEffect, useState } from "react";
import { Row, Col, Spin, Typography } from "antd";
import type { Room } from "../../../types/room";
import RoomCard from "../components/RoomCard";
import dbData from "../../../../db.json";

const { Title } = Typography;

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (dbData && dbData.rooms) {
      const roomsData: Room[] = dbData.rooms.map((room: any) => ({
        _id: room._id,
        roomNumber: room.roomNumber,
        type: room.type as "SINGLE" | "DOUBLE" | "STUDIO" | "VIP",
        pricePerMonth: Number(room.pricePerMonth),
        areaM2: room.areaM2,
        floor: room.floor,
        district: room.district,
        status: room.status as "OCCUPIED" | "AVAILABLE" | "MAINTENANCE",
        image: room.image,
        images: room.images,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      }));

      setRooms(roomsData);
    } else {
      console.error("Không tìm thấy dữ liệu phòng trong db.json");
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải danh sách phòng..." />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Banner đầu trang */}
      <div
        style={{
          position: "relative",
          height: 280,
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          background:
            "url(https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop) center/cover no-repeat",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Title level={2} style={{ color: "#fff", fontWeight: 800 }}>
            Danh Sách Phòng Trọ
          </Title>
        </div>
      </div>

      {/* Danh sách phòng */}
      <div
        style={{
          padding: "0 40px",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <Row gutter={[24, 24]}>
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <Col xs={24} sm={12} md={12} lg={6} xl={6} key={room._id}>
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <RoomCard room={room} />
                </div>
              </Col>
            ))
          ) : (
            <Col span={24} style={{ textAlign: "center", padding: "40px 0" }}>
              <Title level={4} style={{ color: "#999" }}>
                Không có phòng nào để hiển thị
              </Title>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default Rooms;
