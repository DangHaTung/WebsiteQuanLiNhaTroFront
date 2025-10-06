import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Tag, Button } from "antd";
import { HomeOutlined, RestOutlined, FullscreenOutlined } from "@ant-design/icons";
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
    <div style={{ padding: 24 }}>
    <section style={{ textAlign: "center", marginBottom: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: "bold", color: "#1677ff" }}>
        DANH SÁCH PHÒNG TRỌ
      </h2>
    </section>

    <Row gutter={[16, 16]}>
      {rooms.map((room) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={room.id}>
          <Card
            hoverable
            cover={
              <img
                alt={room.title}
                src={room.image}
                style={{ height: 200, objectFit: "cover" }}
              />
            }
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontWeight: "bold" }}>{room.title}</h3>
              <div>
                {room.isHot && <Tag color="red">HOT</Tag>}
                {room.isNew && <Tag color="green">NEW</Tag>}
              </div>
            </div>
            <p style={{ color: "#888", marginBottom: 8 }}>{room.address}</p>
            <p style={{ fontWeight: "bold", color: "#1677ff" }}>
              {room.price.toLocaleString()} VNĐ / tháng
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
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

            <Button type="primary" block style={{ marginTop: 12 }}>
              Chi tiết »
            </Button>
          </Card>
        </Col>
      ))}
    </Row>

    <Row gutter={[16, 16]}>
      {rooms.map((room) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={room.id}>
          <Card
            hoverable
            cover={
              <img
                alt={room.title}
                src={room.image}
                style={{ height: 200, objectFit: "cover" }}
              />
            }
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontWeight: "bold" }}>{room.title}</h3>
              <div>
                {room.isHot && <Tag color="red">HOT</Tag>}
                {room.isNew && <Tag color="green">NEW</Tag>}
              </div>
            </div>
            <p style={{ color: "#888", marginBottom: 8 }}>{room.address}</p>
            <p style={{ fontWeight: "bold", color: "#1677ff" }}>
              {room.price.toLocaleString()} VNĐ / tháng
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
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

            <Button type="primary" block style={{ marginTop: 12 }}>
              Chi tiết »
            </Button>
          </Card>
        </Col>
      ))}
    </Row>

    <Row gutter={[16, 16]}>
      {rooms.map((room) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={room.id}>
          <Card
            hoverable
            cover={
              <img
                alt={room.title}
                src={room.image}
                style={{ height: 200, objectFit: "cover" }}
              />
            }
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontWeight: "bold" }}>{room.title}</h3>
              <div>
                {room.isHot && <Tag color="red">HOT</Tag>}
                {room.isNew && <Tag color="green">NEW</Tag>}
              </div>
            </div>
            <p style={{ color: "#888", marginBottom: 8 }}>{room.address}</p>
            <p style={{ fontWeight: "bold", color: "#1677ff" }}>
              {room.price.toLocaleString()} VNĐ / tháng
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
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

            <Button type="primary" block style={{ marginTop: 12 }}>
              Chi tiết »
            </Button>
          </Card>
        </Col>
      ))}
    </Row>
  </div>
  );
};

export default Rooms;
