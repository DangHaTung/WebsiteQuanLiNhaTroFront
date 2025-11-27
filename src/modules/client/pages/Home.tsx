import React, { useEffect, useState } from "react";
import { Carousel, Row, Col, Card, Button, Typography, Spin, message } from "antd";
import { HomeOutlined, ToolOutlined, CalendarOutlined, GiftOutlined } from "@ant-design/icons";
import type { Room } from "../../../types/room";
import type { Post } from "../../../types/post";
import RoomCard from "../components/RoomCard";
import "../../../assets/styles/home.css";

import banner1 from "../../../assets/images/banner1.jpg";
import banner2 from "../../../assets/images/banner2.jpg";
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
                    <Button type="primary" size="large" className="banner-btn btn-animated" href="/rooms">
                      
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
              title: "Phòng 35 mét vuông",
              desc: "Trang bị đầy đủ: giường, tủ, máy lạnh, WC riêng. Không gian thoáng đãng, yên tĩnh, an ninh tốt.",
              img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
            },
            {
              title: "Phòng 25 mét vuông",
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
    </div>
  );
};

export default Home;