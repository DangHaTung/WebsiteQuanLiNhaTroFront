import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Typography,
  Row,
  Col,
  Collapse,
  Divider,
  Space,
  Tag,
  Alert,
  Button,
  Timeline,
  List,
  message
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  HomeOutlined,
  SafetyOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ToolOutlined,
  BankOutlined,
  FileProtectOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import "../../../assets/styles/contracts.css";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const Contracts: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  const handleAcceptTerms = () => {
    // Hiển thị thông báo thành công
    message.success('Cảm ơn bạn đã xem hợp đồng');

    // Chuyển về trang checkin với roomId nếu có
    if (roomId) {
      navigate(`/checkin/${roomId}`);
    } else {
      navigate("/checkin");
    }
  };

  const handleContactSupport = () => {
    message.info('Liên hệ bộ phận chăm sóc khách hàng để được hỗ trợ chi tiết');
  };

  const contractTerms = [
    {
      title: "ĐIỀU KIỆN THUÊ PHÒNG",
      icon: <HomeOutlined />,
      color: "#1890ff",
      items: [
        "Người thuê phải đủ 18 tuổi trở lên và có đầy đủ năng lực hành vi dân sự",
        "Người thuê phải cung cấp đầy đủ giấy tờ tùy thân hợp lệ (CMND/CCCD)",
        "Người thuê phải thanh toán đầy đủ tiền đặt cọc và tiền thuê tháng đầu tiên trước khi nhận phòng",
        "Hợp đồng thuê phòng có thời hạn tối thiểu 3 tháng"
      ]
    },
    {
      title: "QUYỀN VÀ NGHĨA VỤ CỦA NGƯỜI THUÊ",
      icon: <TeamOutlined />,
      color: "#52c41a",
      items: [
        "Được sử dụng phòng và các tiện ích chung theo đúng mục đích thuê nhà ở",
        "Được yêu cầu chủ nhà sửa chữa các hỏng hóc thuộc về nhà ở",
        "Có trách nhiệm giữ gìn phòng ở sạch sẽ, bảo quản tài sản chung",
        "Tuân thủ nội quy tòa nhà và quy định của địa phương",
        "Thanh toán đầy đủ tiền thuê và các khoản phí đúng hạn"
      ]
    },
    {
      title: "CHÍNH SÁCH THANH TOÁN",
      icon: <BankOutlined />,
      color: "#faad14",
      items: [
        "Tiền thuê phải thanh toán trước ngày 5 hàng tháng",
        "Phí phạt chậm thanh toán: 5% số tiền chậm cho mỗi ngày chậm",
        "Tiền đặt cọc sẽ được hoàn trả trong vòng 30 ngày sau khi trả phòng và kiểm tra phòng",
        "Các khoản phí phát sinh (điện, nước, internet) thanh toán theo hóa đơn thực tế"
      ]
    },
    {
      title: "NỘI QUY VÀ QUY ĐỊNH",
      icon: <SafetyOutlined />,
      color: "#722ed1",
      items: [
        "Không hút thuốc lá trong phòng và khu vực chung",
        "Không nuôi động vật trong phòng",
        "Không tổ chức tiệc tùng gây ồn ào sau 22h",
        "Không tự ý sửa chữa, cải tạo phòng mà không được phép",
        "Giữ gìn vệ sinh chung, bỏ rác đúng nơi quy định"
      ]
    },
    {
      title: "BẢO TRÌ VÀ SỬA CHỮA",
      icon: <ToolOutlined />,
      color: "#13c2c2",
      items: [
        "Chủ nhà có trách nhiệm sửa chữa các hỏng hóc lớn trong vòng 48h",
        "Người thuê chịu trách nhiệm sửa chữa các hỏng hóc do mình gây ra",
        "Thông báo trước 24h khi cần bảo trì định kỳ",
        "Người thuê không được tự ý thay đổi cấu trúc phòng"
      ]
    },
    {
      title: "CHÍNH SÁCH HỦY HỢP ĐỒNG",
      icon: <ExclamationCircleOutlined />,
      color: "#ff4d4f",
      items: [
        "Người thuê phải thông báo trước ít nhất 30 ngày trước khi muốn chấm dứt hợp đồng",
        "Nếu chấm dứt hợp đồng trước thời hạn, người thuê sẽ mất toàn bộ tiền đặt cọc",
        "Chủ nhà có quyền chấm dứt hợp đồng nếu người thuê vi phạm nghiêm trọng nội quy",
        "Khi trả phòng phải trả lại phòng trong tình trạng ban đầu (trừ hao mòn tự nhiên)"
      ]
    }
  ];

  const paymentSchedule = [
    { date: "Ngày 30 (tháng trước)", description: "Gửi hóa đơn điện, nước, internet", amount: "Theo sử dụng thực tế" },
    { date: "Ngày 1-5", description: "Thanh toán tiền thuê tháng hiện tại", amount: "Tùy theo hợp đồng" },
    { date: "Ngày 6-10", description: "Nhắc nhở thanh toán (nếu chưa thanh toán)", amount: "Áp dụng phí phạt" }
  ];

  const contactInfo = [
    { title: "Điện thoại", value: "1900-XXXX", icon: <PhoneOutlined />, color: "#1890ff" },
    { title: "Email", value: "support@tro360.com", icon: <FileTextOutlined />, color: "#52c41a" },
    { title: "Địa chỉ", value: "123 Đường ABC, Quận XYZ, TP.HCM", icon: <EnvironmentOutlined />, color: "#faad14" },
    { title: "Giờ làm việc", value: "8:00 - 18:00 (T2-T7)", icon: <CalendarOutlined />, color: "#722ed1" }
  ];

  return (
    <div className="contracts-container">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ color: "#1890ff", marginBottom: 8 }}>
            Điều Khoản & Điều Kiện Thuê Phòng
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Vui lòng đọc kỹ các điều khoản và điều kiện trước khi tiến hành thuê phòng
          </Paragraph>
        </div>

        {/* Introduction Alert */}
        <Alert
          message="Quan trọng!"
          description={
            <div>
              <p>Việc đọc và đồng ý với các điều khoản này là bắt buộc trước khi ký hợp đồng thuê phòng.</p>
              <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ bộ phận chăm sóc khách hàng.</p>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />

        {/* Contract Terms Accordion */}
        <Card
          title={
            <Space>
              <FileProtectOutlined />
              Các Điều Khoản Chính
            </Space>
          }
          className="terms-card"
          style={{ marginBottom: 24 }}
        >
          <Collapse accordion>
            {contractTerms.map((section, index) => (
              <Panel
                header={
                  <Space>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: section.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      {section.icon}
                    </div>
                    <strong>{section.title}</strong>
                  </Space>
                }
                key={index}
              >
                <List
                  dataSource={section.items}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '8px 0', border: 'none' }}>
                      <Space align="start">
                        <CheckCircleOutlined style={{ color: section.color, marginTop: 2 }} />
                        <Text>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
        </Card>

        {/* Payment Schedule */}
        <Card
          title={
            <Space>
              <DollarOutlined />
              Lịch Thanh Toán Hàng Tháng
            </Space>
          }
          className="payment-card"
          style={{ marginBottom: 24 }}
        >
          <Timeline>
            {paymentSchedule.map((item, index) => (
              <Timeline.Item
                key={index}
                color={index === 0 ? "blue" : index === 1 ? "green" : "orange"}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>{item.date}</Text>
                    <br />
                    <Text type="secondary">{item.description}</Text>
                  </div>
                  <Tag color={index === 2 ? "red" : "blue"}>{item.amount}</Tag>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Contact Information */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <PhoneOutlined />
                  Liên Hệ Hỗ Trợ
                </Space>
              }
              className="contact-card"
            >
              <List
                dataSource={contactInfo}
                renderItem={(item) => (
                  <List.Item style={{ padding: '12px 0', border: 'none' }}>
                    <Space align="center">
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <Text strong>{item.title}</Text>
                        <br />
                        <Text type="secondary">{item.value}</Text>
                      </div>
                    </Space>
                  </List.Item>
                )}
              />

              <Divider>Liên hệ ngay</Divider>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  block
                  icon={<PhoneOutlined />}
                  onClick={handleContactSupport}
                  className="btn-animated"
                >
                  Gọi hotline hỗ trợ
                </Button>
                <Button
                  type="primary"
                  block
                  icon={<FileTextOutlined />}
                  onClick={handleContactSupport}
                  className="btn-animated"
                >
                  Chat hỗ trợ trực tuyến
                </Button>
              </Space>
            </Card>
          </Col>

          {/* Terms Acceptance */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1890ff, #1890ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <CheckCircleOutlined />
                  </div>
                  <span style={{ color: '#1890ff', fontWeight: 600 }}>
                    Sẵn sàng đăng ký
                  </span>
                </Space>
              }
              className="acceptance-card"
              style={{
                border: '2px solid #e6f7ff',
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)',
                borderRadius: '12px'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #e6f7ff,rgb(250, 250, 250))',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '4px solidrgb(245, 245, 245)',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#1890ff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    marginBottom: '12px'
                  }}>
                    ✓
                  </div>
                  <Title level={4} style={{
                    color: "#1890ff",
                    margin: '0 0 8px 0',
                    fontSize: '18px'
                  }}>
                    Chào mừng bạn đến với Tro360!
                  </Title>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Bạn đã sẵn sàng trải nghiệm dịch vụ thuê phòng tốt nhất
                  </Text>
                </div>

                <ul style={{
                  margin: 0,
                  paddingLeft: 20,
                  listStyle: 'none'
                }}>
                  <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                    <Text>Đặt phòng nhanh chóng, dễ dàng</Text>
                  </li>
                  <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                    <Text>Hỗ trợ 24/7 từ đội ngũ chuyên nghiệp</Text>
                  </li>
                  <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                    <Text>Nhiều lựa chọn phòng đa dạng</Text>
                  </li>
                  <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                    <Text>Thanh toán linh hoạt và an toàn</Text>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                    <Text>Ưu đãi đặc biệt cho khách hàng thân thiết</Text>
                  </li>
                </ul>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                  onClick={handleAcceptTerms}
                  className="btn-animated"
                  style={{
                    height: 48,
                    background: 'linear-gradient(135deg, #1890ff, #1890ff)',
                    border: "none",
                    borderRadius: 8,
                    fontSize: '16px',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(24, 144, 255, 0.3)'
                  }}
                >
                  Bắt đầu đăng ký phòng ngay
                </Button>

                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#fff7e6',
                  borderRadius: '8px',
                  border: '1px solid #ffd591'
                }}>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    <ArrowRightOutlined style={{ marginRight: '4px' }} />
                    Sau khi nhấn nút, bạn sẽ được chuyển về trang đăng ký với phòng đã chọn
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Footer Information */}
        <Card style={{ marginTop: 24, textAlign: "center" }}>
          <Paragraph type="secondary">
            Các điều khoản này có thể được cập nhật mà không cần thông báo trước.
            <br />
            Vui lòng kiểm tra thường xuyên để cập nhật thông tin mới nhất.
          </Paragraph>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </Text>
        </Card>
      </div>
    </div>
  );
};

export default Contracts;
