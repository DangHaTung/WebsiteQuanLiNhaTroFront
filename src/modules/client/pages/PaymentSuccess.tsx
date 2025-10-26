import React from "react";
import { Result, Button } from "antd";
import { Link } from "react-router-dom";

const PaymentSuccess: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Result
        status="success"
        title="Thanh toán thành công!"
        subTitle="Cảm ơn bạn. Chúng tôi sẽ liên hệ với bạn sớm nhất."
        extra={[
          <Link to="/" key="home"><Button type="primary">Về trang chủ</Button></Link>,
        ]}
      />
    </div>
  );
};

export default PaymentSuccess;
