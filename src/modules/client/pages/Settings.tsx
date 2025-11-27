import React, { useState } from "react";
import { 
  Card, 
  Typography, 
  Form, 
  Button, 
  Switch, 
  Select, 
  Radio, 
  Space, 
  Tabs, 
  Divider,
  message,
  theme
} from "antd";
import { 
  BellOutlined, 
  SaveOutlined, 
  GlobalOutlined,
  NotificationOutlined,
  MessageOutlined,
  BulbOutlined,
  CheckOutlined,
  CloseOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  MailOutlined,
  CheckCircleFilled
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { useToken } = theme;

const Settings: React.FC = () => {
  const { token } = useToken();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);

  // Initial form values
  const initialValues = {
    language: 'vi',
    darkMode: false,
    fontSize: 'medium',
    systemNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
    newMessageNotifications: true
  };

  const handleSave = () => {
    setIsSaving(true);
    form.validateFields().then((values) => {
      console.log("Saving settings:", values);
      // Simulate API call
      setTimeout(() => {
        setIsSaving(false);
        // Show success message
        message.success('Cập nhật cài đặt thành công!');
      }, 1000);
    }).catch(() => {
      setIsSaving(false);
    });
  };

  const tabItems = [
    {
      key: 'notifications',
      label: (
        <span>
          <NotificationOutlined style={{ marginRight: 8 }} />
          Thông báo
        </span>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Card variant="borderless">
            <Form layout="vertical" form={form}>
              <Form.Item 
                label={
                  <Space>
                    <BellOutlined style={{ color: token.colorPrimary }} />
                    <span>Thông báo hệ thống</span>
                  </Space>
                }
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>
              <Divider style={{ margin: '12px 0' }} />
              
              <Form.Item 
                label={
                  <Space>
                    <MailOutlined style={{ color: token.colorPrimary }} />
                    <span>Email thông báo</span>
                  </Space>
                }
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>
              <Divider style={{ margin: '12px 0' }} />
              
              <Form.Item 
                label={
                  <Space>
                    <NotificationOutlined style={{ color: token.colorPrimary }} />
                    <span>Thông báo đẩy</span>
                  </Space>
                }
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>
              <Divider style={{ margin: '12px 0' }} />
              
              <Form.Item 
                label={
                  <Space>
                    <MessageOutlined style={{ color: token.colorPrimary }} />
                    <span>Tin nhắn mới</span>
                  </Space>
                }
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'appearance',
      label: (
        <span>
          <GlobalOutlined style={{ marginRight: 8 }} />
          Giao diện
        </span>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Card variant="borderless">
            <Form layout="vertical" form={form}>
              <Form.Item 
                label={
                  <Space>
                    <GlobalOutlined style={{ color: token.colorPrimary }} />
                    <span>Ngôn ngữ</span>
                  </Space>
                }
                name="language"
              >
                <Select style={{ width: 200 }}>
                  <Option value="vi">
                    <Space>
                      <span role="img" aria-label="vi">🇻🇳</span>
                      Tiếng Việt
                    </Space>
                  </Option>
                  <Option value="en">
                    <Space>
                      <span role="img" aria-label="en">🇬🇧</span>
                      English
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
              <Divider style={{ margin: '12px 0' }} />
              
              <Form.Item 
                label={
                  <Space>
                    <BulbOutlined style={{ color: token.colorPrimary }} />
                    <span>Chế độ tối</span>
                  </Space>
                }
                name="darkMode"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren={<CheckOutlined />} 
                  unCheckedChildren={<CloseOutlined />} 
                />
              </Form.Item>
              <Divider style={{ margin: '12px 0' }} />
              
              <Form.Item 
                label={
                  <Space>
                    <FontSizeOutlined style={{ color: token.colorPrimary }} />
                    <span>Kích thước chữ</span>
                  </Space>
                }
                name="fontSize"
              >
                <Radio.Group 
                  optionType="button" 
                  name="fontSize"
                  style={{ width: '100%' }}
                >
                  <Radio.Button value="small" style={{ width: '33.33%', textAlign: 'center' }}>Nhỏ</Radio.Button>
                  <Radio.Button value="medium" style={{ width: '33.33%', textAlign: 'center' }}>Vừa</Radio.Button>
                  <Radio.Button value="large" style={{ width: '33.33%', textAlign: 'center' }}>Lớn</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Divider style={{ margin: '12px 0' }} />
              
              <Form.Item 
                label={
                  <Space>
                    <BgColorsOutlined style={{ color: token.colorPrimary }} />
                    <span>Chủ đề màu</span>
                  </Space>
                }
              >
                <Space wrap>
                  {['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96'].map(color => (
                    <div 
                      key={color}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: color === '#1890ff' ? `2px solid ${token.colorPrimary}` : '2px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {color === '#1890ff' && <CheckCircleFilled style={{ color: '#fff' }} />}
                    </div>
                  ))}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8 }}>Cài đặt tài khoản</Title>
        <Text type="secondary">Quản lý thông tin cá nhân, cài đặt thông báo và tùy chỉnh giao diện</Text>
      </div>
      
      <Form 
        form={form}
        initialValues={initialValues}
        onFinish={handleSave}
      >
        <Card 
          variant="borderless"
          styles={{
            body: { padding: 0 },
            header: { 
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #f0f0f0'
            }
          }}
          style={{
            borderRadius: 12,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            overflow: 'hidden'
          }}
        >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="left"
          style={{ minHeight: 500 }}
          tabBarStyle={{ 
            width: 220,
            background: token.colorFillAlter,
            margin: 0,
            padding: '16px 0',
            borderRight: `1px solid ${token.colorBorderSecondary}`
          }}
          items={tabItems}
        />
        
        {activeTab !== 'security' && (
          <div style={{ 
            padding: '16px 24px', 
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            textAlign: 'right' 
          }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<SaveOutlined />} 
              onClick={handleSave}
              loading={isSaving}
              style={{ minWidth: 160, height: 40 }}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        )}
        </Card>
      </Form>
    </div>
  );
};

export default Settings;
