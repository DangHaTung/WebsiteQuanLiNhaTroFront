import React from "react";
import { Row, Col, Card, Typography, Space, Statistic, Timeline, Avatar } from "antd";
import { 
  TeamOutlined, 
  TrophyOutlined, 
  HeartOutlined, 
  StarOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  SafetyOutlined,
  CustomerServiceOutlined
} from "@ant-design/icons";
import "../../../assets/styles/about.css";

const { Title, Text, Paragraph } = Typography;

const About: React.FC = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { title: "Phòng trọ", value: 10000, suffix: "+" },
    { title: "Người dùng", value: 50000, suffix: "+" },
    { title: "Thành phố", value: 20, suffix: "+" },
    { title: "Đánh giá", value: 4.8, suffix: "/5" }
  ];

  const values = [
    {
      icon: <SafetyOutlined />,
      title: "An toàn & Bảo mật",
      description: "Đảm bảo thông tin cá nhân và giao dịch của bạn được bảo vệ tuyệt đối"
    },
    {
      icon: <CustomerServiceOutlined />,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc"
    },
    {
      icon: <CheckCircleOutlined />,
      title: "Chất lượng đảm bảo",
      description: "Tất cả phòng trọ đều được kiểm duyệt kỹ lưỡng trước khi đăng"
    },
    {
      icon: <RocketOutlined />,
      title: "Công nghệ hiện đại",
      description: "Ứng dụng công nghệ tiên tiến để mang lại trải nghiệm tốt nhất"
    }
  ];

  const timeline = [
    {
      year: "2020",
      title: "Thành lập",
      description: "Tro360 được thành lập với sứ mệnh kết nối người thuê và chủ nhà"
    },
    {
      year: "2021",
      title: "Mở rộng",
      description: "Mở rộng dịch vụ ra 5 thành phố lớn với hơn 1000 phòng trọ"
    },
    {
      year: "2022",
      title: "Công nghệ",
      description: "Ra mắt ứng dụng di động và hệ thống thanh toán online"
    },
    {
      year: "2023",
      title: "Phát triển",
      description: "Tích hợp AI và chatbot hỗ trợ khách hàng tự động"
    },
    {
      year: "2024",
      title: "Tương lai",
      description: "Hướng tới trở thành nền tảng thuê phòng trọ hàng đầu Việt Nam"
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
          <Title level={1} className="about-hero-title">
            Về Tro360
          </Title>
          <Paragraph className="about-hero-subtitle">
            Nền tảng kết nối người thuê và chủ nhà uy tín, 
            mang đến trải nghiệm thuê phòng trọ tốt nhất
          </Paragraph>
        </div>
      </div>

      {/* Stats Section */}
      <div className="about-stats">
        <div className="about-stats-content">
          <Title level={2} className="about-section-title">
            Tro360 trong con số
          </Title>
          <Row gutter={[32, 32]}>
            {stats.map((stat, index) => (
              <Col xs={12} sm={6} key={index}>
                <Card className="about-stat-card">
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    suffix={stat.suffix}
                    valueStyle={{ color: '#667eea' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Mission Section */}
      <div className="about-mission">
        <div className="about-mission-content">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <Title level={2} className="about-section-title">
                Sứ mệnh của chúng tôi
              </Title>
              <Paragraph className="about-mission-text">
                Tro360 được sinh ra với sứ mệnh tạo ra một cầu nối tin cậy giữa 
                người thuê phòng trọ và chủ nhà. Chúng tôi hiểu rằng việc tìm kiếm 
                một nơi ở phù hợp không chỉ là về không gian vật lý, mà còn là về 
                cộng đồng, an toàn và sự tiện nghi.
              </Paragraph>
              <Paragraph className="about-mission-text">
                Với công nghệ hiện đại và đội ngũ chuyên nghiệp, chúng tôi cam kết 
                mang đến trải nghiệm thuê phòng trọ minh bạch, an toàn và tiện lợi 
                nhất cho tất cả người dùng.
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <div className="about-mission-image">
                <img 
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop" 
                  alt="Mission"
                  className="about-image"
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Values Section */}
      <div className="about-values">
        <div className="about-values-content">
          <Title level={2} className="about-section-title">
            Giá trị cốt lõi
          </Title>
          <Row gutter={[24, 24]}>
            {values.map((value, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="about-value-card">
                  <div className="about-value-icon">
                    {value.icon}
                  </div>
                  <Title level={4} className="about-value-title">
                    {value.title}
                  </Title>
                  <Paragraph className="about-value-description">
                    {value.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="about-timeline">
        <div className="about-timeline-content">
          <Title level={2} className="about-section-title">
            Hành trình phát triển
          </Title>
          <Timeline
            items={timeline.map((item, index) => ({
              dot: <div className="about-timeline-dot">{item.year}</div>,
              children: (
                <div className="about-timeline-item">
                  <Title level={4} className="about-timeline-title">
                    {item.title}
                  </Title>
                  <Paragraph className="about-timeline-description">
                    {item.description}
                  </Paragraph>
                </div>
              )
            }))}
          />
        </div>
      </div>

      {/* Team Section */}
      <div className="about-team">
        <div className="about-team-content">
          <Title level={2} className="about-section-title">
            Đội ngũ của chúng tôi
          </Title>
          <Paragraph className="about-team-subtitle">
            Những con người tài năng và tận tâm đang xây dựng tương lai của ngành thuê phòng trọ
          </Paragraph>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={12} md={8}>
              <Card className="about-team-card">
                <div className="about-team-member">
                  <Avatar 
                    size={80} 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                    className="about-team-avatar"
                  />
                  <Title level={4} className="about-team-name">
                    Nguyễn Văn A
                  </Title>
                  <Text className="about-team-position">
                    CEO & Founder
                  </Text>
                  <Paragraph className="about-team-bio">
                    Với hơn 10 năm kinh nghiệm trong lĩnh vực bất động sản và công nghệ
                  </Paragraph>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="about-team-card">
                <div className="about-team-member">
                  <Avatar 
                    size={80} 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
                    className="about-team-avatar"
                  />
                  <Title level={4} className="about-team-name">
                    Trần Thị B
                  </Title>
                  <Text className="about-team-position">
                    CTO
                  </Text>
                  <Paragraph className="about-team-bio">
                    Chuyên gia công nghệ với niềm đam mê tạo ra những sản phẩm có ích
                  </Paragraph>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="about-team-card">
                <div className="about-team-member">
                  <Avatar 
                    size={80} 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    className="about-team-avatar"
                  />
                  <Title level={4} className="about-team-name">
                    Lê Văn C
                  </Title>
                  <Text className="about-team-position">
                    Head of Operations
                  </Text>
                  <Paragraph className="about-team-bio">
                    Đảm bảo mọi hoạt động diễn ra suôn sẻ và hiệu quả
                  </Paragraph>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div className="about-cta">
        <div className="about-cta-content">
          <Title level={2} className="about-cta-title">
            Sẵn sàng bắt đầu hành trình tìm phòng trọ?
          </Title>
          <Paragraph className="about-cta-subtitle">
            Tham gia cùng hàng nghìn người dùng đã tin tưởng Tro360
          </Paragraph>
          <Space size="large">
            <a href="/rooms" className="about-cta-button primary">
              Tìm phòng ngay
            </a>
            <a href="/contact" className="about-cta-button secondary">
              Liên hệ chúng tôi
            </a>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default About;


