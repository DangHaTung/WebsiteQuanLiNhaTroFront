import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserAddOutlined, MailOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../../../assets/styles/register.css";

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (values: {
    fullname: string;
    email: string;
    phone: string;
    password: string;
    confirm: string;
  }) => {
    setLoading(true);

    // Kiểm tra mật khẩu xác nhận
    if (values.password !== values.confirm) {
      message.error("Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      message.error("Email không hợp lệ!");
      setLoading(false);
      return;
    }

    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(values.phone)) {
      message.error("Số điện thoại phải có 10-11 chữ số!");
      setLoading(false);
      return;
    }

    // Mô phỏng lưu vào db.json (thực tế sẽ gọi API)
    setTimeout(() => {
      // Lưu thông tin người dùng vào localStorage để mô phỏng
      const newUser = {
        _id: `user_${Date.now()}`,
        fullName: values.fullname,
        email: values.email,
        phone: values.phone,
        passwordHash: values.password, // Trong thực tế nên hash password
        role: "TENANT",
        createdAt: new Date().toISOString(),
      };

      // Lấy danh sách người dùng hiện tại từ localStorage
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

      // Kiểm tra email đã tồn tại chưa
      const emailExists = existingUsers.some((user: any) => user.email === values.email);
      if (emailExists) {
        message.error("Email đã được đăng ký!");
        setLoading(false);
        return;
      }

      // Thêm người dùng mới
      existingUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(existingUsers));

      setLoading(false);
      message.success(`Đăng ký thành công! Chào mừng, ${values.fullname}!`);

      // Chuyển sang trang login sau 2 giây
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }, 1500);
  };

  return (
    <div className="register-container">
      {/* Logo góc trên trái */}
      <div className="register-logo">
        <img
          src="https://cdn-icons-png.flaticon.com/512/893/893292.png"
          alt="Tro360 Logo"
          className="logo-icon"
        />
        <h2 className="logo-text">Tro360</h2>
      </div>

      {/* --- Cột trái --- */}
      <div className="register-left">
        <img
          src="https://cdn3d.iconscout.com/3d/premium/thumb/register-online-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--signup-login-user-digital-form-web-pack-network-illustrations-3127482.png"
          alt="illustration"
          className="register-illustration"
        />
        <Title className="register-title" level={2}>
          Bắt đầu hành trình cùng Tro360
        </Title>
        <Text className="register-subtitle">
          Quản lý – Kết nối – Tối ưu phòng trọ của bạn ✨
        </Text>
      </div>

      {/* --- Cột phải --- */}
      <div className="register-right">
        <Card className="register-card">
          <div className="register-card-header">
            <Title level={2} className="register-heading">
              Đăng ký tài khoản
            </Title>
            <Text type="secondary">Tạo tài khoản mới để bắt đầu 🚀</Text>
          </div>

          <Form
            name="register-form"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="fullname"
              label="Họ và tên"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên!" },
                { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
              ]}
            >
              <Input
                prefix={<UserAddOutlined style={{ color: "#3b82f6" }} />}
                placeholder="Nguyễn Văn A"
                size="large"
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#3b82f6" }} />}
                placeholder="example@email.com"
                size="large"
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại phải có 10-11 chữ số!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: "#3b82f6" }} />}
                placeholder="0123456789"
                size="large"
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#3b82f6" }} />}
                placeholder="Mật khẩu"
                size="large"
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#3b82f6" }} />}
                placeholder="Nhập lại mật khẩu"
                size="large"
                className="custom-input"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<UserAddOutlined />}
                size="large"
                block
                loading={loading}
                className="register-btn btn-animated"
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 10 }}>
            <Text>
              Đã có tài khoản?{" "}
              <Button
                type="link"
                onClick={() => navigate("/login")}
                style={{ padding: 0, fontWeight: 600 }}
              >
                Đăng nhập
              </Button>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
