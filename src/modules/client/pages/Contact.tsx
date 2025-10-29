import React, { useState } from "react";
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Select, 
  message,
  Space,
  Divider
} from "antd";
import { 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  SendOutlined,
  CustomerServiceOutlined,
  QuestionCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import "../../../assets/styles/contact.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Contact: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.');
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <PhoneOutlined />,
      title: "Điện thoại",
      content: "0123 456 789",
      description: "Hỗ trợ 24/7"
    },
    {
      icon: <MailOutlined />,
      title: "Email",
      content: "support@tro360.com",
      description: "Phản hồi trong 2 giờ"
    },
    {
      icon: <EnvironmentOutlined />,
      title: "Địa chỉ",
      content: "123 Đường ABC, Quận 1, TP.HCM",
      description: "Văn phòng chính"
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Giờ làm việc",
      content: "8:00 - 22:00",
      description: "Thứ 2 - Chủ nhật"
    }
  ];

  const faqData = [
    {
      question: "Làm thế nào để đăng tin cho thuê phòng?",
      answer: "Bạn có thể đăng tin miễn phí bằng cách nhấn nút 'Đăng tin cho thuê' ở góc trên bên phải trang web, sau đó điền đầy đủ thông tin phòng trọ."
    },
    {
      question: "Phí dịch vụ của Tro360 là bao nhiêu?",
      answer: "Đăng tin cho thuê phòng hoàn toàn miễn phí. Chúng tôi chỉ thu phí khi có giao dịch thành công."
    },
    {
      question: "Làm sao để báo cáo phòng trọ không đúng thông tin?",
      answer: "Bạn có thể sử dụng chức năng 'Khiếu nại' trên trang web hoặc gọi hotline để báo cáo. Chúng tôi sẽ xử lý trong vòng 24 giờ."
    },
    {
      question: "Có hỗ trợ thanh toán online không?",
      answer: "Có, chúng tôi hỗ trợ thanh toán qua VNPay, MoMo, ZaloPay và các ví điện tử khác."
    }
  ];

  return (
    <div className="contact-container">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <Title level={1} className="contact-hero-title">
            Liên hệ với chúng tôi
          </Title>
          <Paragraph className="contact-hero-subtitle">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </Paragraph>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="contact-info">
        <div className="contact-info-content">
          <Title level={2} className="contact-section-title">
            Thông tin liên hệ
          </Title>
          <Row gutter={[24, 24]}>
            {contactInfo.map((info, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="contact-info-card">
                  <div className="contact-info-icon">
                    {info.icon}
                  </div>
                  <Title level={4} className="contact-info-title">
                    {info.title}
                  </Title>
                  <Text className="contact-info-content-text">
                    {info.content}
                  </Text>
                  <Text type="secondary" className="contact-info-description">
                    {info.description}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="contact-form-section">
        <div className="contact-form-content">
          <Row gutter={[48, 48]}>
            <Col xs={24} lg={12}>
              <Card className="contact-form-card">
                <Title level={3} className="contact-form-title">
                  Gửi tin nhắn cho chúng tôi
                </Title>
                <Paragraph className="contact-form-subtitle">
                  Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn sớm nhất
                </Paragraph>
                
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  className="contact-form"
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                      >
                        <Input placeholder="Nhập họ và tên" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: 'Vui lòng nhập email' },
                          { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                      >
                        <Input placeholder="Nhập email" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                      >
                        <Input placeholder="Nhập số điện thoại" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="subject"
                        label="Chủ đề"
                        rules={[{ required: true, message: 'Vui lòng chọn chủ đề' }]}
                      >
                        <Select placeholder="Chọn chủ đề">
                          <Option value="general">Tư vấn chung</Option>
                          <Option value="rent">Thuê phòng</Option>
                          <Option value="rental">Cho thuê phòng</Option>
                          <Option value="payment">Thanh toán</Option>
                          <Option value="complaint">Khiếu nại</Option>
                          <Option value="other">Khác</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="message"
                    label="Nội dung tin nhắn"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung tin nhắn' }]}
                  >
                    <TextArea 
                      rows={6} 
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SendOutlined />}
                      size="large"
                      className="contact-submit-btn"
                    >
                      Gửi tin nhắn
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <div className="contact-sidebar">
                <Card className="contact-help-card">
                  <div className="contact-help-icon">
                    <CustomerServiceOutlined />
                  </div>
                  <Title level={4} className="contact-help-title">
                    Cần hỗ trợ ngay?
                  </Title>
                  <Paragraph className="contact-help-text">
                    Gọi hotline để được tư vấn trực tiếp với đội ngũ chuyên viên
                  </Paragraph>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<PhoneOutlined />}
                    className="contact-call-btn"
                  >
                    0123 456 789
                  </Button>
                </Card>

                <Card className="contact-faq-card">
                  <Title level={4} className="contact-faq-title">
                    Câu hỏi thường gặp
                  </Title>
                  <div className="contact-faq-list">
                    {faqData.map((faq, index) => (
                      <div key={index} className="contact-faq-item">
                        <div className="contact-faq-question">
                          <QuestionCircleOutlined className="contact-faq-icon" />
                          <Text strong>{faq.question}</Text>
                        </div>
                        <div className="contact-faq-answer">
                          <Text type="secondary">{faq.answer}</Text>
                        </div>
                        {index < faqData.length - 1 && <Divider />}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Map Section */}
      <div className="contact-map">
        <div className="contact-map-content">
          <Title level={2} className="contact-section-title">
            Vị trí văn phòng
          </Title>
          <div className="contact-map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3253113000003!2d106.70042331533333!3d10.776611992315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b90bde3bd%3A0x15e8a216c816dc1!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBD4bqndSBHaeG6pXkgVGjDoG5oIHBo4buRIEj5bq1!5e0!3m2!1svi!2s!4v1640000000000!5m2!1svi!2s"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;