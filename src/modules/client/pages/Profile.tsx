import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, Avatar, message, Row, Col, Upload } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import { useAuth } from "../../../modules/client/context/AuthContext";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.username || "",
        email: user.email,
        phone: "",
        role: user.role,
      });
    }
  }, [user, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      form.setFieldsValue({
        fullName: user.username || "",
        email: user.email,
        phone: "",
        role: user.role,
      });
    }
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      // TODO: Implement API call to update user profile
      console.log("Updating profile:", values);
      message.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error: any) {
      message.error(error.message || "Cập nhật thông tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Text type="danger">Bạn cần đăng nhập để xem trang này</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Card>
        <Row gutter={24}>
          <Col span={8}>
            <div style={{ textAlign: "center" }}>
              <Avatar size={120} icon={<UserOutlined />} style={{ marginBottom: "16px" }} />
              <Upload>
                <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
              </Upload>
            </div>
          </Col>

          <Col span={16}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <Title level={3}>Thông tin cá nhân</Title>
              {!isEditing ? (
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                  Chỉnh sửa
                </Button>
              ) : (
                <div>
                  <Button style={{ marginRight: "8px" }} onClick={handleCancel}>
                    Hủy
                  </Button>
                  <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={() => form.submit()}>
                    Lưu
                  </Button>
                </div>
              )}
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              disabled={!isEditing}
            >
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  {
                    pattern: /^[0-9]{9,11}$/,
                    message: "Số điện thoại phải từ 9-11 chữ số",
                  },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item label="Vai trò">
                <Input value={user.role} disabled />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Profile;
