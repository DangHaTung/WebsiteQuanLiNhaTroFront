import React, { useEffect, useState } from "react";
import {
    Avatar,
    Card,
    Col,
    Row,
    Tabs,
    Typography,
    Button,
    Space,
    Tag,
    List,
    Tooltip,
    Spin,
    Divider,
    Modal,
    Form,
    Input,
    message,
} from "antd";
import {
    EditOutlined,
    LockOutlined,
    MailOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    MessageOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import type { IRoom, IContract, IBill } from "../../../types/profile";
import api from "../services/api";
import { changePassword } from "../services/profile";
import { jwtDecode } from "jwt-decode";
import "../../../assets/styles/profile.css";
import type { IUserToken } from "../../../types/user";
import { clientAuthService } from "../services/auth";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
    const [user, setUser] = useState<IUserToken | null>(null);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [contracts, setContracts] = useState<IContract[]>([]);
    const [bills, setBills] = useState<IBill[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [pwdForm] = Form.useForm<{ currentPassword: string; newPassword: string }>();
    const [pwdModalOpen, setPwdModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Chưa đăng nhập");

            const decoded = jwtDecode<IUserToken>(token);
            // Kết hợp thông tin từ token và user đã lưu khi đăng nhập (localStorage)
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

            // Lấy userId đúng từ token
            const userId = decoded.id;

            if (!userId) {
                console.error("User ID không tồn tại trong token");
                return;
            }

            setLoading(true);

            // Lấy rooms, contracts, bills song song
            const [roomsRes, contractsRes, billsRes] = await Promise.all([
                api.get(`/rooms?userId=${userId}`),
                api.get(`/contracts?userId=${userId}`),
                api.get(`/bills?userId=${userId}`),
            ]);

            setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
            setContracts(Array.isArray(contractsRes.data) ? contractsRes.data : []);
            setBills(Array.isArray(billsRes.data) ? billsRes.data : []);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    if (loading)
        return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;

    if (!user) return <div>Không tìm thấy người dùng</div>;

    const safeBills = Array.isArray(bills) ? bills : [];
    const totalPaid = safeBills.reduce((acc, b) => acc + (b.amountPaid || 0), 0);
    const totalDebt = safeBills.reduce(
        (acc, b) => acc + ((b.amountDue || 0) - (b.amountPaid || 0)),
        0
    );

    return (
        <div className="profile-container">
            <Row gutter={[24, 24]} justify="center">
                {/* Cột trái - Thông tin cá nhân */}
                <Col xs={24} md={6}>
                    <Card className="profile-card">
                        <div className="avatar-wrapper">
                            <Avatar size={120} src={user.avatar} />
                        </div>
                        <Title level={3} style={{ marginBottom: 0 }}>
                            {user.fullName || user.email}
                        </Title>
                        <Text type="secondary">{user.role}</Text>
                        <div style={{ marginTop: 16 }}>
                            <Tag color="blue">
                                <MailOutlined /> {user.email}
                            </Tag>
                            <Tag color="green">
                                <EnvironmentOutlined /> TP. Hồ Chí Minh
                            </Tag>
                        </div>

                        <Space
                            direction="vertical"
                            style={{
                                marginTop: 24,
                                width: "100%",
                                alignItems: "center",
                                gap: 15,
                            }}
                        >
                            <Space direction="horizontal">
                                <Button
                                    className="glow-button"
                                    type="primary"
                                    icon={<LockOutlined />}

                                >
                                    Sửa thông tin
                                </Button>
                                <Tooltip title="Đổi mật khẩu">
                                    <Button
                                        className="glow-icon-button"
                                        shape="circle"
                                        icon={<LockOutlined />}
                                        onClick={() => setPwdModalOpen(true)}
                                    />
                                </Tooltip>
                            </Space>
                        </Space>
                    </Card>
                </Col>

                {/* Cột phải - Tabs nội dung */}
                <Col xs={24} md={18}>
                    <Card className="profile-card">
                        <Tabs
                            defaultActiveKey="1"
                            className="modern-tabs"
                            items={[
                                {
                                    key: "1",
                                    label: "Thông tin cá nhân",
                                    children: (
                                        <div className="tab-content">
                                            <p>
                                                <b>Họ tên:</b> {user.fullName || user.email}
                                            </p>
                                            <p>
                                                <b>Email:</b> {user.email}
                                            </p>
                                            <p>
                                                <b>Số điện thoại:</b> {user.phone || "-"}
                                            </p>
                                            <p>
                                                <b>Ngày tham gia:</b>{" "}
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString(
                                                        "vi-VN"
                                                    )
                                                    : "-"}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: "2",
                                    label: "Phòng trọ của tôi",
                                    children: (
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={rooms}
                                            renderItem={(item, index) => (
                                                <List.Item
                                                    key={item._id || index}
                                                    className="list-item-hover"
                                                    actions={[
                                                        <Tooltip title="Chỉnh sửa tin" key="edit">
                                                            <Button
                                                                shape="circle"
                                                                icon={<EditOutlined />}
                                                            />
                                                        </Tooltip>,
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar
                                                                shape="square"
                                                                size={60}
                                                                src={item.image}
                                                                icon={<HomeOutlined />}
                                                            />
                                                        }
                                                        title={`Phòng ${item.roomNumber}`}
                                                        description={
                                                            <>
                                                                <Text strong>
                                                                    {Number(item.pricePerMonth).toLocaleString()} đ / tháng
                                                                </Text>
                                                                <br />
                                                                <Text>{item.district}</Text>
                                                            </>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    ),
                                },
                                {
                                    key: "3",
                                    label: "Hợp đồng & hóa đơn",
                                    children: (
                                        <>
                                            <h3>Hợp đồng</h3>
                                            <List
                                                dataSource={contracts}
                                                renderItem={(item, index) => (
                                                    <List.Item
                                                        key={item._id || index}
                                                        className="list-item-hover"
                                                    >
                                                        <List.Item.Meta
                                                            avatar={<Avatar icon={<CalendarOutlined />} />}
                                                            title={`Hợp đồng #${item._id || index}`}
                                                            description={
                                                                <>
                                                                    <Text>
                                                                        Ngày bắt đầu:{" "}
                                                                        {new Date(item.startDate).toLocaleDateString()}
                                                                    </Text>
                                                                    <br />
                                                                    <Text>
                                                                        Ngày kết thúc:{" "}
                                                                        {new Date(item.endDate).toLocaleDateString()}
                                                                    </Text>
                                                                    <br />
                                                                    <Text>Trạng thái: {item.status}</Text>
                                                                </>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />

                                            <Divider />

                                            <h3>Hóa đơn</h3>
                                            <List
                                                dataSource={safeBills}
                                                renderItem={(item, index) => (
                                                    <List.Item
                                                        key={item._id || index}
                                                        className="list-item-hover"
                                                    >
                                                        <List.Item.Meta
                                                            avatar={<Avatar icon={<MessageOutlined />} />}
                                                            title={`Hóa đơn ngày ${new Date(
                                                                item.billingDate
                                                            ).toLocaleDateString()}`}
                                                            description={
                                                                <>
                                                                    <Text>
                                                                        Tổng tiền:{" "}
                                                                        {(item.amountDue || 0).toLocaleString()} đ
                                                                    </Text>
                                                                    <br />
                                                                    <Text>
                                                                        Đã thanh toán:{" "}
                                                                        {(item.amountPaid || 0).toLocaleString()} đ
                                                                    </Text>
                                                                    <br />
                                                                    <Tag
                                                                        color={
                                                                            item.status === "PARTIALLY_PAID"
                                                                                ? "orange"
                                                                                : "green"
                                                                        }
                                                                    >
                                                                        {item.status || "-"}
                                                                    </Tag>
                                                                </>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        </>
                                    ),
                                },
                                {
                                    key: "6",
                                    label: "Thống kê cá nhân",
                                    children: (
                                        <div className="tab-content">
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} md={8}>
                                                    <Card className="stat-card" bordered={false}>
                                                        <Title level={4}>Phòng đang cho thuê</Title>
                                                        <Text strong style={{ fontSize: 24 }}>
                                                            {rooms.length}
                                                        </Text>
                                                    </Card>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Card className="stat-card" bordered={false}>
                                                        <Title level={4}>Hợp đồng hiện tại</Title>
                                                        <Text strong style={{ fontSize: 24 }}>
                                                            {contracts.length}
                                                        </Text>
                                                    </Card>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Card className="stat-card" bordered={false}>
                                                        <Title level={4}>Tổng hóa đơn</Title>
                                                        <Text strong style={{ fontSize: 24 }}>
                                                            {safeBills.length}
                                                        </Text>
                                                    </Card>
                                                </Col>
                                            </Row>

                                            <Divider />

                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} md={12}>
                                                    <Card
                                                        title="Tổng tiền đã thanh toán"
                                                        bordered={false}
                                                    >
                                                        <Title level={3} style={{ color: "green" }}>
                                                            {totalPaid.toLocaleString()} đ
                                                        </Title>
                                                    </Card>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Card title="Tổng tiền còn nợ" bordered={false}>
                                                        <Title level={3} style={{ color: "red" }}>
                                                            {totalDebt.toLocaleString()} đ
                                                        </Title>
                                                    </Card>
                                                </Col>
                                            </Row>
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
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
                    } catch (_) {
                        // antd will show field errors; API errors handled globally
                    }
                }}
                okText="Cập nhật"
                cancelText="Hủy"
                centered
            >
                <Form form={pwdForm} layout="vertical">
                    <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: "Nhập mật khẩu hiện tại" }]}>
                        <Input.Password placeholder="••••••" />
                    </Form.Item>
                    <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, min: 6, message: "Mật khẩu tối thiểu 6 ký tự" }]}>
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
