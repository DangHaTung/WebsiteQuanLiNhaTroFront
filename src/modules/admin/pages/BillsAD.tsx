import React, { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Form, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip, Typography, message, Row, Col, Statistic } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Bill, BillStatus } from "../../../types/bill";
import type { Contract } from "../../../types/contract";
import type { Tenant } from "../../../types/tenant";
import type { Room } from "../../../types/room";
import dayjs, { Dayjs } from "dayjs";
import { adminBillService } from "../services/bill";
import { adminContractService } from "../services/contract";
import { adminTenantService } from "../services/tenant";
import { adminRoomService } from "../services/room";
import BillDetailDrawer from "../components/BillDetailDrawer";
import "../../../assets/styles/roomAd.css";
import { isAdmin } from "../../../utils/roleChecker";

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
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editing, setEditing] = useState<Bill | null>(null);
    const [form] = Form.useForm<BillFormValues>();
    const [statusFilter, setStatusFilter] = useState<BillStatus | "ALL">("ALL");

    // Drawer detail
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedBillId, setSelectedBillId] = useState<string | undefined>(undefined);

    // State để theo dõi đã load các dữ liệu phụ chưa
    const [hasLoadedContracts, setHasLoadedContracts] = useState<boolean>(false);
    const [hasLoadedTenants, setHasLoadedTenants] = useState<boolean>(false);
    const [hasLoadedRooms, setHasLoadedRooms] = useState<boolean>(false);

    useEffect(() => {
        loadBills();
    }, []);

    // Chỉ load bills ban đầu
    const loadBills = async () => {
        try {
            setLoading(true);
            const billsData = await adminBillService.getAll({ limit: 50 });
            setBills(billsData);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    // Load contracts chỉ khi cần (khi mở modal)
    const loadContractsIfNeeded = async () => {
        if (!hasLoadedContracts) {
            try {
                const contractsData = await adminContractService.getAll({ limit: 100 });
                setContracts(contractsData);
                setHasLoadedContracts(true);
            } catch (error: any) {
                message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu hợp đồng");
            }
        }
    };

    // Load tenants chỉ khi cần (khi mở drawer detail)
    const loadTenantsIfNeeded = async () => {
        if (!hasLoadedTenants) {
            try {
                const tenantsData = await adminTenantService.getAll({ limit: 50 });
                setTenants(tenantsData);
                setHasLoadedTenants(true);
            } catch (error: any) {
                message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu người thuê");
            }
        }
    };

    // Load rooms chỉ khi cần (khi mở drawer detail)
    const loadRoomsIfNeeded = async () => {
        if (!hasLoadedRooms) {
            try {
                const roomsData = await adminRoomService.getAll();
                setRooms(roomsData);
                setHasLoadedRooms(true);
            } catch (error: any) {
                message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu phòng");
            }
        }
    };

    const openModal = async (record?: Bill) => {
        // Chỉ load contracts khi mở modal (vì cần cho dropdown)
        await loadContractsIfNeeded();

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
            // Nếu hóa đơn đang ở trạng thái PAID, không cho phép chuyển về trạng thái khác
            if (editing?.status === "PAID" && values.status !== "PAID") {
                message.error("Hóa đơn đã thanh toán, không thể chuyển về chưa thanh toán hoặc hủy");
                return;
            }
            // Nếu hóa đơn đang ở trạng thái PARTIALLY_PAID, không cho phép chuyển về UNPAID hoặc VOID (cho phép chuyển lên PAID)
            if (editing?.status === "PARTIALLY_PAID" && (values.status === "UNPAID" || values.status === ("VOID" as any))) {
                message.error("Hóa đơn đã thanh toán một phần, không thể chuyển về chưa thanh toán hoặc hủy");
                return;
            }
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
            loadBills();
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await adminBillService.remove(id);
            message.success("Đã xóa hóa đơn!");
            loadBills();
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Lỗi khi xóa hóa đơn");
        }
    };

    const getContractInfo = (contractId: string | Contract): string => {
        if (typeof contractId === "object" && contractId?._id) {
            return contractId._id.substring(0, 8) + '...';
        }

        // Nếu backend đã populate contract data trong bill, không cần tìm trong contracts list
        const bill = bills.find(b =>
            (typeof b.contractId === 'object' && b.contractId?._id === contractId) ||
            (typeof b.contractId === 'string' && b.contractId === contractId)
        );

        if (bill && typeof bill.contractId === 'object') {
            return bill.contractId._id.substring(0, 8) + '...';
        }

        const contract = contracts.find((c) => c._id === contractId);
        return contract?._id.substring(0, 8) + '...' || (typeof contractId === "string" ? contractId.substring(0, 8) + '...' : "N/A");
    };

    const filteredBills = useMemo(() => {
        let data = [...bills];
        if (statusFilter && statusFilter !== "ALL") data = data.filter((b) => b.status === statusFilter);
        return data;
    }, [bills, statusFilter]);

    const paidCount = useMemo(() => bills.filter((b) => b.status === "PAID").length, [bills]);
    const unpaidCount = useMemo(() => bills.filter((b) => b.status === "UNPAID").length, [bills]);
    const partiallyPaidCount = useMemo(() => bills.filter((b) => b.status === "PARTIALLY_PAID").length, [bills]);

    const openDetail = async (bill: Bill) => {
        // Load tenants và rooms khi mở drawer detail (nếu chưa load)
        await Promise.all([loadTenantsIfNeeded(), loadRoomsIfNeeded()]);

        setSelectedBillId(bill._id);
        setDetailVisible(true);
    };

    const closeDetail = () => {
        setDetailVisible(false);
        setSelectedBillId(undefined);
    };

    const columns: ColumnsType<Bill> = [
        {
            title: "Mã hóa đơn",
            dataIndex: "_id",
            key: "_id",
            width: 160,
            render: (v: string, record: Bill) => (
                <b style={{ cursor: "pointer" }} onClick={() => openDetail(record)}>
                    {v.substring(0, 8)}...
                </b>
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
                return <Tag color={m.color} className="tag-hover">{m.text}</Tag>;
            },
        },
        {
            title: "Phải thu (₫)",
            dataIndex: "amountDue",
            key: "amountDue",
            align: "right",
            render: (_: any, record: Bill) => {
                const due = typeof record.amountDue === 'number' && !isNaN(record.amountDue) ? record.amountDue : 0;
                const paid = typeof record.amountPaid === 'number' && !isNaN(record.amountPaid) ? record.amountPaid : 0;
                let display = due;
                if (record.status === 'PAID') display = 0;
                else if (record.status === 'PARTIALLY_PAID') display = Math.max(due - paid, 0);
                return display.toLocaleString("vi-VN");
            },
        },
        {
            title: "Đã thu (₫)",
            dataIndex: "amountPaid",
            key: "amountPaid",
            align: "right",
            render: (_: any, record: Bill) => {
                const due = typeof record.amountDue === 'number' && !isNaN(record.amountDue) ? record.amountDue : 0;
                const paid = typeof record.amountPaid === 'number' && !isNaN(record.amountPaid) ? record.amountPaid : 0;
                let display = paid;
                if (record.status === 'UNPAID') display = 0;
                else if (record.status === 'PARTIALLY_PAID') display = Math.min(paid, due);
                return display.toLocaleString("vi-VN");
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
                        <Button
                            shape="circle"
                            type="primary"
                            icon={<EditOutlined />}
                            className="btn-hover"
                            onClick={(e) => { e.stopPropagation(); openModal(record); }}
                        />
                    </Tooltip>
                    {isAdmin() && (
                        <Tooltip title={(record.status === 'PAID' || record.status === 'PARTIALLY_PAID') ? "Không thể xóa hóa đơn đã thanh toán/1 phần" : "Xóa"}>
                            <Popconfirm title="Xóa hóa đơn này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(record._id)} disabled={record.status === 'PAID' || record.status === 'PARTIALLY_PAID'}>
                                <Button shape="circle" type="primary" danger icon={<DeleteOutlined />} className="btn-hover" onClick={(e) => e.stopPropagation()} disabled={record.status === 'PAID' || record.status === 'PARTIALLY_PAID'} />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
            <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
                {/* Header */}
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                            <FileTextOutlined style={{ color: "#1890ff", fontSize: 28 }} /> Quản lý Hóa đơn
                        </Title>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={() => openModal()}
                        >
                            Thêm hóa đơn
                        </Button>
                    </Col>
                </Row>

                {/* Statistic */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{
                            background: "#fff",
                            padding: 20,
                            borderRadius: 12,
                            textAlign: "center",
                            cursor: "pointer",
                            border: "1px solid #e8e8e8",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                        }} onClick={() => setStatusFilter("PAID")}>
                            <FileTextOutlined style={{ fontSize: 28, color: "#52c41a", marginBottom: 8 }} />
                            <Statistic title="Đã thanh toán" value={paidCount} valueStyle={{ color: "#52c41a", fontWeight: 600 }} />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{
                            background: "#fff",
                            padding: 20,
                            borderRadius: 12,
                            textAlign: "center",
                            cursor: "pointer",
                            border: "1px solid #e8e8e8",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                        }} onClick={() => setStatusFilter("UNPAID")}>
                            <FileTextOutlined style={{ fontSize: 28, color: "#ff4d4f", marginBottom: 8 }} />
                            <Statistic title="Chưa thanh toán" value={unpaidCount} valueStyle={{ color: "#ff4d4f", fontWeight: 600 }} />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{
                            background: "#fff",
                            padding: 20,
                            borderRadius: 12,
                            textAlign: "center",
                            cursor: "pointer",
                            border: "1px solid #e8e8e8",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                        }} onClick={() => setStatusFilter("PARTIALLY_PAID")}>
                            <FileTextOutlined style={{ fontSize: 28, color: "#fa8c16", marginBottom: 8 }} />
                            <Statistic title="Một phần" value={partiallyPaidCount} valueStyle={{ color: "#fa8c16", fontWeight: 600 }} />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{
                            background: "#fff",
                            padding: 20,
                            borderRadius: 12,
                            border: "1px solid #e8e8e8",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center"
                        }}>
                            <span style={{ fontWeight: 600, marginBottom: 8 }}>Tình trạng:</span>
                            {["PAID", "UNPAID", "PARTIALLY_PAID"].map((status) => (
                                <Tag
                                    key={status}
                                    color={statusFilter === status ? "blue" : "default"}
                                    onClick={() => setStatusFilter(status as BillStatus)}
                                    style={{ cursor: "pointer", marginBottom: 6 }}
                                >
                                    {status === "PAID" ? "Đã thanh toán" :
                                        status === "UNPAID" ? "Chưa thanh toán" : "Một phần"}
                                </Tag>
                            ))}
                            <Tag
                                color={statusFilter === "ALL" ? "blue" : "default"}
                                onClick={() => setStatusFilter("ALL")}
                                style={{ cursor: "pointer", marginBottom: 6 }}
                            >
                                Tất cả
                            </Tag>
                        </div>
                    </Col>
                </Row>


                {/* Table */}
                <Table<Bill>
                    columns={columns}
                    dataSource={filteredBills}
                    rowKey={(r) => r._id}
                    loading={loading}
                    pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: [5, 8, 10, 20] }}
                    size="middle"
                    onRow={(record) => ({
                        onClick: () => openDetail(record),
                    })}
                />
            </div>

            {/* Modal (Add/Edit) */}
            <Modal
                title={editing ? "Chỉnh sửa hóa đơn" : "Thêm hóa đơn"}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={handleSave}
                okText="Lưu"
                cancelText="Hủy"
                width={640}
                centered
                okButtonProps={{ style: { background: "#1890ff", borderColor: "#1890ff" } }}
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
                                <Select disabled={editing?.status === 'PAID'}>
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

            {/* Drawer: Detail view */}
            <BillDetailDrawer
                open={detailVisible}
                onClose={closeDetail}
                billId={selectedBillId ?? null}
                contracts={contracts}
                tenants={tenants}
                rooms={rooms}
            />
        </div>
    );
};

export default BillsAD;