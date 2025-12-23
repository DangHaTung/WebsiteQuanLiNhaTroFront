import React from 'react';
import { Typography, Row, Col, Card, Form, Input, Button, Space, message, Divider } from 'antd';
import { PhoneOutlined, MailOutlined, HomeOutlined, SendOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Contact: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: { name: string; email: string; phone: string; message: string }) => {
    console.log('Contact form submit:', values);
    message.success('🎉 Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.');
    form.resetFields();
  };

  return (
    <div
      style={{
        padding: '48px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        background: '#f9fbff',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={2} style={{ color: '#1677ff', marginBottom: 8 }}>
          Liên hệ với Tro360°
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7.  
          Hãy để lại thông tin để Tro360° có thể giúp bạn nhanh nhất.
        </Paragraph>
      </div>

      {/* Main content */}
      <Row gutter={[32, 32]}>
        {/* Form liên hệ */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            style={{
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              borderRadius: 16,
            }}
          >
            <Title level={4} style={{ marginBottom: 16 }}>
              Gửi thông tin liên hệ
            </Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                  >
                    <Input
                      placeholder="VD: Nguyễn Văn A"
                      size="large"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                  >
                    <Input placeholder="you@example.com" size="large" allowClear />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại' },
                      { pattern: /^\+?\d{9,12}$/, message: 'Số điện thoại không hợp lệ' },
                    ]}
                  >
                    <Input placeholder="0123 456 789" size="large" allowClear />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Chủ đề"
                    name="subject"
                    rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}
                  >
                    <Input placeholder="VD: Hỗ trợ thuê phòng" size="large" allowClear />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Nội dung"
                name="message"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
              >
                <Input.TextArea
                  rows={6}
                  placeholder="Mô tả chi tiết vấn đề bạn cần hỗ trợ..."
                  allowClear
                />
              </Form.Item>

              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  size="large"
                >
                  Gửi liên hệ
                </Button>
                <Button
                  onClick={() => form.resetFields()}
                  icon={<ReloadOutlined />}
                  size="large"
                >
                  Làm mới
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        {/* Thông tin liên hệ + Bản đồ */}
        <Col xs={24} lg={10}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <Card
              bordered={false}
              style={{
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                borderRadius: 16,
              }}
              title={
                <Title level={4} style={{ marginBottom: 0 }}>
                  Thông tin liên hệ
                </Title>
              }
            >
              <Space direction="vertical" size="middle">
                <Space>
                  <PhoneOutlined style={{ color: '#1677ff' }} />
                  <Text strong>Hotline:</Text>
                  <Text>0123 456 789</Text>
                </Space>
                <Space>
                  <MailOutlined style={{ color: '#1677ff' }} />
                  <Text strong>Email:</Text>
                  <Text>support@tro360.com</Text>
                </Space>
                <Space align="start">
                  <HomeOutlined style={{ color: '#1677ff', marginTop: 4 }} />
                  <div>
                    <Text strong>Địa chỉ:</Text>
                    <div>123 Đường ABC, Quận XYZ, Hà Nội</div>
                  </div>
                </Space>
              </Space>
            </Card>

            <Card
              bordered={false}
              style={{
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                borderRadius: 16,
              }}
              title={
                <Title level={4} style={{ marginBottom: 0 }}>
                  Vị trí trên bản đồ
                </Title>
              }
            >
              <div
                style={{
                  height: 300,
                  width: '100%',
                  overflow: 'hidden',
                  borderRadius: 12,
                }}
              >
                <iframe
                  title="Tro360 Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.125892225124!2d105.834159815406!3d21.02776408599817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abfd12b0d3a1%3A0x9c639c3a35d87693!2zSGFub2ksIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Card>
          </Space>
        </Col>
      </Row>

      <Divider style={{ marginTop: 64 }} />
      <Paragraph style={{ textAlign: 'center', color: '#888' }}>
        © {new Date().getFullYear()} Tro360° - Mạng lưới phòng trọ thông minh Việt Nam
      </Paragraph>
    </div>
  );
};

export default Contact;
