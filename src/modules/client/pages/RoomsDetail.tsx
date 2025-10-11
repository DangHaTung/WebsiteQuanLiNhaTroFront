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
  AppstoreOutlined,
} from "@ant-design/icons";
// import api from "../services/api"; // Commented out unused import
import type { Room } from "../../../types/room";
import RoomCard from "../components/RoomCard";
// Import dữ liệu từ db.json trực tiếp
import dbData from "../../../../db.json";

const { Title, Paragraph, Text } = Typography;

// RoomsDetail page
// - Lấy dữ liệu phòng theo id từ URL
// - Hiển thị hero (ảnh nền + tiêu đề), gallery ảnh, thông tin chi tiết, form đặt phòng
// - Gợi ý sản phẩm liên quan ở gần footer
const RoomsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // room: dữ liệu phòng hiện tại
  const [room, setRoom] = useState<Room | null>(null);
  // loading: trạng thái tải chi tiết phòng
  const [loading, setLoading] = useState<boolean>(true);
  // userRating: điểm đánh giá người dùng (client-side demo)
  const [userRating, setUserRating] = useState<number>(4.5);
  // related: danh sách phòng gợi ý/"sản phẩm liên quan"
  const [related, setRelated] = useState<Room[]>([]);
  // loadingRelated: trạng thái tải danh sách gợi ý
  const [loadingRelated, setLoadingRelated] = useState<boolean>(true);
  // currentImage: index ảnh đang xem trong gallery
  const [currentImage, setCurrentImage] = useState<number>(0);

  // Tải chi tiết phòng theo id
  useEffect(() => {
    const fetchRoom = () => {
      if (!id) {
        setLoading(false);
        return;
      }
      // Tìm phòng theo ID từ db.json
      const roomData = dbData.rooms.find(room => room._id === id);
      if (roomData) {
        const formattedRoom: Room = {
          ...roomData,
          pricePerMonth: Number(roomData.pricePerMonth),
          type: roomData.type as 'SINGLE' | 'DOUBLE' | 'STUDIO' | 'VIP',
          status: roomData.status as 'OCCUPIED' | 'AVAILABLE' | 'MAINTENANCE'
        };
        setRoom(formattedRoom);
      } else {
        message.error("Không tìm thấy phòng");
        setRoom(null);
      }
      setLoading(false);
    };
    fetchRoom();
  }, [id]);

  // Sau khi có room, tải danh sách phòng liên quan từ db.json
  useEffect(() => {
    const fetchRelated = () => {
      if (!room) return;

      // Lấy danh sách phòng liên quan từ db.json
      const allRooms: Room[] = dbData.rooms
        .filter(r => r._id !== room._id)
        .map(r => ({
          ...r,
          pricePerMonth: Number(r.pricePerMonth),
          type: r.type as 'SINGLE' | 'DOUBLE' | 'STUDIO' | 'VIP',
          status: r.status as 'OCCUPIED' | 'AVAILABLE' | 'MAINTENANCE'
        }));

      // ưu tiên cùng khu vực nếu địa chỉ giống nhau
      const sameArea = allRooms.filter((r) => r.district === room.district);
      const finalList = (sameArea.length ? sameArea : allRooms).slice(0, 4);

      setRelated(finalList);
      setLoadingRelated(false);
    };
    setLoadingRelated(true);
    fetchRelated();
  }, [room]);

  // Định dạng giá theo VN
  const price = room ? new Intl.NumberFormat("vi-VN").format(room.pricePerMonth) : "";
  // Gallery ảnh: nếu db có mảng images thì dùng, không thì nhân bản ảnh chính để demo
  const gallery: string[] = room
    ? (room.images && room.images.length
        ? room.images
        : [room.image, room.image, room.image, room.image])
    : [];

  // Điều hướng ảnh trong gallery
  const goPrev = () => setCurrentImage((i) => (i - 1 + gallery.length) % gallery.length);
  const goNext = () => setCurrentImage((i) => (i + 1) % gallery.length);

  const handleBook = () => message.success("Đã gửi yêu cầu đặt phòng!");

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
        <Button type="primary" onClick={() => navigate("/rooms")}>Quay về danh sách</Button>
      </div>
    );
  }

  return (
    // Khung trang chính
    <div style={{ padding: 0, maxWidth: 1400, margin: "0 auto" }}>
      <div
        style={{
          position: "relative",
          height: 320,
          borderRadius: 12,
          overflow: "hidden",
          margin: 24,
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          // Dùng ảnh đầu tiên trong gallery cho hero nếu có
          background: `url(${(gallery[0] || room.image)}) center/cover no-repeat`,
        }}
      >
        {/* Hero overlay tối để nổi bật tiêu đề & địa chỉ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        {/* Nội dung hero: tiêu đề, địa chỉ, điểm đánh giá */}
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
          <Title level={1} style={{ color: "#e6f7ff", marginBottom: 8 }}>Phòng {room.roomNumber}</Title>
          <Space wrap align="center" size={12}>
            <Text style={{ color: "#f0f0f0" }}><EnvironmentOutlined /> {room.district}</Text>
            <span style={{ color: "#ffd666" }}>
              <Rate allowHalf disabled value={userRating} /> <Text style={{ color: "#ffd666" }}>{userRating.toFixed(1)}</Text>
            </span>
          </Space>
        </div>
      </div>

      {/* Vùng nội dung 2 cột: trái (gallery + mô tả + thông số), phải (đặt phòng) */}
      <Row gutter={[32, 32]} style={{ padding: 24, paddingTop: 0 }}>
        <Col xs={24} md={16}>
          <Card style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
            {/* Ảnh chính + nút chuyển ảnh trái/phải */}
            <div style={{ position: "relative" }}>
              <img
                src={gallery[currentImage]}
                alt={`Phòng ${room.roomNumber}`}
                style={{ width: "100%", height: 420, objectFit: "cover" }}
              />
              {gallery.length > 1 && (
                <>
                  {/* nút lùi ảnh */}
                  <Button
                    type="text"
                    onClick={goPrev}
                    style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.35)", color: "#fff" }}
                  >
                    ‹
                  </Button>
                  {/* nút tiến ảnh */}
                  <Button
                    type="text"
                    onClick={goNext}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.35)", color: "#fff" }}
                  >
                    ›
                  </Button>
                </>
              )}
            </div>
            {/* Dòng thumbnail (tối đa 8) để chọn nhanh ảnh */}
            {gallery.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
                {gallery.slice(0, 8).map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    style={{
                      border: idx === currentImage ? "2px solid #1677ff" : "2px solid transparent",
                      padding: 0,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                    aria-label={`Ảnh ${idx + 1}`}
                  >
                    <img src={src} alt={`thumb-${idx + 1}`} style={{ width: 88, height: 66, objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}
            {/* Header nhỏ: tiêu đề + tag + đánh giá */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space size={12} align="baseline">
                <Title level={3} style={{ margin: 0 }}>Phòng {room.roomNumber}</Title>
                <Tag color={room.status === 'AVAILABLE' ? 'green' : room.status === 'OCCUPIED' ? 'red' : 'orange'}>
                  {room.status === 'AVAILABLE' ? 'Có sẵn' : room.status === 'OCCUPIED' ? 'Đã thuê' : 'Bảo trì'}
                </Tag>
              </Space>
              <Space>
                <Rate allowHalf value={userRating} onChange={(v) => { setUserRating(v); message.success("Cảm ơn bạn đã đánh giá!"); }} />
                <Text strong>{userRating.toFixed(1)}</Text>
              </Space>
            </div>

            {/* Địa chỉ phòng */}
            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              <EnvironmentOutlined /> {room.district}
            </Paragraph>

            {/* Thông số chính của phòng */}
            <Divider style={{ margin: "12px 0" }} />

            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label={<span><FullscreenOutlined /> Diện tích</span>}>
                {room.areaM2} m²
              </Descriptions.Item>
              <Descriptions.Item label={<span><EnvironmentOutlined /> Tầng</span>}>
                {room.floor}
              </Descriptions.Item>
              <Descriptions.Item label={<span><CheckCircleOutlined /> Trạng thái</span>}>
                {room.status === 'AVAILABLE' ? 'Có sẵn' : room.status === 'OCCUPIED' ? 'Đã thuê' : 'Bảo trì'}
              </Descriptions.Item>
              <Descriptions.Item label={<span><AppstoreOutlined /> Loại phòng</span>}>
                {room.type === 'SINGLE' ? 'Phòng đơn' : room.type === 'DOUBLE' ? 'Phòng đôi' : room.type === 'STUDIO' ? 'Studio' : 'VIP'}
              </Descriptions.Item>
            </Descriptions>

            {/* Mô tả chi tiết */}
            <Divider style={{ margin: "16px 0" }} />

            <Title level={4}>Mô tả</Title>
            <Paragraph>
              Phòng đầy đủ tiện nghi, khu vực an ninh, gần trung tâm và thuận tiện di chuyển.
              Phù hợp cho sinh viên hoặc người đi làm cần không gian yên tĩnh và sạch sẽ.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Thẻ đặt phòng (sticky) */}
          <Card
            style={{
              borderRadius: 12,
              position: "sticky",
              top: 16,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">Giá thuê</Text>
                <Title level={2} style={{ margin: 0, color: "#1677ff" }}>{price}₫ / tháng</Title>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: 8,
                  padding: "10px 16px",
                }}
              >
                <PhoneOutlined style={{ color: "#52c41a" }} />
                <a href="tel:0901458000" style={{ fontWeight: 600, color: "#52c41a" }}>012.345.6789</a>
              </div>

              <Divider style={{ margin: "0" }} />

              {/* Form thông tin người thuê */}
              <div>
                <Text strong>Thông tin người thuê</Text>
                <Form layout="vertical" onFinish={handleBook} style={{ marginTop: 12 }}>
                  <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                    <Input placeholder="Nguyễn Văn A" allowClear />
                  </Form.Item>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
                    <Input placeholder="email@example.com" allowClear />
                  </Form.Item>
                  <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
                    <Input placeholder="0901xxxxxx" allowClear />
                  </Form.Item>
                  <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}>
                    <Input.TextArea placeholder="Tôi muốn xem phòng vào cuối tuần..." rows={4} allowClear />
                  </Form.Item>
                  <Button htmlType="submit" type="primary" size="large" block className="btn-animated">
                    Đặt phòng
                  </Button>
                </Form>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              <Space direction="vertical" size={6}>
                <Text type="secondary">Cam kết</Text>
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <Text>Hình ảnh thật 100%</Text>
                </Space>
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <Text>Hỗ trợ xem phòng miễn phí</Text>
                </Space>
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <Text>Hợp đồng minh bạch</Text>
                </Space>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Sản phẩm liên quan */}
      <Divider style={{ margin: "8px 24px" }} />
      <div style={{ padding: 24, paddingTop: 0 }}>
        <Title level={3} style={{ marginBottom: 16 }}>Sản phẩm liên quan</Title>
        {loadingRelated ? (
          <Row gutter={[24, 24]}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Col xs={24} sm={12} md={12} lg={6} key={i}>
                <Card style={{ borderRadius: 12 }}>
                  <Skeleton.Image style={{ width: "100%", height: 160 }} active />
                  <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 12 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[24, 24]}>
            {related.map((r) => (
              <Col xs={24} sm={12} md={12} lg={6} key={r._id}>
                <RoomCard room={r} />
              </Col>
            ))}
            {related.length === 0 && (
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