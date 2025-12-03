import React, { useState } from 'react';

/**
 * Component Demo về Bảo Mật Hóa Đơn
 * Giải thích tại sao KHÔNG NÊN cho phép sửa hóa đơn
 * Component độc lập không kết nối router
 * Chỉ để commit code và demo
 */

interface SecurityIssue {
  id: number;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  icon: string;
  example: string;
}

const BillSecurityDemo: React.FC = () => {
  const [selectedIssue, setSelectedIssue] = useState<SecurityIssue | null>(null);

  const securityIssues: SecurityIssue[] = [
    {
      id: 1,
      title: 'Gian lận tài chính',
      description: 'Cho phép sửa hóa đơn có thể dẫn đến việc thay đổi số tiền, tạo kẽ hở để gian lận.',
      severity: 'high',
      icon: '💰',
      example: 'Admin sửa hóa đơn 5,000,000₫ thành 3,000,000₫ sau khi khách đã thanh toán, chiếm đoạt 2,000,000₫'
    },
    {
      id: 2,
      title: 'Mất dấu vết kiểm toán',
      description: 'Khi sửa hóa đơn, lịch sử thay đổi không được ghi lại, khó kiểm tra khi có tranh chấp.',
      severity: 'high',
      icon: '📝',
      example: 'Không thể chứng minh hóa đơn ban đầu là bao nhiêu khi có khiếu nại từ khách hàng'
    },
    {
      id: 3,
      title: 'Vi phạm quy định kế toán',
      description: 'Theo quy định, hóa đơn đã xuất không được phép sửa đổi, chỉ được hủy và lập lại.',
      severity: 'high',
      icon: '⚖️',
      example: 'Vi phạm Luật Kế toán Việt Nam về tính bất biến của chứng từ kế toán'
    },
    {
      id: 4,
      title: 'Tranh chấp pháp lý',
      description: 'Hóa đơn bị sửa đổi không có giá trị pháp lý, gây khó khăn khi giải quyết tranh chấp.',
      severity: 'high',
      icon: '⚠️',
      example: 'Khách hàng kiện vì hóa đơn bị thay đổi sau khi thanh toán, không có bằng chứng rõ ràng'
    },
    {
      id: 5,
      title: 'Lỗi đồng bộ dữ liệu',
      description: 'Sửa hóa đơn có thể gây lỗi với các hệ thống liên quan như báo cáo, thuế, kế toán.',
      severity: 'medium',
      icon: '🔄',
      example: 'Báo cáo doanh thu tháng đã chốt nhưng hóa đơn bị sửa, số liệu không khớp'
    },
    {
      id: 6,
      title: 'Mất niềm tin khách hàng',
      description: 'Khách hàng phát hiện hóa đơn bị thay đổi sẽ mất niềm tin vào hệ thống.',
      severity: 'medium',
      icon: '😞',
      example: 'Khách lưu screenshot hóa đơn 5tr, sau đó thấy hệ thống hiển thị 6tr'
    }
  ];

  const bestPractices = [
    {
      title: 'Không cho phép sửa',
      description: 'Hóa đơn đã xuất không được sửa dưới mọi hình thức',
      icon: '🚫',
      color: '#ff4d4f'
    },
    {
      title: 'Chỉ cho phép hủy',
      description: 'Nếu sai, hủy hóa đơn cũ và tạo hóa đơn mới',
      icon: '🔄',
      color: '#fa8c16'
    },
    {
      title: 'Ghi log đầy đủ',
      description: 'Mọi thao tác với hóa đơn đều được ghi log chi tiết',
      icon: '📋',
      color: '#1890ff'
    },
    {
      title: 'Phân quyền chặt chẽ',
      description: 'Chỉ admin cấp cao mới có quyền hủy hóa đơn',
      icon: '🔐',
      color: '#722ed1'
    },
    {
      title: 'Lưu trữ vĩnh viễn',
      description: 'Hóa đơn đã hủy vẫn được lưu trữ, không xóa',
      icon: '💾',
      color: '#52c41a'
    },
    {
      title: 'Thông báo rõ ràng',
      description: 'Thông báo cho khách khi hóa đơn bị hủy/tạo mới',
      icon: '📧',
      color: '#13c2c2'
    }
  ];

  const getSeverityColor = (severity: string) => {
    const colors = {
      high: { bg: '#fff1f0', border: '#ff4d4f', text: '#cf1322' },
      medium: { bg: '#fff7e6', border: '#fa8c16', text: '#d46b08' },
      low: { bg: '#f6ffed', border: '#52c41a', text: '#389e0d' }
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getSeverityText = (severity: string) => {
    const texts = {
      high: 'Nghiêm trọng',
      medium: 'Trung bình',
      low: 'Thấp'
    };
    return texts[severity as keyof typeof texts] || 'Trung bình';
  };

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
          color: 'white',
          padding: '50px 40px',
          borderRadius: '20px',
          marginBottom: '40px',
          boxShadow: '0 8px 24px rgba(255, 77, 79, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', margin: 0 }}>
            Bảo Mật Hóa Đơn
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.95, margin: 0 }}>
            Tại sao KHÔNG NÊN cho phép sửa hóa đơn sau khi đã xuất
          </p>
        </div>

        {/* Warning Banner */}
        <div style={{
          background: '#fff7e6',
          border: '2px solid #fa8c16',
          borderRadius: '15px',
          padding: '25px 30px',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#d46b08', fontSize: '1.5rem' }}>
              Cảnh báo quan trọng!
            </h3>
            <p style={{ margin: 0, color: '#8c5c00', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Cho phép sửa hóa đơn là một lỗ hổng bảo mật nghiêm trọng, có thể dẫn đến gian lận tài chính, 
              vi phạm pháp luật và mất niềm tin khách hàng. Hệ thống đã <strong>BỎ CHỨC NĂNG SỬA HÓA ĐƠN</strong> để đảm bảo an toàn.
            </p>
          </div>
        </div>

        {/* Security Issues Grid */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '30px', 
            color: '#333',
            textAlign: 'center'
          }}>
            🚨 Các Rủi Ro Bảo Mật
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '25px'
          }}>
            {securityIssues.map((issue) => {
              const severityColor = getSeverityColor(issue.severity);
              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '30px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: `3px solid ${severityColor.border}`,
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    padding: '6px 15px',
                    background: severityColor.bg,
                    color: severityColor.text,
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    border: `1px solid ${severityColor.border}`
                  }}>
                    {getSeverityText(issue.severity)}
                  </div>
                  <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>
                    {issue.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    marginBottom: '15px', 
                    color: '#333',
                    fontWeight: 'bold'
                  }}>
                    {issue.title}
                  </h3>
                  <p style={{ 
                    color: '#666', 
                    lineHeight: '1.7',
                    margin: 0,
                    fontSize: '1.05rem'
                  }}>
                    {issue.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best Practices */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '30px', 
            color: '#333',
            textAlign: 'center'
          }}>
            ✅ Giải Pháp Đúng Đắn
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '25px'
          }}>
            {bestPractices.map((practice, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '30px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: `3px solid ${practice.color}20`,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.background = `${practice.color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  {practice.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  marginBottom: '12px', 
                  color: practice.color,
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {practice.title}
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: '1.6',
                  margin: 0,
                  textAlign: 'center',
                  fontSize: '1.05rem'
                }}>
                  {practice.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          marginBottom: '40px'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '30px', 
            color: '#333',
            textAlign: 'center'
          }}>
            ⚖️ So Sánh: Cho Phép Sửa vs Không Cho Phép Sửa
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px'
          }}>
            {/* Cho phép sửa - BAD */}
            <div style={{
              padding: '30px',
              background: '#fff1f0',
              borderRadius: '12px',
              border: '3px solid #ff4d4f'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>❌</div>
                <h3 style={{ fontSize: '1.5rem', color: '#cf1322', margin: 0 }}>
                  Cho Phép Sửa
                </h3>
              </div>
              <ul style={{ lineHeight: '2', color: '#8c1f1f', fontSize: '1.05rem' }}>
                <li>Dễ bị gian lận tài chính</li>
                <li>Mất dấu vết kiểm toán</li>
                <li>Vi phạm quy định pháp luật</li>
                <li>Gây tranh chấp với khách hàng</li>
                <li>Dữ liệu không đồng bộ</li>
                <li>Mất niềm tin</li>
              </ul>
            </div>

            {/* Không cho phép sửa - GOOD */}
            <div style={{
              padding: '30px',
              background: '#f6ffed',
              borderRadius: '12px',
              border: '3px solid #52c41a'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                <h3 style={{ fontSize: '1.5rem', color: '#389e0d', margin: 0 }}>
                  Không Cho Phép Sửa
                </h3>
              </div>
              <ul style={{ lineHeight: '2', color: '#3f6600', fontSize: '1.05rem' }}>
                <li>Bảo mật tuyệt đối</li>
                <li>Dấu vết rõ ràng</li>
                <li>Tuân thủ pháp luật</li>
                <li>Minh bạch với khách hàng</li>
                <li>Dữ liệu nhất quán</li>
                <li>Tăng niềm tin</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Guide */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          marginBottom: '40px'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '30px', 
            color: '#333',
            textAlign: 'center'
          }}>
            🛠️ Cách Triển Khai Đúng
          </h2>
          <div style={{
            background: '#f5f5f5',
            padding: '30px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1890ff' }}>
              1. Bỏ nút "Sửa" trong giao diện
            </h3>
            <pre style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '0.95rem',
              lineHeight: '1.6'
            }}>
{`// ❌ KHÔNG LÀM NHƯ NÀY
<Button icon={<EditOutlined />} onClick={() => editBill(bill)}>
  Sửa hóa đơn
</Button>

// ✅ LÀM NHƯ NÀY
<Button icon={<EyeOutlined />} onClick={() => viewBill(bill)}>
  Xem chi tiết
</Button>
<Button icon={<CloseOutlined />} onClick={() => cancelBill(bill)}>
  Hủy hóa đơn
</Button>`}
            </pre>
          </div>

          <div style={{
            background: '#f5f5f5',
            padding: '30px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1890ff' }}>
              2. Disable form khi xem chi tiết
            </h3>
            <pre style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '0.95rem',
              lineHeight: '1.6'
            }}>
{`// ✅ Tất cả input đều disabled
<Input value={bill.amount} disabled />
<Select value={bill.status} disabled />
<DatePicker value={bill.date} disabled />`}
            </pre>
          </div>

          <div style={{
            background: '#f5f5f5',
            padding: '30px',
            borderRadius: '12px'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1890ff' }}>
              3. Thêm chức năng hủy và tạo mới
            </h3>
            <pre style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '0.95rem',
              lineHeight: '1.6'
            }}>
{`// ✅ Hủy hóa đơn cũ
const cancelBill = async (billId) => {
  await billService.update(billId, { 
    status: 'CANCELLED',
    cancelledAt: new Date(),
    cancelledBy: currentUser.id,
    cancelReason: reason
  });
  // Ghi log
  await logService.create({
    action: 'CANCEL_BILL',
    billId,
    userId: currentUser.id,
    timestamp: new Date()
  });
};

// ✅ Tạo hóa đơn mới
const createNewBill = async (data) => {
  const newBill = await billService.create({
    ...data,
    replacedBillId: oldBillId // Tham chiếu hóa đơn cũ
  });
};`}
            </pre>
          </div>
        </div>

        {/* Legal Notice */}
        <div style={{
          background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
          color: 'white',
          padding: '40px',
          borderRadius: '15px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(114, 46, 209, 0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚖️</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px', margin: 0 }}>
            Quy Định Pháp Luật
          </h2>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', margin: 0, opacity: 0.95 }}>
            Theo <strong>Luật Kế toán Việt Nam</strong>, chứng từ kế toán (bao gồm hóa đơn) phải đảm bảo 
            tính <strong>chính xác, trung thực và không được tẩy xóa, sửa chữa</strong>. 
            Nếu có sai sót, phải <strong>lập chứng từ điều chỉnh</strong> hoặc <strong>hủy và lập lại</strong>.
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedIssue && (
        <div
          onClick={() => setSelectedIssue(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '700px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setSelectedIssue(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '40px',
                height: '40px',
                background: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '20px' }}>
              {selectedIssue.icon}
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333', textAlign: 'center' }}>
              {selectedIssue.title}
            </h2>
            <div style={{
              padding: '20px',
              background: getSeverityColor(selectedIssue.severity).bg,
              borderRadius: '12px',
              marginBottom: '20px',
              border: `2px solid ${getSeverityColor(selectedIssue.severity).border}`
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: getSeverityColor(selectedIssue.severity).text,
                fontSize: '1.1rem'
              }}>
                Mức độ: {getSeverityText(selectedIssue.severity)}
              </div>
              <p style={{ 
                margin: 0, 
                lineHeight: '1.8',
                color: '#333',
                fontSize: '1.1rem'
              }}>
                {selectedIssue.description}
              </p>
            </div>
            <div style={{
              padding: '20px',
              background: '#fff7e6',
              borderRadius: '12px',
              border: '2px solid #fa8c16'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#d46b08', fontSize: '1.1rem' }}>
                📌 Ví dụ thực tế:
              </div>
              <p style={{ margin: 0, lineHeight: '1.8', color: '#333', fontSize: '1.05rem' }}>
                {selectedIssue.example}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillSecurityDemo;
