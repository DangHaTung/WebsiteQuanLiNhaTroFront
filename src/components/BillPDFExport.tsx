import React, { useRef } from 'react';

/**
 * Component Export PDF cho Hóa Đơn
 * Component độc lập không kết nối router
 * Chỉ để commit code và demo, có thể tái sử dụng sau
 */

interface BillData {
  billId: string;
  billDate: string;
  dueDate: string;
  customerName: string;
  roomNumber: string;
  address: string;
  phone: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  status: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';
}

const BillPDFExport: React.FC = () => {
  const billRef = useRef<HTMLDivElement>(null);

  // Dữ liệu mẫu
  const sampleBill: BillData = {
    billId: 'HD-2024-001',
    billDate: '01/12/2024',
    dueDate: '05/12/2024',
    customerName: 'Nguyễn Văn A',
    roomNumber: '102',
    address: 'Số 123, Đường ABC, Quận XYZ, Hà Nội',
    phone: '0123456789',
    items: [
      { name: 'Tiền thuê phòng', quantity: 1, unit: 'tháng', price: 3200000, total: 3200000 },
      { name: 'Tiền điện', quantity: 150, unit: 'kWh', price: 3500, total: 525000 },
      { name: 'Tiền nước', quantity: 12, unit: 'm³', price: 20000, total: 240000 },
      { name: 'Phí dịch vụ', quantity: 1, unit: 'tháng', price: 200000, total: 200000 },
      { name: 'Phí xe', quantity: 1, unit: 'tháng', price: 100000, total: 100000 },
    ],
    subtotal: 4265000,
    discount: 0,
    total: 4265000,
    status: 'UNPAID'
  };

  const exportToPDF = async () => {
    if (!billRef.current) return;

    try {
      // Tạo một window mới để in
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Vui lòng cho phép popup để xuất PDF');
        return;
      }

      // Clone nội dung hóa đơn
      const billContent = billRef.current.cloneNode(true) as HTMLElement;
      
      // Tạo HTML cho window mới
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Hóa Đơn ${sampleBill.billId}</title>
            <meta charset="utf-8">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: 'Arial', sans-serif;
                padding: 20px;
                background: white;
              }
              .bill-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border: 2px solid #333;
              }
              .bill-header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #1890ff;
                padding-bottom: 20px;
              }
              .company-name {
                font-size: 28px;
                font-weight: bold;
                color: #1890ff;
                margin-bottom: 10px;
              }
              .bill-title {
                font-size: 24px;
                font-weight: bold;
                color: #333;
                margin: 15px 0;
              }
              .bill-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
              }
              .info-section {
                flex: 1;
              }
              .info-label {
                font-weight: bold;
                color: #666;
                margin-bottom: 5px;
              }
              .info-value {
                color: #333;
                margin-bottom: 10px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th {
                background: #1890ff;
                color: white;
                padding: 12px;
                text-align: left;
                font-weight: bold;
              }
              td {
                padding: 10px 12px;
                border-bottom: 1px solid #ddd;
              }
              tr:hover {
                background: #f5f5f5;
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .summary {
                margin-top: 30px;
                border-top: 2px solid #333;
                padding-top: 20px;
              }
              .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 16px;
              }
              .summary-total {
                font-size: 20px;
                font-weight: bold;
                color: #1890ff;
                border-top: 2px solid #333;
                padding-top: 15px;
                margin-top: 10px;
              }
              .status-badge {
                display: inline-block;
                padding: 8px 20px;
                border-radius: 20px;
                font-weight: bold;
                margin-top: 10px;
              }
              .status-unpaid {
                background: #ff4d4f;
                color: white;
              }
              .status-paid {
                background: #52c41a;
                color: white;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #ddd;
                text-align: center;
                color: #666;
              }
              .signature-section {
                display: flex;
                justify-content: space-around;
                margin-top: 60px;
              }
              .signature-box {
                text-align: center;
              }
              .signature-line {
                margin-top: 80px;
                border-top: 1px solid #333;
                padding-top: 10px;
                font-weight: bold;
              }
              @media print {
                body {
                  padding: 0;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            ${billContent.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      
      // Đợi load xong rồi mới in
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Có lỗi khi xuất PDF. Vui lòng thử lại!');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      PAID: { text: 'ĐÃ THANH TOÁN', className: 'status-paid' },
      UNPAID: { text: 'CHƯA THANH TOÁN', className: 'status-unpaid' },
      PARTIALLY_PAID: { text: 'THANH TOÁN MỘT PHẦN', className: 'status-unpaid' }
    };
    return statusMap[status] || statusMap.UNPAID;
  };

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Control Panel */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            📄 Demo Export Hóa Đơn PDF
          </h2>
          <button
            onClick={exportToPDF}
            style={{
              padding: '12px 30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            📥 Xuất PDF
          </button>
        </div>

        {/* Bill Preview */}
        <div ref={billRef} className="bill-container" style={{
          background: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '2px solid #e8e8e8'
        }}>
          {/* Header */}
          <div className="bill-header" style={{
            textAlign: 'center',
            marginBottom: '30px',
            borderBottom: '3px solid #1890ff',
            paddingBottom: '20px'
          }}>
            <div className="company-name" style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1890ff',
              marginBottom: '10px'
            }}>
              BAN QUẢN LÝ PHÒNG TRO360
            </div>
            <div style={{ color: '#666', marginBottom: '5px' }}>
              Địa chỉ: Số 123, Đường ABC, Quận XYZ, Hà Nội
            </div>
            <div style={{ color: '#666' }}>
              Hotline: 1900 xxxx | Email: contact@tro360.vn
            </div>
            <div className="bill-title" style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              margin: '15px 0'
            }}>
              HÓA ĐƠN TIỀN PHÒNG
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>
              Mã hóa đơn: <strong>{sampleBill.billId}</strong>
            </div>
          </div>

          {/* Bill Info */}
          <div className="bill-info" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px',
            marginBottom: '30px'
          }}>
            <div className="info-section">
              <div className="info-label" style={{ fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>
                Thông tin khách hàng:
              </div>
              <div className="info-value" style={{ color: '#333', marginBottom: '8px' }}>
                <strong>Họ tên:</strong> {sampleBill.customerName}
              </div>
              <div className="info-value" style={{ color: '#333', marginBottom: '8px' }}>
                <strong>Phòng:</strong> {sampleBill.roomNumber}
              </div>
              <div className="info-value" style={{ color: '#333', marginBottom: '8px' }}>
                <strong>Địa chỉ:</strong> {sampleBill.address}
              </div>
              <div className="info-value" style={{ color: '#333' }}>
                <strong>SĐT:</strong> {sampleBill.phone}
              </div>
            </div>
            <div className="info-section">
              <div className="info-label" style={{ fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>
                Thông tin hóa đơn:
              </div>
              <div className="info-value" style={{ color: '#333', marginBottom: '8px' }}>
                <strong>Ngày lập:</strong> {sampleBill.billDate}
              </div>
              <div className="info-value" style={{ color: '#333', marginBottom: '8px' }}>
                <strong>Hạn thanh toán:</strong> {sampleBill.dueDate}
              </div>
              <div className="info-value">
                <strong>Trạng thái:</strong>
                <span className={`status-badge ${getStatusBadge(sampleBill.status).className}`} style={{
                  display: 'inline-block',
                  padding: '6px 15px',
                  borderRadius: '15px',
                  fontWeight: 'bold',
                  marginLeft: '10px',
                  fontSize: '14px'
                }}>
                  {getStatusBadge(sampleBill.status).text}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: '20px 0'
          }}>
            <thead>
              <tr>
                <th style={{
                  background: '#1890ff',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 'bold'
                }}>STT</th>
                <th style={{
                  background: '#1890ff',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 'bold'
                }}>Nội dung</th>
                <th style={{
                  background: '#1890ff',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>Số lượng</th>
                <th style={{
                  background: '#1890ff',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>Đơn vị</th>
                <th style={{
                  background: '#1890ff',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: 'bold'
                }}>Đơn giá</th>
                <th style={{
                  background: '#1890ff',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: 'bold'
                }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {sampleBill.items.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #ddd' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #ddd' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                    {item.unit}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #ddd', textAlign: 'right' }}>
                    {item.price.toLocaleString('vi-VN')}₫
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                    {item.total.toLocaleString('vi-VN')}₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="summary" style={{
            marginTop: '30px',
            borderTop: '2px solid #333',
            paddingTop: '20px'
          }}>
            <div className="summary-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              fontSize: '16px'
            }}>
              <span>Tạm tính:</span>
              <span>{sampleBill.subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="summary-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              fontSize: '16px'
            }}>
              <span>Giảm giá:</span>
              <span>-{sampleBill.discount.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="summary-total" style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1890ff',
              borderTop: '2px solid #333',
              paddingTop: '15px',
              marginTop: '10px'
            }}>
              <span>TỔNG CỘNG:</span>
              <span>{sampleBill.total.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          {/* Payment Info */}
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: '#f0f7ff',
            borderRadius: '8px',
            border: '1px solid #91d5ff'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#0050b3' }}>
              Thông tin thanh toán:
            </div>
            <div style={{ color: '#333', lineHeight: '1.8' }}>
              <div>• Ngân hàng: <strong>Vietcombank</strong></div>
              <div>• Số tài khoản: <strong>1234567890</strong></div>
              <div>• Chủ tài khoản: <strong>NGUYEN VAN A</strong></div>
              <div>• Nội dung: <strong>Thanh toan {sampleBill.billId} Phong {sampleBill.roomNumber}</strong></div>
            </div>
          </div>

          {/* Signature */}
          <div className="signature-section" style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: '60px'
          }}>
            <div className="signature-box" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Người lập phiếu</div>
              <div style={{ fontStyle: 'italic', color: '#666', fontSize: '14px' }}>(Ký, ghi rõ họ tên)</div>
              <div className="signature-line" style={{
                marginTop: '80px',
                borderTop: '1px solid #333',
                paddingTop: '10px',
                minWidth: '200px'
              }}></div>
            </div>
            <div className="signature-box" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Người thanh toán</div>
              <div style={{ fontStyle: 'italic', color: '#666', fontSize: '14px' }}>(Ký, ghi rõ họ tên)</div>
              <div className="signature-line" style={{
                marginTop: '80px',
                borderTop: '1px solid #333',
                paddingTop: '10px',
                minWidth: '200px'
              }}></div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer" style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '2px solid #ddd',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            <div>Cảm ơn quý khách đã sử dụng dịch vụ!</div>
            <div style={{ marginTop: '5px' }}>
              Mọi thắc mắc xin liên hệ: <strong>1900 xxxx</strong> hoặc <strong>contact@tro360.vn</strong>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>📝 Hướng dẫn sử dụng:</h3>
          <ul style={{ lineHeight: '2', color: '#666' }}>
            <li>Click nút "Xuất PDF" để mở cửa sổ in</li>
            <li>Chọn "Save as PDF" trong dialog in để lưu file PDF</li>
            <li>Component này hoàn toàn độc lập, có thể tái sử dụng</li>
            <li>Sau này có thể integrate vào BillsAD hoặc bất kỳ trang nào</li>
            <li>Không cần cài thêm thư viện, sử dụng window.print() native</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BillPDFExport;
