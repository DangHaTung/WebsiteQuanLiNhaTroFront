import React, { useEffect, useState } from "react";
import { Avatar, Card, Col, Row, Typography, Button, Tag, List, Tooltip, Spin, Divider, Modal, Form, Input, message, Descriptions, Menu } from "antd";
import { EditOutlined, LockOutlined, HomeOutlined, CalendarOutlined, BarChartOutlined, DollarOutlined, FileTextOutlined, ProfileOutlined, WalletOutlined } from "@ant-design/icons";
import type { IRoom, IContract, IBill } from "../../../types/profile";
import api from "../services/api";
import { changePassword } from "../services/profile";
import { jwtDecode } from "jwt-decode";
import '../../../assets/styles/profile.css';
import type { IUserToken } from "../../../types/user";
import { clientAuthService } from "../services/auth";

const { Title, Text } = Typography;

const menuItems = [
    { key: "1", icon: <ProfileOutlined />, label: "Tổng quan" },
    { key: "2", icon: <HomeOutlined />, label: "Phòng trọ của tôi" },
    { key: "3", icon: <FileTextOutlined />, label: "Hợp đồng & Hóa đơn" },
    { key: "4", icon: <BarChartOutlined />, label: "Thống kê cá nhân" },
];

const Profile: React.FC = () => {
    const [user, setUser] = useState<IUserToken | null>(null);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [contracts, setContracts] = useState<IContract[]>([]);
    const [bills, setBills] = useState<IBill[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [tabLoading, setTabLoading] = useState<{ [key: string]: boolean }>({});
    const [activeKey, setActiveKey] = useState<string>("1");

    const [pwdForm] = Form.useForm<{ currentPassword: string; newPassword: string }>();
    const [pwdModalOpen, setPwdModalOpen] = useState(false);

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Chưa đăng nhập");

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
            } catch (error) {
                console.error("Lỗi tải thông tin người dùng:", error);
            } finally {
                setLoading(false);
            }
        };

        loadUserInfo();
    }, []);

    const loadRoomsData = async () => {
        setTabLoading(prev => ({ ...prev, "2": true }));
        try {
            const roomsRes = await api.get(`/rooms/public`);
            setRooms(Array.isArray(roomsRes.data.data) ? roomsRes.data.data : []);
        } catch (error) {
            console.error("Lỗi tải danh sách phòng:", error);
            message.error("Không thể tải danh sách phòng");
        } finally {
            setTabLoading(prev => ({ ...prev, "2": false }));
        }
    };

    const loadContractsAndBillsData = async (tabKey: string) => {
        setTabLoading(prev => ({ ...prev, [tabKey]: true }));
        try {
            const [contractsRes, billsRes] = await Promise.all([
                api.get(`/contracts/my-contracts`),
                api.get(`/bills/my-bills`),
            ]);

            setContracts(Array.isArray(contractsRes.data.data) ? contractsRes.data.data : []);
            setBills(Array.isArray(billsRes.data.data) ? billsRes.data.data : []);
        } catch (error) {
            console.error("Lỗi tải hợp đồng và hóa đơn:", error);
            message.error("Không thể tải hợp đồng và hóa đơn");
        } finally {
            setTabLoading(prev => ({ ...prev, [tabKey]: false }));
        }
    };

    const handleMenuClick = (e: any) => {
        const key = e.key;
        setActiveKey(key);

        switch (key) {
            case "2":
                if (rooms.length === 0) loadRoomsData();
                break;
            case "3":
                loadContractsAndBillsData("3");
                break;
            case "4":
                setTabLoading(prev => ({ ...prev, "4": true }));
                Promise.all([
                    rooms.length === 0 ? loadRoomsData() : Promise.resolve(),
                    contracts.length === 0 || bills.length === 0 ? loadContractsAndBillsData("4") : Promise.resolve()
                ]).finally(() => setTabLoading(prev => ({ ...prev, "4": false })));
                break;
            default:
                break;
        }
    };

    if (loading)
        return <Spin size="large" style={{ display: "block", margin: "120px auto" }} />;

    if (!user) return <div>Không tìm thấy người dùng</div>;

    const safeBills = Array.isArray(bills) ? bills : [];
    const totalPaid = safeBills.reduce((acc, b) => acc + (b.amountPaid || 0), 0);
    const totalDebt = safeBills.reduce((acc, b) => {
        const due = Number(b.amountDue || 0);
        const paid = Number(b.amountPaid || 0);
        const remaining = Math.max(due - paid, 0);
        return acc + remaining;
    }, 0);

    // Đơn hàng gần đây
    const recentOrder = safeBills.length > 0 ? safeBills[0] : null;

    return (
        <div className="cp-profile-wrap">
            <Row gutter={[24, 24]}>
                {/* Sidebar */}
                <Col xs={24} md={6} lg={5}>
                    <Card
                        bordered={false}
                        style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}
                    >
                        {/* User Info */}
                        <div style={{ textAlign: "center", marginBottom: 24 }}>
                            <Avatar size={80} style={{ backgroundColor: "#1890ff" }}>{user.fullName?.charAt(0).toUpperCase()}</Avatar>
                            <Title level={4} style={{ marginTop: 12 }}>{user.role || user.fullName}</Title>
                            <Text type="secondary">{user.phone || "Chưa cập nhật"}</Text>
                        </div>

                        <Divider />

                        {/* Stats */}
                        <div style={{ marginBottom: 16 }}>
                            <Card bordered={false} style={{ backgroundColor: "#fafafa", textAlign: "center" }}>
                                <WalletOutlined style={{ fontSize: 24, color: "#fa541c" }} />
                                <Title level={5} style={{ marginTop: 8 }}>Tổng tiền tích lũy</Title>
                                <Text strong style={{ color: "#fa541c", fontSize: 16 }}>{totalPaid.toLocaleString()} đ</Text>
                            </Card>
                        </div>

                        <Menu
                            mode="inline"
                            selectedKeys={[activeKey]}
                            onClick={handleMenuClick}
                            items={menuItems.map(i => ({ key: i.key, icon: i.icon, label: i.label }))}
                            className="profile-menu"
                        />

                        <Button block type="primary" icon={<LockOutlined />} style={{ marginTop: 16 }} onClick={() => setPwdModalOpen(true)}>
                            Đổi mật khẩu
                        </Button>
                    </Card>
                </Col>

                {/* Main content */}
                <Col xs={24} md={18} lg={19}>
                    <div className="cp-main-grid">
                        {/* Top notifications */}
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={16}>
                                <Card className="cp-top-card" bordered={false} style={{ borderRadius: 16 }}>
                                    <Row justify="space-between" align="middle">
                                        <Col>
                                            <Title level={4} style={{ margin: 0 }}>
                                                Xin chào, {user.fullName || user.email}
                                            </Title>
                                            <Text type="secondary">
                                                Cập nhật lần sau: {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "-"}
                                            </Text>
                                        </Col>
                                        <Col>
                                            <Button type="default" shape="round" icon={<EditOutlined />}>
                                                Chỉnh sửa hồ sơ
                                            </Button>
                                        </Col>
                                    </Row>

                                    <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
                                        <Col xs={24} sm={12}>
                                            <Card
                                                className="cp-mini"
                                                bordered={false}
                                                style={{ borderRadius: 12, backgroundColor: "#f6ffed", textAlign: "center" }}
                                            >
                                                <Text type="secondary">Tổng tiền đã thanh toán</Text>
                                                <Title level={4} style={{ marginTop: 8, color: "#52c41a" }}>
                                                    {totalPaid.toLocaleString()} đ
                                                </Title>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Card
                                                className="cp-mini"
                                                bordered={false}
                                                style={{ borderRadius: 12, backgroundColor: "#fff1f0", textAlign: "center" }}
                                            >
                                                <Text type="secondary">Tổng tiền còn nợ</Text>
                                                <Title level={4} style={{ marginTop: 8, color: "#f5222d" }}>
                                                    {totalDebt.toLocaleString()} đ
                                                </Title>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            <Col xs={24} md={8}>
                                <Card
                                    className="cp-side-card"
                                    bordered={false}
                                    style={{ borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                                >
                                    <Title level={5}>Thông tin tài khoản</Title>
                                    <Descriptions bordered column={1} size="small">
                                        <Descriptions.Item label="Họ tên">{user.fullName || "-"}</Descriptions.Item>
                                        <Descriptions.Item label="Email">{user.email || "-"}</Descriptions.Item>
                                        <Descriptions.Item label="Số điện thoại">{user.phone || "-"}</Descriptions.Item>
                                        <Descriptions.Item label="Ngày tham gia">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "-"}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                        </Row>

                        {/* Content body */}
                        <Card bordered={false} className="cp-content-body">
                            {activeKey === "1" && (
                                <>
                                    <Card type="inner" title="Phòng mới đặt">
                                        {!recentOrder ? (
                                            <div className="cp-empty-spot" style={{ textAlign: "center", padding: 24 }}>
                                                <Text type="secondary">Bạn chưa đặt phòng nào gần đây.</Text>
                                                <div style={{ marginTop: 8 }}>
                                                    <Button type="primary" onClick={() => window.location.href = "/rooms"}>
                                                        Xem phòng trọ
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <List>
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar
                                                                shape="square"
                                                                size={64}
                                                                src={(recentOrder as any).roomImage}
                                                                icon={<HomeOutlined />}
                                                            />
                                                        }
                                                        title={`Phòng #${(recentOrder as any).roomNumber || "—"}`}
                                                        description={
                                                            <>
                                                                <Text type="secondary">
                                                                    Ngày đặt: {new Date((recentOrder as any).bookingDate).toLocaleDateString()}
                                                                </Text>
                                                                <div style={{ marginTop: 8 }}>
                                                                    <Text strong style={{ color: "#1890ff" }}>
                                                                        Giá thuê: {(recentOrder as any).pricePerMonth?.toLocaleString() || 0} đ/tháng
                                                                    </Text>
                                                                </div>
                                                            </>
                                                        }
                                                    />
                                                    <div>
                                                        <Tag color={(recentOrder as any).status === "ACTIVE" ? "green" : "orange"}>
                                                            {(recentOrder as any).status || "Chưa xác nhận"}
                                                        </Tag>
                                                    </div>
                                                </List.Item>
                                            </List>
                                        )}
                                    </Card>

                                    <Divider />

                                    <Card type="inner" title="Chương trình nổi bật">
                                        <Row gutter={[12, 12]}>
                                            <Col xs={24} sm={8}>
                                                <div className="cp-banner-block">Banner 1</div>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <div className="cp-banner-block">Banner 2</div>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <div className="cp-banner-block">Banner 3</div>
                                            </Col>
                                        </Row>
                                    </Card>
                                </>
                            )}

                            {activeKey === "2" && (
                                <Spin spinning={tabLoading["2"]}>
                                    <Title level={4}>Phòng trọ của tôi</Title>
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={rooms}
                                        locale={{ emptyText: "Bạn chưa đăng tin phòng nào" }}
                                        renderItem={(item, index) => (
                                            <List.Item
                                                key={item._id || index}
                                                actions={[
                                                    <Tooltip title="Sửa" key="edit"><Button shape="circle" icon={<EditOutlined />} /></Tooltip>,
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    avatar={<Avatar shape="square" size={64} src={item.image} icon={<HomeOutlined />} />}
                                                    title={<Text strong>Phòng {item.roomNumber}</Text>}
                                                    description={
                                                        <>
                                                            <Text strong style={{ color: "#e51b23" }}>{Number(item.pricePerMonth).toLocaleString()} đ / tháng</Text>
                                                            <br />
                                                            <Text type="secondary">{item.district}</Text>
                                                        </>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Spin>
                            )}

                            {activeKey === "3" && (
                                <Spin spinning={tabLoading["3"]}>
                                    <Title level={4}>Hợp đồng</Title>
                                    <List
                                        dataSource={contracts}
                                        locale={{ emptyText: "Không có hợp đồng" }}
                                        renderItem={(item, idx) => (
                                            <List.Item key={item._id || idx}>
                                                <List.Item.Meta
                                                    avatar={<Avatar icon={<CalendarOutlined />} />}
                                                    title={`Hợp đồng #${item._id || idx}`}
                                                    description={
                                                        <>
                                                            <Text>Bắt đầu: {new Date(item.startDate).toLocaleDateString()}</Text><br />
                                                            <Text>Kết thúc: {new Date(item.endDate).toLocaleDateString()}</Text><br />
                                                            <Tag color={item.status === "ACTIVE" ? "green" : item.status === "EXPIRED" ? "red" : "orange"}>{item.status}</Tag>
                                                        </>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />

                                    <Divider />

                                    <Title level={4}>Hóa đơn</Title>
                                    <List
                                        dataSource={safeBills}
                                        locale={{ emptyText: "Không có hóa đơn" }}
                                        renderItem={(item, idx) => (
                                            <List.Item key={item._id || idx}>
                                                <List.Item.Meta
                                                    avatar={<Avatar icon={<DollarOutlined />} />}
                                                    title={`Hóa đơn ngày ${new Date(item.billingDate).toLocaleDateString()}`}
                                                    description={
                                                        <>
                                                            <Text>Tổng tiền: {Number(item.amountDue || 0).toLocaleString()} đ</Text><br />
                                                            <Text>Đã thanh toán: {Number(item.amountPaid || 0).toLocaleString()} đ</Text><br />
                                                            <Tag color={item.status === "PAID" ? "green" : item.status === "UNPAID" ? "red" : "orange"}>{item.status}</Tag>
                                                        </>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Spin>
                            )}

                            {activeKey === "4" && (
                                <Spin spinning={tabLoading["4"]}>
                                    <Title level={4}>Thống kê cá nhân</Title>
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} sm={8}>
                                            <Card className="stat-card" bordered={false}>
                                                <HomeOutlined style={{ fontSize: 28, color: "#e51b23" }} />
                                                <Title level={5}>Phòng đang thuê</Title>
                                                <Title level={3}>{rooms.length}</Title>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Card className="stat-card" bordered={false}>
                                                <FileTextOutlined style={{ fontSize: 28, color: "#52c41a" }} />
                                                <Title level={5}>Hợp đồng hiện tại</Title>
                                                <Title level={3}>{contracts.length}</Title>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Card className="stat-card" bordered={false}>
                                                <DollarOutlined style={{ fontSize: 28, color: "#faad14" }} />
                                                <Title level={5}>Tổng hóa đơn</Title>
                                                <Title level={3}>{safeBills.length}</Title>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} sm={12}>
                                            <Card bordered={false}>
                                                <Text>Tổng tiền đã thanh toán</Text>
                                                <Title level={3} style={{ color: "green" }}>{totalPaid.toLocaleString()} đ</Title>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Card bordered={false}>
                                                <Text>Tổng tiền còn nợ</Text>
                                                <Title level={3} style={{ color: "red" }}>{totalDebt.toLocaleString()} đ</Title>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Spin>
                            )}
                        </Card>
                    </div>
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
                    } catch (err: any) {
                        message.error(err?.message || "Đổi mật khẩu thất bại");
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