import React from "react";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { adminAuthService } from "../services/auth";

const { Title } = Typography;

const AdminRegister: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);

  const onFinish = async (values: { fullName: string; email: string; password: string }) => {
    try {
      setSubmitting(true);
      const res = await adminAuthService.register(values);
      message.success(res.message || "Đăng ký admin thành công");
      navigate("/admin/login");
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.response?.data?.error;
      message.error(apiMsg || err?.message || "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", padding: 16 }}>
      <Card style={{ width: 460, borderRadius: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Title level={3} style={{ marginBottom: 4 }}>Tạo tài khoản Admin</Title>
          <Typography.Text type="secondary">Quản trị hệ thống Tro360</Typography.Text>
        </div>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 8 }}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }, { min: 3, message: "Ít nhất 3 ký tự" }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
            <Input placeholder="abc@gmail.com" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }, { min: 6, message: "Ít nhất 6 ký tự" }]}>
            <Input.Password placeholder="••••••" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Nhập lại mật khẩu"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng nhập lại mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••" />
          </Form.Item>
          <Button type="primary" size="large" htmlType="submit" block loading={submitting} style={{ marginTop: 4 }}>Đăng ký</Button>
          <Button type="link" block onClick={() => navigate("/admin/login")} style={{ marginTop: 4 }}>Đã có tài khoản? Đăng nhập</Button>
        </Form>
      </Card>
    </div>
  );
};

export default AdminRegister;
