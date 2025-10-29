import React, { useState, useEffect } from "react";
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Pagination,
  Skeleton,
  Empty
} from "antd";
import { 
  SearchOutlined, 
  CalendarOutlined, 
  EyeOutlined, 
  LikeOutlined,
  BookOutlined,
  BulbOutlined,
  InfoCircleOutlined,
  BellOutlined,
  FilterOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import NewsCard from "../components/NewsCard";
import "../../../assets/styles/news.css";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// Mock data cho tin tức
const mockNewsData = [
  {
    id: 1,
    title: "Xu hướng thuê phòng trọ mới nhất 2024: Những điều cần biết",
    excerpt: "Khám phá những xu hướng mới trong việc thuê phòng trọ, từ công nghệ đến phong cách sống hiện đại...",
    content: "Nội dung chi tiết của bài viết...",
    category: "news",
    categoryName: "Tin tức",
    author: "Admin Tro360",
    publishDate: "2024-01-15",
    readTime: "5 phút đọc",
    views: 1250,
    likes: 89,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop",
    tags: ["xu hướng", "thuê phòng", "2024"]
  },
  {
    id: 2,
    title: "10 mẹo tiết kiệm chi phí khi thuê phòng trọ",
    excerpt: "Những cách thông minh để giảm thiểu chi phí sinh hoạt khi thuê phòng trọ mà vẫn đảm bảo chất lượng cuộc sống...",
    content: "Nội dung chi tiết của bài viết...",
    category: "tips",
    categoryName: "Mẹo thuê trọ",
    author: "Chuyên gia Tro360",
    publishDate: "2024-01-14",
    readTime: "7 phút đọc",
    views: 2100,
    likes: 156,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    tags: ["tiết kiệm", "chi phí", "mẹo vặt"]
  },
  {
    id: 3,
    title: "Hướng dẫn đầy đủ về quy trình thuê phòng trọ",
    excerpt: "Từ tìm kiếm, xem phòng đến ký hợp đồng - tất cả những gì bạn cần biết để thuê phòng trọ an toàn...",
    content: "Nội dung chi tiết của bài viết...",
    category: "guide",
    categoryName: "Hướng dẫn",
    author: "Hỗ trợ Tro360",
    publishDate: "2024-01-13",
    readTime: "10 phút đọc",
    views: 3200,
    likes: 234,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop",
    tags: ["hướng dẫn", "quy trình", "thuê phòng"]
  },
  {
    id: 4,
    title: "Cập nhật chính sách mới về bảo hiểm phòng trọ",
    excerpt: "Thông tin về các chính sách bảo hiểm mới áp dụng cho người thuê phòng trọ từ tháng 2/2024...",
    content: "Nội dung chi tiết của bài viết...",
    category: "announcement",
    categoryName: "Thông báo",
    author: "Ban quản lý Tro360",
    publishDate: "2024-01-12",
    readTime: "3 phút đọc",
    views: 890,
    likes: 45,
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=250&fit=crop",
    tags: ["chính sách", "bảo hiểm", "cập nhật"]
  },
  {
    id: 5,
    title: "Cách trang trí phòng trọ nhỏ đẹp và tiết kiệm",
    excerpt: "Những ý tưởng trang trí sáng tạo giúp biến phòng trọ nhỏ thành không gian sống đẹp và tiện nghi...",
    content: "Nội dung chi tiết của bài viết...",
    category: "tips",
    categoryName: "Mẹo thuê trọ",
    author: "Design Expert",
    publishDate: "2024-01-11",
    readTime: "8 phút đọc",
    views: 1800,
    likes: 167,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop",
    tags: ["trang trí", "phòng nhỏ", "tiết kiệm"]
  },
  {
    id: 6,
    title: "Kinh nghiệm chọn phòng trọ phù hợp với sinh viên",
    excerpt: "Những tiêu chí quan trọng khi chọn phòng trọ dành riêng cho sinh viên, từ vị trí đến chi phí...",
    content: "Nội dung chi tiết của bài viết...",
    category: "guide",
    categoryName: "Hướng dẫn",
    author: "Sinh viên kinh nghiệm",
    publishDate: "2024-01-10",
    readTime: "6 phút đọc",
    views: 2500,
    likes: 198,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop",
    tags: ["sinh viên", "chọn phòng", "kinh nghiệm"]
  }
];

const News: React.FC = () => {
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredNews, setFilteredNews] = useState(mockNewsData);

  const pageSize = 6;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Lọc tin tức theo danh mục và tìm kiếm
  useEffect(() => {
    let filtered = mockNewsData;

    // Lọc theo danh mục
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Lọc theo tìm kiếm
    if (searchText.trim()) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchText.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    setFilteredNews(filtered);
    setCurrentPage(1);
  }, [selectedCategory, searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleNewsClick = (newsId: number) => {
    navigate(`/news/${newsId}`);
  };


  // Phân trang
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentNews = filteredNews.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredNews.length / pageSize);

  return (
    <div className="news-container">
      {/* Header Section */}
      <div className="news-header">
        <div className="news-header-content">
          <Title level={1} className="news-title">
            Tin tức & Mẹo thuê trọ
          </Title>
          <Paragraph className="news-subtitle">
            Cập nhật những thông tin mới nhất, mẹo vặt hữu ích và hướng dẫn chi tiết 
            để bạn có trải nghiệm thuê phòng trọ tốt nhất
          </Paragraph>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="news-filters">
        <div className="news-filters-content">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm tin tức, mẹo vặt..."
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                allowClear
                className="news-search"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Chọn danh mục"
                size="large"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="news-category-select"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả danh mục</Option>
                <Option value="news">Tin tức</Option>
                <Option value="tips">Mẹo thuê trọ</Option>
                <Option value="guide">Hướng dẫn</Option>
                <Option value="announcement">Thông báo</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <div className="news-stats">
                <Text type="secondary">
                  Tìm thấy {filteredNews.length} bài viết
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* News Content */}
      <div className="news-content">
        <div className="news-content-wrapper">
          {loading ? (
            <Row gutter={[24, 24]}>
              {[...Array(6)].map((_, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card className="news-card">
                    <Skeleton.Image style={{ width: '100%', height: 200 }} />
                    <Skeleton active paragraph={{ rows: 3 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : filteredNews.length === 0 ? (
            <div className="news-empty">
              <Empty
                description="Không tìm thấy bài viết nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <>
              <Row gutter={[24, 24]}>
                {currentNews.map((news) => (
                  <Col xs={24} sm={12} lg={8} key={news.id}>
                    <NewsCard
                      id={news.id}
                      title={news.title}
                      excerpt={news.excerpt}
                      category={news.category}
                      categoryName={news.categoryName}
                      author={news.author}
                      publishDate={news.publishDate}
                      readTime={news.readTime}
                      views={news.views}
                      likes={news.likes}
                      image={news.image}
                      tags={news.tags}
                      onClick={handleNewsClick}
                    />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="news-pagination">
                  <Pagination
                    current={currentPage}
                    total={filteredNews.length}
                    pageSize={pageSize}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} của ${total} bài viết`
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
