import React, { useState } from 'react';

/**
 * Trang Hướng Dẫn Sử Dụng - Help Center
 * Component độc lập không kết nối router
 * Chỉ để commit code, không ảnh hưởng logic chính
 */
const HuongDan: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '📚' },
    { id: 'tenant', name: 'Người thuê', icon: '👤' },
    { id: 'owner', name: 'Chủ nhà', icon: '🏠' },
    { id: 'payment', name: 'Thanh toán', icon: '💳' },
    { id: 'contract', name: 'Hợp đồng', icon: '📄' },
    { id: 'technical', name: 'Kỹ thuật', icon: '⚙️' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'tenant',
      question: 'Làm thế nào để tìm kiếm phòng trọ phù hợp?',
      answer: 'Bạn có thể sử dụng bộ lọc tìm kiếm với các tiêu chí như giá, diện tích, vị trí, tiện ích. Hệ thống sẽ hiển thị danh sách phòng phù hợp nhất với nhu cầu của bạn.'
    },
    {
      id: 2,
      category: 'tenant',
      question: 'Tôi cần chuẩn bị gì khi đi xem phòng?',
      answer: 'Nên mang theo CMND/CCCD, chuẩn bị danh sách câu hỏi về tiện ích, quy định, và kiểm tra kỹ tình trạng phòng, điện nước, khóa cửa.'
    },
    {
      id: 3,
      category: 'owner',
      question: 'Làm sao để đăng tin cho thuê phòng?',
      answer: 'Đăng nhập vào tài khoản chủ nhà, chọn "Thêm phòng mới", điền đầy đủ thông tin phòng, upload ảnh chất lượng cao và mô tả chi tiết để thu hút khách thuê.'
    },
    {
      id: 4,
      category: 'owner',
      question: 'Quản lý hóa đơn điện nước như thế nào?',
      answer: 'Hệ thống tự động tạo hóa đơn hàng tháng dựa trên chỉ số điện nước. Bạn chỉ cần nhập số mới, hệ thống sẽ tính toán và gửi thông báo cho khách thuê.'
    },
    {
      id: 5,
      category: 'payment',
      question: 'Các phương thức thanh toán được hỗ trợ?',
      answer: 'Hỗ trợ thanh toán qua chuyển khoản ngân hàng, ví điện tử (Momo, ZaloPay), thẻ ATM/Visa/Mastercard và tiền mặt tại chỗ.'
    },
    {
      id: 6,
      category: 'payment',
      question: 'Làm sao để xác nhận đã thanh toán?',
      answer: 'Sau khi thanh toán online, hệ thống tự động cập nhật. Với tiền mặt, chủ nhà sẽ xác nhận và cập nhật trạng thái thanh toán trong hệ thống.'
    },
    {
      id: 7,
      category: 'contract',
      question: 'Quy trình ký hợp đồng thuê phòng?',
      answer: 'Sau khi thỏa thuận, hai bên ký hợp đồng điện tử hoặc giấy. Hợp đồng bao gồm thông tin phòng, giá thuê, tiền cọc, thời hạn và các điều khoản khác.'
    },
    {
      id: 8,
      category: 'contract',
      question: 'Có thể gia hạn hợp đồng online không?',
      answer: 'Có, trước khi hết hạn 30 ngày, hệ thống sẽ thông báo. Bạn có thể gia hạn trực tuyến với điều khoản mới hoặc giữ nguyên điều khoản cũ.'
    },
    {
      id: 9,
      category: 'technical',
      question: 'Tôi quên mật khẩu, phải làm sao?',
      answer: 'Click "Quên mật khẩu" ở trang đăng nhập, nhập email đã đăng ký. Hệ thống sẽ gửi link đặt lại mật khẩu đến email của bạn.'
    },
    {
      id: 10,
      category: 'technical',
      question: 'Làm thế nào để cập nhật thông tin cá nhân?',
      answer: 'Vào "Tài khoản" > "Thông tin cá nhân", chỉnh sửa các thông tin cần thiết và nhấn "Lưu thay đổi". Một số thông tin quan trọng cần xác thực qua email/SMS.'
    },
    {
      id: 11,
      category: 'tenant',
      question: 'Chính sách hoàn tiền cọc như thế nào?',
      answer: 'Tiền cọc được hoàn lại sau khi kết thúc hợp đồng, trừ các khoản phát sinh (nếu có) như hư hỏng tài sản, nợ tiền điện nước. Thời gian hoàn tiền trong vòng 7-14 ngày.'
    },
    {
      id: 12,
      category: 'owner',
      question: 'Làm sao để quản lý nhiều phòng hiệu quả?',
      answer: 'Sử dụng dashboard tổng quan để theo dõi tình trạng tất cả phòng, hóa đơn, hợp đồng. Hệ thống có thông báo tự động cho các sự kiện quan trọng.'
    }
  ];

  const guides = [
    {
      title: 'Hướng dẫn cho người thuê',
      icon: '👤',
      color: '#52c41a',
      steps: [
        'Đăng ký tài khoản và xác thực email',
        'Tìm kiếm phòng phù hợp với bộ lọc',
        'Liên hệ chủ nhà và đặt lịch xem phòng',
        'Ký hợp đồng và thanh toán tiền cọc',
        'Nhận phòng và bắt đầu thuê'
      ]
    },
    {
      title: 'Hướng dẫn cho chủ nhà',
      icon: '🏠',
      color: '#1890ff',
      steps: [
        'Đăng ký tài khoản chủ nhà',
        'Thêm thông tin phòng và upload ảnh',
        'Đợi khách thuê liên hệ',
        'Tạo hợp đồng và thu tiền cọc',
        'Quản lý hóa đơn hàng tháng'
      ]
    },
    {
      title: 'Quy trình thanh toán',
      icon: '💳',
      color: '#fa8c16',
      steps: [
        'Nhận thông báo hóa đơn qua email/SMS',
        'Kiểm tra chi tiết hóa đơn',
        'Chọn phương thức thanh toán',
        'Xác nhận và hoàn tất thanh toán',
        'Nhận biên lai điện tử'
      ]
    }
  ];

  const filteredFaqs = activeTab === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeTab);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: 'bold' }}>
          🎓 Trung Tâm Hỗ Trợ
        </h1>
        <p style={{ fontSize: '1.4rem', marginBottom: '40px', opacity: 0.95 }}>
          Tìm câu trả lời cho mọi thắc mắc của bạn
        </p>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm câu hỏi..."
            style={{
              width: '100%',
              padding: '18px 25px',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          />
        </div>
      </section>

      {/* Quick Links */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '-50px auto 60px',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {[
            { icon: '📞', title: 'Hotline', desc: '1900 xxxx', color: '#52c41a' },
            { icon: '📧', title: 'Email', desc: 'support@phongtro.vn', color: '#1890ff' },
            { icon: '💬', title: 'Live Chat', desc: 'Trực tuyến 24/7', color: '#fa8c16' },
            { icon: '📱', title: 'Zalo', desc: '0123 456 789', color: '#722ed1' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: item.color }}>
                {item.title}
              </h3>
              <p style={{ color: '#666', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step-by-Step Guides */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px', padding: '0 20px' }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          textAlign: 'center', 
          marginBottom: '40px',
          color: '#333'
        }}>
          📖 Hướng Dẫn Chi Tiết
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {guides.map((guide, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                borderRadius: '15px',
                padding: '35px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {guide.icon}
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                marginBottom: '25px',
                color: guide.color,
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {guide.title}
              </h3>
              <ol style={{ paddingLeft: '20px', lineHeight: '2' }}>
                {guide.steps.map((step, stepIdx) => (
                  <li key={stepIdx} style={{ 
                    marginBottom: '12px',
                    color: '#555',
                    fontSize: '1.05rem'
                  }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 60px', padding: '0 20px' }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          textAlign: 'center', 
          marginBottom: '40px',
          color: '#333'
        }}>
          ❓ Câu Hỏi Thường Gặp
        </h2>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              style={{
                padding: '12px 25px',
                border: activeTab === cat.id ? '2px solid #667eea' : '1px solid #ddd',
                background: activeTab === cat.id ? '#667eea' : 'white',
                color: activeTab === cat.id ? 'white' : '#333',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === cat.id ? 'bold' : 'normal',
                transition: 'all 0.3s'
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              style={{
                background: 'white',
                marginBottom: '15px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s'
              }}
            >
              <div
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                style={{
                  padding: '20px 25px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: expandedFaq === faq.id ? '#f0f7ff' : 'white'
                }}
              >
                <h3 style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  color: '#333',
                  fontWeight: 600
                }}>
                  {faq.question}
                </h3>
                <span style={{
                  fontSize: '1.5rem',
                  color: '#667eea',
                  transition: 'transform 0.3s',
                  transform: expandedFaq === faq.id ? 'rotate(180deg)' : 'rotate(0)'
                }}>
                  ▼
                </span>
              </div>
              {expandedFaq === faq.id && (
                <div style={{
                  padding: '20px 25px',
                  borderTop: '1px solid #f0f0f0',
                  background: '#fafafa',
                  animation: 'slideDown 0.3s ease'
                }}>
                  <p style={{
                    margin: 0,
                    color: '#666',
                    lineHeight: '1.8',
                    fontSize: '1.05rem'
                  }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
          Vẫn cần hỗ trợ thêm?
        </h2>
        <p style={{ fontSize: '1.3rem', marginBottom: '30px', opacity: 0.95 }}>
          Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
            💬 Chat với chúng tôi
          </button>
          <button style={{
            padding: '15px 40px',
            background: 'transparent',
            color: 'white',
            border: '2px solid white',
            borderRadius: '30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            📧 Gửi email
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
        <p style={{ margin: 0, opacity: 0.8 }}>
          © 2024 Hệ Thống Quản Lý Phòng Trọ - Hỗ trợ 24/7
        </p>
      </footer>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HuongDan;
