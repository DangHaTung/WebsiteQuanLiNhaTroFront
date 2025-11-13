import React from "react";
import { Layout, Row, Col, Typography, Input, Button, Space } from "antd";
import { FacebookOutlined, InstagramOutlined, TwitterOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

const Footer: React.FC = () => {
    return (
        <AntFooter
            style={{
                background: "linear-gradient(135deg, #0F172A, #1E293B)",
                color: "#fff",
                padding: "60px 0 30px 0",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Glow line */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "2px",
                    background:
                        "linear-gradient(90deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)",
                    boxShadow: "0 0 15px #3B82F6",
                }}
            ></div>

            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "0 16px",
                    animation: "fadeUp 0.8s ease",
                }}
            >
                <Row gutter={[32, 32]}>
                    {/* Cột 1 */}
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {/* Logo chữ */}
                            <h2
                                style={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    letterSpacing: 1,
                                    background: "linear-gradient(90deg, #3B82F6, #06B6D4, #8B5CF6)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    textTransform: "uppercase",
                                    margin: 0,
                                    position: "relative",
                                    animation: "shine 3s linear infinite",
                                }}
                            >
                                Trọ 360
                            </h2>

                            {/* Mô tả ngắn */}
                            <Text type="secondary" style={{ color: "#aaa", lineHeight: 1.6 }}>
                                Tìm phòng trọ nhanh – Thuê nhà dễ dàng – Uy tín hàng đầu.
                            </Text>
                        </div>
                    </Col>

                    {/* Cột 2 */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={{ color: "#fff", marginBottom: 16 }}>
                            Liên kết nhanh
                        </Title>
                        <Space direction="vertical">
                            {["Trang chủ", "Danh sách phòng", "Tin tức", "Liên hệ"].map(
                                (text, index) => (
                                    <Link
                                        key={index}
                                        href="#"
                                        style={{
                                            color: "#ccc",
                                            transition: "color 0.3s ease",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.color = "#3B82F6")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.color = "#ccc")
                                        }
                                    >
                                        {text}
                                    </Link>
                                )
                            )}
                        </Space>
                    </Col>

                    {/* Cột 3: Liên hệ */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={{ color: "#fff", marginBottom: 16 }}>
                            Liên hệ
                        </Title>
                        <Space direction="vertical" size="middle">
                            <Text style={{ display: "flex", alignItems: "center", color: "#ccc", gap: 8 }}>
                                <EnvironmentOutlined style={{ color: "#3B82F6" }} /> 123 Nam Từ Liêm, TP. Hà Nội
                            </Text>
                            <Text style={{ display: "flex", alignItems: "center", color: "#ccc", gap: 8 }}>
                                <PhoneOutlined style={{ color: "#3B82F6" }} /> 0123 456 789
                            </Text>
                            <Text style={{ display: "flex", alignItems: "center", color: "#ccc", gap: 8 }}>
                                <MailOutlined style={{ color: "#3B82F6" }} /> tro360@example.com
                            </Text>
                        </Space>

                        <div style={{ marginTop: 16 }}>
                            <Space size="large">
                                {[FacebookOutlined, InstagramOutlined, TwitterOutlined].map(
                                    (Icon, i) => (
                                        <a
                                            key={i}
                                            href="#"
                                            style={{
                                                color: "#ccc",
                                                transition: "all 0.3s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color =
                                                    i === 0
                                                        ? "#3B82F6"
                                                        : i === 1
                                                            ? "#EC4899"
                                                            : "#0ea5e9";
                                                e.currentTarget.style.transform = "translateY(-4px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = "#ccc";
                                                e.currentTarget.style.transform = "translateY(0)";
                                            }}
                                        >
                                            <Icon style={{ fontSize: 20 }} />
                                        </a>
                                    )
                                )}
                            </Space>
                        </div>
                    </Col>

                    {/* Cột 4 */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={5} style={{ color: "#fff", marginBottom: 16 }}>
                            Đăng ký nhận tin
                        </Title>
                        <Text
                            style={{
                                display: "block",
                                color: "#ccc",
                                marginBottom: 12,
                            }}
                        >
                            Nhận thông báo khi có phòng mới, ưu đãi hấp dẫn!
                        </Text>
                        <Space.Compact style={{ width: "100%" }}>
                            <Input
                                placeholder="Nhập email của bạn"
                                style={{
                                    height: 44,
                                    borderRadius: "8px 0 0 8px",
                                    border: "1px solid #334155",
                                    color: "#fff",
                                    backgroundColor: "#1E293B",
                                    padding: "0 14px",
                                }}
                                className="custom-input"
                            />
                            <Button
                                type="primary"
                                style={{
                                    height: 44,
                                    background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                                    border: "none",
                                    fontWeight: 500,
                                    borderRadius: "0 8px 8px 0",
                                    transition: "all 0.3s ease",
                                    padding: "0 20px",
                                }}
                                onMouseEnter={(e) =>
                                ((e.currentTarget.style.background =
                                    "linear-gradient(90deg, #06B6D4, #3B82F6)"))
                                }
                                onMouseLeave={(e) =>
                                ((e.currentTarget.style.background =
                                    "linear-gradient(90deg, #3B82F6, #06B6D4)"))
                                }
                            >
                                Gửi
                            </Button>
                        </Space.Compact>
                    </Col>
                </Row>

                {/* Dòng bản quyền */}
                <div
                    style={{
                        borderTop: "1px solid #334155",
                        marginTop: 40,
                        paddingTop: 20,
                        textAlign: "center",
                        color: "#777",
                        fontSize: 14,
                    }}
                >
                    © {new Date().getFullYear()} Trọ 360. Bản quyền thuộc về Nhóm WD-04.
                </div>
            </div>

            <style>
                {`
                    .subscribe-btn:hover {
                        transform: scale(1.05);           
                        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                    }

                    input::placeholder {
                        color: #64748b;
                    }

                    input:focus {
                        outline: none;
                        border-color: #3B82F6;
                        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
                    }
                    .custom-input::placeholder {
                        color: #cbd5e1 !important;
                        opacity: 1;
                    }

                    @keyframes shine {
                        0% {
                        background-position: -200px 0;
                        }
                        100% {
                        background-position: 200px 0;
                        }
                    }
                    h2 {
                        background-size: 200%;
                    }
                `}
            </style>
        </AntFooter>
    );
};

export default Footer;
