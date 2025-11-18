import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Card, Typography, Tag, Button, Rate, Divider, Space, Descriptions, Skeleton, message, Empty } from "antd";
import { EnvironmentOutlined, FullscreenOutlined, CheckCircleOutlined, PhoneOutlined, AppstoreOutlined } from "@ant-design/icons";
import type { Room } from "../../../types/room";
import RoomCard from "../components/RoomCard";
import { getRoomById, getAllRooms } from "../services/room";
import { FaCommentDots, FaFacebook, FaFacebookMessenger } from "react-icons/fa6";

const { Title, Paragraph, Text } = Typography;

const RoomsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  const [related, setRelated] = useState<Room[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const [currentImage, setCurrentImage] = useState(0);
  const [userRating, setUserRating] = useState(4.5);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Lấy chi tiết phòng
  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getRoomById(id);
        setRoom(data);
      } catch (error) {
        console.error(error);
        message.error("Không tìm thấy phòng");
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  // Lấy phòng liên quan
  useEffect(() => {
    const fetchRelated = async () => {
      if (!room) return;
      setLoadingRelated(true);
      try {
        const allRooms = await getAllRooms();
        const relatedRooms = allRooms
          .filter(
            (r) =>
              r._id !== room._id && r.type === room.type && r.status === "AVAILABLE"
          )
          .sort((a, b) => a.pricePerMonth - b.pricePerMonth)
          .slice(0, 6);
        setRelated(relatedRooms);
      } catch (error) {
        console.error(error);
        message.error("Không thể tải phòng liên quan");
      } finally {
        setLoadingRelated(false);
      }
    };
    fetchRelated();
  }, [room]);

  const gallery: string[] = room
    ? room.images && room.images.length
      ? room.images
      : [room.image, room.image, room.image, room.image]
    : [];

  const goPrev = () =>
    setCurrentImage((i) => (i - 1 + gallery.length) % gallery.length);
  const goNext = () => setCurrentImage((i) => (i + 1) % gallery.length);

  const handleBook = () => {
    if (room) navigate(`/checkin/${room._id}`);
  };

  const price = room ? new Intl.NumberFormat("vi-VN").format(room.pricePerMonth) : "";

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <Skeleton.Button style={{ width: 120, marginBottom: 16 }} active />
        <Row gutter={[32, 32]}>
          <Col xs={24} md={16}>
            <Card style={{ borderRadius: 12 }}>
              <Skeleton.Image active style={{ width: "100%", height: 380 }} />
              <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 16 }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ borderRadius: 12 }}>
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
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <Title level={3}>Không tìm thấy phòng</Title>
        <Button type="primary" onClick={() => navigate("/rooms")} className="btn-animated">
          Quay về danh sách
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 0, maxWidth: 1400, margin: "0 auto" }}>
      {/* Hero */}
      <div
        style={{
          position: "relative",
          height: 320,
          borderRadius: 12,
          overflow: "hidden",
          margin: 24,
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          background: `url(${gallery[0] || room.image}) center/cover no-repeat`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            textAlign: "center",
            padding: 16,
          }}
        >
          <Title level={1} style={{ color: "#e6f7ff", marginBottom: 8 }}>
            Phòng {room.roomNumber}
          </Title>
          <Space wrap align="center" size={12}>
            <span style={{ color: "#ffd666" }}>
              <Rate allowHalf disabled value={userRating} />{" "}
              <Text style={{ color: "#ffd666" }}>{userRating.toFixed(1)}</Text>
            </span>
          </Space>
        </div>
      </div>

      {/* Nội dung */}
      <Row gutter={[32, 32]} style={{ padding: 24, paddingTop: 0 }}>
        <Col xs={24} md={16}>
          <Card
            style={{
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            {/* Gallery */}
            <div style={{ position: "relative" }}>
              <img
                src={gallery[currentImage]}
                alt={`Phòng ${room.roomNumber}`}
                style={{ width: "100%", height: 420, objectFit: "cover" }}
              />
              {gallery.length > 1 && (
                <>
                  <Button
                    type="text"
                    onClick={goPrev}
                    style={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.35)",
                      color: "#fff",
                    }}
                  >
                    ‹
                  </Button>
                  <Button
                    type="text"
                    onClick={goNext}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.35)",
                      color: "#fff",
                    }}
                  >
                    ›
                  </Button>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {gallery.slice(0, 8).map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    style={{
                      border:
                        idx === currentImage ? "2px solid #1677ff" : "2px solid transparent",
                      padding: 0,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={src}
                      alt={`thumb-${idx + 1}`}
                      style={{ width: 88, height: 66, objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Thông tin phòng */}
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}
            >
              <Space size={12} align="baseline">
                <Title level={3} style={{ margin: 0 }}>
                  Phòng {room.roomNumber}
                </Title>
                <Tag
                  color={
                    room.status === "AVAILABLE"
                      ? "green"
                      : room.status === "OCCUPIED"
                        ? "red"
                        : "orange"
                  }
                >
                  {room.status === "AVAILABLE"
                    ? "Có sẵn"
                    : room.status === "OCCUPIED"
                      ? "Đã thuê"
                      : "Bảo trì"}
                </Tag>
              </Space>
              <Space>
                <Rate allowHalf value={userRating} onChange={(v) => setUserRating(v)} />
                <Text strong>{userRating.toFixed(1)}</Text>
              </Space>
            </div>


            <Divider style={{ margin: "12px 0" }} />

            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label={<span><FullscreenOutlined /> Diện tích</span>}>
                {room.areaM2} m²
              </Descriptions.Item>
              <Descriptions.Item label={<span><EnvironmentOutlined /> Tầng</span>}>
                {room.floor}
              </Descriptions.Item>
              <Descriptions.Item label={<span><CheckCircleOutlined /> Trạng thái</span>}>
                <Tag
                  color={
                    room.status === "AVAILABLE"
                      ? "green"
                      : room.status === "OCCUPIED"
                        ? "red"
                        : "orange"
                  }
                >
                  {room.status === "AVAILABLE"
                    ? "Có sẵn"
                    : room.status === "OCCUPIED"
                      ? "Đã thuê"
                      : "Bảo trì"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<span><AppstoreOutlined /> Loại phòng</span>}>
                {room.type === "SINGLE" ? "Phòng đơn" : room.type === "DOUBLE" ? "Phòng đôi" : "Phòng dorm"}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: "16px 0" }} />
            <Title level={4}>Nội thất</Title>
            {room.utilities && room.utilities.filter((util: any) => util.condition !== "broken").length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {room.utilities
                  .filter((util: any) => util.condition !== "broken")
                  .map((util: any) => {
                  const utilityLabels: Record<string, string> = {
                    refrigerator: "Tủ lạnh",
                    air_conditioner: "Máy lạnh",
                    washing_machine: "Máy giặt",
                    television: "TV",
                    microwave: "Lò vi sóng",
                    water_heater: "Bình nóng lạnh",
                    fan: "Quạt",
                    bed: "Giường",
                    wardrobe: "Tủ quần áo",
                    desk: "Bàn",
                    chair: "Ghế",
                    sofa: "Sofa",
                    wifi_router: "Bộ phát WiFi",
                    other: "Khác",
                  };

                  const conditionLabels: Record<string, string> = {
                    new: "Mới",
                    used: "Đã sử dụng",
                    broken: "Hỏng",
                  };

                  const conditionColors: Record<string, string> = {
                    new: "success",
                    used: "processing",
                    broken: "error",
                  };

                  const conditionStyles: Record<string, React.CSSProperties> = {
                    new: {
                      margin: 0,
                      padding: "4px 12px",
                      fontSize: 13,
                      borderRadius: "16px",
                      border: "1px solid #52c41a",
                      backgroundColor: "#f6ffed",
                      color: "#389e0d",
                    },
                    used: {
                      margin: 0,
                      padding: "4px 12px",
                      fontSize: 13,
                      borderRadius: "16px",
                      border: "1px solid #1890ff",
                      backgroundColor: "#e6f7ff",
                      color: "#0958d9",
                    },
                    broken: {
                      margin: 0,
                      padding: "4px 12px",
                      fontSize: 13,
                      borderRadius: "16px",
                      border: "1px solid #ff4d4f",
                      backgroundColor: "#fff2f0",
                      color: "#cf1322",
                    },
                  };

                  return (
                    <Tag
                      key={util._id}
                      color={util.condition === "new" ? undefined : conditionColors[util.condition] || "default"}
                      style={conditionStyles[util.condition] || conditionStyles.used}
                      title={util.description || undefined}
                    >
                      {utilityLabels[util.name] || util.name} ({conditionLabels[util.condition] || util.condition})
                    </Tag>
                  );
                })}
              </div>
            ) : (
              <Empty description="Chưa có thông tin nội thất" />
            )}
          </Card>
        </Col>

        {/* Sticky booking card */}
        <Col xs={24} md={8}>
          <Card
            style={{
              borderRadius: 16,
              position: "sticky",
              top: 16,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              padding: 20,
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size={20}>
              {/* --- Giá thuê --- */}
              <div style={{ textAlign: "center" }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Giá thuê
                </Text>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    color: "#1677ff",
                    fontWeight: 700,
                  }}
                >
                  {price}₫ / tháng
                </Title>
              </div>

              {/* --- Liên hệ --- */}
              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid #f0f0f0",
                  borderRadius: 16,
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 16, color: "#333" }}>
                    Liên hệ chủ trọ
                  </Text>
                </div>

                {/* --- Gọi ngay (nút chính) --- */}
                <a
                  href="tel:0123456789"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 16px",
                    backgroundColor: "#52c41a",
                    color: "#fff",
                    fontWeight: 600,
                    borderRadius: 10,
                    textDecoration: "none",
                    boxShadow: "0 2px 6px rgba(82,196,26,0.4)",
                    transition: "transform 0.2s ease, opacity 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <PhoneOutlined style={{ fontSize: 18 }} /> Gọi ngay: 012.345.6789
                </a>

                {/* --- Liên hệ qua mạng xã hội --- */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 10,
                    marginTop: 4,
                  }}
                >
                  {/* Zalo */}
                  <a
                    href="https://zalo.me/0842346871"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      backgroundColor: "#0068ff",
                      color: "#fff",
                      padding: "10px 0",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 500,
                      transition: "transform 0.2s ease, opacity 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <FaCommentDots /> Zalo
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/profile.php?id=61583677535458"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      backgroundColor: "#1877f2",
                      color: "#fff",
                      padding: "10px 0",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 500,
                      transition: "transform 0.2s ease, opacity 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <FaFacebook /> Facebook
                  </a>
                </div>

                {/* Messenger (riêng dòng) */}
                <a
                  href="https://www.facebook.com/messages/t/846800271851706"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    backgroundColor: "#0099ff",
                    color: "#fff",
                    padding: "10px 0",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "transform 0.2s ease, opacity 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <FaFacebookMessenger /> Messenger
                </a>
              </div>

              <Divider style={{ margin: "4px 0" }} />

              {/* --- Nút đặt phòng --- */}
              {room.status === "AVAILABLE" ? (
                <Button
                  htmlType="submit"
                  type="primary"
                  size="large"
                  className="btn-animated"
                  block
                  style={{
                    borderRadius: 10,
                    height: 48,
                    fontWeight: 600,
                  }}
                  onClick={handleBook}
                >
                  Liên hệ ngay
                </Button>
              ) : (
                <Button
                  type="default"
                  size="large"
                  block
                  disabled
                  style={{
                    borderRadius: 10,
                    backgroundColor: "#f5f5f5",
                    color: "#999",
                    border: "1px solid #d9d9d9",
                    cursor: "not-allowed",
                    height: 48,
                    fontWeight: 600,
                  }}
                >
                  {room.status === "OCCUPIED" ? "Đã thuê" : "Bảo trì"}
                </Button>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Phòng liên quan */}
      <div
        style={{
          padding: "0 24px 48px 24px",
          background: "#fafafa",
          borderRadius: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
          marginTop: 32,
        }}
      >
        <Divider
          orientation="left"
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#1677ff",
            borderColor: "#1677ff20",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AppstoreOutlined style={{ color: "#1677ff" }} />
            Phòng liên quan
          </span>
        </Divider>

        {loadingRelated ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                <div
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <Skeleton.Image
                    style={{ width: "100%", height: 200 }}
                    active
                  />
                  <div style={{ padding: 12 }}>
                    <Skeleton.Input active size="small" style={{ width: "80%" }} />
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: "50%", marginTop: 8 }}
                    />
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : related.length ? (
          <Row gutter={[20, 20]}>
            {related.map((r) => (
              <Col xs={24} sm={12} md={8} lg={6} key={r._id}>
                <div
                  style={{
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  className="hover:shadow-xl hover:scale-[1.02]"
                >
                  <RoomCard room={r} />
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#999",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có phòng liên quan"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsDetail;
