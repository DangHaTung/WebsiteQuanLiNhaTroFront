import React from 'react';

/**
 * Trang Giới Thiệu - About Us Page
 * Component độc lập không kết nối router
 * Chỉ để commit code, không ảnh hưởng logic chính
 */
const GioiThieu: React.FC = () => {
  const stats = [
    { number: '10,000+', label: 'Phòng trọ', icon: '🏠' },
    { number: '50,000+', label: 'Người dùng', icon: '👥' },
    { number: '5,000+', label: 'Chủ nhà', icon: '🏢' },
    { number: '99%', label: 'Hài lòng', icon: '⭐' }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Sứ Mệnh',
      description: 'Kết nối người thuê và chủ nhà một cách nhanh chóng, minh bạch và hiệu quả nhất.',
      color: '#1890ff'
    },
    {
      icon: '👁️',
      title: 'Tầm Nhìn',
      description: 'Trở thành nền tảng quản lý phòng trọ hàng đầu Việt Nam, phục vụ hàng triệu người dùng.',
      color: '#52c41a'
    },
    {
      icon: '💎',
      title: 'Giá Trị Cốt Lõi',
      description: 'Minh bạch, tin cậy, chuyên nghiệp và luôn đặt lợi ích khách hàng lên hàng đầu.',
      color: '#fa8c16'
    },
    {
      icon: '🚀',
      title: 'Cam Kết',
      description: 'Không ngừng cải tiến công nghệ và dịch vụ để mang đến trải nghiệm tốt nhất.',
      color: '#722ed1'
    }
  ];

  const team = [
    {
      name: 'Nguyễn Văn A',
      position: 'CEO & Founder',
      image: 'https://i.pravatar.cc/300?img=12',
      description: '10+ năm kinh nghiệm trong lĩnh vực bất động sản'
    },
    {
      name: 'Trần Thị B',
      position: 'CTO',
      image: 'https://i.pravatar.cc/300?img=45',
      description: 'Chuyên gia công nghệ với 8 năm kinh nghiệm'
    },
    {
      name: 'Lê Văn C',
      position: 'Head of Operations',
      image: 'https://i.pravatar.cc/300?img=33',
      description: 'Quản lý vận hành và phát triển kinh doanh'
    },
    {
      name: 'Phạm Thị D',
      position: 'Head of Customer Success',
      image: 'https://i.pravatar.cc/300?img=47',
      description: 'Chăm sóc khách hàng và xây dựng cộng đồng'
    }
  ];

  const timeline = [
    { year: '2020', event: 'Thành lập công ty', description: 'Khởi đầu với đội ngũ 5 người' },
    { year: '2021', event: 'Ra mắt nền tảng', description: '1,000 phòng trọ đầu tiên' },
    { year: '2022', event: 'Mở rộng thị trường', description: 'Phủ sóng 10 tỉnh thành' },
    { year: '2023', event: 'Đạt mốc 10,000 phòng', description: '50,000 người dùng tin tưởng' },
    { year: '2024', event: 'Dẫn đầu thị trường', description: 'Top 1 nền tảng quản lý phòng trọ' }
  ];

  const features = [
    {
      icon: '🔒',
      title: 'An Toàn & Bảo Mật',
      description: 'Thông tin được mã hóa và bảo vệ tuyệt đối'
    },
    {
      icon: '⚡',
      title: 'Nhanh Chóng',
      description: 'Tìm phòng và quản lý chỉ trong vài phút'
    },
    {
      icon: '💰',
      title: 'Minh Bạch',
      description: 'Giá cả rõ ràng, không phí ẩn'
    },
    {
      icon: '🎯',
      title: 'Chính Xác',
      description: 'Thông tin phòng được xác thực kỹ lưỡng'
    },
    {
      icon: '📱',
      title: 'Đa Nền Tảng',
      description: 'Sử dụng mọi lúc mọi nơi trên mọi thiết bị'
    },
    {
      icon: '🤝',
      title: 'Hỗ Trợ 24/7',
      description: 'Đội ngũ luôn sẵn sàng giúp đỡ bạn'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '100px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '25px', fontWeight: 'bold' }}>
            Về Chúng Tôi
          </h1>
          <p style={{ fontSize: '1.5rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', opacity: 0.95 }}>
            Chúng tôi là nền tảng kết nối người thuê và chủ nhà, mang đến giải pháp quản lý phòng trọ hiện đại và chuyên nghiệp nhất
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '-80px auto 80px',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '25px'
        }}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                padding: '40px 30px',
                borderRadius: '20px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '4rem', marginBottom: '15px' }}>{stat.icon}</div>
              <h3 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#667eea', fontWeight: 'bold' }}>
                {stat.number}
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section style={{ 
        background: '#f8f9fa', 
        padding: '80px 20px' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: '60px',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ fontSize: '3rem', marginBottom: '30px', color: '#333' }}>
                Câu Chuyện Của Chúng Tôi
              </h2>
              <p style={{ fontSize: '1.15rem', lineHeight: '2', color: '#555', marginBottom: '20px' }}>
                Bắt đầu từ năm 2020, chúng tôi nhận thấy rằng việc tìm kiếm và quản lý phòng trọ vẫn còn nhiều khó khăn. 
                Người thuê khó tìm được phòng phù hợp, chủ nhà gặp vấn đề trong việc quản lý.
              </p>
              <p style={{ fontSize: '1.15rem', lineHeight: '2', color: '#555', marginBottom: '20px' }}>
                Với sứ mệnh giải quyết những vấn đề này, chúng tôi đã xây dựng một nền tảng công nghệ hiện đại, 
                kết nối người thuê và chủ nhà một cách nhanh chóng, minh bạch và hiệu quả.
              </p>
              <p style={{ fontSize: '1.15rem', lineHeight: '2', color: '#555' }}>
                Sau 4 năm phát triển, chúng tôi tự hào là nền tảng được hàng chục nghìn người tin tưởng sử dụng mỗi ngày.
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              padding: '60px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎉</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '20px' }}>4 Năm Thành Công</h3>
              <p style={{ fontSize: '1.2rem', lineHeight: '1.8', opacity: 0.95 }}>
                Từ một startup nhỏ đến nền tảng hàng đầu, chúng tôi không ngừng phát triển để phục vụ bạn tốt hơn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '3rem', 
            textAlign: 'center', 
            marginBottom: '60px',
            color: '#333'
          }}>
            Giá Trị Cốt Lõi
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '35px'
          }}>
            {values.map((value, idx) => (
              <div
                key={idx}
                style={{
                  padding: '40px 30px',
                  borderRadius: '15px',
                  border: `3px solid ${value.color}`,
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = value.color;
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  const title = e.currentTarget.querySelector('h3') as HTMLElement;
                  const desc = e.currentTarget.querySelector('p') as HTMLElement;
                  if (title) title.style.color = 'white';
                  if (desc) desc.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                  const title = e.currentTarget.querySelector('h3') as HTMLElement;
                  const desc = e.currentTarget.querySelector('p') as HTMLElement;
                  if (title) title.style.color = value.color;
                  if (desc) desc.style.color = '#666';
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '20px', textAlign: 'center' }}>
                  {value.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '15px', 
                  color: value.color,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  transition: 'color 0.3s'
                }}>
                  {value.title}
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: '1.8',
                  textAlign: 'center',
                  margin: 0,
                  fontSize: '1.05rem',
                  transition: 'color 0.3s'
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ background: '#f8f9fa', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '3rem', 
            textAlign: 'center', 
            marginBottom: '60px',
            color: '#333'
          }}>
            Hành Trình Phát Triển
          </h2>
          <div style={{ position: 'relative' }}>
            {timeline.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '30px',
                  marginBottom: '40px',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  minWidth: '100px',
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#667eea'
                  }}>
                    {item.year}
                  </div>
                </div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#667eea',
                  border: '4px solid white',
                  boxShadow: '0 0 0 3px #667eea',
                  flexShrink: 0
                }} />
                <div style={{
                  flex: 1,
                  background: 'white',
                  padding: '25px 30px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#333' }}>
                    {item.event}
                  </h3>
                  <p style={{ color: '#666', margin: 0, fontSize: '1.05rem' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '3rem', 
            textAlign: 'center', 
            marginBottom: '60px',
            color: '#333'
          }}>
            Đội Ngũ Lãnh Đạo
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '40px'
          }}>
            {team.map((member, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: 'center',
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 25px',
                  border: '5px solid #667eea',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                }}>
                  <img 
                    src={member.image} 
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#333' }}>
                  {member.name}
                </h3>
                <p style={{ 
                  fontSize: '1.1rem', 
                  color: '#667eea', 
                  marginBottom: '15px',
                  fontWeight: 600
                }}>
                  {member.position}
                </p>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '1rem' }}>
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ background: '#f8f9fa', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '3rem', 
            textAlign: 'center', 
            marginBottom: '60px',
            color: '#333'
          }}>
            Tại Sao Chọn Chúng Tôi?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px'
          }}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  padding: '35px 30px',
                  borderRadius: '15px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: '#333' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#666', lineHeight: '1.7', margin: 0, fontSize: '1.05rem' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '25px' }}>
          Sẵn Sàng Bắt Đầu?
        </h2>
        <p style={{ fontSize: '1.4rem', marginBottom: '40px', opacity: 0.95 }}>
          Tham gia cùng hàng chục nghìn người dùng đang tin tưởng chúng tôi
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            padding: '18px 45px',
            background: 'white',
            color: '#f5576c',
            border: 'none',
            borderRadius: '30px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Đăng Ký Ngay
          </button>
          <button style={{
            padding: '18px 45px',
            background: 'transparent',
            color: 'white',
            border: '3px solid white',
            borderRadius: '30px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#f5576c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'white';
          }}
          >
            Liên Hệ Ngay
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#2c3e50',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, opacity: 0.8, fontSize: '1.05rem' }}>
          © 2024 Ban Quản Lý Phòng Tro360 - Kết nối niềm tin, xây dựng tương lai
        </p>
      </footer>
    </div>
  );
};

export default GioiThieu;
