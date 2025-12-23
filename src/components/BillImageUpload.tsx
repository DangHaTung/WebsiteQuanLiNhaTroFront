import React, { useState } from 'react';

/**
 * Component Upload Ảnh Bill/Chứng Từ Thanh Toán
 * Component độc lập không kết nối router
 * Chỉ để commit code và demo, có thể tái sử dụng sau
 */

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

const BillImageUpload: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      // Chỉ chấp nhận ảnh
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} không phải là ảnh!`);
        return false;
      }
      // Giới hạn 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} quá lớn! Tối đa 5MB`);
        return false;
      }
      return true;
    });

    const newImages: UploadedImage[] = validFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36),
      file,
      preview: URL.createObjectURL(file),
      uploadDate: new Date().toLocaleString('vi-VN'),
      status: 'pending'
    }));

    setImages(prev => [...newImages, ...prev]);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Delete image
  const handleDelete = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  // Update status
  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, status } : img
    ));
  };

  // View full image
  const viewImage = (image: UploadedImage) => {
    setSelectedImage(image);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; bg: string }> = {
      pending: { text: 'Chờ xác nhận', color: '#fa8c16', bg: '#fff7e6' },
      approved: { text: 'Đã xác nhận', color: '#52c41a', bg: '#f6ffed' },
      rejected: { text: 'Từ chối', color: '#ff4d4f', bg: '#fff1f0' }
    };
    return statusMap[status] || statusMap.pending;
  };

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '2rem' }}>
            📸 Upload Ảnh Chứng Từ Thanh Toán
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>
            Tải lên ảnh bill/chuyển khoản để xác nhận thanh toán
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            background: dragActive ? '#e6f7ff' : 'white',
            border: dragActive ? '3px dashed #1890ff' : '3px dashed #d9d9d9',
            borderRadius: '15px',
            padding: '60px 40px',
            textAlign: 'center',
            marginBottom: '30px',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>
            {dragActive ? '📥' : '📤'}
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>
            {dragActive ? 'Thả file vào đây' : 'Kéo thả ảnh vào đây'}
          </h3>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
            hoặc
          </p>
          <button
            style={{
              padding: '15px 40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('fileInput')?.click();
            }}
          >
            Chọn File
          </button>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />
          <p style={{ marginTop: '20px', color: '#999', fontSize: '0.95rem' }}>
            Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB mỗi file)
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {[
            { label: 'Tổng ảnh', value: images.length, icon: '📊', color: '#1890ff' },
            { label: 'Chờ xác nhận', value: images.filter(i => i.status === 'pending').length, icon: '⏳', color: '#fa8c16' },
            { label: 'Đã xác nhận', value: images.filter(i => i.status === 'approved').length, icon: '✅', color: '#52c41a' },
            { label: 'Từ chối', value: images.filter(i => i.status === 'rejected').length, icon: '❌', color: '#ff4d4f' }
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                textAlign: 'center',
                border: `2px solid ${stat.color}20`
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

        {/* Images Grid */}
        {images.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '25px'
          }}>
            {images.map((image) => {
              const statusBadge = getStatusBadge(image.status);
              return (
                <div
                  key={image.id}
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
                  {/* Image */}
                  <div
                    onClick={() => viewImage(image)}
                    style={{
                      height: '200px',
                      background: `url(${image.preview}) center/cover`,
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      padding: '6px 15px',
                      background: statusBadge.bg,
                      color: statusBadge.color,
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      border: `1px solid ${statusBadge.color}`
                    }}>
                      {statusBadge.text}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '15px' }}>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span>📅</span>
                      <span>{image.uploadDate}</span>
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#999',
                      marginBottom: '15px'
                    }}>
                      {image.file.name} ({(image.file.size / 1024).toFixed(0)} KB)
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {image.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(image.id, 'approved')}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#52c41a',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.9rem'
                            }}
                          >
                            ✓ Xác nhận
                          </button>
                          <button
                            onClick={() => updateStatus(image.id, 'rejected')}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#ff4d4f',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.9rem'
                            }}
                          >
                            ✗ Từ chối
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(image.id)}
                        style={{
                          flex: image.status === 'pending' ? 0 : 1,
                          padding: '10px',
                          background: '#f5f5f5',
                          color: '#666',
                          border: '1px solid #d9d9d9',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            background: 'white',
            padding: '60px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px', opacity: 0.5 }}>📭</div>
            <h3 style={{ fontSize: '1.5rem', color: '#999', margin: 0 }}>
              Chưa có ảnh nào được tải lên
            </h3>
          </div>
        )}

        {/* Image Viewer Modal */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.9)',
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
                position: 'relative',
                maxWidth: '90%',
                maxHeight: '90%',
                background: 'white',
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
              }}
            >
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  width: '40px',
                  height: '40px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}
              >
                ✕
              </button>
              <img
                src={selectedImage.preview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  display: 'block'
                }}
              />
              <div style={{
                padding: '20px',
                background: '#f5f5f5',
                borderTop: '1px solid #e8e8e8'
              }}>
                <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
                  {selectedImage.file.name}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  Tải lên: {selectedImage.uploadDate} | Kích thước: {(selectedImage.file.size / 1024).toFixed(0)} KB
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          marginTop: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '1.3rem' }}>
            📝 Hướng dẫn sử dụng:
          </h3>
          <ul style={{ lineHeight: '2', color: '#666', fontSize: '1.05rem' }}>
            <li>Kéo thả ảnh vào vùng upload hoặc click "Chọn File"</li>
            <li>Có thể upload nhiều ảnh cùng lúc</li>
            <li>Mỗi ảnh tối đa 5MB, định dạng JPG/PNG/GIF</li>
            <li>Click vào ảnh để xem full size</li>
            <li>Admin có thể xác nhận hoặc từ chối ảnh</li>
            <li>Component này độc lập, có thể tích hợp vào Bills sau</li>
          </ul>
        </div>

        {/* Integration Guide */}
        <div style={{
          background: '#e6f7ff',
          padding: '25px',
          borderRadius: '15px',
          marginTop: '20px',
          border: '2px solid #91d5ff'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#0050b3', fontSize: '1.3rem' }}>
            💡 Tích hợp vào hệ thống:
          </h3>
          <div style={{ color: '#0050b3', lineHeight: '1.8', fontSize: '1.05rem' }}>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>1. Thêm vào BillDetailDrawer:</strong> Cho phép người dùng upload ảnh chuyển khoản khi thanh toán
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>2. Lưu vào database:</strong> Lưu URL ảnh vào field <code>paymentProof</code> của Bill
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>3. Upload lên Cloudinary:</strong> Sử dụng service upload ảnh hiện có
            </p>
            <p style={{ margin: 0 }}>
              <strong>4. Xác nhận thanh toán:</strong> Admin xem ảnh và xác nhận bill từ PENDING → PAID
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillImageUpload;
