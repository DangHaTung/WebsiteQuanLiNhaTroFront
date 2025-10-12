import React from "react";
import { Card, Typography, Row, Col, Form, Input, Button, Space, Divider, Switch, Select, Radio } from "antd";
import { SettingOutlined, BellOutlined, LockOutlined, SaveOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then((values) => {
      console.log("Saving settings:", values);
      // TODO: Implement save logic
    });
  };

  return (
    <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
        Cài đặt tài khoản
      </Title>

      <Row gutter={[24, 24]}>
        {/* Thông báo */}
        <Col span={24}>
          <Card title={<><BellOutlined /> Thông báo</>}>
            <Form.Item label="Email thông báo" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>
            <Form.Item label="Thông báo SMS" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Thông báo đẩy" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>
          </Card>
        </Col>

        {/* Bảo mật */}
        <Col span={24}>
          <Card title={<><LockOutlined /> Bảo mật</>}>
            <Form.Item
              label="Mật khẩu hiện tại"
              name="currentPassword"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" }
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Card>
        </Col>

        {/* Giao diện */}
        <Col span={24}>
          <Card title={<><SettingOutlined /> Giao diện</>}>
            <Form.Item label="Ngôn ngữ" name="language" initialValue="vi">
              <Select style={{ width: 200 }}>
                <Option value="vi">Tiếng Việt</Option>
                <Option value="en">English</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Chế độ tối" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item label="Kích thước font chữ">
              <Radio.Group defaultValue="medium">
                <Radio value="small">Nhỏ</Radio>
                <Radio value="medium">Trung bình</Radio>
                <Radio value="large">Lớn</Radio>
              </Radio.Group>
            </Form.Item>
          </Card>
        </Col>

        <Col span={24}>
          <div style={{ textAlign: "center" }}>
            <Button type="primary" size="large" icon={<SaveOutlined />} onClick={handleSave}>
              Lưu cài đặt
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;
