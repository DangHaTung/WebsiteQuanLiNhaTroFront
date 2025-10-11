import React, { useEffect, useState } from "react";
import { Carousel, Row, Col, Card, Button, Typography, Tag, Skeleton, Alert } from "antd";
import { HomeOutlined, FullscreenOutlined, ToolOutlined, CalendarOutlined, GiftOutlined } from "@ant-design/icons";
import banner1 from "../../../assets/images/banner1.png";
import banner2 from "../../../assets/images/banner2.png";
import banner3 from "../../../assets/images/banner3.png";
import type { Room } from "../../../types/room";
import type { Post } from "../../../types/post";
// import api from "../services/api";
import "../../../assets/styles/home.css";
import RoomCard from "../components/RoomCard";

const { Title } = Typography;

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorRooms, setErrorRooms] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);

  const formatCurrency = (v: string | number | undefined) => {
    if (v === undefined || v === null) return "0";
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return isNaN(num) ? "0" : num.toLocaleString("vi-VN");
  };

  // useEffect(() => {
  //   api
  //     .get<Room[]>("/rooms")
  //     .then((res) => setRooms(res.data))
  //     .catch((err) => {
  //       console.error(err);
  //       setErrorRooms("Không tải được danh sách phòng. Vui lòng thử lại sau.");
  //     })
  //     .finally(() => setLoading(false));
  // }, []);

  // useEffect(() => {
  //   api
  //     .get<Post[]>("/posts")
  //     .then((res) => setPosts(res.data))
  //     .catch((err) => {
  //       console.error(err);
  //       setErrorPosts("Không tải được danh sách bài viết.");
  //     })
  //     .finally(() => setLoadingPosts(false));
  // }, []);

  useEffect(() => {
    fetch("/db.json")
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms || []);
      })
      .catch(() => setErrorRooms("Không tải được danh sách phòng."))
      .finally(() => setLoading(false));
  }, []);
  
  useEffect(() => {
    fetch("/db.json")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
      })
      .catch(() => setErrorPosts("Không tải được danh sách bài viết."))
      .finally(() => setLoadingPosts(false));
  }, []);

  return (
    <div>
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
                      {idx === 1 && "Hàng ngàn căn hộ, homestay dành cho bạn"}
                      {idx === 2 && "Đăng tin dễ dàng, tiếp cận người thuê ngay"}
                    </h1>
                    <p>
                      Chỉ vài bước đơn giản để tìm phòng phù hợp với nhu cầu của bạn.
                    </p>
                    <Button type="primary" size="large" className="banner-btn">
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
                <Card.Meta title={item.title} description="Khám phá ngay" />
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* KHU VỰC GỢI Ý */}
      <section className="section page-container">
        <Title level={2} className="section-title" style={{ textAlign: "center", marginBottom: 16 }}>
          Khu vực nổi bật
        </Title>
        <p style={{ textAlign: "center", color: "#555", marginBottom: 24 }}>
          Tìm phòng trọ phù hợp với nhu cầu và vị trí lý tưởng
        </p>

        <div className="trend-grid">
          {[
            {
              title: "Khu vực trung tâm",
              desc: "Gần chợ, siêu thị, trường học — tiện nghi đầy đủ",
              img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
            },
            {
              title: "Khu vực giá rẻ",
              desc: "Giá thuê phù hợp sinh viên & công nhân — an ninh đảm bảo",
              img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            },
          ].map((area, index) => (
            <div key={index} className="trend-card">
              <img src={area.img} alt={area.title} />
              <div className="trend-overlay" />
              <div className="trend-content">
                <h2>{area.title}</h2>
                <p>{area.desc}</p>
                <Button type="primary" className="btn-animated">Xem phòng</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DANH SÁCH PHÒNG */}
      <section className="section section-bg">
        <Title level={2} className="section-title" style={{ textAlign: "center", marginBottom: 16 }}>
          DANH SÁCH PHÒNG TRỌ
        </Title>

        <p style={{ textAlign: "center", color: "#555", marginBottom: 24 }}>
          Khám phá các phòng trọ phù hợp với nhu cầu, vị trí và ngân sách của bạn
        </p>

        <Row gutter={[24, 24]} justify="center">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Col xs={24} sm={12} md={8} lg={8} key={`sk-${i}`}>
                  <Card className="room-card" hoverable>
                    <Skeleton.Image style={{ width: "100%", height: 200 }} active />
                    <Skeleton active paragraph={{ rows: 2 }} title style={{ marginTop: 16 }} />
                  </Card>
                </Col>
              ))
            : rooms.map((room) => (
            <Col xs={24} sm={12} md={8} lg={8} key={room._id}>
              <RoomCard room={room} />
            </Col>
            ))}
        </Row>
      </section>
      {/* TIN ĐĂNG */}
      <section className="section page-container">
        <Title level={2} className="section-title" style={{ textAlign: "center", marginBottom: 16 }}>
          Tin đăng nổi bật
        </Title>
        <p style={{ textAlign: "center", color: "#555", marginBottom: 24 }}>
          Cập nhật những tin đăng phòng trọ mới nhất, chất lượng và đáng tin cậy
        </p>

        {errorPosts && (
          <Alert style={{ marginTop: 16 }} type="error" showIcon message={errorPosts} />
        )}

        {loadingPosts ? (
          <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Col xs={24} sm={12} md={8} lg={6} key={`psk-${i}`}>
                <Card hoverable className="post-card">
                  <Skeleton.Image style={{ width: "100%", height: 160 }} active />
                  <Skeleton active paragraph={{ rows: 2 }} title style={{ marginTop: 16 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[24, 24]}>
            {posts.map((post) => (
              <Col xs={24} sm={12} md={8} lg={6} key={post.id}>
                <Card
                  hoverable
                  cover={<img alt={post.title} src={post.image} />}
                  className="post-card"
                >
                  <Card.Meta
                    title={post.title}
                    description={
                      <>
                        <p>{post.excerpt}</p>
                        <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                      </>
                    }
                  />
                  <Button type="link" block className="btn-animated" style={{ marginTop: "16px", fontWeight: 500 }}>
                    Xem chi tiết »
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </section>

    </div>
  );
};

export default Home;
