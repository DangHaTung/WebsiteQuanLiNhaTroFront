import React, { useState } from "react";
import { Input, Collapse, Button, Typography, Card } from "antd";
import { SearchOutlined, MessageOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const Support: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const faqs = [
        {
            question: "Làm sao để đăng phòng trọ?",
            answer:
                "Bạn cần đăng ký tài khoản, sau đó vào mục 'Đăng phòng' và điền đầy đủ thông tin như địa chỉ, giá, hình ảnh, tiện ích...",
        },
        {
            question: "Tôi muốn chỉnh sửa hoặc xoá bài đăng?",
            answer:
                "Vào mục 'Quản lý phòng của tôi', chọn bài đăng cần chỉnh sửa hoặc xoá, sau đó nhấn nút tương ứng.",
        },
        {
            question: "Có mất phí khi đăng bài không?",
            answer:
                "Hiện tại, website cho phép đăng bài miễn phí với số lượng giới hạn. Nếu bạn muốn đăng nhiều hơn, hãy liên hệ admin để được hỗ trợ gói VIP.",
        },
        {
            question: "Tôi quên mật khẩu thì làm sao khôi phục?",
            answer:
                "Vào trang đăng nhập và chọn 'Quên mật khẩu'. Hệ thống sẽ gửi liên kết khôi phục đến email bạn đã đăng ký.",
        },
        {
            question: "Làm sao để liên hệ chủ phòng?",
            answer:
                "Trong mỗi bài đăng, bạn có thể xem thông tin liên hệ trực tiếp của chủ trọ hoặc gửi tin nhắn thông qua nút 'Liên hệ'.",
        },
    ];

    const filteredFaqs = faqs.filter((faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: 800, margin: "50px auto", padding: "0 20px" }}>
            <Card
                style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    border: "none",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 30 }}>
                    <Title level={2} style={{ color: "#1677ff" }}>
                        Trung tâm Hỗ trợ
                    </Title>
                    <Paragraph>
                        Tìm câu trả lời cho các thắc mắc thường gặp về thuê và đăng phòng.
                    </Paragraph>
                </div>

                {/* Thanh tìm kiếm */}
                <Input
                    size="large"
                    placeholder="Nhập từ khóa: đăng phòng, mật khẩu, liên hệ..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginBottom: 25, borderRadius: 8 }}
                />

                {/* Danh sách câu hỏi */}
                <Collapse accordion bordered={false} style={{ background: "#fff" }}>
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => (
                            <Panel
                                header={<b>{faq.question}</b>}
                                key={index}
                                style={{
                                    border: "1px solid #f0f0f0",
                                    borderRadius: 8,
                                    marginBottom: 10,
                                    overflow: "hidden",
                                }}
                            >
                                <Paragraph>{faq.answer}</Paragraph>
                            </Panel>
                        ))
                    ) : (
                        <Paragraph style={{ textAlign: "center", color: "#999" }}>
                            Không tìm thấy kết quả phù hợp.
                        </Paragraph>
                    )}
                </Collapse>

                {/* Nút liên hệ */}
                <div style={{ textAlign: "center", marginTop: 30 }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<MessageOutlined />}
                        onClick={() => (window.location.href = "/contact")}
                    >
                        Liên hệ ngay
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Support;
