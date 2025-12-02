import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Card, Form, Input, Modal, Table, Tag, Typography, message, Row, Col, Statistic } from "antd";
import { PlusOutlined, EditOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { motion } from "framer-motion";
import type { User, UserRole } from "../../../types/user";
import { adminUserService } from "../services/user";
import ExpandableSearch from "../components/ExpandableSearch";

const { Title } = Typography;

type FormValues = Partial<User> & { password?: string };

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [form] = Form.useForm<FormValues>();
    const [keyword, setKeyword] = useState<string>("");
    const [roleFilter] = useState<string | undefined>(undefined);

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
                const payload: any = {
                    fullName: values.fullName,
                    email: values.email,
                    phone: values.phone,
                    role: roleToSend,
                };
                // Nếu có nhập password mới, thêm vào payload
                if (values.password && values.password.trim()) {
                    payload.password = values.password;
                }
                const updated = await adminUserService.update(id, payload);
                setUsers((prev) =>
                    prev.map((u) => ((u._id || u.id) === (updated._id || updated.id) ? updated : u))
                );
                message.success(values.password ? "Cập nhật người dùng và mật khẩu thành công!" : "Cập nhật người dùng thành công!");
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
                    size={48}
                    src={url}
                    icon={<UserOutlined />}
                    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
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
            filters: [
                { text: "Quản trị", value: "ADMIN" },
                { text: "Người dùng", value: "TENANT" },
                { text: "Nhân viên", value: "STAFF" },
            ],
            onFilter: (value: boolean | React.Key, record: User) => String(record.role) === String(value),
            render: (role: string) => {
                const map: Record<string, { color: string; text: string }> = {
                    ADMIN: { color: "#fa8c16", text: "Quản trị" },
                    TENANT: { color: "#52c41a", text: "Người dùng" },
                    STAFF: { color: "#1890ff", text: "Nhân viên" },
                };
                const m = map[role] || { color: "#8c8c8c", text: role };
                return (
                    <Tag
                        style={{
                            fontWeight: 600,
                            borderRadius: 12,
                            color: "#fff",
                            backgroundColor: m.color,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            transition: "all 0.3s",
                            padding: "4px 16px",
                        }}
                    >
                        {m.text}
                    </Tag>
                );
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            align: "center",
            render: (_: any, record: User) => (
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    shape="circle"
                    onClick={() => openModal(record)}
                    className="btn-hover"
                />
            ),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: 32, minHeight: "100vh" }}
        >
            <Row
                gutter={[24, 24]}
                style={{
                    borderRadius: 20,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    background: "#fff",
                    padding: 24,
                }}
            >
                {/* Header */}
                <Col span={24}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 24,
                        }}
                    >
                        <Title
                            level={3}
                            style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
                        >
                            <TeamOutlined style={{ color: "#1677ff", fontSize: 26 }} />
                            Quản lý người dùng
                        </Title>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => openModal()}
                            className="btn-hover-gradient"
                        >
                            Thêm người dùng
                        </Button>
                    </div>
                </Col>

                {/* Bộ lọc & thống kê */}
                <Col span={24}>
                    <Row gutter={[16, 16]} align="middle" justify="space-between">
                        <Col xs={24} sm={12} md={8}>
                            <ExpandableSearch
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Tìm theo tên / email / SĐT"
                            />
                        </Col>

                        <Col xs={24} sm={24} md={16}>
                            <Row gutter={[16, 16]} justify="end">
                                {[
                                    { label: "Quản trị", icon: <UserOutlined />, color: "#fa8c16", value: users.filter((u) => u.role === "ADMIN").length },
                                    { label: "Nhân viên", icon: <UserOutlined />, color: "#1677ff", value: users.filter((u) => u.role === "STAFF").length },
                                    { label: "Người dùng", icon: <UserOutlined />, color: "#52c41a", value: users.filter((u) => u.role === "TENANT" as UserRole).length },
                                ].map((item, idx) => (
                                    <Col xs={24} sm={8} key={idx}>
                                        <Card
                                            size="small"
                                            bordered={false}
                                            style={{
                                                textAlign: "center",
                                                borderRadius: 16,
                                                background: "white",
                                                boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
                                                padding: 12,
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
                                                        {item.icon}
                                                        {item.label}
                                                    </span>
                                                }
                                                value={item.value}
                                                valueStyle={{
                                                    fontSize: 20,
                                                    color: item.color,
                                                    fontWeight: 700,
                                                }}
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>
                </Col>

                {/* Bảng người dùng */}
                <Col span={24}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
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
                                background: "#fff",
                                borderRadius: 16,
                                overflow: "hidden",
                            }}
                            rowClassName={() => "hover-row"}
                        />
                    </motion.div>
                </Col>
            </Row>

            {/* Modal thêm/sửa */}
            <Modal
                title={editing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={handleSave}
                okText="Lưu"
                cancelText="Hủy"
                centered
                width={560}
                style={{ borderRadius: 16 }}
            >
                <Form<FormValues> form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Họ tên"
                                name="fullName"
                                rules={[{ required: true, message: "Nhập họ tên" }]}
                            >
                                <Input
                                    placeholder="VD: Nguyễn Văn A"
                                    style={{ borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}
                            >
                                <Input
                                    placeholder="user@example.com"
                                    style={{ borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Số điện thoại" name="phone">
                                <Input
                                    placeholder="0123456789"
                                    style={{ borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={editing ? "Mật khẩu mới" : "Mật khẩu"}
                                name="password"
                                rules={
                                    editing
                                        ? [{ min: 6, message: "Ít nhất 6 ký tự" }]
                                        : [
                                              { required: true, message: "Nhập mật khẩu" },
                                              { min: 6, message: "Ít nhất 6 ký tự" },
                                          ]
                                }
                            >
                                <Input.Password
                                    placeholder={editing ? "Để trống nếu không đổi" : "••••••"}
                                    style={{ borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
                                />
                            </Form.Item>
                        </Col>
                        {editing && (
                            <Col span={24}>
                                <div style={{ 
                                    padding: 12, 
                                    background: "#e6f7ff", 
                                    borderRadius: 8, 
                                    border: "1px solid #91d5ff",
                                    marginTop: -8
                                }}>
                                    <p style={{ margin: 0, fontSize: 13, color: "#0050b3" }}>
                                        💡 <strong>Lưu ý:</strong> Chỉ nhập mật khẩu mới nếu muốn đổi mật khẩu cho người dùng. Để trống nếu chỉ cập nhật thông tin khác.
                                    </p>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Form>
            </Modal>
        </motion.div>
    );
};

export default Users;
