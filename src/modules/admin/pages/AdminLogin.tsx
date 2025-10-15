import React from "react";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminAuthService } from "../services/auth";

const { Title } = Typography;

const AdminLogin: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setSubmitting(true);
      const res = await adminAuthService.login(values);
      adminAuthService.saveAuthData(res.token, res.user);
      message.success(res.message || "Đăng nhập thành công");
      navigate("/admin/dashboard");
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.response?.data?.error;
      message.error(apiMsg || err?.message || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", padding: 16 }}>
      <Card style={{ width: 420, borderRadius: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Title level={3} style={{ marginBottom: 4 }}>Đăng nhập Admin</Title>
          <Typography.Text type="secondary">Truy cập khu vực quản trị Tro360</Typography.Text>
        </div>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 8 }}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
            <Input size="large" prefix={<MailOutlined style={{ color: "#1677ff" }} />} placeholder="admin@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
            <Input.Password size="large" prefix={<LockOutlined style={{ color: "#1677ff" }} />} placeholder="••••••" />
          </Form.Item>
          <Button type="primary" size="large" icon={<LoginOutlined />} htmlType="submit" block loading={submitting} style={{ marginTop: 4 }}>
            Đăng nhập
          </Button>
          <Button type="link" block icon={<UserAddOutlined />} onClick={() => navigate("/admin/register")} style={{ marginTop: 8 }}>
            Chưa có tài khoản? Đăng ký Admin
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AdminLogin;
