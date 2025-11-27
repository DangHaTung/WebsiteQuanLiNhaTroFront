import React from 'react';
import { Card, Typography, Row, Col, Divider, Space, Tag, Button } from 'antd';
import { 
  InfoCircleOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  TeamOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const Information: React.FC = () => {
  const navigate = useNavigate();

  // System information data
  const systemInfo = {
    appName: 'Trọ 360',
    version: '1.0.0',
    releaseDate: '27/11/2024',
    description: 'Hệ thống quản lý và tìm kiếm phòng trọ toàn diện',
    features: [
      'Tìm kiếm phòng trọ nhanh chóng',
      'Đăng tin cho thuê miễn phí',
      'Quản lý hợp đồng điện tử',
      'Hệ thống đánh giá minh bạch',
      'Hỗ trợ khách hàng 24/7'
    ]
  };

  const contactInfo = [
    {
      icon: <PhoneOutlined />,
      title: 'Điện thoại',
      value: '0842 346 871',
      color: '#1890ff'
    },
    {
      icon: <MailOutlined />,
      title: 'Email',
      value: 'tro360@example.com',
      color: '#ff4d4f'
    },
    {
      icon: <EnvironmentOutlined />,
      title: 'Địa chỉ',
      value: '39 Ngõ 113 Yên Hoà - Cầu Giấy, Hà Nội',
      color: '#52c41a'
    },
    {
      icon: <ClockCircleOutlined />,
      title: 'Thời gian làm việc',
      value: 'Thứ 2 - Thứ 7: 8:00 - 22:00',
      color: '#faad14'
    }
  ];

  const teamMembers = [
    { name: 'Nguyễn Văn A', role: 'Fullstack Developer' },
    { name: 'Trần Thị B', role: 'Frontend Developer' },
    { name: 'Lê Văn C', role: 'Backend Developer' },
    { name: 'Phạm Thị D', role: 'UI/UX Designer' },
  ];

  return (
    <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ color: '#1890ff' }}>
              <InfoCircleOutlined /> THÔNG TIN HỆ THỐNG
            </Title>
            <Text type="secondary">Cập nhật lần cuối: {systemInfo.releaseDate}</Text>
          </div>

          {/* Giới thiệu ứng dụng */}
          <Card title="Giới thiệu" style={{ marginBottom: 24 }}>
            <Title level={4}>{systemInfo.appName}</Title>
            <Paragraph>
              {systemInfo.description}
            </Paragraph>
            <div style={{ margin: '16px 0' }}>
              <Text strong>Phiên bản: </Text>
              <Tag color="blue">v{systemInfo.version}</Tag>
            </div>
            
            <Divider orientation="left">Tính năng chính</Divider>
            <Row gutter={[16, 16]}>
              {systemInfo.features.map((feature, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                    <Text>{feature}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Thông tin liên hệ */}
          <Card title="Liên hệ hỗ trợ" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 24]}>
              {contactInfo.map((item, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card 
                    style={{ 
                      textAlign: 'center',
                      borderColor: item.color,
                      borderTop: `4px solid ${item.color}`,
                      height: '100%'
                    }}
                  >
                    <div style={{ fontSize: 24, color: item.color, marginBottom: 12 }}>
                      {item.icon}
                    </div>
                    <Title level={5}>{item.title}</Title>
                    <Text>{item.value}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>


          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => navigate(-1)}
              style={{ marginRight: 16 }}
            >
              Quay lại
            </Button>
            <Button 
              type="primary" 
              size="large"
              href="mailto:tro360@example.com"
              icon={<MailOutlined />}
            >
              Liên hệ hỗ trợ
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Information;