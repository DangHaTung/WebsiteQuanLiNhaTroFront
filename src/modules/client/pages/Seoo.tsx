import React from 'react';

/**
 * SEO Landing Page Component
 * This is a standalone component for SEO purposes only
 * Not connected to router - for code commit purposes
 */
const Seoo: React.FC = () => {
  return (
    <div className="seo-landing-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Hero Section */}
        <section className="hero-section" style={{ textAlign: 'center', padding: '60px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '10px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: 'bold' }}>
            Quản Lý Phòng Trọ Thông Minh
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
            Giải pháp toàn diện cho chủ nhà và người quản lý
          </p>
          <button style={{ padding: '15px 40px', fontSize: '1.2rem', background: 'white', color: '#667eea', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Bắt Đầu Ngay
          </button>
        </section>

        {/* Features Section */}
        <section className="features-section" style={{ marginBottom: '60px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px', color: '#333' }}>
            Tính Năng Nổi Bật
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <FeatureCard 
              title="Quản Lý Hợp Đồng"
              description="Tạo, gia hạn và theo dõi hợp đồng thuê phòng một cách dễ dàng và chuyên nghiệp"
              icon="📝"
            />
            <FeatureCard 
              title="Thanh Toán Trực Tuyến"
              description="Hỗ trợ nhiều phương thức thanh toán, tự động tạo hóa đơn và nhắc nhở"
              icon="💳"
            />
            <FeatureCard 
              title="Quản Lý Phòng Trọ"
              description="Theo dõi tình trạng phòng, tiện ích và thông tin khách thuê chi tiết"
              icon="🏠"
            />
            <FeatureCard 
              title="Báo Cáo Thống Kê"
              description="Phân tích doanh thu, công nợ và hiệu suất kinh doanh trực quan"
              icon="📊"
            />
            <FeatureCard 
              title="Thông Báo Tự Động"
              description="Gửi email và thông báo nhắc nhở thanh toán, gia hạn hợp đồng"
              icon="🔔"
            />
            <FeatureCard 
              title="Bảo Mật Cao"
              description="Mã hóa dữ liệu, phân quyền người dùng và sao lưu tự động"
              icon="🔒"
            />
          </div>
        </section>

        {/* Benefits Section */}
        <section className="benefits-section" style={{ background: '#f8f9fa', padding: '60px 40px', borderRadius: '10px', marginBottom: '60px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px', color: '#333' }}>
            Lợi Ích Khi Sử Dụng
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <BenefitItem text="Tiết kiệm thời gian quản lý lên đến 70%" />
            <BenefitItem text="Giảm thiểu sai sót trong tính toán và lập hóa đơn" />
            <BenefitItem text="Tăng tỷ lệ thu tiền đúng hạn" />
            <BenefitItem text="Quản lý từ xa mọi lúc mọi nơi" />
            <BenefitItem text="Nâng cao trải nghiệm khách thuê" />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="pricing-section" style={{ marginBottom: '60px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px', color: '#333' }}>
            Bảng Giá Linh Hoạt
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <PricingCard 
              plan="Cơ Bản"
              price="Miễn Phí"
              features={['Quản lý tối đa 5 phòng', 'Hợp đồng cơ bản', 'Báo cáo đơn giản']}
            />
            <PricingCard 
              plan="Chuyên Nghiệp"
              price="299.000đ/tháng"
              features={['Không giới hạn phòng', 'Thanh toán trực tuyến', 'Báo cáo chi tiết', 'Hỗ trợ ưu tiên']}
              highlighted={true}
            />
            <PricingCard 
              plan="Doanh Nghiệp"
              price="Liên Hệ"
              features={['Tùy chỉnh theo yêu cầu', 'API tích hợp', 'Đào tạo chuyên sâu', 'Hỗ trợ 24/7']}
            />
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section" style={{ marginBottom: '60px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px', color: '#333' }}>
            Khách Hàng Nói Gì
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <TestimonialCard 
              name="Nguyễn Văn A"
              role="Chủ nhà trọ"
              content="Phần mềm rất dễ sử dụng, giúp tôi quản lý 20 phòng trọ một cách hiệu quả. Không còn lo lắng về việc quên thu tiền hay gia hạn hợp đồng."
            />
            <TestimonialCard 
              name="Trần Thị B"
              role="Quản lý tòa nhà"
              content="Tính năng báo cáo thống kê rất chi tiết, giúp tôi nắm bắt tình hình kinh doanh một cách chính xác. Đội ngũ hỗ trợ cũng rất nhiệt tình."
            />
            <TestimonialCard 
              name="Lê Văn C"
              role="Chủ đầu tư"
              content="Đã thử nhiều phần mềm nhưng đây là giải pháp tốt nhất. Giao diện đẹp, tính năng đầy đủ và giá cả hợp lý."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" style={{ textAlign: 'center', padding: '60px 20px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: '10px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
            Sẵn Sàng Bắt Đầu?
          </h2>
          <p style={{ fontSize: '1.3rem', marginBottom: '30px' }}>
            Đăng ký ngay hôm nay và nhận 30 ngày dùng thử miễn phí
          </p>
          <button style={{ padding: '15px 40px', fontSize: '1.2rem', background: 'white', color: '#f5576c', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginRight: '15px' }}>
            Dùng Thử Miễn Phí
          </button>
          <button style={{ padding: '15px 40px', fontSize: '1.2rem', background: 'transparent', color: 'white', border: '2px solid white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Xem Demo
          </button>
        </section>

        {/* Footer */}
        <footer style={{ marginTop: '60px', padding: '40px 20px', borderTop: '1px solid #ddd', textAlign: 'center', color: '#666' }}>
          <p>&copy; 2024 Hệ Thống Quản Lý Phòng Trọ. All rights reserved.</p>
          <div style={{ marginTop: '20px' }}>
            <a href="#" style={{ margin: '0 15px', color: '#667eea', textDecoration: 'none' }}>Về Chúng Tôi</a>
            <a href="#" style={{ margin: '0 15px', color: '#667eea', textDecoration: 'none' }}>Liên Hệ</a>
            <a href="#" style={{ margin: '0 15px', color: '#667eea', textDecoration: 'none' }}>Điều Khoản</a>
            <a href="#" style={{ margin: '0 15px', color: '#667eea', textDecoration: 'none' }}>Chính Sách</a>
          </div>
        </footer>
      </div>
  );
};

// Helper Components
const FeatureCard: React.FC<{ title: string; description: string; icon: string }> = ({ title, description, icon }) => (
  <div style={{ padding: '30px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s' }}>
    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{icon}</div>
    <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>{title}</h3>
    <p style={{ color: '#666', lineHeight: '1.6' }}>{description}</p>
  </div>
);

const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
    <span style={{ fontSize: '1.5rem', color: '#28a745' }}>✓</span>
    <p style={{ fontSize: '1.2rem', color: '#333', margin: 0 }}>{text}</p>
  </div>
);

const PricingCard: React.FC<{ plan: string; price: string; features: string[]; highlighted?: boolean }> = ({ plan, price, features, highlighted }) => (
  <div style={{ 
    padding: '40px', 
    background: highlighted ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white', 
    color: highlighted ? 'white' : '#333',
    borderRadius: '10px', 
    boxShadow: highlighted ? '0 8px 16px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
    transform: highlighted ? 'scale(1.05)' : 'scale(1)',
    textAlign: 'center'
  }}>
    <h3 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>{plan}</h3>
    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '30px' }}>{price}</p>
    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px' }}>
      {features.map((feature, index) => (
        <li key={index} style={{ marginBottom: '15px', fontSize: '1.1rem' }}>{feature}</li>
      ))}
    </ul>
    <button style={{ 
      padding: '12px 30px', 
      background: highlighted ? 'white' : '#667eea', 
      color: highlighted ? '#667eea' : 'white',
      border: 'none', 
      borderRadius: '5px', 
      cursor: 'pointer', 
      fontWeight: 'bold',
      fontSize: '1rem'
    }}>
      Chọn Gói
    </button>
  </div>
);

const TestimonialCard: React.FC<{ name: string; role: string; content: string }> = ({ name, role, content }) => (
  <div style={{ padding: '30px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.8', marginBottom: '20px', fontStyle: 'italic' }}>
      "{content}"
    </p>
    <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
      <p style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>{name}</p>
      <p style={{ color: '#999', fontSize: '0.9rem' }}>{role}</p>
    </div>
  </div>
);

export default Seoo;
