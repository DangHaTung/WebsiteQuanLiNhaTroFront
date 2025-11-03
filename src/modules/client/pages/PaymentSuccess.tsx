import React from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import { CheckCircleOutlined, StarFilled, HeartFilled } from "@ant-design/icons";
import "../../../assets/styles/payment.css";

const PaymentSuccess: React.FC = () => {
  const floatingIcons = [StarFilled, HeartFilled, CheckCircleOutlined];

  return (
    <div className="payment-success-page">
      {/* Background icon */}
      <div className="animated-icons">
        {Array.from({ length: 20 }).map((_, idx) => {
          const IconComp = floatingIcons[idx % floatingIcons.length];
          return (
            <div
              key={idx}
              className="floating-icon"
              style={{
                left: `${Math.random() * 90 + 5}%`,
                animationDuration: `${3 + Math.random() * 3}s`,
                fontSize: `${12 + Math.random() * 16}px`,
              }}
            >
              <IconComp style={{ color: "rgba(255,255,255,0.8)" }} />
            </div>
          );
        })}
      </div>

      <div className="payment-success-card animate-fadeIn">
        <CheckCircleOutlined className="success-icon" />
        <h1 className="success-title">Thanh toán thành công!</h1>
        <p className="success-subtitle">
          Cảm ơn bạn! Đơn đặt phòng của bạn đã được xác nhận.<br />
          Chúng tôi sẽ liên hệ sớm để hoàn tất thủ tục.
        </p>
        <Link to="/">
          <Button type="primary" size="large" className="btn-animated">
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
