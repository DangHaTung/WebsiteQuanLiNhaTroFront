import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../../../assets/styles/login.css";

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (values: { username: string; password: string }) => {
    setLoading(true);

    // Kiểm tra thông tin đăng nhập từ localStorage (mô phỏng db.json)
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find((u: any) => u.email === values.username && u.passwordHash === values.password);

      if (user) {
        // Đăng nhập thành công
        localStorage.setItem("currentUser", JSON.stringify(user));
        setLoading(false);
        message.success(`Đăng nhập thành công! Chào mừng, ${user.fullName}!`);

        // Gửi sự kiện đăng nhập thành công để các component khác cập nhật
        window.dispatchEvent(new CustomEvent("login-success", {
          detail: { username: user.fullName }
        }));

        // Chuyển về trang chủ sau 1 giây
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        // Đăng nhập thất bại
        setLoading(false);
        message.error("Email hoặc mật khẩu không đúng!");
      }
    }, 1500);
  };

  return (
    <div className="login-container">
      {/* Logo góc trên trái */}
      <div className="login-logo">
        <img
          src="https://cdn-icons-png.flaticon.com/512/893/893292.png"
          alt="Tro360 Logo"
          className="logo-icon"
        />
        <h2 className="logo-text">Tro360</h2>
      </div>

      {/* --- Cột trái --- */}
      <div className="login-left">
        <img
          src="https://cdn3d.iconscout.com/3d/premium/thumb/website-login-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--login-signup-signin-user-interface-web-pack-network-illustrations-3022528.png"
          alt="illustration"
          className="login-illustration"
        />
        <Title className="login-title" level={2}>
          Giải pháp quản lý phòng trọ thông minh
        </Title>
        <Text className="login-subtitle">
          Quản lý – Kết nối – Tối ưu vận hành 💡
        </Text>
      </div>

      {/* --- Cột phải --- */}
      <div className="login-right">
        <Card className="login-card">
          <div className="login-card-header">
            <Title level={2} className="login-heading">
              Đăng nhập
            </Title>
            <Text type="secondary">Chào mừng bạn quay lại 👋</Text>
          </div>

          <Form
            name="login-form"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#3b82f6" }} />}
                placeholder="Email"
                size="large"
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#3b82f6" }} />}
                placeholder="Mật khẩu"
                size="large"
                className="custom-input"
              />
            </Form.Item>

            <div style={{ textAlign: "right", marginBottom: 10 }}>
              <a href="/forgot-password" className="forgot-link">
                Quên mật khẩu?
              </a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<LoginOutlined />}
                size="large"
                block
                loading={loading}
                className="login-btn btn-animated"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 10 }}>
            <Text>
              Chưa có tài khoản?{" "}
              <Button
                type="link"
                onClick={() => navigate("/register")}
                style={{ padding: 0, fontWeight: 600 }}
              >
                Đăng ký
              </Button>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
