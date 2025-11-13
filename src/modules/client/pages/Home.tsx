import React, { useEffect, useState } from "react";
import { Carousel, Row, Col, Card, Button, Typography, Spin, message } from "antd";
import { HomeOutlined, ToolOutlined, CalendarOutlined, GiftOutlined } from "@ant-design/icons";
import type { Room } from "../../../types/room";
import type { Post } from "../../../types/post";
import RoomCard from "../components/RoomCard";
import "../../../assets/styles/home.css";

import banner1 from "../../../assets/images/banner1.png";
import banner2 from "../../../assets/images/banner2.png";
import banner3 from "../../../assets/images/banner3.png";
import { getAllRooms } from "../services/room";

const { Title } = Typography;

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getAllRooms();
        setRooms(data.slice(0, 8));
      } catch (error) {
        console.error("Lỗi khi tải phòng:", error);
        message.error("Không thể tải danh sách phòng!");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    // db.json chưa có posts nên tạo tạm mảng rỗng
    setPosts([]);
    setLoadingPosts(false);
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div className="home-page">
      {/* BANNER */}
      <div className="full-width-banner">
        <Carousel autoplay dots effect="fade">
          {[banner1, banner2, banner3].map((img, idx) => (
            <div key={idx}>
              <div
                className="banner-slide"
                style={{
                  background: `url(${img}) center/cover no-repeat`,
                }}
              >
                <div className="banner-overlay">
                  <div className="banner-text animate-fadeUp">
                    <h1>
                      {idx === 0 && "Tìm phòng trọ nhanh chóng & uy tín"}
                      {idx === 1 && "Nhiều loại phòng, đầy đủ tiện nghi và nhiều lựa chọn cho bạn"}
                      {idx === 2 && "Đăng ký thuê hoặc cho thuê dễ dàng ngay hôm nay"}
                    </h1>
                    <p>
                      Chỉ vài bước đơn giản để tìm phòng phù hợp với nhu cầu của bạn.
                    </p>
                    <Button type="primary" size="large" className="banner-btn btn-animated">
                      Khám phá ngay
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* DANH MỤC */}
      <section className="section">
        <Row gutter={[16, 16]} justify="center">
          {[
            { title: "Phòng trọ", icon: <HomeOutlined />, description: "Xem phòng trọ ngay" },
            { title: "Phòng đầy đủ tiện nghi", icon: <ToolOutlined />, description: "Thuê ngay, tiện nghi đầy đủ" },
            { title: "Cho thuê theo tháng", icon: <CalendarOutlined />, description: "Dễ dàng thuê theo tháng" },
            { title: "Ưu đãi / Khuyến mãi", icon: <GiftOutlined />, description: "Xem ưu đãi mới nhất" },
          ].map((item, index) => (
            <Col xs={12} md={6} key={index}>
              <Card className="category-card" hoverable>
                <div className="category-icon">{item.icon}</div>
                <Card.Meta title={item.title} description={item.description} />
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* PHÒNG TRỌ GỢI Ý */}
      <section className="section page-container">
        <Title level={2} className="section-title" style={{ textAlign: "center" }}>
          Phòng trọ lý tưởng cho bạn
        </Title>
        <p style={{ textAlign: "center", color: "#555", marginBottom: 24 }}>
          Trải nghiệm không gian sống tiện nghi, an ninh và thoải mái, phù hợp với mọi nhu cầu của bạn
        </p>

        <div className="trend-grid">
          {[
            {
              title: "Phòng trọ tiêu chuẩn",
              desc: "Trang bị đầy đủ: giường, tủ, máy lạnh, WC riêng. Không gian thoáng đãng, yên tĩnh, an ninh tốt.",
              img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
            },
            {
              title: "Phòng trọ giá hợp lý",
              desc: "Chi phí hợp lý, phù hợp sinh viên và người đi làm. Thanh toán linh hoạt theo tháng, dễ dàng quản lý.",
              img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            },
          ].map((room, index) => (
            <div key={index} className="trend-card">
              <img src={room.img} alt={room.title} />
              <div className="trend-overlay" />
              <div className="trend-content">
                <h2>{room.title}</h2>
                <p>{room.desc}</p>
                <Button type="primary" className="btn-animated">
                  Xem phòng
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DANH SÁCH PHÒNG */}
      <section className="section section-bg">
        <Title level={2} className="section-title" style={{ textAlign: "center" }}>
          Danh sách phòng trọ hiện đại và tiện nghi
        </Title>
        <p style={{ textAlign: "center", color: "#555", marginBottom: 24 }}>
          Chọn ngay phòng trọ phù hợp với nhu cầu và ngân sách của bạn – thiết kế đẹp, an ninh và tiện lợi
        </p>

        <Row gutter={[24, 24]} justify="center" style={{ padding: "40px 0" }}>
          {rooms.map((room) => (
            <Col xs={24} sm={12} md={8} lg={6} key={room._id}>
              <RoomCard room={room} />
            </Col>
          ))}
        </Row>
      </section>

      {/* PHÒNG TRỌ LÝ TƯỞNG CHO BẠN */}
      <section className="section page-container">
        <Title
          level={2}
          className="section-title"
          style={{ textAlign: "center" }}
        >
          Phòng trọ mới – Hiện đại & Nổi bật
        </Title>
        <p style={{ textAlign: "center", color: "#555", marginBottom: 24 }}>
          Không gian sống hiện đại, tiện nghi và sang trọng trong từng chi tiết
        </p>

        {/* Lưới phòng chính */}
        <div className="trend-grid">
          {[
            {
              _id: "r001",
              name: "Phòng tiêu chuẩn tiện nghi",
              price: 3500000,
              rating: 4.7,
              image:
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
              desc: "Phòng mới, sạch sẽ, đầy đủ nội thất cơ bản: giường, tủ, bàn, ghế, máy lạnh và nhà vệ sinh riêng.",
            },
            {
              _id: "r002",
              name: "Phòng cao cấp có ban công",
              price: 4500000,
              rating: 4.9,
              image:
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
              desc: "Phòng rộng thoáng, ban công đón nắng, nội thất cao cấp, phù hợp nhân viên văn phòng hoặc cặp đôi.",
            },
            {
              _id: "r003",
              name: "Phòng tiết kiệm hiện đại",
              price: 2800000,
              rating: 4.4,
              image:
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
              desc: "Phòng nhỏ gọn, tối ưu không gian, có máy lạnh và khu vực nấu ăn chung – phù hợp sinh viên, người đi làm.",
            },
          ].map((room) => (
            <div key={room._id} className="trend-card">
              <img src={room.image} alt={room.name} />
              <div className="trend-overlay" />
              <div className="trend-content">
                <h2>{room.name}</h2>
                <p>{room.desc}</p>
                <div className="trend-rating">
                  <span className="stars">
                    {"★".repeat(Math.round(room.rating)) +
                      "☆".repeat(5 - Math.round(room.rating))}
                  </span>
                  <span className="rating-text">{room.rating.toFixed(1)}/5</span>
                </div>
                <p className="trend-price">
                  {room.price.toLocaleString("vi-VN")}₫ / tháng
                </p>
                <Button type="primary" className="btn-animated">
                  Xem phòng
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* SLIDE SHOW */}
        <section className="modern-gallery-section">
          <div className="scroll-gallery">
            {/* Hàng trên */}
            <div className="scroll-row scroll-row-top">
              {[...Array(2)].map((_, repeatIndex) =>
                [
                  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1616594039964-ae9021a16c67?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1600585154154-46b0d78c8bf9?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1600585154084-3e3275d9b5a4?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
                ].map((img, idx) => (
                  <div key={`${repeatIndex}-${idx}`} className="scroll-item">
                    <img src={img} alt={`slide-top-${idx}`} />
                  </div>
                ))
              )}
            </div>

            {/* Hàng dưới */}
            <div className="scroll-row scroll-row-bottom">
              {[...Array(2)].map((_, repeatIndex) =>
                [
                  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1616594039964-ae9021a16c67?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1600585154154-46b0d78c8bf9?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1600585154084-3e3275d9b5a4?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
                ].map((img, idx) => (
                  <div key={`${repeatIndex}-${idx}`} className="scroll-item">
                    <img src={img} alt={`slide-bottom-${idx}`} />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </section>

      {/* ĐÁNH GIÁ KHÁCH HÀNG */}
      <section className="section section-bg review-section">
        <Title
          level={2}
          className="section-title"
          style={{ textAlign: "center", marginBottom: 16 }}
        >
          Khách hàng nói gì về chúng tôi
        </Title>
        <p style={{ textAlign: "center", color: "#555", marginBottom: 40 }}>
          Cảm nhận thực tế từ những khách hàng đã thuê và sử dụng dịch vụ
        </p>

        <Carousel
          autoplay
          dots
          autoplaySpeed={4000}
          effect="fade"
          style={{ maxWidth: 900, margin: "0 auto" }}
        >
          {[
            {
              name: "Nguyễn Minh Anh",
              avatar:
                "https://randomuser.me/api/portraits/women/68.jpg",
              comment:
                "Trang web rất dễ sử dụng, tôi tìm được phòng ưng ý chỉ sau vài phút. Chủ nhà thân thiện và thông tin minh bạch!",
              rating: 5,
              location: "Quận Bình Thạnh, TP. HCM",
            },
            {
              name: "Trần Quốc Huy",
              avatar:
                "https://randomuser.me/api/portraits/men/45.jpg",
              comment:
                "Giao diện hiện đại, hình ảnh phòng rõ ràng. Tôi rất hài lòng với trải nghiệm thuê phòng qua hệ thống này.",
              rating: 4.8,
              location: "Thủ Đức, TP. HCM",
            },
            {
              name: "Phạm Thị Thu Trang",
              avatar:
                "https://randomuser.me/api/portraits/women/23.jpg",
              comment:
                "Dịch vụ hỗ trợ rất nhanh chóng, đội ngũ nhiệt tình. Tôi sẽ giới thiệu cho bạn bè cùng sử dụng!",
              rating: 4.9,
              location: "Quận 7, TP. HCM",
            },
          ].map((review, idx) => (
            <div key={idx}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 16,
                  background: "#fff",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  padding: "32px 24px",
                  maxWidth: 700,
                  margin: "0 auto",
                  textAlign: "center",
                }}
              >
                <img
                  src={review.avatar}
                  alt={review.name}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: 16,
                  }}
                />
                <p
                  style={{
                    fontSize: 16,
                    fontStyle: "italic",
                    color: "#444",
                    marginBottom: 16,
                  }}
                >
                  “{review.comment}”
                </p>
                <div style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      color: "#fadb14",
                      fontSize: 18,
                      letterSpacing: 2,
                    }}
                  >
                    {"★".repeat(Math.round(review.rating)) +
                      "☆".repeat(5 - Math.round(review.rating))}
                  </span>
                </div>
                <h4 style={{ marginBottom: 4 }}>{review.name}</h4>
                <p style={{ color: "#888", marginBottom: 0 }}>
                  {review.location}
                </p>
              </Card>
            </div>
          ))}
        </Carousel>
      </section>

    </div>
  );
};

export default Home;