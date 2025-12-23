import React, { useEffect, useState } from "react";
import { Avatar, Card, Col, Row, Typography, Button, Divider, Modal, Form, Input, message, Descriptions, Tag } from "antd";
import { LockOutlined, HomeOutlined } from "@ant-design/icons";
import { changePassword } from "../services/profile";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import api from "../services/api";
import '../../../assets/styles/profile.css';
import type { IUserToken } from "../../../types/user";
import { clientAuthService } from "../services/auth";

const { Title, Text } = Typography;
// Định nghĩa kiểu cho thông tin phòng
interface RoomInfo {
    roomNumber: string;
    pricePerMonth: number;
    startDate: string;
    endDate: string;
    status: string;
    occupantCount?: number;
}
// Trang hồ sơ người dùng
const Profile: React.FC = () => {
    const [user, setUser] = useState<IUserToken | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [pwdForm] = Form.useForm<{ currentPassword: string; newPassword: string }>();
    const [pwdModalOpen, setPwdModalOpen] = useState(false);
// Tải thông tin người dùng khi component được mount
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Chưa đăng nhập");
                // Giải mã token để lấy thông tin người dùng
                const decoded = jwtDecode<IUserToken>(token);
                const stored = clientAuthService.getCurrentUser();
                const issuedAt = (decoded as any)?.iat ? new Date((decoded as any).iat * 1000).toISOString() : undefined;
                const mergedUser: IUserToken = {
                    ...(decoded as any),
                    ...(stored as any),
                    fullName:
                        (stored as any)?.fullName ||
                        (stored as any)?.username ||
                        (decoded as any)?.fullName ||
                        (decoded as any)?.email,
                    phone: (stored as any)?.phone || (decoded as any)?.phone || "",
                    createdAt: (stored as any)?.createdAt || issuedAt,
                } as any;
                setUser(mergedUser);

                // Load thông tin phòng đang thuê
                loadRoomInfo();
            } catch (error) {
                console.error("Lỗi tải thông tin người dùng:", error);
            } finally {
                setLoading(false);
            }
        };
// Gọi hàm tải thông tin người dùng
        loadUserInfo();
    }, []);
// Tải thông tin phòng đang thuê
    const loadRoomInfo = async () => {
        try {
            const response = await api.get("/final-contracts/my-contracts", { params: { limit: 1 } });
            const contracts = response.data.data || [];
            if (contracts.length > 0) {
                const contract = contracts[0];
                setRoomInfo({
                    roomNumber: contract.roomId?.roomNumber || "-",
                    pricePerMonth: contract.monthlyRent || 0,
                    startDate: contract.startDate,
                    endDate: contract.endDate,
                    status: contract.status,
                    occupantCount: contract.occupantCount || 0,
                });
            }
        } catch (error) {
            console.error("Lỗi tải thông tin phòng:", error);
        }
    };
// Hiển thị trang hồ sơ
    if (loading) return <div style={{ textAlign: "center", padding: "120px" }}>Đang tải...</div>;
    if (!user) return <div>Không tìm thấy người dùng</div>;
// Giao diện trang hồ sơ
    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
            <Row gutter={[24, 24]}>
                {/* Sidebar */}
                <Col xs={24} md={8}>
                    <Card style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
                        <div style={{ textAlign: "center", marginBottom: 24 }}>
                            <Avatar size={80} style={{ backgroundColor: "#1890ff" }}>
                                {user.fullName?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Title level={4} style={{ marginTop: 12 }}>{user.fullName}</Title>
                            <Text type="secondary">{user.phone || "Chưa cập nhật"}</Text>
                        </div>

                        <Divider />

                        <Button 
                            block 
                            type="primary" 
                            icon={<LockOutlined />} 
                            onClick={() => setPwdModalOpen(true)}
                        >
                            Đổi mật khẩu
                        </Button>
                    </Card>
                </Col>

                {/* Main content */}
                <Col xs={24} md={16}>
                    <Card style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", marginBottom: 24 }}>
                        <Title level={4}>Thông tin tài khoản</Title>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Họ tên">{user.fullName || "-"}</Descriptions.Item>
                            <Descriptions.Item label="Email">{user.email || "-"}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{user.phone || "-"}</Descriptions.Item>
                            <Descriptions.Item label="Vai trò">{user.role || "TENANT"}</Descriptions.Item>
                            <Descriptions.Item label="Ngày tham gia">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "-"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {roomInfo && (
                        <Card 
                            style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}
                            title={
                                <span>
                                    <HomeOutlined style={{ marginRight: 8 }} />
                                    Phòng đang thuê
                                </span>
                            }
                        >
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="Số phòng">
                                    <Text strong style={{ fontSize: 16 }}>{roomInfo.roomNumber}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Giá thuê">
                                    <Text strong style={{ color: "#1890ff" }}>
                                        {roomInfo.pricePerMonth.toLocaleString("vi-VN")} đ/tháng
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số người ở">
                                    <Text strong style={{ color: "#52c41a" }}>
                                        {roomInfo.occupantCount || 0} người
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian thuê">
                                    {dayjs(roomInfo.startDate).format("DD/MM/YYYY")} → {dayjs(roomInfo.endDate).format("DD/MM/YYYY")}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color={roomInfo.status === "SIGNED" ? "success" : "processing"}>
                                        {roomInfo.status === "SIGNED" ? "Đã ký" : roomInfo.status === "WAITING_SIGN" ? "Chờ ký" : "Nháp"}
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    )}

                    {!roomInfo && (
                        <Card style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
                            <div style={{ textAlign: "center", padding: "40px 0" }}>
                                <Text type="secondary">
                                    Bạn chưa có phòng đang thuê. Để xem hợp đồng và hóa đơn, vui lòng truy cập menu "Hợp đồng của tôi" và "Hóa đơn của tôi"
                                </Text>
                            </div>
                        </Card>
                    )}
                </Col>
            </Row>
            {/* Modal đổi mật khẩu */}
            <Modal
                title="Đổi mật khẩu"
                open={pwdModalOpen}
                onCancel={() => setPwdModalOpen(false)}
                onOk={async () => {
                    try {
                        const { currentPassword, newPassword } = await pwdForm.validateFields();
                        await changePassword(currentPassword, newPassword);
                        message.success("Đổi mật khẩu thành công");
                        setPwdModalOpen(false);
                        pwdForm.resetFields();
                    } catch (err: any) {
                        message.error(err?.message || "Đổi mật khẩu thất bại");
                    }
                }}
                okText="Cập nhật"
                cancelText="Hủy"
            >
                <Form form={pwdForm} layout="vertical">
                    <Form.Item 
                        label="Mật khẩu hiện tại" 
                        name="currentPassword" 
                        rules={[{ required: true, message: "Nhập mật khẩu hiện tại" }]}
                    >
                        <Input.Password placeholder="••••••" />
                    </Form.Item>
                    <Form.Item 
                        label="Mật khẩu mới" 
                        name="newPassword" 
                        rules={[{ required: true, min: 6, message: "Mật khẩu tối thiểu 6 ký tự" }]}
                    >
                        <Input.Password placeholder="••••••" />
                    </Form.Item>
                    <Form.Item
                        label="Nhập lại mật khẩu mới"
                        name="confirmNewPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: "Vui lòng nhập lại mật khẩu mới" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="••••••" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Profile;
