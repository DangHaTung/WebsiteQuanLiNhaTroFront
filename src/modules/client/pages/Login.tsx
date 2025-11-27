import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { clientAuthService } from "../../client/services/auth";
import "../../../assets/styles/login.css";

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Kiểm tra xem có phải từ admin route không
  const fromAdmin = new URLSearchParams(window.location.search).get("from") === "admin";

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await clientAuthService.login({
        email: values.username,
        password: values.password,
      });

      // Save token and user based on role
      const role = res.user.role;
      
      if (role === "ADMIN" || role === "STAFF") {
        // Admin/Staff: lưu vào admin_token và admin_currentUser
        localStorage.setItem("admin_token", res.token);
        localStorage.setItem("admin_currentUser", JSON.stringify(res.user));
        // Cũng lưu vào token để có thể dùng chung
        localStorage.setItem("token", res.token);
        localStorage.setItem("currentUser", JSON.stringify(res.user));
      } else {
        // User: lưu vào token và currentUser
        clientAuthService.saveAuthData(res.token, res.user);
      }

      const displayName = res.user.username || res.user.fullName || res.user.email;
      message.success(res.message || `Đăng nhập thành công! Chào mừng, ${displayName}!`);

      // Notify navbar
      window.dispatchEvent(new CustomEvent("login-success", {
        detail: { username: displayName }
      }));

      // Role-based redirect
      if (role === "ADMIN" || role === "STAFF") {
        navigate("/admin/dashboard");
      } else {
        // Kiểm tra xem có redirect từ admin route không
        const from = new URLSearchParams(window.location.search).get("from");
        if (from === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || err?.response?.data?.error || "Email hoặc mật khẩu không đúng!"
      );
    } finally {
      setLoading(false);
    }
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
        <Title className="login-title" level={2}>
          Giải pháp quản lý phòng trọ thông minh
        </Title>
      
      </div>

      {/* --- Cột phải --- */}
      <div className="login-right">
        <Card className="login-card">
          <div className="login-card-header">
            <Title level={2} className="login-heading">
              {fromAdmin ? "Đăng nhập Admin" : "Đăng nhập"}
            </Title>
            <Text type="secondary">
              {fromAdmin ? "Truy cập khu vực quản trị Tro360" : "Chào mừng bạn quay lại"}
            </Text>
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
        </Card>
      </div>
    </div>
  );
};

export default Login;
