import React, { useState, useEffect } from 'react';

/**
 * Component QR Code Thanh Toán
 * Generate QR code cho chuyển khoản ngân hàng
 * Component độc lập không kết nối router
 * Chỉ để commit code và demo, có thể tái sử dụng sau
 */

interface BankInfo {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  bin: string;
}

interface PaymentInfo {
  bankId: string;
  accountNo: string;
  accountName: string;
  amount: number;
  description: string;
}

const PaymentQRCode: React.FC = () => {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    bankId: 'VCB',
    accountNo: '1234567890',
    accountName: 'NGUYEN VAN A',
    amount: 5000000,
    description: 'Thanh toan tien phong thang 12'
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Danh sách ngân hàng phổ biến
  const banks: BankInfo[] = [
    { id: 'VCB', name: 'Vietcombank', shortName: 'VCB', logo: '🏦', bin: '970436' },
    { id: 'TCB', name: 'Techcombank', shortName: 'TCB', logo: '🏦', bin: '970407' },
    { id: 'VTB', name: 'Vietinbank', shortName: 'VTB', logo: '🏦', bin: '970415' },
    { id: 'BIDV', name: 'BIDV', shortName: 'BIDV', logo: '🏦', bin: '970418' },
    { id: 'ACB', name: 'ACB', shortName: 'ACB', logo: '🏦', bin: '970416' },
    { id: 'MB', name: 'MBBank', shortName: 'MB', logo: '🏦', bin: '970422' },
    { id: 'VPB', name: 'VPBank', shortName: 'VPB', logo: '🏦', bin: '970432' },
    { id: 'TPB', name: 'TPBank', shortName: 'TPB', logo: '🏦', bin: '970423' },
    { id: 'STB', name: 'Sacombank', shortName: 'STB', logo: '🏦', bin: '970403' },
    { id: 'AGR', name: 'Agribank', shortName: 'AGR', logo: '🏦', bin: '970405' }
  ];

  // Generate QR Code URL using VietQR API
  const generateQRCode = () => {
    setLoading(true);
    
    // Format description (remove Vietnamese characters and special chars)
    const formattedDesc = paymentInfo.description
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // VietQR API format
    const bank = banks.find(b => b.id === paymentInfo.bankId);
    if (!bank) return;

    // Using VietQR API (free, no authentication needed)
    const qrUrl = `https://img.vietqr.io/image/${bank.bin}-${paymentInfo.accountNo}-compact2.png?amount=${paymentInfo.amount}&addInfo=${encodeURIComponent(formattedDesc)}&accountName=${encodeURIComponent(paymentInfo.accountName)}`;
    
    setQrCodeUrl(qrUrl);
    setLoading(false);
  };

  useEffect(() => {
    generateQRCode();
  }, [paymentInfo]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const selectedBank = banks.find(b => b.id === paymentInfo.bankId);

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '50px 40px',
          borderRadius: '20px',
          marginBottom: '40px',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📱</div>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', margin: 0 }}>
            QR Code Thanh Toán
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.95, margin: 0 }}>
            Quét mã QR để chuyển khoản nhanh chóng và chính xác
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '30px'
        }}>
          {/* Form Input */}
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#333' }}>
              Thông Tin Thanh Toán
            </h2>

            {/* Bank Selection */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: 'bold',
                color: '#555',
                fontSize: '1.1rem'
              }}>
                Ngân hàng *
              </label>
              <select
                value={paymentInfo.bankId}
                onChange={(e) => setPaymentInfo({...paymentInfo, bankId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1.05rem',
                  border: '2px solid #d9d9d9',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: 'white'
                }}
              >
                {banks.map(bank => (
                  <option key={bank.id} value={bank.id}>
                    {bank.logo} {bank.name} ({bank.shortName})
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: 'bold',
                color: '#555',
                fontSize: '1.1rem'
              }}>
                Số tài khoản *
              </label>
              <input
                type="text"
                value={paymentInfo.accountNo}
                onChange={(e) => setPaymentInfo({...paymentInfo, accountNo: e.target.value})}
                placeholder="1234567890"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1.05rem',
                  border: '2px solid #d9d9d9',
                  borderRadius: '10px'
                }}
              />
            </div>

            {/* Account Name */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: 'bold',
                color: '#555',
                fontSize: '1.1rem'
              }}>
                Tên tài khoản *
              </label>
              <input
                type="text"
                value={paymentInfo.accountName}
                onChange={(e) => setPaymentInfo({...paymentInfo, accountName: e.target.value.toUpperCase()})}
                placeholder="NGUYEN VAN A"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1.05rem',
                  border: '2px solid #d9d9d9',
                  borderRadius: '10px',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: 'bold',
                color: '#555',
                fontSize: '1.1rem'
              }}>
                Số tiền *
              </label>
              <input
                type="number"
                value={paymentInfo.amount}
                onChange={(e) => setPaymentInfo({...paymentInfo, amount: Number(e.target.value)})}
                placeholder="5000000"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1.05rem',
                  border: '2px solid #d9d9d9',
                  borderRadius: '10px'
                }}
              />
              <div style={{ marginTop: '8px', color: '#1890ff', fontWeight: 'bold', fontSize: '1.1rem' }}>
                = {formatCurrency(paymentInfo.amount)}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: 'bold',
                color: '#555',
                fontSize: '1.1rem'
              }}>
                Nội dung chuyển khoản *
              </label>
              <input
                type="text"
                value={paymentInfo.description}
                onChange={(e) => setPaymentInfo({...paymentInfo, description: e.target.value})}
                placeholder="Thanh toan tien phong thang 12"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1.05rem',
                  border: '2px solid #d9d9d9',
                  borderRadius: '10px'
                }}
              />
              <div style={{ marginTop: '8px', color: '#999', fontSize: '0.9rem' }}>
                💡 Không dấu, không ký tự đặc biệt
              </div>
            </div>

            <button
              onClick={generateQRCode}
              style={{
                width: '100%',
                padding: '18px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🔄 Tạo lại QR Code
            </button>
          </div>

          {/* QR Code Display */}
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#333' }}>
              Mã QR Thanh Toán
            </h2>

            {/* QR Code */}
            <div style={{
              background: '#f5f5f5',
              padding: '30px',
              borderRadius: '15px',
              marginBottom: '30px',
              border: '3px dashed #d9d9d9'
            }}>
              {loading ? (
                <div style={{ padding: '100px 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
                  <div style={{ color: '#999' }}>Đang tạo QR Code...</div>
                </div>
              ) : qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div style="padding: 100px 0; color: #ff4d4f;">❌ Không thể tạo QR Code</div>';
                  }}
                />
              ) : (
                <div style={{ padding: '100px 0', color: '#999' }}>
                  Nhập thông tin để tạo QR Code
                </div>
              )}
            </div>

            {/* Payment Info Summary */}
            <div style={{
              background: '#f0f7ff',
              padding: '25px',
              borderRadius: '12px',
              border: '2px solid #91d5ff',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                fontSize: '1.3rem', 
                marginBottom: '20px', 
                color: '#0050b3',
                textAlign: 'center'
              }}>
                📋 Thông Tin Chuyển Khoản
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#666', fontSize: '0.95rem', marginBottom: '5px' }}>
                  Ngân hàng:
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1.05rem'
                }}>
                  <span>{selectedBank?.logo} {selectedBank?.name}</span>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#666', fontSize: '0.95rem', marginBottom: '5px' }}>
                  Số tài khoản:
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {paymentInfo.accountNo}
                  </span>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.accountNo)}
                    style={{
                      padding: '6px 15px',
                      background: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    {copied ? '✓' : '📋'} Copy
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#666', fontSize: '0.95rem', marginBottom: '5px' }}>
                  Tên tài khoản:
                </div>
                <div style={{ 
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1.05rem'
                }}>
                  {paymentInfo.accountName}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#666', fontSize: '0.95rem', marginBottom: '5px' }}>
                  Số tiền:
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#1890ff' }}>
                    {formatCurrency(paymentInfo.amount)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.amount.toString())}
                    style={{
                      padding: '6px 15px',
                      background: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    {copied ? '✓' : '📋'} Copy
                  </button>
                </div>
              </div>

              <div>
                <div style={{ color: '#666', fontSize: '0.95rem', marginBottom: '5px' }}>
                  Nội dung:
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.05rem', flex: 1 }}>
                    {paymentInfo.description}
                  </span>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.description)}
                    style={{
                      padding: '6px 15px',
                      background: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      marginLeft: '10px'
                    }}
                  >
                    {copied ? '✓' : '📋'} Copy
                  </button>
                </div>
              </div>
            </div>

            <div style={{
              background: '#fff7e6',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #ffa940',
              textAlign: 'left'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#d46b08' }}>
                ⚠️ Lưu ý quan trọng:
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#8c5c00', lineHeight: '1.8' }}>
                <li>Kiểm tra kỹ thông tin trước khi chuyển khoản</li>
                <li>Nhập đúng nội dung để xác nhận thanh toán nhanh</li>
                <li>Lưu lại ảnh QR hoặc screenshot để thanh toán sau</li>
                <li>Liên hệ hotline nếu gặp vấn đề</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          marginTop: '30px'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#333', textAlign: 'center' }}>
            📖 Hướng Dẫn Thanh Toán
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '25px'
          }}>
            {[
              { step: '1', title: 'Mở App Banking', desc: 'Mở ứng dụng ngân hàng trên điện thoại', icon: '📱' },
              { step: '2', title: 'Quét QR Code', desc: 'Chọn chức năng quét QR và quét mã trên màn hình', icon: '📷' },
              { step: '3', title: 'Kiểm tra thông tin', desc: 'Xác nhận số tiền và nội dung chuyển khoản', icon: '✅' },
              { step: '4', title: 'Xác nhận thanh toán', desc: 'Nhập mã PIN/OTP và hoàn tất giao dịch', icon: '🔐' }
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  padding: '30px',
                  background: '#f5f5f5',
                  borderRadius: '15px',
                  textAlign: 'center',
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  margin: '0 auto 20px'
                }}>
                  {item.step}
                </div>
                <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#333' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#666', margin: 0, lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Guide */}
        <div style={{
          background: '#e6f7ff',
          padding: '30px',
          borderRadius: '15px',
          marginTop: '30px',
          border: '2px solid #91d5ff'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#0050b3' }}>
            💡 Tích hợp vào hệ thống:
          </h3>
          <ul style={{ color: '#0050b3', lineHeight: '2', fontSize: '1.05rem', margin: 0 }}>
            <li>Thêm vào BillDetailDrawer để hiển thị QR khi xem hóa đơn</li>
            <li>Tự động điền thông tin từ bill (số tiền, nội dung)</li>
            <li>Lưu thông tin ngân hàng vào settings</li>
            <li>Cho phép download QR code dưới dạng ảnh</li>
            <li>Gửi QR code qua email cho khách hàng</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentQRCode;
