import { useEffect, useState } from "react";
import {
    Row,
    Col,
    Card,
    Avatar,
    Button,
    Tag,
    Typography,
    Space,
    List,
    Divider,
    Tabs,
    Badge,
    Input,
    Form,
    message,
    Spin,
    Upload,
    Modal,
    type UploadFile,
} from "antd";
import {
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    EditOutlined,
    LockOutlined,
    KeyOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    SettingOutlined,
    ClockCircleOutlined,
    UploadOutlined,
} from "@ant-design/icons";

import "../../../assets/styles/profileAd.css";
import type { User } from "../../../types/user";
import { getProfileForForm, updatePassword, updateProfile } from "../services/profile";

const { Title, Text } = Typography;

const cardStyle = {
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
};

const Profile = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("1");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();

    // Lấy data admin đang đăng nhập
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const data = await getProfileForForm();

                if (!data) {
                    message.error("Token không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.");
                    return;
                }

                if (data.role !== "ADMIN") {
                    message.error("Bạn không có quyền truy cập trang này");
                    return;
                }

                setUser(data);
            } catch (err) {
                console.error(err);
                message.error("Lấy thông tin người dùng thất bại");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const activities = [
        { action: "Đăng nhập hệ thống", time: "12:30 10/10/2025" },
        { action: "Chỉnh sửa thông tin phòng", time: "15:45 09/10/2025" },
        { action: "Xem báo cáo doanh thu", time: "10:10 08/10/2025" },
    ];

    const handleUpdatePassword = async (values: any) => {
        try {
            await updatePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            message.success("Đổi mật khẩu thành công");
            form.resetFields(["currentPassword", "newPassword", "confirmPassword"]);
        } catch (err: any) {
            message.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
        }
    };

    // Khi mở Modal, setFieldsValue ở đây → tránh warning
    const handleOpenModal = () => {
        form.setFieldsValue({
            fullName: user?.fullName,
            phone: user?.phone,
        });

        setFileList(
            user?.avatar
                ? [
                    {
                        uid: "-1",
                        name: "avatar.png",
                        status: "done",
                        url: user.avatar,
                    },
                ]
                : []
        );
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        if (!user) return;
        try {
            const values = await form.validateFields();

            const updated = await updateProfile({
                fullName: values.fullName,
                phone: values.phone,
            });

            setUser({
                ...updated,
                avatar: user.avatar, // giữ nguyên avatar hiển thị
            });

            message.success("Cập nhật hồ sơ thành công");
            setIsModalVisible(false);
        } catch (err) {
            console.error(err);
            message.error("Cập nhật hồ sơ thất bại");
        }
    };

    const handleCancel = () => setIsModalVisible(false);

    if (loading) {
        return (
            <div className="profile-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        return <div className="profile-error">Không tìm thấy người dùng</div>;
    }

    const tabItems = [
        {
            key: "1",
            label: "Thông tin tài khoản",
            children: (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Card
                        title={
                            <span>
                                <SettingOutlined /> Thông tin cơ bản
                            </span>
                        }
                        style={cardStyle}
                    >
                        <Space direction="vertical">
                            <Text>
                                <MailOutlined /> {user.email}
                            </Text>
                            <Text>
                                <PhoneOutlined /> {user.phone || "Chưa cập nhật"}
                            </Text>
                            <Text>
                                <CalendarOutlined /> Ngày tạo:{" "}
                                {user.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                                    : "Chưa cập nhật"}
                            </Text>
                        </Space>
                    </Card>

                    <Card title="Phân quyền & Trạng thái truy cập" style={cardStyle}>
                        <Text type="secondary">Quyền: {user.role}</Text>
                    </Card>
                </Space>
            ),
        },
        {
            key: "2",
            label: "Bảo mật",
            children: (
                <Card style={cardStyle}>
                    <Form layout="vertical" onFinish={handleUpdatePassword} style={{ maxWidth: 500 }}>
                        <Form.Item
                            label="Mật khẩu hiện tại"
                            name="currentPassword"
                            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
                        >
                            <Input.Password
                                prefix={<KeyOutlined />}
                                placeholder="Nhập mật khẩu hiện tại"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Nhập mật khẩu mới"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu mới"
                            name="confirmPassword"
                            dependencies={["newPassword"]}
                            rules={[
                                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
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
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Xác nhận mật khẩu mới"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" block>
                            Cập nhật mật khẩu
                        </Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: "3",
            label: "Hoạt động gần đây",
            children: (
                <Card style={cardStyle}>
                    <List
                        itemLayout="horizontal"
                        dataSource={activities}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<ClockCircleOutlined style={{ fontSize: 20 }} />}
                                    title={item.action}
                                    description={item.time}
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row gutter={24}>
                <Col xs={24} md={8}>
                    <Card
                        style={{
                            textAlign: "center",
                            borderRadius: 16,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                        }}
                    >
                        <Badge dot color="green" offset={[0, 0]} size="small">
                            <Avatar
                                size={120}
                                src={user.avatar}
                                style={{ border: "4px solid #1677ff", marginBottom: 12 }}
                            />
                        </Badge>
                        <Title level={4}>{user.fullName}</Title>
                        <Space>
                            <Tag color="blue">{user.role}</Tag>
                            <Tag color="green">Hoạt động</Tag>
                        </Space>

                        <Divider />

                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Button
                                icon={<EditOutlined />}
                                type="primary"
                                className="btn-hover"
                                block
                                onClick={handleOpenModal}
                            >
                                Chỉnh sửa hồ sơ
                            </Button>
                            <Modal
                                title="Cập nhật hồ sơ"
                                open={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                okText="Lưu thay đổi"
                                cancelText="Hủy"
                                okButtonProps={{ className: "btn-hover" }}
                                cancelButtonProps={{ className: "btn-hover cancel-btn" }}
                            >
                                <Form form={form} layout="vertical">
                                    <Form.Item label="Họ và tên" name="fullName">
                                        <Input />
                                    </Form.Item>

                                    <Form.Item label="Số điện thoại" name="phone">
                                        <Input />
                                    </Form.Item>

                                    <Form.Item label="Ảnh đại diện">
                                        <Upload
                                            listType="picture"
                                            fileList={fileList}
                                            onChange={({ fileList }) => setFileList(fileList)}
                                            maxCount={1}
                                        >
                                            <Button icon={<UploadOutlined />} className="btn-hover">
                                                Tải ảnh lên
                                            </Button>
                                        </Upload>
                                    </Form.Item>
                                </Form>
                            </Modal>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} md={16}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={tabItems}
                        className="profile-tabs"
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                            padding: 16,
                        }}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default Profile;
