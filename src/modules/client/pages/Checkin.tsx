import React from "react";
import { Card, Typography, Space, Button, Row, Col, Divider } from "antd";
import { PhoneOutlined, EnvironmentOutlined, FacebookOutlined, MessageOutlined } from "@ant-design/icons";
import "../../../assets/styles/checkin.css";

const { Title, Paragraph, Text } = Typography;

const Checkin: React.FC = () => {
  const handleCallPhone = () => {
    window.location.href = "tel:0842346871";
  };

  const handleOpenFacebook = () => {
    window.open("https://www.facebook.com/profile.php?id=61583677535458", "_blank");
  };

  const handleOpenZalo = () => {
    window.open("https://zalo.me/0842346871", "_blank");
  };

  const handleOpenMap = () => {
    window.open("https://maps.google.com/?q=39+Ngõ+113+Yên+Hoà+Cầu+Giấy+Hà+Nội", "_blank");
  };

  return (
    <div className="checkin-container">
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Title level={2} style={{ color: "#1890ff", marginBottom: 8 }}>
            Liên Hệ Với Chúng Tôi
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Bạn quan tâm đến phòng trọ? Hãy liên hệ với chúng tôi qua các kênh dưới đây
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {/* Thông tin liên hệ */}
          <Col xs={24} md={12}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                height: "100%",
              }}
            >
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Title level={4} style={{ color: "#1890ff", marginBottom: 8 }}>
                    📞 Thông Tin Liên Hệ
                  </Title>
                  <Text type="secondary">Chúng tôi luôn sẵn sàng hỗ trợ bạn</Text>
                </div>

                <Divider />

                {/* Số điện thoại */}
                <div
                  style={{
                    padding: "20px",
                    background: "#f0f9ff",
                    borderRadius: 12,
                    border: "2px solid #1890ff",
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <PhoneOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                      <div>
                        <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                          Số điện thoại
                        </Text>
                        <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                          0842346871
                        </Text>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<PhoneOutlined />}
                      onClick={handleCallPhone}
                      style={{ marginTop: 12 }}
                    >
                      Gọi ngay
                    </Button>
                  </Space>
                </div>

                {/* Địa chỉ */}
                <div
                  style={{
                    padding: "20px",
                    background: "#f6ffed",
                    borderRadius: 12,
                    border: "2px solid #52c41a",
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <EnvironmentOutlined style={{ fontSize: 24, color: "#52c41a" }} />
                      <div>
                        <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                          Địa chỉ
                        </Text>
                        <Text strong style={{ fontSize: 16 }}>
                          39 Ngõ 113 Yên Hoà - Cầu Giấy
                        </Text>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<EnvironmentOutlined />}
                      onClick={handleOpenMap}
                      style={{ marginTop: 12, backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                    >
                      Xem bản đồ
                    </Button>
                  </Space>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Kênh liên hệ khác */}
          <Col xs={24} md={12}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                height: "100%",
              }}
            >
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Title level={4} style={{ color: "#1890ff", marginBottom: 8 }}>
                    💬 Kênh Liên Hệ Khác
                  </Title>
                  <Text type="secondary">Chọn kênh phù hợp với bạn</Text>
                </div>

                <Divider />

                {/* Facebook */}
                <div
                  style={{
                    padding: "20px",
                    background: "#f0f5ff",
                    borderRadius: 12,
                    border: "2px solid #4267B2",
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <FacebookOutlined style={{ fontSize: 24, color: "#4267B2" }} />
                      <div>
                        <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                          Facebook
                        </Text>
                        <Text strong style={{ fontSize: 14 }}>
                          Nhắn tin qua Facebook
                        </Text>
                      </div>
                    </div>
                    <Button
                      size="large"
                      block
                      icon={<FacebookOutlined />}
                      onClick={handleOpenFacebook}
                      style={{
                        marginTop: 12,
                        backgroundColor: "#4267B2",
                        borderColor: "#4267B2",
                        color: "white",
                      }}
                    >
                      Mở Facebook
                    </Button>
                  </Space>
                </div>

                {/* Zalo */}
                <div
                  style={{
                    padding: "20px",
                    background: "#f0f9ff",
                    borderRadius: 12,
                    border: "2px solid #0068ff",
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <MessageOutlined style={{ fontSize: 24, color: "#0068ff" }} />
                      <div>
                        <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                          Zalo
                        </Text>
                        <Text strong style={{ fontSize: 14 }}>
                          Chat qua Zalo
                        </Text>
                      </div>
                    </div>
                    <Button
                      size="large"
                      block
                      icon={<MessageOutlined />}
                      onClick={handleOpenZalo}
                      style={{
                        marginTop: 12,
                        backgroundColor: "#0068ff",
                        borderColor: "#0068ff",
                        color: "white",
                      }}
                    >
                      Mở Zalo
                    </Button>
                  </Space>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Lưu ý */}
        <Card
          style={{
            marginTop: 32,
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
        >
          <div style={{ textAlign: "center", color: "white" }}>
            <Title level={4} style={{ color: "white", marginBottom: 16 }}>
              ⏰ Thời Gian Làm Việc
            </Title>
            <Space direction="vertical" size="middle">
              <Text style={{ color: "white", fontSize: 16 }}>
                <strong>Thứ 2 - Thứ 7:</strong> 8:00 - 20:00
              </Text>
              <Text style={{ color: "white", fontSize: 16 }}>
                <strong>Chủ nhật:</strong> 9:00 - 18:00
              </Text>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)", margin: "16px 0" }} />
              <Text style={{ color: "white", fontSize: 14, opacity: 0.9 }}>
                💡 Liên hệ ngay để được tư vấn và xem phòng trực tiếp!
              </Text>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Checkin;
