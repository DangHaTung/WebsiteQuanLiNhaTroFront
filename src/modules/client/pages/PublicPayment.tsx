import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, Descriptions, Button, message, Space, Tag, Modal, Spin, Alert, Typography, Upload } from "antd";
import { CreditCardOutlined, DollarOutlined, CheckCircleOutlined, HomeOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
// Trang thanh toán công khai cho khách hàng
const { Title, Text } = Typography;

interface BillInfo {
  // Thông tin hóa đơn và hợp đồng liên quan
  bill: {
    _id: string;
    billType: string;
    status: string;
    amountDue: number;
    amountPaid: number;
    billingDate: string;
    metadata?: {
      cashPaymentRequest?: {
        receiptImage?: {
          url?: string;
          secure_url?: string;
        };
      };
    };
  };
  // Thông tin hợp đồng và phòng liên quan
  contract: {
    _id: string;
    tenantSnapshot: {
      fullName?: string;
      phone?: string;
      email?: string;
    };
    // other contract fields can be added as needed
  } | null;
  room: {
    _id: string;
    roomNumber: string;
    type?: string;
  } | null;
}
// Trang thanh toán công khai cho khách hàng
const PublicPayment: React.FC = () => {
  const { billId, token } = useParams<{ billId: string; token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [billInfo, setBillInfo] = useState<BillInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isSuccessPage, setIsSuccessPage] = useState(false);
  const [isUploadPage, setIsUploadPage] = useState(false);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
// Load thông tin hóa đơn khi component mount
  useEffect(() => {
    // Check if this is success page or upload page
    const isSuccess = window.location.pathname.includes("/success");
    const isUpload = location.pathname.includes("/upload-receipt");
    setIsSuccessPage(isSuccess);
    setIsUploadPage(isUpload);

    if (billId && token) {
      if (isSuccess) {
        // On success page, check payment status
        checkPaymentStatus();
      } else {
        verifyTokenAndLoadBill();
      }
    } else {
      setError("Thiếu thông tin billId hoặc token");
      setLoading(false);
    }
  }, [billId, token, location.pathname]);
// Xác thực token và tải thông tin hóa đơn
  const verifyTokenAndLoadBill = async () => {
    // Xác thực token và tải thông tin hóa đơn
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/public/payment/${billId}/${token}`);
      const data = await response.json();
// Nếu không thành công, hiển thị lỗi
      if (!data.success) {
        setError(data.message || "Token không hợp lệ hoặc đã hết hạn");
        return;
      }

      // Luôn hiển thị thông tin bill, dù đã thanh toán hay chưa
      setBillInfo(data.data);
    } catch (error: any) {
      //  Hiển thị lỗi khi xác thực token
      console.error("Verify token error:", error);
      setError("Lỗi khi xác thực token. Vui lòng kiểm tra lại link.");
    } finally {
      setLoading(false);
    }
  };
// Kiểm tra trạng thái thanh toán
  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/public/payment/${billId}/${token}`);
      const data = await response.json();

      if (data.success) {
        setBillInfo(data.data);
        // Check if payment was successful from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get("payment");
        if (paymentStatus === "success") {
          message.success("Thanh toán thành công! Tài khoản đã được tạo tự động.");
        }
      } else {
        setError(data.message || "Không thể tải thông tin thanh toán");
      }
      // Luôn hiển thị thông tin bill, dù đã thanh toán hay chưa
    } catch (error: any) {
      console.error("Check payment status error:", error);
      setError("Lỗi khi kiểm tra trạng thái thanh toán");
    } finally {
      setLoading(false);
    }
  };
// Xử lý thanh toán qua các cổng thanh toán
  const handlePayment = async (provider: "vnpay" | "momo" | "zalopay") => {
    if (!billId || !token || !billInfo) return;
// Tạo link thanh toán và chuyển hướng
    try {
      setPaymentLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      const endpoint = provider === "zalopay" 
        ? `${apiUrl}/api/public/payment/${billId}/${token}/create`
        : `${apiUrl}/api/public/payment/${billId}/${token}/create`;
// Gọi API tạo link thanh toán
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: provider.toUpperCase(), // VNPAY, MOMO, ZALOPAY
          amount: billInfo.bill.amountDue - billInfo.bill.amountPaid,
        }),
      });
// Nhận phản hồi từ API
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Lỗi tạo link thanh toán");
      }
// Lấy link thanh toán từ phản hồi
      let paymentUrl = null;
      if (provider === "vnpay") {
        paymentUrl = data.url || data.paymentUrl;
      } else if (provider === "momo") {
        paymentUrl = data.payUrl || data.data?.payUrl;
      } else if (provider === "zalopay") {
        paymentUrl = data.payUrl || data.zaloData?.order_url || data.order_url;
      }
// Chuyển hướng người dùng đến cổng thanh toán
      if (paymentUrl) {
        // Redirect to payment gateway
        window.location.href = paymentUrl;
      } else {
        message.error("Không tìm thấy link thanh toán");
      }
      // Handle payment response
    } catch (error: any) {
      console.error("Payment error:", error);
      message.error(error.message || "Lỗi khi tạo link thanh toán");
    } finally {
      setPaymentLoading(false);
    }
  };
// Hiển thị modal chọn phương thức thanh toán
  const showPaymentModal = () => {
    if (!billInfo) return;

    const amountToPay = billInfo.bill.amountDue - billInfo.bill.amountPaid;

    Modal.info({
      title: "Chọn phương thức thanh toán",
      width: 500,
      content: (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>
            Số tiền cần thanh toán: <strong style={{ color: "#1890ff" }}>{amountToPay.toLocaleString("vi-VN")} đ</strong>
          </p>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="primary"
              block
              size="large"
              onClick={() => {
                Modal.destroyAll();
                handlePayment("vnpay");
              }}
              style={{ backgroundColor: "#1890ff" }}
              loading={paymentLoading}
            >
              💳 VNPAY
            </Button>
            <Button
              type="primary"
              block
              size="large"
              onClick={() => {
                Modal.destroyAll();
                handlePayment("momo");
              }}
              style={{ backgroundColor: "#a50064" }}
              loading={paymentLoading}
            >
              🟣 MOMO
            </Button>
            <Button
              type="primary"
              block
              size="large"
              onClick={() => {
                Modal.destroyAll();
                handlePayment("zalopay");
              }}
              style={{ backgroundColor: "#0068ff" }}
              loading={paymentLoading}
            >
              💙 ZaloPay
            </Button>
          </Space>
        </div>
      ),
      okText: "Đóng",
      onOk: () => Modal.destroyAll(),
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" tip="Đang tải thông tin thanh toán..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <Card>
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" icon={<HomeOutlined />} onClick={() => navigate("/")}>
                Về trang chủ
              </Button>
            }
          />
        </Card>
      </div>
    );
  }
// Nếu không tìm thấy thông tin hóa đơn
  if (!billInfo) {
    return (
      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <Card>
          <Alert
            message="Không tìm thấy"
            description="Không tìm thấy thông tin hóa đơn"
            type="warning"
            showIcon
            action={
              <Button size="small" icon={<HomeOutlined />} onClick={() => navigate("/")}>
                Về trang chủ
              </Button>
            }
          />
        </Card>
      </div>
    );
  }
  // Handle upload receipt
  const handleUploadReceipt = async () => {
    if (!billId || !token || !billInfo) return;

    if (uploadFileList.length === 0) {
      message.error("Vui lòng chọn ảnh bill chuyển khoản");
      return;
    }

    try {
      setUploading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      const formData = new FormData();
      formData.append("amount", (billInfo.bill.amountDue - billInfo.bill.amountPaid).toString());
      if (uploadFileList[0].originFileObj) {
        formData.append("receiptImage", uploadFileList[0].originFileObj);
      }

      const response = await fetch(`${apiUrl}/api/public/payment/${billId}/${token}/upload-receipt`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lỗi khi upload ảnh bill");
      }

      message.success("Đã gửi yêu cầu xác nhận thanh toán thành công! Admin sẽ xem xét và xác nhận trong thời gian sớm nhất.");
      
      // Reload bill info
      setTimeout(() => {
        verifyTokenAndLoadBill();
        setIsUploadPage(false);
        navigate(`/public/payment/${billId}/${token}`);
      }, 2000);
    } catch (error: any) {
      console.error("Upload receipt error:", error);
      message.error(error.message || "Lỗi khi upload ảnh bill");
    } finally {
      setUploading(false);
    }
  };

  // Hiển thị thông tin hóa đơn và nút thanh toán
  const { bill, contract, room } = billInfo;
  const amountToPay = bill.amountDue - bill.amountPaid;
  const isPaid = bill.status === "PAID";
  const isPendingConfirm = bill.status === "PENDING_CASH_CONFIRM";
// Giao diện trang thanh toán công khai
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", minHeight: "100vh" }}>
      <Card>
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          💳 Thanh toán tiền cọc
        </Title>

        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Mã phiếu thu">
            <Text code>{bill._id.substring(0, 8)}...</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Phòng">
            {room ? `${room.roomNumber}${room.type ? ` - ${room.type}` : ""}` : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Người thuê">
            {contract?.tenantSnapshot?.fullName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {contract?.tenantSnapshot?.phone || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày lập">
            {dayjs(bill.billingDate).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
              {bill.amountDue.toLocaleString("vi-VN")} đ
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Đã thanh toán">
            {bill.amountPaid.toLocaleString("vi-VN")} đ
          </Descriptions.Item>
          <Descriptions.Item label="Còn lại">
            <Text strong style={{ fontSize: 18, color: "#ff4d4f" }}>
              {amountToPay.toLocaleString("vi-VN")} đ
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {isPaid ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Đã thanh toán
              </Tag>
            ) : isPendingConfirm ? (
              <Tag color="processing" icon={<UploadOutlined />}>
                Đang chờ xác nhận
              </Tag>
            ) : (
              <Tag color="warning">Chưa thanh toán</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          {isUploadPage ? (
            // Kiểm tra nếu đã gửi yêu cầu rồi (PENDING_CASH_CONFIRM)
            isPendingConfirm ? (
              <div style={{ maxWidth: 500, margin: "0 auto" }}>
                <Title level={3}>⏳ Đang chờ admin xác nhận</Title>
                <Alert
                  message="Yêu cầu xác nhận thanh toán đã được gửi"
                  description="Bạn đã gửi yêu cầu xác nhận thanh toán. Admin sẽ xem xét và xác nhận trong thời gian sớm nhất. Vui lòng chờ xử lý."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                {billInfo?.bill?.metadata?.cashPaymentRequest?.receiptImage && (
                  <div style={{ marginBottom: 24 }}>
                    <Text strong>Ảnh bill đã upload:</Text>
                    <div style={{ marginTop: 12 }}>
                      <img
                        src={billInfo.bill.metadata.cashPaymentRequest.receiptImage.secure_url || billInfo.bill.metadata.cashPaymentRequest.receiptImage.url}
                        alt="Receipt"
                        style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #d9d9d9" }}
                      />
                    </div>
                  </div>
                )}
                <Button onClick={() => {
                  setIsUploadPage(false);
                  navigate(`/public/payment/${billId}/${token}`);
                }}>
                  Quay lại trang thanh toán
                </Button>
              </div>
            ) : (
              <div style={{ maxWidth: 500, margin: "0 auto" }}>
                <Title level={3}>📤 Xác nhận đã chuyển khoản</Title>
                <Alert
                  message="Vui lòng upload ảnh bill chuyển khoản"
                  description="Sau khi upload, admin sẽ xem xét và xác nhận thanh toán của bạn."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                <Upload
                  listType="picture-card"
                  fileList={uploadFileList}
                  onChange={({ fileList }) => setUploadFileList(fileList)}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                >
                  {uploadFileList.length < 1 && (
                    <div>
                      <UploadOutlined style={{ fontSize: 24 }} />
                      <div style={{ marginTop: 8 }}>Upload ảnh</div>
                    </div>
                  )}
                </Upload>
                <div style={{ marginTop: 24 }}>
                  <Space>
                    <Button
                      type="primary"
                      size="large"
                      icon={<UploadOutlined />}
                      onClick={handleUploadReceipt}
                      loading={uploading}
                      disabled={uploadFileList.length === 0}
                    >
                      Gửi yêu cầu xác nhận
                    </Button>
                    <Button onClick={() => {
                      setIsUploadPage(false);
                      navigate(`/public/payment/${billId}/${token}`);
                    }}>
                      Hủy
                    </Button>
                  </Space>
                </div>
              </div>
            )
          ) : isPaid || isSuccessPage ? (
            <Alert
              message={isSuccessPage ? "Thanh toán thành công!" : "Hóa đơn đã được thanh toán"}
              description={
                isSuccessPage 
                  ? "Tài khoản đã được tạo tự động. Vui lòng kiểm tra email để nhận thông tin đăng nhập."
                  : "Bạn có thể đóng trang này."
              }
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              style={{ marginBottom: 16 }}
            />
          ) : isPendingConfirm ? (
            <Alert
              message="Đang chờ admin xác nhận"
              description="Yêu cầu thanh toán của bạn đang được admin xem xét. Vui lòng chờ xác nhận."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            <>
              <Button
                type="primary"
                size="large"
                icon={<CreditCardOutlined />}
                onClick={showPaymentModal}
                loading={paymentLoading}
                style={{ minWidth: 200, marginBottom: 16 }}
              >
                Thanh toán ngay
              </Button>
              <div>
                <Button
                  type="default"
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={() => navigate(`/public/payment/${billId}/${token}/upload-receipt`)}
                  style={{ minWidth: 200 }}
                >
                  Tôi đã chuyển khoản
                </Button>
              </div>
            </>
          )}
          <div style={{ marginTop: 16 }}>
            <Button icon={<HomeOutlined />} onClick={() => navigate("/")}>
              Về trang chủ
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PublicPayment;

