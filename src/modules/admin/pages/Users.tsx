import React, { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Button,
    Card,
    Form,
    Input,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
    Row,
    Col,
    Statistic,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { motion } from "framer-motion";
import type { User } from "../../../types/user";
import { adminUserService } from "../services/user";

const { Title } = Typography;
const { Option } = Select;

type FormValues = Partial<User> & { password?: string };

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [form] = Form.useForm<FormValues>();
    const [keyword, setKeyword] = useState<string>("");
    const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const list = await adminUserService.list();
                if (mounted) setUsers(list);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const openModal = (record?: User) => {
        if (record) {
            setEditing(record);
            form.setFieldsValue(record as any);
        } else {
            setEditing(null);
            form.resetFields();
            form.setFieldsValue({ role: "TENANT" } as any);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditing(null);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const roleToSend = values.role ?? "TENANT";
            if (editing) {
                const id = (editing._id as string) || (editing.id as string);
                const updated = await adminUserService.update(id, {
                    fullName: values.fullName,
                    email: values.email,
                    phone: values.phone,
                    role: roleToSend,
                } as any);
                setUsers((prev) =>
                    prev.map((u) => ((u._id || u.id) === (updated._id || updated.id) ? updated : u))
                );
                message.success("Cập nhật người dùng thành công!");
            } else {
                if (!values.password) {
                    message.error("Vui lòng nhập mật khẩu cho tài khoản mới");
                    return;
                }
                const created = await adminUserService.create({
                    fullName: values.fullName!,
                    email: values.email!,
                    phone: values.phone,
                    role: (roleToSend as any)!,
                    password: values.password,
                });
                setUsers((prev) => [created, ...prev]);
                message.success("Thêm người dùng thành công!");
            }
            closeModal();
        } catch (e) { }
    };

    const handleDelete = async (id?: string) => {
        const key = id ?? "";
        if (!key) return;
        await adminUserService.remove(key);
        setUsers((prev) => prev.filter((u) => (u._id ?? u.id) !== key));
        message.success("Đã xóa người dùng!");
    };

    const filteredUsers = useMemo(() => {
        let data = [...users];
        if (keyword.trim()) {
            const k = keyword.toLowerCase();
            data = data.filter(
                (u) =>
                    (u.fullName || "").toLowerCase().includes(k) ||
                    (u.email || "").toLowerCase().includes(k) ||
                    (u.phone || "").toLowerCase().includes(k)
            );
        }
        if (roleFilter) {
            data = data.filter((u) => u.role === roleFilter);
        }
        return data;
    }, [users, keyword, roleFilter]);

    const columns: ColumnsType<User> = [
        {
            title: "Avatar",
            dataIndex: "avatar",
            key: "avatar",
            align: "center",
            render: (url: string) => (
                <Avatar
                    size={42}
                    src={url}
                    icon={<UserOutlined />}
                    style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
                />
            ),
        },
        {
            title: "Họ tên",
            dataIndex: "fullName",
            key: "fullName",
            sorter: (a, b) => (a.fullName || "").localeCompare(b.fullName || ""),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "SĐT",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            align: "center",
            render: (role: string) => {
                const color = role === "ADMIN" ? "magenta" : "blue";
                const text = role === "ADMIN" ? "Quản trị" : "Người dùng";
                return (
                    <Tag
                        color={color}
                        style={{ borderRadius: 20, padding: "2px 12px", fontWeight: 500 }}
                    >
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            align: "center",
            render: (_: any, record: User) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button
                            shape="circle"
                            icon={<EditOutlined />}
                            type="default"
                            onClick={() => openModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa người dùng này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={() => handleDelete(record._id)}
                        >
                            <Button shape="circle" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                padding: 24,
                background: "linear-gradient(135deg, #f5f7fa, #e4ebf5)",
                minHeight: "100vh",
            }}
        >
            <Card
                bordered={false}
                style={{
                    borderRadius: 16,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    background: "white",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 24,
                    }}
                >
                    <Title level={3} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <TeamOutlined style={{ color: "#1677ff", fontSize: 26 }} />
                        Quản lý người dùng
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => openModal()}
                        style={{
                            borderRadius: 8,
                            background: "linear-gradient(90deg, #1677ff, #69b1ff)",
                            boxShadow: "0 4px 10px rgba(22,119,255,0.3)",
                        }}
                    >
                        Thêm người dùng
                    </Button>
                </div>

                <Card
                    size="small"

                    style={{
                        marginBottom: 20,
                        borderRadius: 12,
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        padding: 16,
                    }}
                >
                    <Row gutter={[16, 16]} align="middle" justify="space-between">
                        {/* Bộ lọc tìm kiếm */}
                        <Col xs={24} sm={12} md={8} lg={8}>
                            <Input.Search
                                placeholder="Tìm theo tên / email / SĐT"
                                allowClear
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                style={{
                                    borderRadius: 10,
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                                }}
                            />
                        </Col>

                        {/* Thống kê + Bộ lọc vai trò */}
                        <Col xs={24} sm={24} md={16} lg={14}>
                            <Row gutter={[16, 16]} justify="end">
                                {/* Tất cả người dùng */}
                                <Col xs={24} sm={8}>
                                    <Card
                                        size="small"
                                        bordered={false}
                                        hoverable
                                        onClick={() => setRoleFilter(undefined)}
                                        style={{
                                            textAlign: "center",
                                            borderRadius: 14,
                                            cursor: "pointer",
                                            background: !roleFilter
                                                ? "linear-gradient(135deg, #e6f7ff, #bae7ff)"
                                                : "white",
                                            boxShadow: !roleFilter
                                                ? "0 6px 16px rgba(24,144,255,0.25)"
                                                : "0 3px 8px rgba(0,0,0,0.06)",
                                            transition: "all 0.3s ease",
                                            transform: !roleFilter ? "scale(1.03)" : "scale(1)",
                                        }}
                                    >
                                        <Statistic
                                            title={
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <TeamOutlined style={{ color: "#1677ff" }} />
                                                    Tất cả
                                                </span>
                                            }
                                            value={users.length}
                                            valueStyle={{
                                                fontSize: 20,
                                                color: !roleFilter ? "#1677ff" : "#333",
                                                fontWeight: 700,
                                            }}
                                        />
                                    </Card>
                                </Col>

                                {/* Quản trị viên */}
                                <Col xs={24} sm={8}>
                                    <Card
                                        size="small"
                                        bordered={false}
                                        hoverable
                                        onClick={() =>
                                            setRoleFilter((prev) =>
                                                prev === "ADMIN" ? undefined : "ADMIN"
                                            )
                                        }
                                        style={{
                                            textAlign: "center",
                                            borderRadius: 14,
                                            cursor: "pointer",
                                            background:
                                                roleFilter === "ADMIN"
                                                    ? "linear-gradient(135deg, #fff2e8, #ffd8bf)"
                                                    : "white",
                                            boxShadow:
                                                roleFilter === "ADMIN"
                                                    ? "0 6px 16px rgba(250,84,28,0.25)"
                                                    : "0 3px 8px rgba(0,0,0,0.06)",
                                            transition: "all 0.3s ease",
                                            transform:
                                                roleFilter === "ADMIN" ? "scale(1.03)" : "scale(1)",
                                        }}
                                    >
                                        <Statistic
                                            title={
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <UserOutlined style={{ color: "#fa8c16" }} />
                                                    Quản trị
                                                </span>
                                            }
                                            value={users.filter((u) => u.role === "ADMIN").length}
                                            valueStyle={{
                                                fontSize: 20,
                                                color: roleFilter === "ADMIN" ? "#fa541c" : "#333",
                                                fontWeight: 700,
                                            }}
                                        />
                                    </Card>
                                </Col>

                                {/* Người dùng thường */}
                                <Col xs={24} sm={8}>
                                    <Card
                                        size="small"
                                        bordered={false}
                                        hoverable
                                        onClick={() =>
                                            setRoleFilter((prev) =>
                                                prev === "TENANT" ? undefined : "TENANT"
                                            )
                                        }
                                        style={{
                                            textAlign: "center",
                                            borderRadius: 14,
                                            cursor: "pointer",
                                            background:
                                                roleFilter === "TENANT"
                                                    ? "linear-gradient(135deg, #f6ffed, #d9f7be)"
                                                    : "white",
                                            boxShadow:
                                                roleFilter === "TENANT"
                                                    ? "0 6px 16px rgba(82,196,26,0.25)"
                                                    : "0 3px 8px rgba(0,0,0,0.06)",
                                            transition: "all 0.3s ease",
                                            transform:
                                                roleFilter === "TENANT" ? "scale(1.03)" : "scale(1)",
                                        }}
                                    >
                                        <Statistic
                                            title={
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <UserOutlined style={{ color: "#52c41a" }} />
                                                    Người dùng
                                                </span>
                                            }
                                            value={users.filter((u) => u.role === "TENANT").length}
                                            valueStyle={{
                                                fontSize: 20,
                                                color: roleFilter === "TENANT" ? "#52c41a" : "#333",
                                                fontWeight: 700,
                                            }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                </Card>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Table<User>
                        columns={columns}
                        dataSource={filteredUsers}
                        rowKey={(r) => (r._id || r.id || "")}
                        loading={loading}
                        pagination={{
                            pageSize: 8,
                            showSizeChanger: true,
                            pageSizeOptions: [5, 8, 10, 20],
                        }}
                        size="middle"
                        style={{
                            background: "white",
                            borderRadius: 12,
                        }}
                    />
                </motion.div>
            </Card>

            <Modal
                title={editing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={handleSave}
                okText="Lưu"
                cancelText="Hủy"
                centered
                width={560}
                style={{ borderRadius: 12 }}
            >
                <Form<FormValues> form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Avatar (URL)" name="avatar">
                                <Input placeholder="https://..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Họ tên"
                                name="fullName"
                                rules={[{ required: true, message: "Nhập họ tên" }]}
                            >
                                <Input placeholder="VD: Nguyễn Văn A" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, type: "email", message: "Email không hợp lệ" },
                                ]}
                            >
                                <Input placeholder="user@example.com" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Số điện thoại" name="phone">
                                <Input placeholder="0123456789" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Vai trò"
                                name="role"
                                rules={[{ required: true, message: "Chọn vai trò" }]}
                                initialValue="USER"
                            >
                                <Select>
                                    <Option value="ADMIN">Quản trị</Option>
                                    <Option value="TENANT">Người dùng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        {!editing && (
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Mật khẩu"
                                    name="password"
                                    rules={[
                                        { required: true, message: "Nhập mật khẩu" },
                                        { min: 6, message: "Ít nhất 6 ký tự" },
                                    ]}
                                >
                                    <Input.Password placeholder="••••••" />
                                </Form.Item>
                            </Col>
                        )}
                    </Row>
                </Form>
            </Modal>
        </motion.div>
    );
};

export default Users;
