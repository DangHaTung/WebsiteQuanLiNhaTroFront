import React, { useState } from 'react';

/**
 * Trang Liên Hệ - Contact Page
 * Component độc lập không kết nối router
 * Chỉ để commit code, không ảnh hưởng logic chính
 */
const LienHe: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    {
      icon: '📍',
      title: 'Địa chỉ',
      content: 'Số 123, Đường ABC, Quận XYZ, Hà Nội',
      color: '#1890ff'
    },
    {
      icon: '📞',
      title: 'Điện thoại',
      content: '1900 xxxx / 0123 456 789',
      color: '#52c41a'
    },
    {
      icon: '📧',
      title: 'Email',
      content: 'contact@phongtro.vn',
      color: '#fa8c16'
    },
    {
      icon: '🕐',
      title: 'Giờ làm việc',
      content: 'T2 - T7: 8:00 - 18:00',
      color: '#722ed1'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: 'bold' }}>
          Liên Hệ Với Chúng Tôi
        </h1>
        <p style={{ fontSize: '1.3rem', opacity: 0.95 }}>
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
        </p>
      </section>

      {/* Contact Info Cards */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '-60px auto 60px',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {contactInfo.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                padding: '35px 25px',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                fontSize: '3.5rem',
                marginBottom: '15px'
              }}>
                {item.icon}
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                marginBottom: '10px',
                color: item.color,
                fontWeight: 'bold'
              }}>
                {item.title}
              </h3>
              <p style={{ color: '#666', margin: 0, fontSize: '1.05rem' }}>
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form & Map */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px', padding: '0 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '40px'
        }}>
          {/* Form */}
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '25px', color: '#333' }}>
              Gửi Tin Nhắn
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
                  Họ tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
                  Chủ đề *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="Tôi muốn hỏi về..."
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
                  Nội dung *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '15px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Gửi Tin Nhắn
              </button>
            </form>
          </div>

          {/* Map & Social */}
          <div>
            {/* Map */}
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '25px', color: '#333' }}>
                Vị Trí Văn Phòng
              </h2>
              <div style={{
                width: '100%',
                height: '300px',
                background: '#e0e0e0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem'
              }}>
                🗺️
              </div>
              <p style={{ marginTop: '15px', color: '#666', lineHeight: '1.6' }}>
                Số 123, Đường ABC, Quận XYZ, Hà Nội, Việt Nam
              </p>
            </div>

            {/* Social Media */}
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '25px', color: '#333' }}>
                Kết Nối Với Chúng Tôi
              </h2>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {[
                  { name: 'Facebook', icon: '📘', color: '#1877f2' },
                  { name: 'Zalo', icon: '💬', color: '#0068ff' },
                  { name: 'Instagram', icon: '📷', color: '#e4405f' },
                  { name: 'YouTube', icon: '▶️', color: '#ff0000' }
                ].map((social, idx) => (
                  <button
                    key={idx}
                    style={{
                      flex: '1 1 calc(50% - 10px)',
                      minWidth: '120px',
                      padding: '15px',
                      background: social.color,
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{social.icon}</span>
                    {social.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick */}
      <section style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
          Câu Hỏi Thường Gặp
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.95 }}>
          Có thể câu trả lời bạn cần đã có sẵn
        </p>
        <button style={{
          padding: '15px 40px',
          background: 'white',
          color: '#f5576c',
          border: 'none',
          borderRadius: '30px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          Xem Câu Hỏi Thường Gặp
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#2c3e50',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, opacity: 0.8 }}>
          © 2024 Hệ Thống Quản Lý Phòng Trọ - Liên hệ hỗ trợ 24/7
        </p>
      </footer>
    </div>
  );
};

export default LienHe;
