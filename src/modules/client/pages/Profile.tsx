import React, { useEffect, useState } from "react";
import { Avatar, Card, Col, Row, Tabs, Typography, Button, Space, Tag, List, Tooltip, Spin, Divider } from "antd";
import { EditOutlined, LockOutlined, MailOutlined, HomeOutlined, EnvironmentOutlined, CalendarOutlined, MessageOutlined, PlusOutlined } from "@ant-design/icons";
import type { IUser, IRoom, IContract, IBill } from "../../../types/profile";
import { getProfileData } from "../services/profile";
import "../../../assets/styles/profile.css";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
    const [user, setUser] = useState<IUser | null>(null);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [contracts, setContracts] = useState<IContract[]>([]);
    const [bills, setBills] = useState<IBill[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async () => {
        try {
            const { user, rooms, contracts, bills } = await getProfileData();
            setUser(user);
            setRooms(rooms);
            setContracts(contracts);
            setBills(bills);
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

    if (!user) return null;

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
                            {user.fullName}
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

                        <Space direction="vertical" style={{ marginTop: 24, width: "100%", alignItems: "center", gap: 15 }}>
                            <Space direction="horizontal">
                                <Button
                                    className="glow-button"
                                    type="primary"
                                    icon={<EditOutlined />}
                                >
                                    Sửa thông tin
                                </Button>
                                <Tooltip title="Đổi mật khẩu">
                                    <Button
                                        className="glow-icon-button"
                                        shape="circle"
                                        icon={<LockOutlined />}
                                    />
                                </Tooltip>
                            </Space>

                            <Button
                                className="glow-button dashed-button"
                                type="dashed"
                                icon={<PlusOutlined />}
                                style={{ width: "100%" }}
                            >
                                Đăng tin cho thuê
                            </Button>
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
                                                <b>Họ tên:</b> {user.fullName}
                                            </p>
                                            <p>
                                                <b>Email:</b> {user.email}
                                            </p>
                                            <p>
                                                <b>Số điện thoại:</b> {user.phone}
                                            </p>
                                            <p>
                                                <b>Ngày tham gia:</b>{" "}
                                                {new Date(user.createdAt).toLocaleDateString()}
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
                                            renderItem={(item) => (
                                                <List.Item
                                                    key={item._id}
                                                    className="list-item-hover"
                                                    actions={[
                                                        <Tooltip title="Chỉnh sửa tin" key="edit">
                                                            <Button shape="circle" icon={<EditOutlined />} />
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
                                                renderItem={(item) => (
                                                    <List.Item key={item._id} className="list-item-hover">
                                                        <List.Item.Meta
                                                            avatar={<Avatar icon={<CalendarOutlined />} />}
                                                            title={`Hợp đồng #${item._id}`}
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
                                                dataSource={bills}
                                                renderItem={(item) => (
                                                    <List.Item key={item.id} className="list-item-hover">
                                                        <List.Item.Meta
                                                            avatar={<Avatar icon={<MessageOutlined />} />}
                                                            title={`Hóa đơn ngày ${new Date(
                                                                item.billingDate
                                                            ).toLocaleDateString()}`}
                                                            description={
                                                                <>
                                                                    <Text>Tổng tiền: {item.amountDue} $</Text>
                                                                    <br />
                                                                    <Text>Đã thanh toán: {item.amountPaid} $</Text>
                                                                    <br />
                                                                    <Tag
                                                                        color={
                                                                            item.status === "PARTIALLY_PAID"
                                                                                ? "orange"
                                                                                : "green"
                                                                        }
                                                                    >
                                                                        {item.status}
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
                                    key: "4",
                                    label: "Thanh toán",
                                    children: (
                                        <div className="tab-content" style={{ maxHeight: "400px", overflowY: "auto" }}>
                                            <List
                                                itemLayout="horizontal"
                                                dataSource={bills}
                                                renderItem={(item) => (
                                                    <List.Item key={item.id} className="list-item-hover">
                                                        <List.Item.Meta
                                                            avatar={<Avatar icon={<MessageOutlined />} />}
                                                            title={`Hóa đơn ngày ${new Date(item.billingDate).toLocaleDateString()}`}
                                                            description={
                                                                <>
                                                                    <Text>Tổng tiền: {item.amountDue} $</Text>
                                                                    <br />
                                                                    <Text>Đã thanh toán: {item.amountPaid} $</Text>
                                                                    <br />
                                                                    <Tag
                                                                        color={item.status === "PARTIALLY_PAID" ? "orange" : "green"}
                                                                    >
                                                                        {item.status}
                                                                    </Tag>
                                                                </>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        </div>
                                    ),
                                },
                                {
                                    key: "5",
                                    label: "Hộp thư & phản hồi",
                                    children: (
                                        <div className="tab-content" style={{ maxHeight: "400px", overflowY: "auto" }}>
                                            <List
                                                itemLayout="horizontal"
                                                dataSource={[
                                                    {
                                                        id: 1,
                                                        title: "Thông báo hóa đơn tháng 10",
                                                        content: "Hóa đơn tháng 10 đã được tạo, vui lòng kiểm tra và thanh toán.",
                                                        date: "2025-10-10",
                                                        read: false,
                                                    },
                                                    {
                                                        id: 2,
                                                        title: "Phản hồi yêu cầu sửa chữa",
                                                        content: "Yêu cầu sửa máy nước nóng đã được tiếp nhận.",
                                                        date: "2025-10-08",
                                                        read: true,
                                                    },
                                                ]}
                                                renderItem={(item) => (
                                                    <List.Item
                                                        key={item.id}
                                                        className={`list-item-hover ${!item.read ? "unread" : ""}`}
                                                        actions={[
                                                            <Tooltip title="Xem chi tiết" key="view">
                                                                <Button shape="circle" icon={<MessageOutlined />} />
                                                            </Tooltip>,
                                                        ]}
                                                    >
                                                        <List.Item.Meta
                                                            avatar={<Avatar icon={<MailOutlined />} />}
                                                            title={<Text strong={!item.read}>{item.title}</Text>}
                                                            description={
                                                                <>
                                                                    <Text>{item.content}</Text>
                                                                    <br />
                                                                    <Text type="secondary">{new Date(item.date).toLocaleDateString()}</Text>
                                                                </>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        </div>
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
                                                        <Text strong style={{ fontSize: 24 }}>{rooms.length}</Text>
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
                                                            {bills.length}
                                                        </Text>
                                                    </Card>
                                                </Col>
                                            </Row>

                                            <Divider />

                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} md={12}>
                                                    <Card title="Tổng tiền đã thanh toán" bordered={false}>
                                                        <Title level={3} style={{ color: "green" }}>
                                                            {bills.reduce((acc, b) => acc + b.amountPaid, 0).toLocaleString()} đ
                                                        </Title>
                                                    </Card>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Card title="Tổng tiền còn nợ" bordered={false}>
                                                        <Title level={3} style={{ color: "red" }}>
                                                            {bills.reduce((acc, b) => acc + (b.amountDue - b.amountPaid), 0).toLocaleString()} đ
                                                        </Title>
                                                    </Card>
                                                </Col>
                                            </Row>
                                        </div>
                                    ),
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Profile;
