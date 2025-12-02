import React from 'react';

/**
 * Trang Tin Tức - SEO Landing Page
 * Component độc lập không kết nối router
 * Chỉ để commit code, không ảnh hưởng logic chính
 */
const TinTuc: React.FC = () => {
  const newsData = [
    {
      id: 1,
      title: "Xu hướng thuê phòng trọ 2024 - Những điều cần biết",
      excerpt: "Thị trường phòng trọ năm 2024 có nhiều thay đổi đáng chú ý. Giá thuê tăng nhẹ nhưng chất lượng dịch vụ được cải thiện đáng kể.",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      date: "15/12/2024",
      category: "Thị trường",
      author: "Nguyễn Văn A"
    },
    {
      id: 2,
      title: "Bí quyết tìm phòng trọ giá rẻ chất lượng tốt",
      excerpt: "Chia sẻ kinh nghiệm tìm kiếm và lựa chọn phòng trọ phù hợp với túi tiền sinh viên và người đi làm.",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      date: "10/12/2024",
      category: "Hướng dẫn",
      author: "Trần Thị B"
    },
    {
      id: 3,
      title: "Top 10 khu vực có phòng trọ tốt nhất Hà Nội",
      excerpt: "Danh sách các khu vực được đánh giá cao về chất lượng phòng trọ, an ninh và tiện ích xung quanh.",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      date: "05/12/2024",
      category: "Địa điểm",
      author: "Lê Văn C"
    },
    {
      id: 4,
      title: "Quyền lợi người thuê trọ cần biết theo pháp luật",
      excerpt: "Những quyền lợi cơ bản mà người thuê trọ được pháp luật bảo vệ và cách bảo vệ quyền lợi của mình.",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
      date: "01/12/2024",
      category: "Pháp lý",
      author: "Phạm Thị D"
    },
    {
      id: 5,
      title: "Cách trang trí phòng trọ đẹp với chi phí thấp",
      excerpt: "Những ý tưởng sáng tạo giúp bạn biến phòng trọ nhỏ hẹp thành không gian sống ấm cúng và đẹp mắt.",
      image: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800",
      date: "28/11/2024",
      category: "Lifestyle",
      author: "Hoàng Văn E"
    },
    {
      id: 6,
      title: "Checklist khi xem phòng trọ - Không bỏ sót điều gì",
      excerpt: "Danh sách kiểm tra chi tiết giúp bạn đánh giá đầy đủ các yếu tố quan trọng khi đi xem phòng trọ.",
      image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
      date: "25/11/2024",
      category: "Hướng dẫn",
      author: "Đỗ Thị F"
    }
  ];

  const categories = ["Tất cả", "Thị trường", "Hướng dẫn", "Địa điểm", "Pháp lý", "Lifestyle"];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '15px', fontWeight: 'bold' }}>
          Tin Tức & Kiến Thức
        </h1>
        <p style={{ fontSize: '1.3rem', opacity: 0.9 }}>
          Cập nhật thông tin mới nhất về thị trường phòng trọ
        </p>
      </header>

      {/* Categories Filter */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              style={{
                padding: '10px 25px',
                border: idx === 0 ? '2px solid #667eea' : '1px solid #ddd',
                background: idx === 0 ? '#667eea' : 'white',
                color: idx === 0 ? 'white' : '#333',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: idx === 0 ? 'bold' : 'normal',
                transition: 'all 0.3s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '30px' 
        }}>
          {newsData.map((news) => (
            <article 
              key={news.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ 
                height: '220px', 
                background: `url(${news.image}) center/cover`,
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: '#667eea',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  {news.category}
                </span>
              </div>
              
              <div style={{ padding: '25px' }}>
                <h3 style={{ 
                  fontSize: '1.4rem', 
                  marginBottom: '15px',
                  color: '#333',
                  fontWeight: 'bold',
                  lineHeight: '1.4'
                }}>
                  {news.title}
                </h3>
                
                <p style={{ 
                  color: '#666', 
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  fontSize: '0.95rem'
                }}>
                  {news.excerpt}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '15px',
                  borderTop: '1px solid #eee'
                }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#999', margin: 0 }}>
                      {news.author}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#999', margin: 0 }}>
                      📅 {news.date}
                    </p>
                  </div>
                  <button style={{
                    background: 'transparent',
                    border: '2px solid #667eea',
                    color: '#667eea',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    Đọc thêm →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '60px 20px',
        marginTop: '60px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
            Đăng ký nhận tin tức mới nhất
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9 }}>
            Cập nhật thông tin về thị trường phòng trọ và các mẹo hữu ích
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            maxWidth: '500px', 
            margin: '0 auto',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <input 
              type="email" 
              placeholder="Nhập email của bạn"
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '15px 20px',
                border: 'none',
                borderRadius: '25px',
                fontSize: '1rem'
              }}
            />
            <button style={{
              padding: '15px 35px',
              background: 'white',
              color: '#f5576c',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}>
              Đăng ký
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: '#2c3e50', 
        color: 'white', 
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <div>
              <h3 style={{ marginBottom: '15px' }}>Về chúng tôi</h3>
              <p style={{ color: '#bdc3c7', lineHeight: '1.6' }}>
                Nền tảng quản lý và tìm kiếm phòng trọ hàng đầu Việt Nam
              </p>
            </div>
            <div>
              <h3 style={{ marginBottom: '15px' }}>Liên kết</h3>
              <ul style={{ listStyle: 'none', padding: 0, color: '#bdc3c7' }}>
                <li style={{ marginBottom: '10px' }}>Trang chủ</li>
                <li style={{ marginBottom: '10px' }}>Tìm phòng</li>
                <li style={{ marginBottom: '10px' }}>Tin tức</li>
                <li style={{ marginBottom: '10px' }}>Liên hệ</li>
              </ul>
            </div>
            <div>
              <h3 style={{ marginBottom: '15px' }}>Liên hệ</h3>
              <p style={{ color: '#bdc3c7', lineHeight: '1.8' }}>
                📧 contact@phongtro.vn<br/>
                📞 0123 456 789<br/>
                📍 Hà Nội, Việt Nam
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #34495e', paddingTop: '20px' }}>
            <p style={{ color: '#95a5a6', margin: 0 }}>
              © 2024 Quản Lý Phòng Trọ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TinTuc;
