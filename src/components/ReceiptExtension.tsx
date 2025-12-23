import React, { useState } from 'react';

/**
 * Component Gia Hạn Phiếu Thu
 * Quản lý việc gia hạn phiếu thu/tiền cọc
 * Component độc lập không kết nối router
 * Chỉ để commit code và demo, có thể tái sử dụng sau
 */

interface Receipt {
  id: string;
  receiptNumber: string;
  customerName: string;
  roomNumber: string;
  amount: number;
  depositDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'extended';
  extensionCount: number;
  extensionHistory: ExtensionHistory[];
}

interface ExtensionHistory {
  date: string;
  oldExpiry: string;
  newExpiry: string;
  extensionMonths: number;
  additionalFee: number;
  reason: string;
  approvedBy: string;
}

const ReceiptExtension: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: '1',
      receiptNumber: 'PT-2024-001',
      customerName: 'Nguyễn Văn A',
      roomNumber: '102',
      amount: 5000000,
      depositDate: '2024-01-15',
      expiryDate: '2024-12-15',
      status: 'active',
      extensionCount: 0,
      extensionHistory: []
    },
    {
      id: '2',
      receiptNumber: 'PT-2024-002',
      customerName: 'Trần Thị B',
      roomNumber: '103',
      amount: 3000000,
      depositDate: '2024-02-01',
      expiryDate: '2024-11-30',
      status: 'expired',
      extensionCount: 1,
      extensionHistory: [
        {
          date: '2024-11-25',
          oldExpiry: '2024-11-30',
          newExpiry: '2025-05-30',
          extensionMonths: 6,
          additionalFee: 500000,
          reason: 'Khách hàng yêu cầu gia hạn thêm 6 tháng',
          approvedBy: 'Admin'
        }
      ]
    }
  ]);

  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionMonths, setExtensionMonths] = useState(6);
  const [additionalFee, setAdditionalFee] = useState(500000);
  const [extensionReason, setExtensionReason] = useState('');

  const calculateNewExpiryDate = (currentExpiry: string, months: number): string => {
    const date = new Date(currentExpiry);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const getDaysRemaining = (expiryDate: string): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (receipt: Receipt) => {
    const daysRemaining = getDaysRemaining(receipt.expiryDate);
    
    if (daysRemaining < 0) {
      return { text: 'Đã hết hạn', color: '#ff4d4f', bg: '#fff1f0' };
    } else if (daysRemaining <= 30) {
      return { text: 'Sắp hết hạn', color: '#fa8c16', bg: '#fff7e6' };
    } else {
      return { text: 'Còn hiệu lực', color: '#52c41a', bg: '#f6ffed' };
    }
  };

  const handleExtension = () => {
    if (!selectedReceipt || !extensionReason.trim()) {
      alert('Vui lòng nhập lý do gia hạn!');
      return;
    }

    const newExpiry = calculateNewExpiryDate(selectedReceipt.expiryDate, extensionMonths);
    
    const newHistory: ExtensionHistory = {
      date: new Date().toISOString().split('T')[0],
      oldExpiry: selectedReceipt.expiryDate,
      newExpiry,
      extensionMonths,
      additionalFee,
      reason: extensionReason,
      approvedBy: 'Admin'
    };

    setReceipts(prev => prev.map(r => {
      if (r.id === selectedReceipt.id) {
        return {
          ...r,
          expiryDate: newExpiry,
          status: 'extended' as const,
          extensionCount: r.extensionCount + 1,
          extensionHistory: [...r.extensionHistory, newHistory]
        };
      }
      return r;
    }));

    setShowExtensionModal(false);
    setSelectedReceipt(null);
    setExtensionReason('');
    alert('Gia hạn phiếu thu thành công!');
  };

  const openExtensionModal = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowExtensionModal(true);
  };

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          color: 'white',
          padding: '50px 40px',
          borderRadius: '20px',
          marginBottom: '40px',
          boxShadow: '0 8px 24px rgba(24, 144, 255, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📋</div>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', margin: 0 }}>
            Gia Hạn Phiếu Thu
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.95, margin: 0 }}>
            Quản lý và gia hạn phiếu thu tiền cọc cho khách hàng
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {[
            { label: 'Tổng phiếu thu', value: receipts.length, icon: '📊', color: '#1890ff' },
            { label: 'Còn hiệu lực', value: receipts.filter(r => getDaysRemaining(r.expiryDate) > 30).length, icon: '✅', color: '#52c41a' },
            { label: 'Sắp hết hạn', value: receipts.filter(r => getDaysRemaining(r.expiryDate) <= 30 && getDaysRemaining(r.expiryDate) > 0).length, icon: '⏰', color: '#fa8c16' },
            { label: 'Đã hết hạn', value: receipts.filter(r => getDaysRemaining(r.expiryDate) < 0).length, icon: '❌', color: '#ff4d4f' }
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                padding: '25px',
                borderRadius: '15px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                textAlign: 'center',
                border: `3px solid ${stat.color}20`
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{stat.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color, marginBottom: '5px' }}>
                {stat.value}
              </div>
              <div style={{ color: '#666', fontSize: '1rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Receipts List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '25px'
        }}>
          {receipts.map((receipt) => {
            const statusBadge = getStatusBadge(receipt);
            const daysRemaining = getDaysRemaining(receipt.expiryDate);
            
            return (
              <div
                key={receipt.id}
                style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '30px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: `3px solid ${statusBadge.color}20`,
                  transition: 'transform 0.3s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  padding: '8px 15px',
                  background: statusBadge.bg,
                  color: statusBadge.color,
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  border: `2px solid ${statusBadge.color}`
                }}>
                  {statusBadge.text}
                </div>

                {/* Receipt Info */}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>
                    {receipt.receiptNumber}
                  </h3>
                  <div style={{ color: '#666', lineHeight: '1.8', fontSize: '1.05rem' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Khách hàng:</strong> {receipt.customerName}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Phòng:</strong> {receipt.roomNumber}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Số tiền:</strong> <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                        {receipt.amount.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Ngày cọc:</strong> {new Date(receipt.depositDate).toLocaleDateString('vi-VN')}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Hết hạn:</strong> {new Date(receipt.expiryDate).toLocaleDateString('vi-VN')}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Còn lại:</strong> <span style={{ 
                        color: daysRemaining < 0 ? '#ff4d4f' : daysRemaining <= 30 ? '#fa8c16' : '#52c41a',
                        fontWeight: 'bold'
                      }}>
                        {daysRemaining < 0 ? `Quá hạn ${Math.abs(daysRemaining)} ngày` : `${daysRemaining} ngày`}
                      </span>
                    </div>
                    <div>
                      <strong>Đã gia hạn:</strong> {receipt.extensionCount} lần
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => openExtensionModal(receipt)}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  🔄 Gia Hạn
                </button>

                {/* Extension History */}
                {receipt.extensionHistory.length > 0 && (
                  <details style={{ marginTop: '20px' }}>
                    <summary style={{ 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      color: '#1890ff',
                      fontSize: '1.05rem'
                    }}>
                      📜 Lịch sử gia hạn ({receipt.extensionHistory.length})
                    </summary>
                    <div style={{ marginTop: '15px', paddingLeft: '10px' }}>
                      {receipt.extensionHistory.map((history, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '15px',
                            background: '#f5f5f5',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            fontSize: '0.95rem'
                          }}
                        >
                          <div style={{ marginBottom: '5px' }}>
                            <strong>Ngày:</strong> {new Date(history.date).toLocaleDateString('vi-VN')}
                          </div>
                          <div style={{ marginBottom: '5px' }}>
                            <strong>Gia hạn:</strong> {history.extensionMonths} tháng
                          </div>
                          <div style={{ marginBottom: '5px' }}>
                            <strong>Phí:</strong> {history.additionalFee.toLocaleString('vi-VN')}₫
                          </div>
                          <div style={{ marginBottom: '5px' }}>
                            <strong>Lý do:</strong> {history.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>

        {/* Extension Modal */}
        {showExtensionModal && selectedReceipt && (
          <div
            onClick={() => setShowExtensionModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
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
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
            >
              <h2 style={{ fontSize: '2rem', marginBottom: '25px', color: '#333', textAlign: 'center' }}>
                🔄 Gia Hạn Phiếu Thu
              </h2>

              {/* Current Info */}
              <div style={{
                background: '#f0f7ff',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '2px solid #91d5ff'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Phiếu thu:</strong> {selectedReceipt.receiptNumber}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Khách hàng:</strong> {selectedReceipt.customerName}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Hết hạn hiện tại:</strong> {new Date(selectedReceipt.expiryDate).toLocaleDateString('vi-VN')}
                </div>
                <div>
                  <strong>Hết hạn mới:</strong> <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    {new Date(calculateNewExpiryDate(selectedReceipt.expiryDate, extensionMonths)).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Extension Form */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>
                  Thời gian gia hạn (tháng) *
                </label>
                <select
                  value={extensionMonths}
                  onChange={(e) => setExtensionMonths(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1.05rem',
                    border: '2px solid #d9d9d9',
                    borderRadius: '8px'
                  }}
                >
                  <option value={1}>1 tháng</option>
                  <option value={3}>3 tháng</option>
                  <option value={6}>6 tháng</option>
                  <option value={12}>12 tháng</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>
                  Phí gia hạn (₫) *
                </label>
                <input
                  type="number"
                  value={additionalFee}
                  onChange={(e) => setAdditionalFee(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1.05rem',
                    border: '2px solid #d9d9d9',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>
                  Lý do gia hạn *
                </label>
                <textarea
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  placeholder="Nhập lý do gia hạn..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1.05rem',
                    border: '2px solid #d9d9d9',
                    borderRadius: '8px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => setShowExtensionModal(false)}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: '#f5f5f5',
                    color: '#666',
                    border: '2px solid #d9d9d9',
                    borderRadius: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleExtension}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Xác Nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          marginTop: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#333' }}>
            📝 Hướng dẫn sử dụng:
          </h3>
          <ul style={{ lineHeight: '2', color: '#666', fontSize: '1.05rem' }}>
            <li>Xem danh sách phiếu thu và trạng thái hết hạn</li>
            <li>Click "Gia Hạn" để mở form gia hạn</li>
            <li>Chọn thời gian gia hạn (1, 3, 6, 12 tháng)</li>
            <li>Nhập phí gia hạn và lý do</li>
            <li>Hệ thống tự động tính ngày hết hạn mới</li>
            <li>Lịch sử gia hạn được lưu trữ đầy đủ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReceiptExtension;
