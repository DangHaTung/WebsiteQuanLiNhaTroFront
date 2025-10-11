import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Button,
  Rate,
  Form,
  Input,
  Descriptions,
  Skeleton,
  Space,
  Divider,
  message,
} from "antd";
import {
  EnvironmentOutlined,
  FullscreenOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import type { Room } from "../../../types/room";
import RoomCard from "../components/RoomCard";
import "../../../assets/styles/roomsDetail.css";

const { Title, Paragraph, Text } = Typography;

const RoomsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(4.5);
  const [related, setRelated] = useState<Room[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  // Fetch main room
  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch("/db.json");
        if (!res.ok) throw new Error("Failed to fetch db.json");
        const data = await res.json();
        const foundRoom = data.rooms?.find((r: Room) => r._id === id);
        setRoom(foundRoom || null);
      } catch {
        message.error("Không tìm thấy phòng!");
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  // Fetch related rooms
  useEffect(() => {
    const fetchRelated = async () => {
      if (!room) return;
      setLoadingRelated(true);
      try {
        const res = await fetch("/db.json");
        if (!res.ok) throw new Error("Failed to fetch db.json");
        const data = await res.json();
        const all = data.rooms || [];
        const others = all.filter((r: Room) => r._id !== room._id);
        const sameDistrict = others.filter((r: Room) => r.district === room.district);
        setRelated((sameDistrict.length ? sameDistrict : others).slice(0, 4));
      } catch {
        setRelated([]);
      } finally {
        setLoadingRelated(false);
      }
    };
    fetchRelated();
  }, [room]);

  const formatCurrency = (v: string | number | undefined) => {
    if (v === undefined || v === null) return "0";
    const num = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(num) ? "0" : num.toLocaleString("vi-VN");
  };

  const price = room ? formatCurrency(room.pricePerMonth) : "";
  const gallery: string[] = room
    ? Array.isArray(room.images) && room.images.length
      ? room.images
      : room.image
      ? [room.image, room.image, room.image, room.image]
      : []
    : [];

  const goPrev = () => setCurrentImage((i) => (i - 1 + gallery.length) % gallery.length);
  const goNext = () => setCurrentImage((i) => (i + 1) % gallery.length);
  const handleBook = () => message.success("Đã gửi yêu cầu đặt phòng!");

  if (loading) {
    return (
      <div className="room-detail-loading">
        <Skeleton.Button style={{ width: 120, marginBottom: 16 }} active />
        <Row gutter={[32, 32]}>
          <Col xs={24} md={16}>
            <Card className="room-detail-skeleton-card">
              <Skeleton.Image active style={{ width: "100%", height: 380 }} />
              <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 16 }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="room-detail-skeleton-card">
              <Skeleton active paragraph={{ rows: 3 }} />
              <Skeleton.Button block active style={{ height: 40, marginTop: 12 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="room-detail-notfound">
        <Title level={3}>Không tìm thấy phòng</Title>
        <Button type="primary" onClick={() => navigate("/rooms")}>
          Quay về danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="room-detail-container">
      {/* Hero */}
      <div
        className="room-hero"
        style={{
          background: `url(${
            gallery[0] || room.image || `https://picsum.photos/id/${room._id.slice(-3)}/800/400`
          }) center/cover no-repeat`,
        }}
      >
        <div className="room-hero-overlay" />
        <div className="room-hero-content">
          <Title level={1} className="room-hero-title">
            Phòng {room.roomNumber} - {room.type}
          </Title>
          <Space wrap align="center" size={12}>
            <Text className="room-hero-text">
              <EnvironmentOutlined /> {room.district}
            </Text>
            <span className="room-hero-rating">
              <Rate allowHalf disabled value={userRating} />{" "}
              <Text>{userRating.toFixed(1)}</Text>
            </span>
          </Space>
        </div>
      </div>

      {/* Main Content */}
      <Row gutter={[32, 32]} className="room-main">
        <Col xs={24} md={16}>
          <Card className="room-gallery-card">
            <div className="room-gallery">
              <img
                src={
                  gallery[currentImage] ||
                  `https://picsum.photos/id/${room._id.slice(-3)}/800/400`
                }
                alt={`Phòng ${room.roomNumber}`}
                className="room-gallery-image"
              />
              {gallery.length > 1 && (
                <>
                  <Button type="text" onClick={goPrev} className="room-gallery-prev">
                    ‹
                  </Button>
                  <Button type="text" onClick={goNext} className="room-gallery-next">
                    ›
                  </Button>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="room-gallery-thumbs">
                {gallery.slice(0, 8).map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`room-thumb-btn ${
                      idx === currentImage ? "active" : ""
                    }`}
                  >
                    <img src={src} alt={`thumb-${idx + 1}`} className="room-thumb-img" />
                  </button>
                ))}
              </div>
            )}

            <div className="room-header">
              <Space size={12} align="baseline">
                <Title level={3} style={{ margin: 0 }}>
                  Phòng {room.roomNumber} - {room.type}
                </Title>
                {room.status === "AVAILABLE" && <Tag color="green">TRỐNG</Tag>}
                {room.status === "OCCUPIED" && <Tag color="red">ĐÃ THUÊ</Tag>}
              </Space>
              <Space>
                <Rate
                  allowHalf
                  value={userRating}
                  onChange={(v) => {
                    setUserRating(v);
                    message.success("Cảm ơn bạn đã đánh giá!");
                  }}
                />
                <Text strong>{userRating.toFixed(1)}</Text>
              </Space>
            </div>

            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              <EnvironmentOutlined /> {room.district} - Tầng {room.floor}
            </Paragraph>

            <Divider />

            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="Diện tích">
                {room.areaM2} m²
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng">
                {room.status === "AVAILABLE" ? "Sẵn sàng thuê" : "Đã thuê"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            <Title level={4}>Mô tả</Title>
            <Paragraph>
              Phòng đầy đủ tiện nghi, khu vực an ninh, gần trung tâm và thuận tiện di
              chuyển. Phù hợp cho sinh viên hoặc người đi làm cần không gian yên tĩnh
              và sạch sẽ.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="room-booking-card">
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
              <div className="room-booking-price">
                <Text type="secondary">Giá thuê</Text>
                <Title level={2}>{price} VNĐ / tháng</Title>
              </div>

              <div className="room-booking-phone">
                <PhoneOutlined />{" "}
                <a href="tel:0901458000" className="room-phone-link">
                  012.345.6789
                </a>
              </div>

              <Divider />
              <div>
                <Text strong>Thông tin người thuê</Text>
                <Form layout="vertical" onFinish={handleBook} style={{ marginTop: 12 }}>
                  <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                  >
                    <Input placeholder="Nguyễn Văn A" allowClear />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
                  >
                    <Input placeholder="email@example.com" allowClear />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                  >
                    <Input placeholder="0901xxxxxx" allowClear />
                  </Form.Item>
                  <Form.Item
                    name="content"
                    label="Nội dung"
                    rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                  >
                    <Input.TextArea rows={4} placeholder="Tôi muốn xem phòng..." allowClear />
                  </Form.Item>
                  <Button
                    htmlType="submit"
                    type="primary"
                    size="large"
                    block
                    className="btn-animated"
                    style={{
                      height: 44,
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 14
                    }}
                  >
                    Đặt phòng
                  </Button>
                </Form>
              </div>

              <Divider />
              <Space direction="vertical" size={6}>
                <Text type="secondary">Cam kết</Text>
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />{" "}
                  <Text>Hình ảnh thật 100%</Text>
                </Space>
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />{" "}
                  <Text>Hỗ trợ xem phòng miễn phí</Text>
                </Space>
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />{" "}
                  <Text>Hợp đồng minh bạch</Text>
                </Space>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />
      <div className="room-related">
        <Title level={3}>Sản phẩm liên quan</Title>
        {loadingRelated ? (
          <Row gutter={[24, 24]}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Col xs={24} sm={12} md={12} lg={6} key={i}>
                <Card className="room-related-skeleton">
                  <Skeleton.Image style={{ width: "100%", height: 160 }} active />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[24, 24]}>
            {related.length ? (
              related.map((r) => (
                <Col xs={24} sm={12} md={12} lg={6} key={r._id}>
                  <RoomCard room={r} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Text type="secondary">Chưa có phòng tương tự để gợi ý.</Text>
              </Col>
            )}
          </Row>
        )}
      </div>
    </div>
  );
};

export default RoomsDetail;
