import React from "react";
import { Card, Avatar, Typography, Row, Col, Form, Input, Button, Space, Divider } from "antd";
import { UserOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then((values) => {
      console.log("Saving profile:", values);
      // TODO: Implement save logic
    });
  };

  return (
    <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
        Thông tin cá nhân
      </Title>

      <Row gutter={[24, 24]}>
        {/* Avatar và thông tin cơ bản */}
        <Col xs={24} md={8}>
          <Card style={{ textAlign: "center" }}>
            <Avatar size={80} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
            <Title level={4}>Nguyễn Văn A</Title>
            <Text type="secondary">nguyenvana@example.com</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" icon={<EditOutlined />}>
                Đổi ảnh đại diện
              </Button>
            </div>
          </Card>
        </Col>

        {/* Form thông tin chi tiết */}
        <Col xs={24} md={16}>
          <Card title="Thông tin cá nhân">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                fullName: "Nguyễn Văn A",
                email: "nguyenvana@example.com",
                phone: "0123456789",
                address: "123 Đường ABC, Quận 1, TP.HCM",
                dateOfBirth: "1990-01-01",
              }}
            >
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" }
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item label="Địa chỉ" name="address">
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item label="Ngày sinh" name="dateOfBirth">
                <Input type="date" />
              </Form.Item>

              <Divider />

              <div style={{ textAlign: "right" }}>
                <Space>
                  <Button>Hủy</Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                    Lưu thay đổi
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
