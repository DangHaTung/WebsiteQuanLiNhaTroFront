import React from "react";
import { Card, Typography, Tag, Space } from "antd";
import { 
  CalendarOutlined, 
  EyeOutlined, 
  LikeOutlined,
  BookOutlined,
  BulbOutlined,
  InfoCircleOutlined,
  BellOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface NewsCardProps {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  categoryName: string;
  author: string;
  publishDate: string;
  readTime: string;
  views: number;
  likes: number;
  image: string;
  tags: string[];
  onClick: (id: number) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  excerpt,
  category,
  categoryName,
  author,
  publishDate,
  readTime,
  views,
  likes,
  image,
  tags,
  onClick
}) => {
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

  return (
    <Card
      className="news-card"
      hoverable
      cover={
        <div className="news-card-image">
          <img
            alt={title}
            src={image}
            className="news-image"
          />
          <div className="news-card-overlay">
            <Tag 
              color={getCategoryColor(category)}
              className="news-category-tag"
            >
              {getCategoryIcon(category)} {categoryName}
            </Tag>
          </div>
        </div>
      }
      onClick={() => onClick(id)}
    >
      <div className="news-card-content">
        <Title level={4} className="news-card-title">
          {title}
        </Title>
        <Paragraph className="news-card-excerpt">
          {excerpt}
        </Paragraph>
        
        <div className="news-card-meta">
          <Space size="small" wrap>
            <Text type="secondary" className="news-meta-item">
              <CalendarOutlined /> {publishDate}
            </Text>
            <Text type="secondary" className="news-meta-item">
              <EyeOutlined /> {views}
            </Text>
            <Text type="secondary" className="news-meta-item">
              <LikeOutlined /> {likes}
            </Text>
            <Text type="secondary" className="news-meta-item">
              {readTime}
            </Text>
          </Space>
        </div>

        <div className="news-card-tags">
          <Space size="small" wrap>
            {tags.map((tag, index) => (
              <Tag key={index}>
                #{tag}
              </Tag>
            ))}
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default NewsCard;

