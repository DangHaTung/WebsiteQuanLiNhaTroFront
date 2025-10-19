import React, { useEffect, useMemo, useState } from "react";
import {
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    InputNumber,
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
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Bill, BillStatus } from "../../../types/bill";
import type { Contract } from "../../../types/contract";
import dayjs, { Dayjs } from "dayjs";
import { adminBillService } from "../services/bill";
import { adminContractService } from "../services/contract";

const { Title } = Typography;
const { Option } = Select;

interface BillFormValues {
    contractId: string;
    billingDate: Dayjs;
    status: BillStatus;
    amountDue: number;
    amountPaid: number;
}

const BillsAD: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editing, setEditing] = useState<Bill | null>(null);
    const [form] = Form.useForm<BillFormValues>();
    const [keyword, setKeyword] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<BillStatus | undefined>(undefined);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [billsData, contractsData] = await Promise.all([
                adminBillService.getAll({ limit: 50 }),
                adminContractService.getAll({ limit: 50 }),
            ]);
            setBills(billsData);
            setContracts(contractsData);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (record?: Bill) => {
        if (record) {
            setEditing(record);
            const contractId = typeof record.contractId === "string" ? record.contractId : record.contractId?._id;
            form.setFieldsValue({
                contractId,
                billingDate: dayjs(record.billingDate),
                status: record.status,
                amountDue: Number(record.amountDue || 0),
                amountPaid: Number(record.amountPaid || 0),
            });
        } else {
            setEditing(null);
            form.resetFields();
            form.setFieldsValue({ status: "UNPAID" } as any);
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
            const payload: Partial<Bill> = {
                contractId: values.contractId,
                billingDate: values.billingDate.toISOString(),
                status: values.status,
                amountDue: values.amountDue ?? 0,
                amountPaid: values.amountPaid ?? 0,
                lineItems: editing?.lineItems || [{
                    item: "Tiền thuê phòng",
                    quantity: 1,
                    unitPrice: values.amountDue ?? 0,
                    lineTotal: values.amountDue ?? 0
                }],
            };

            if (editing) {
                await adminBillService.update(editing._id, payload);
                message.success("Cập nhật hóa đơn thành công!");
            } else {
                await adminBillService.create(payload);
                message.success("Thêm hóa đơn thành công!");
            }
            closeModal();
            loadData();
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await adminBillService.remove(id);
            message.success("Đã xóa hóa đơn!");
            loadData();
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Lỗi khi xóa hóa đơn");
        }
    };

    const getContractInfo = (contractId: string | Contract): string => {
        if (typeof contractId === "object" && contractId?._id) {
            return contractId._id;
        }
        const contract = contracts.find((c) => c._id === contractId);
        return contract?._id || (typeof contractId === "string" ? contractId : "N/A");
    };

    const filteredBills = useMemo(() => {
        let data = [...bills];
        if (keyword.trim()) {
            const k = keyword.toLowerCase();
            data = data.filter((b) => {
                const id = b._id.toLowerCase();
                const contractInfo = getContractInfo(b.contractId).toLowerCase();
                return id.includes(k) || contractInfo.includes(k);
            });
        }
        if (statusFilter) data = data.filter((b) => b.status === statusFilter);
        if (dateRange) {
            const [start, end] = dateRange;
            data = data.filter((b) => {
                const d = dayjs(b.billingDate);
                return d.isAfter(start.startOf("day")) && d.isBefore(end.endOf("day"));
            });
        }
        return data;
    }, [bills, keyword, statusFilter, dateRange, contracts]);

    const total = filteredBills.length;
    const paidCount = useMemo(() => filteredBills.filter((b) => b.status === "PAID").length, [filteredBills]);
    const totalDue = useMemo(() => filteredBills.reduce((s, b) => s + Number(b.amountDue || 0), 0), [filteredBills]);
    const totalPaid = useMemo(() => filteredBills.reduce((s, b) => s + Number(b.amountPaid || 0), 0), [filteredBills]);

    const columns: ColumnsType<Bill> = [
        {
            title: "Mã hóa đơn",
            dataIndex: "_id",
            key: "_id",
            width: 160,
            render: (v: string) => (
                <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{v}</span>
            ),
        },
        {
            title: "Hợp đồng",
            dataIndex: "contractId",
            key: "contractId",
            render: (v: string | Contract) => (
                <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{getContractInfo(v)}</span>
            ),
        },
        {
            title: "Ngày lập",
            dataIndex: "billingDate",
            key: "billingDate",
            render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
        },
        {
            title: "Tình trạng",
            dataIndex: "status",
            key: "status",
            align: "center",
            filters: [
                { text: "Đã thanh toán", value: "PAID" },
                { text: "Chưa thanh toán", value: "UNPAID" },
                { text: "Thanh toán một phần", value: "PARTIALLY_PAID" },
            ],
            onFilter: (val, record) => record.status === val,
            render: (s: BillStatus) => {
                const map: Record<BillStatus, { color: string; text: string }> = {
                    PAID: { color: "green", text: "Đã thanh toán" },
                    UNPAID: { color: "red", text: "Chưa thanh toán" },
                    PARTIALLY_PAID: { color: "orange", text: "Một phần" },
                    VOID: { color: "default", text: "Đã hủy" },
                };
                const m = map[s];
                return <Tag color={m.color}>{m.text}</Tag>;
            },
        },
        {
            title: "Phải thu (₫)",
            dataIndex: "amountDue",
            key: "amountDue",
            align: "right",
            render: (v: any) => {
                // Backend đã chuyển đổi Decimal128 sang number
                if (typeof v === 'number' && !isNaN(v)) {
                    return v.toLocaleString("vi-VN");
                }
                return "0";
            },
        },
        {
            title: "Đã thu (₫)",
            dataIndex: "amountPaid",
            key: "amountPaid",
            align: "right",
            render: (v: any) => {
                // Backend đã chuyển đổi Decimal128 sang number
                if (typeof v === 'number' && !isNaN(v)) {
                    return v.toLocaleString("vi-VN");
                }
                return "0";
            },
        },
        {
            title: "",
            key: "actions",
            align: "center",
            width: 120,
            render: (_: any, record: Bill) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button shape="circle" type="primary" icon={<EditOutlined />} onClick={() => openModal(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm title="Xóa hóa đơn này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(record._id)}>
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
                    <Title level={3} style={{ margin: 0 }}>Quản lý hóa đơn</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} style={{ borderRadius: 6, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
                        Thêm hóa đơn
                    </Button>
                </div>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Input.Search
                            placeholder="Tìm theo mã hóa đơn/hợp đồng"
                            allowClear
                            onSearch={setKeyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Select
                            allowClear
                            placeholder="Lọc tình trạng"
                            style={{ width: "100%" }}
                            value={statusFilter}
                            onChange={(v) => setStatusFilter(v as BillStatus)}
                            options={[
                                { label: "Đã thanh toán", value: "PAID" },
                                { label: "Chưa thanh toán", value: "UNPAID" },
                                { label: "Thanh toán một phần", value: "PARTIALLY_PAID" },
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8}>
                        <DatePicker.RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" onChange={(v) => setDateRange(v as any)} />
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={4}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic title="Tổng HĐơn" value={total} />
                            </Col>
                            <Col span={12}>
                                <Statistic title="Đã thanh toán" value={paidCount} valueStyle={{ color: "#52c41a" }} />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginBottom: 12 }}>
                    <Col xs={24} md={12}>
                        <Statistic title="Tổng phải thu (lọc)" value={totalDue} suffix="₫" valueRender={() => (
                            <span style={{ fontWeight: 600 }}>{Number(totalDue).toLocaleString("vi-VN")}₫</span>
                        )} />
                    </Col>
                    <Col xs={24} md={12}>
                        <Statistic title="Tổng đã thu (lọc)" value={totalPaid} suffix="₫" valueRender={() => (
                            <span style={{ fontWeight: 600 }}>{Number(totalPaid).toLocaleString("vi-VN")}₫</span>
                        )} />
                    </Col>
                </Row>

                <Table<Bill>
                    columns={columns}
                    dataSource={filteredBills}
                    rowKey={(r) => r._id}
                    loading={loading}
                    pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: [5, 8, 10, 20] }}
                    size="middle"
                    style={{ background: "white", borderRadius: 8 }}
                />
            </Card>

            <Modal
                title={editing ? "Chỉnh sửa hóa đơn" : "Thêm hóa đơn"}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={handleSave}
                okText="Lưu"
                cancelText="Hủy"
                width={640}
                centered
            >
                <Form<BillFormValues> form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Hợp đồng" name="contractId" rules={[{ required: true, message: "Chọn hợp đồng" }]}>
                                <Select
                                    showSearch
                                    placeholder="Chọn hợp đồng"
                                    optionFilterProp="children"
                                    filterOption={(input, option: any) => {
                                        const children = option?.children;
                                        if (children && typeof children === 'string') {
                                            return children.toLowerCase().includes(input.toLowerCase());
                                        }
                                        return false;
                                    }}
                                >
                                    {contracts.map((contract) => {
                                        const tenantName = typeof contract.tenantId === "object" ? contract.tenantId?.fullName : "";
                                        const roomNumber = typeof contract.roomId === "object" ? contract.roomId?.roomNumber : "";
                                        return (
                                            <Option key={contract._id} value={contract._id}>
                                                {contract._id.substring(0, 8)}... {tenantName && `- ${tenantName}`} {roomNumber && `(${roomNumber})`}
                                            </Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Ngày lập" name="billingDate" rules={[{ required: true, message: "Chọn ngày lập" }]}>
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Tình trạng" name="status" initialValue="UNPAID" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="PAID">Đã thanh toán</Option>
                                    <Option value="UNPAID">Chưa thanh toán</Option>
                                    <Option value="PARTIALLY_PAID">Một phần</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Phải thu (₫)" name="amountDue" rules={[{ required: true, message: "Nhập số tiền phải thu" }]}>
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Đã thu (₫)" name="amountPaid" rules={[{ required: true, message: "Nhập số tiền đã thu" }]}>
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default BillsAD;
