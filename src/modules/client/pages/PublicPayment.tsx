import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, message, Space, Tag, Modal, Spin, Alert, Typography } from "antd";
import { CreditCardOutlined, DollarOutlined, CheckCircleOutlined, HomeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface BillInfo {
  bill: {
    _id: string;
    billType: string;
    status: string;
    amountDue: number;
    amountPaid: number;
    billingDate: string;
  };
  contract: {
    _id: string;
    tenantSnapshot: {
      fullName?: string;
      phone?: string;
      email?: string;
    };
  } | null;
  room: {
    _id: string;
    roomNumber: string;
    type?: string;
  } | null;
}

const PublicPayment: React.FC = () => {
  const { billId, token } = useParams<{ billId: string; token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [billInfo, setBillInfo] = useState<BillInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isSuccessPage, setIsSuccessPage] = useState(false);

  useEffect(() => {
    // Check if this is success page
    const isSuccess = window.location.pathname.includes("/success");
    setIsSuccessPage(isSuccess);

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
  }, [billId, token]);

  const verifyTokenAndLoadBill = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/public/payment/${billId}/${token}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Token không hợp lệ hoặc đã hết hạn");
        return;
      }

      // Luôn hiển thị thông tin bill, dù đã thanh toán hay chưa
      setBillInfo(data.data);
    } catch (error: any) {
      console.error("Verify token error:", error);
      setError("Lỗi khi xác thực token. Vui lòng kiểm tra lại link.");
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error: any) {
      console.error("Check payment status error:", error);
      setError("Lỗi khi kiểm tra trạng thái thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (provider: "vnpay" | "momo" | "zalopay") => {
    if (!billId || !token || !billInfo) return;

    try {
      setPaymentLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      const endpoint = provider === "zalopay" 
        ? `${apiUrl}/api/public/payment/${billId}/${token}/create`
        : `${apiUrl}/api/public/payment/${billId}/${token}/create`;

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Lỗi tạo link thanh toán");
      }

      let paymentUrl = null;
      if (provider === "vnpay") {
        paymentUrl = data.url || data.paymentUrl;
      } else if (provider === "momo") {
        paymentUrl = data.payUrl || data.data?.payUrl;
      } else if (provider === "zalopay") {
        paymentUrl = data.payUrl || data.zaloData?.order_url || data.order_url;
      }

      if (paymentUrl) {
        // Redirect to payment gateway
        window.location.href = paymentUrl;
      } else {
        message.error("Không tìm thấy link thanh toán");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      message.error(error.message || "Lỗi khi tạo link thanh toán");
    } finally {
      setPaymentLoading(false);
    }
  };

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

  const { bill, contract, room } = billInfo;
  const amountToPay = bill.amountDue - bill.amountPaid;
  const isPaid = bill.status === "PAID";

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
            ) : (
              <Tag color="warning">Chưa thanh toán</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          {isPaid || isSuccessPage ? (
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
          ) : (
            <Button
              type="primary"
              size="large"
              icon={<CreditCardOutlined />}
              onClick={showPaymentModal}
              loading={paymentLoading}
              style={{ minWidth: 200 }}
            >
              Thanh toán ngay
            </Button>
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

