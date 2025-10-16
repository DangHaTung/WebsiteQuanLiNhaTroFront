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
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { User } from "../../../types/user";
import dbData from "../../../../db.json";

const { Title } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [form] = Form.useForm<User>();
    const [keyword, setKeyword] = useState<string>("");
    const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

    useEffect(() => {
        const initUsers: User[] = (dbData as any).users || [];
        setUsers(initUsers);
        setLoading(false);
    }, []);

    const openModal = (record?: User) => {
        if (record) {
            setEditing(record);
            form.setFieldsValue(record as any);
        } else {
            setEditing(null);
            form.resetFields();
            form.setFieldsValue({ role: "USER" } as any);
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
            if (editing) {
                const updated = users.map((u) => (u._id === editing._id ? { ...editing, ...values } : u));
                setUsers(updated);
                message.success("Cập nhật người dùng thành công!");
            } else {
                const newUser: User = {
                    _id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    ...values,
                } as User;
                setUsers((prev) => [...prev, newUser]);
                message.success("Thêm người dùng thành công!");
            }
            closeModal();
        } catch (e) {
            // ignore, antd will highlight invalid fields
        }
    };

    const handleDelete = (id?: string) => {
        const key = id ?? "";
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

    const total = filteredUsers.length;
    const adminCount = useMemo(() => filteredUsers.filter((u) => u.role === "ADMIN").length, [filteredUsers]);

    const columns: ColumnsType<User> = [
        {
            title: "Avatar",
            dataIndex: "avatar",
            key: "avatar",
            align: "center",
            render: (url: string) => (
                <Avatar size={40} src={url} icon={<UserOutlined />} />
            ),
        },
        {
            title: "Họ tên",
            dataIndex: "fullName",
            key: "fullName",
            sorter: (a, b) => (a.fullName || "").localeCompare(b.fullName || ""),
            render: (v: string) => (
                <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{v}</span>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (v: string) => (
                <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{v}</span>
            ),
        },
        {
            title: "SĐT",
            dataIndex: "phone",
            key: "phone",
            render: (v: string) => (
                <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{v}</span>
            ),
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            align: "center",
            render: (role: string) => {
                const color = role === "ADMIN" ? "red" : "blue";
                const text = role === "ADMIN" ? "Quản trị" : "Người dùng";
                return <Tag color={color}>{text}</Tag>;
            },
            filters: [
                { text: "Quản trị", value: "ADMIN" },
                { text: "Người dùng", value: "USER" },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: "",
            key: "actions",
            align: "center",
            width: 120,
            render: (_: any, record: User) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button shape="circle" type="primary" icon={<EditOutlined />} onClick={() => openModal(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm title="Xóa người dùng này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(record._id)}>
                            <Button shape="circle" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, background: "#f9fafc", minHeight: "100vh" }}>
            <Card bordered={false} style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <Title level={3} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <UserOutlined /> Quản lý người dùng
                    </Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} style={{ borderRadius: 6, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
                        Thêm người dùng
                    </Button>
                </div>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={10} lg={8}>
                        <Input.Search
                            placeholder="Tìm theo tên/email/SĐT"
                            allowClear
                            onSearch={setKeyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <Select
                            allowClear
                            placeholder="Lọc theo vai trò"
                            style={{ width: "100%" }}
                            value={roleFilter}
                            onChange={(v) => setRoleFilter(v)}
                            options={[
                                { label: "Quản trị", value: "ADMIN" },
                                { label: "Người dùng", value: "USER" },
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={10}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic title="Tổng người dùng" value={total} />
                            </Col>
                            <Col span={12}>
                                <Statistic title="Quản trị" value={adminCount} valueStyle={{ color: "#fa541c" }} />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Table<User>
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey={(r) => (r._id || r.id || "")}
                    loading={loading}
                    pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: [5, 8, 10, 20] }}
                    size="middle"
                    style={{ background: "white", borderRadius: 8 }}
                />
            </Card>

            <Modal
                title={editing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={handleSave}
                okText="Lưu"
                cancelText="Hủy"
                width={560}
                centered
            >
                <Form<User> form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Avatar (URL)" name="avatar">
                                <Input placeholder="https://..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: "Nhập họ tên" }]}>
                                <Input placeholder="VD: Nguyễn Văn A" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
                                <Input placeholder="user@example.com" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Số điện thoại" name="phone">
                                <Input placeholder="0123456789" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Chọn vai trò" }]} initialValue="USER">
                                <Select>
                                    <Option value="ADMIN">Quản trị</Option>
                                    <Option value="USER">Người dùng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default Users;
