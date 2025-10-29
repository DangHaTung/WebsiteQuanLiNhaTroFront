import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Typography, 
  Tag, 
  Space, 
  Button, 
  Row, 
  Col, 
  Divider,
  Avatar,
  Rate,
  message,
  Skeleton,
  Breadcrumb
} from "antd";
import { 
  CalendarOutlined, 
  EyeOutlined, 
  LikeOutlined,
  ShareAltOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  BulbOutlined,
  InfoCircleOutlined,
  BellOutlined,
  UserOutlined
} from "@ant-design/icons";
import "../../../assets/styles/news.css";

const { Title, Text } = Typography;

// Mock data - trong thực tế sẽ fetch từ API
const mockNewsDetail = {
  id: 1,
  title: "Xu hướng thuê phòng trọ mới nhất 2024: Những điều cần biết",
  content: `
    <p>Trong năm 2024, thị trường thuê phòng trọ đã có những thay đổi đáng kể, mang đến nhiều cơ hội và thách thức mới cho cả người thuê và chủ nhà. Dưới đây là những xu hướng nổi bật nhất mà bạn cần nắm bắt:</p>
    
    <h3>1. Ứng dụng công nghệ trong quản lý phòng trọ</h3>
    <p>Nhiều chủ nhà đã bắt đầu áp dụng các ứng dụng quản lý thông minh, cho phép người thuê:</p>
    <ul>
      <li>Thanh toán tiền phòng online</li>
      <li>Báo cáo sự cố qua app</li>
      <li>Đặt lịch bảo trì</li>
      <li>Kết nối với cộng đồng người thuê</li>
    </ul>
    
    <h3>2. Phong cách sống "co-living"</h3>
    <p>Xu hướng co-living đang phát triển mạnh, đặc biệt ở các thành phố lớn. Mô hình này mang lại:</p>
    <ul>
      <li>Không gian chung được thiết kế đẹp mắt</li>
      <li>Cơ hội kết nối với những người có cùng sở thích</li>
      <li>Chi phí hợp lý hơn so với thuê riêng</li>
      <li>Dịch vụ tiện ích đầy đủ</li>
    </ul>
    
    <h3>3. Tiêu chuẩn an ninh được nâng cao</h3>
    <p>An ninh là ưu tiên hàng đầu của người thuê phòng trọ hiện nay. Các chủ nhà đã đầu tư:</p>
    <ul>
      <li>Hệ thống camera giám sát 24/7</li>
      <li>Khóa thông minh và thẻ từ</li>
      <li>Bảo vệ chuyên nghiệp</li>
      <li>Hệ thống báo cháy, báo khói hiện đại</li>
    </ul>
    
    <h3>4. Tính bền vững và thân thiện môi trường</h3>
    <p>Nhiều phòng trọ mới được xây dựng với tiêu chí xanh:</p>
    <ul>
      <li>Hệ thống năng lượng mặt trời</li>
      <li>Vật liệu xây dựng thân thiện môi trường</li>
      <li>Hệ thống tái chế rác thải</li>
      <li>Không gian xanh trong khuôn viên</li>
    </ul>
    
    <h3>5. Dịch vụ tiện ích mở rộng</h3>
    <p>Người thuê ngày càng mong đợi nhiều dịch vụ tiện ích hơn:</p>
    <ul>
      <li>Phòng gym mini</li>
      <li>Khu vực làm việc chung (co-working space)</li>
      <li>Dịch vụ giặt ủi</li>
      <li>Dịch vụ giao đồ ăn</li>
      <li>WiFi tốc độ cao</li>
    </ul>
    
    <p><strong>Kết luận:</strong> Những xu hướng này cho thấy thị trường thuê phòng trọ đang phát triển theo hướng hiện đại hóa, tập trung vào trải nghiệm người dùng và tính bền vững. Người thuê nên cập nhật những thông tin này để có lựa chọn phù hợp nhất.</p>
  `,
  category: "news",
  categoryName: "Tin tức",
  author: "Admin Tro360",
  authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
  publishDate: "2024-01-15",
  readTime: "5 phút đọc",
  views: 1250,
  likes: 89,
  image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop",
  tags: ["xu hướng", "thuê phòng", "2024", "công nghệ", "co-living"],
  relatedNews: [
    {
      id: 2,
      title: "10 mẹo tiết kiệm chi phí khi thuê phòng trọ",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      publishDate: "2024-01-14"
    },
    {
      id: 3,
      title: "Hướng dẫn đầy đủ về quy trình thuê phòng trọ",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop",
      publishDate: "2024-01-13"
    },
    {
      id: 5,
      title: "Cách trang trí phòng trọ nhỏ đẹp và tiết kiệm",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
      publishDate: "2024-01-11"
    }
  ]
};

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState(mockNewsDetail);
  const [userRating, setUserRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setNews(mockNewsDetail);
      setLoading(false);
    }, 1000);
  }, [id]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "news": return <InfoCircleOutlined />;
      case "tips": return <BulbOutlined />;
      case "guide": return <BookOutlined />;
      case "announcement": return <BellOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "news": return "blue";
      case "tips": return "green";
      case "guide": return "orange";
      case "announcement": return "red";
      default: return "default";
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    message.success(isLiked ? "Đã bỏ thích bài viết" : "Đã thích bài viết");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success("Đã copy link bài viết");
    }
  };

  const handleRelatedNewsClick = (newsId: number) => {
    navigate(`/news/${newsId}`);
  };

  if (loading) {
    return (
      <div className="news-detail-container">
        <div className="news-detail-content">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail-container">
      <div className="news-detail-content">
        {/* Breadcrumb */}
        <Breadcrumb className="news-detail-breadcrumb">
          <Breadcrumb.Item onClick={() => navigate("/")}>Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => navigate("/news")}>Tin tức & Mẹo thuê trọ</Breadcrumb.Item>
          <Breadcrumb.Item>{news.categoryName}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Back Button */}
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/news")}
          className="news-detail-back-btn"
        >
          Quay lại danh sách
        </Button>

        {/* Article Header */}
        <div className="news-detail-header">
          <div className="news-detail-category">
            <Tag 
              color={getCategoryColor(news.category)}
              className="news-detail-category-tag"
            >
              {getCategoryIcon(news.category)} {news.categoryName}
            </Tag>
          </div>
          
          <Title level={1} className="news-detail-title">
            {news.title}
          </Title>

          <div className="news-detail-meta">
            <Space size="large" wrap>
              <div className="news-detail-author">
                <Avatar 
                  src={news.authorAvatar} 
                  icon={<UserOutlined />}
                  size="small"
                />
                <Text strong>{news.author}</Text>
              </div>
              <Text type="secondary">
                <CalendarOutlined /> {news.publishDate}
              </Text>
              <Text type="secondary">
                <EyeOutlined /> {news.views} lượt xem
              </Text>
              <Text type="secondary">
                {news.readTime}
              </Text>
            </Space>
          </div>

          <div className="news-detail-actions">
            <Space>
              <Button 
                type={isLiked ? "primary" : "default"}
                icon={<LikeOutlined />}
                onClick={handleLike}
              >
                {isLiked ? "Đã thích" : "Thích"} ({news.likes})
              </Button>
              <Button 
                icon={<ShareAltOutlined />}
                onClick={handleShare}
              >
                Chia sẻ
              </Button>
            </Space>
          </div>
        </div>

        {/* Featured Image */}
        <div className="news-detail-image">
          <img 
            src={news.image} 
            alt={news.title}
            className="news-detail-featured-image"
          />
        </div>

        {/* Article Content */}
        <div className="news-detail-body">
          <div 
            className="news-detail-content"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>

        {/* Tags */}
        <div className="news-detail-tags">
          <Text strong>Tags: </Text>
          <Space size="small" wrap>
            {news.tags.map((tag, index) => (
              <Tag key={index}>
                #{tag}
              </Tag>
            ))}
          </Space>
        </div>

        <Divider />

        {/* Rating Section */}
        <div className="news-detail-rating">
          <Title level={4}>Đánh giá bài viết</Title>
          <Space direction="vertical" size="middle">
            <div>
              <Text>Bài viết này có hữu ích không?</Text>
              <Rate 
                value={userRating} 
                onChange={setUserRating}
                style={{ marginLeft: 16 }}
              />
            </div>
            {userRating > 0 && (
              <Text type="success">Cảm ơn bạn đã đánh giá!</Text>
            )}
          </Space>
        </div>

        <Divider />

        {/* Related News */}
        <div className="news-detail-related">
          <Title level={3}>Bài viết liên quan</Title>
          <Row gutter={[16, 16]}>
            {news.relatedNews.map((related) => (
              <Col xs={24} sm={12} md={8} key={related.id}>
                <Card
                  className="news-detail-related-card"
                  hoverable
                  cover={
                    <img 
                      alt={related.title}
                      src={related.image}
                      className="news-detail-related-image"
                    />
                  }
                  onClick={() => handleRelatedNewsClick(related.id)}
                >
                  <div className="news-detail-related-content">
                    <Title level={5} className="news-detail-related-title">
                      {related.title}
                    </Title>
                    <Text type="secondary">
                      <CalendarOutlined /> {related.publishDate}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
