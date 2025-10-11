import React, { useState } from "react";
import { Card, Typography, Switch, Divider, Button, Form, Select, message, Row, Col } from "antd";
import {
  SettingOutlined,
  BellOutlined,
  LockOutlined,
  GlobalOutlined,
  MoonOutlined,
  SunOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../modules/client/context/AuthContext";

const { Title, Text } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // State for settings
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [currentLanguage, setLanguage] = useState("vi");

  const handleSaveSettings = async (values: any) => {
    setLoading(true);
    try {
      // TODO: Implement API call to save settings
      console.log("Saving settings:", values);
      message.success("Lưu cài đặt thành công!");
    } catch (error: any) {
      message.error(error.message || "Lưu cài đặt thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    // TODO: Implement change password modal
    message.info("Chức năng đổi mật khẩu sẽ được triển khai");
  };

  const handleLogout = () => {
    logout();
    message.success("Đăng xuất thành công!");
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
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <SettingOutlined style={{ fontSize: "24px", marginRight: "12px", color: "#3b82f6" }} />
          <Title level={3} style={{ margin: 0 }}>Cài đặt tài khoản</Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveSettings}
          initialValues={{
            language: currentLanguage,
            notifications,
            emailNotifications,
          }}
        >
          {/* Appearance Settings */}
          <Card size="small" style={{ marginBottom: "16px" }}>
            <Title level={5} style={{ marginTop: 0 }}>
              <SunOutlined style={{ marginRight: "8px" }} />
              Giao diện
            </Title>

            <Form.Item label="Chế độ tối">
              <Switch
                checked={darkMode}
                onChange={setDarkMode}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
              />
            </Form.Item>
          </Card>

          {/* Notification Settings */}
          <Card size="small" style={{ marginBottom: "16px" }}>
            <Title level={5} style={{ marginTop: 0 }}>
              <BellOutlined style={{ marginRight: "8px" }} />
              Thông báo
            </Title>

            <Form.Item label="Thông báo trong ứng dụng">
              <Switch
                checked={notifications}
                onChange={setNotifications}
              />
            </Form.Item>

            <Form.Item label="Thông báo qua email">
              <Switch
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
            </Form.Item>
          </Card>

          {/* Language Settings */}
          <Card size="small" style={{ marginBottom: "16px" }}>
            <Title level={5} style={{ marginTop: 0 }}>
              <GlobalOutlined style={{ marginRight: "8px" }} />
              Ngôn ngữ
            </Title>

            <Form.Item name="language" label="Ngôn ngữ">
              <Select
                style={{ width: "200px" }}
                value={currentLanguage}
                onChange={setLanguage}
              >
                <Option value="vi">Tiếng Việt</Option>
                <Option value="en">English</Option>
              </Select>
            </Form.Item>
          </Card>

          <Divider />

          {/* Security Settings */}
          <Card size="small" style={{ marginBottom: "16px" }}>
            <Title level={5} style={{ marginTop: 0 }}>
              <LockOutlined style={{ marginRight: "8px" }} />
              Bảo mật
            </Title>

            <Row gutter={16}>
              <Col>
                <Button type="primary" onClick={handleChangePassword}>
                  Đổi mật khẩu
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Save Button */}
          <div style={{ textAlign: "right", marginTop: "24px" }}>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={() => form.submit()}
            >
              Lưu cài đặt
            </Button>
          </div>
        </Form>

        <Divider />

        {/* Danger Zone */}
        <Card size="small">
          <Title level={5} style={{ marginTop: 0, color: "#ff4d4f" }}>
            <LogoutOutlined style={{ marginRight: "8px" }} />
            Đăng xuất
          </Title>
          <Text type="danger" style={{ marginBottom: "16px", display: "block" }}>
            Đăng xuất khỏi tài khoản của bạn trên thiết bị này
          </Text>
          <Button danger onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Card>
      </Card>
    </div>
  );
};

export default Settings;
