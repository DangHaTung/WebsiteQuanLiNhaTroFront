import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
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
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Contract } from "../../../types/contract";
import type { Tenant } from "../../../types/tenant";
import type { Room } from "../../../types/room";
import dayjs, { Dayjs } from "dayjs";
import { adminContractService } from "../services/contract";
import { adminTenantService } from "../services/tenant";
import { adminRoomService } from "../services/room";
import ContractDetailDrawer from "../components/ContractDetailDrawer";

const { Title } = Typography;
const { Option } = Select;

interface ContractFormValues {
  tenantId: string;
  roomId: string;
  startDate: Dayjs;
  endDate: Dayjs;
  deposit: number;
  monthlyRent: number;
  status: "ACTIVE" | "ENDED" | "CANCELED";
}

const ContractsAD: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form] = Form.useForm<ContractFormValues>();
  const [statusFilter, setStatusFilter] = useState<string | "ALL">("ALL");

  // Drawer detail
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contractsData, tenantsData, roomsData] = await Promise.all([
        adminContractService.getAll({ limit: 50 }),
        adminTenantService.getAll({ limit: 50 }),
        adminRoomService.getAll(),
      ]);
      
      setContracts(contractsData);
      setTenants(tenantsData);
      setRooms(roomsData);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (record?: Contract) => {
    if (record) {
      setEditing(record);
      const tenantId = typeof record.tenantId === "string" ? record.tenantId : record.tenantId?._id;
      const roomId = typeof record.roomId === "string" ? record.roomId : record.roomId?._id;
      form.setFieldsValue({
        tenantId,
        roomId,
        startDate: dayjs(record.startDate),
        endDate: dayjs(record.endDate),
        deposit: typeof record.deposit === 'number' ? record.deposit : Number(record.deposit ?? 0),
        monthlyRent: typeof record.monthlyRent === 'number' ? record.monthlyRent : Number(record.monthlyRent ?? 0),
        status: record.status as any,
      });
    } else {
      setEditing(null);
      form.resetFields();
      form.setFieldsValue({ status: "ACTIVE" } as any);
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
      const payload: Partial<Contract> = {
        tenantId: values.tenantId,
        roomId: values.roomId,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        deposit: values.deposit ?? 0,
        monthlyRent: values.monthlyRent ?? 0,
        status: values.status,
      };

      if (editing) {
        await adminContractService.update(editing._id, payload);
        message.success("Cập nhật hợp đồng thành công!");
      } else {
        await adminContractService.create(payload);
        message.success("Thêm hợp đồng thành công!");
      }
      closeModal();
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminContractService.remove(id);
      message.success("Đã xóa hợp đồng!");
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi xóa hợp đồng");
    }
  };

  const getTenantName = (tenantId: string | Tenant): string => {
    if (tenantId === null || tenantId === undefined) {
      return "N/A";
    }
    
    if (typeof tenantId === "object" && tenantId?.fullName) {
      return tenantId.fullName;
    }
    
    const tenant = tenants.find((t) => t._id === tenantId);
    return tenant?.fullName || (typeof tenantId === "string" ? tenantId : "N/A");
  };

  const getRoomNumber = (roomId: string | Room): string => {
    if (typeof roomId === "object" && roomId?.roomNumber) {
      return roomId.roomNumber;
    }
    const room = rooms.find((r) => r._id === roomId);
    return room?.roomNumber || (typeof roomId === "string" ? roomId : "N/A");
  };

  const filteredContracts = useMemo(() => {
    let data = [...contracts];
    if (statusFilter && statusFilter !== "ALL") {
      data = data.filter((c) => c.status === statusFilter);
    }
    return data;
  }, [contracts, statusFilter]);

  const activeCount = useMemo(() => filteredContracts.filter((c) => c.status === "ACTIVE").length, [filteredContracts]);
  const endedCount = useMemo(() => filteredContracts.filter((c) => c.status === "ENDED").length, [filteredContracts]);
  const canceledCount = useMemo(() => filteredContracts.filter((c) => c.status === "CANCELED").length, [filteredContracts]);

  const openDetail = (contract: Contract) => {
    setSelectedContract(contract);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedContract(null);
  };

  const columns: ColumnsType<Contract> = [
    {
      title: "Mã hợp đồng",
      dataIndex: "_id",
      key: "_id",
      width: 160,
      render: (v: string, record: Contract) => (
        <b style={{ cursor: "pointer" }} onClick={() => openDetail(record)}>
          {v.substring(0, 8)}...
        </b>
      ),
    },
    {
      title: "Người thuê",
      dataIndex: "tenantId",
      key: "tenantId",
      render: (v: string | Tenant) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{getTenantName(v)}</span>
      ),
    },
    {
      title: "Phòng",
      dataIndex: "roomId",
      key: "roomId",
      render: (v: string | Room) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{getRoomNumber(v)}</span>
      ),
    },
    {
      title: "Bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Cọc (VNĐ)",
      dataIndex: "deposit",
      key: "deposit",
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
      title: "Tiền thuê (VNĐ)",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        { text: "Đang hiệu lực", value: "ACTIVE" },
        { text: "Đã kết thúc", value: "ENDED" },
        { text: "Đã hủy", value: "CANCELED" },
      ],
      onFilter: (val, record) => record.status === val,
      render: (s: Contract["status"]) => {
        const map: Record<string, { color: string; text: string }> = {
          ACTIVE: { color: "green", text: "Đang hiệu lực" },
          ENDED: { color: "default", text: "Đã kết thúc" },
          CANCELED: { color: "red", text: "Đã hủy" },
        };
        const m = map[s] || { color: "blue", text: s };
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
    {
      title: "",
      key: "actions",
      align: "center",
      width: 120,
      render: (_: any, record: Contract) => (
        <Space>
          <Tooltip title="Sửa">
            <Button shape="circle" type="primary" icon={<EditOutlined />} onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm title="Xóa hợp đồng này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(record._id)}>
              <Button shape="circle" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
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
              <FileTextOutlined style={{ color: "#1890ff", fontSize: 28 }} /> Quản lý Hợp đồng
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => openModal()}
            >
              Thêm hợp đồng
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
            }} onClick={() => setStatusFilter("ACTIVE")}>
              <FileTextOutlined style={{ fontSize: 28, color: "#52c41a", marginBottom: 8 }} />
              <Statistic title="Đang hiệu lực" value={activeCount} valueStyle={{ color: "#52c41a", fontWeight: 600 }} />
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
            }} onClick={() => setStatusFilter("ENDED")}>
              <FileTextOutlined style={{ fontSize: 28, color: "#8c8c8c", marginBottom: 8 }} />
              <Statistic title="Đã kết thúc" value={endedCount} valueStyle={{ color: "#8c8c8c", fontWeight: 600 }} />
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
            }} onClick={() => setStatusFilter("CANCELED")}>
              <FileTextOutlined style={{ fontSize: 28, color: "#ff4d4f", marginBottom: 8 }} />
              <Statistic title="Đã hủy" value={canceledCount} valueStyle={{ color: "#ff4d4f", fontWeight: 600 }} />
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
              <span style={{ fontWeight: 600, marginBottom: 8 }}>Trạng thái:</span>
              {["ACTIVE", "ENDED", "CANCELED"].map((status) => (
                <Tag
                  key={status}
                  color={statusFilter === status ? "blue" : "default"}
                  onClick={() => setStatusFilter(status)}
                  style={{ cursor: "pointer", marginBottom: 6 }}
                >
                  {status === "ACTIVE" ? "Đang hiệu lực" :
                   status === "ENDED" ? "Đã kết thúc" : "Đã hủy"}
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
        <Table<Contract>
          columns={columns}
          dataSource={filteredContracts}
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
        title={editing ? "Chỉnh sửa hợp đồng" : "Thêm hợp đồng"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
        width={640}
        centered
        okButtonProps={{ style: { background: "#1890ff", borderColor: "#1890ff" } }}
      >
        <Form<ContractFormValues> form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Người thuê" name="tenantId" rules={[{ required: true, message: "Chọn người thuê" }]}>
                <Select
                  showSearch
                  placeholder="Chọn người thuê"
                  optionFilterProp="children"
                  filterOption={(input, option: any) => {
                    const children = option?.children;
                    if (children && typeof children === 'string') {
                      return children.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
                  {tenants.map((tenant) => (
                    <Option key={tenant._id} value={tenant._id}>
                      {tenant.fullName} {tenant.email ? `- ${tenant.email}` : ""}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Phòng" name="roomId" rules={[{ required: true, message: "Chọn phòng" }]}>
                <Select
                  showSearch
                  placeholder="Chọn phòng"
                  onChange={(roomId) => {
                    const room = rooms.find(r => r._id === roomId);
                    if (room && room.pricePerMonth) {
                      form.setFieldValue('monthlyRent', Number(room.pricePerMonth));
                    }
                  }}
                  optionFilterProp="children"
                  filterOption={(input, option: any) => {
                    const children = option?.children;
                    if (children && typeof children === 'string') {
                      return children.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
                  {rooms.map((room) => (
                    <Option key={room._id} value={room._id}>
                      {room.roomNumber} - {room.type} - {Number(room.pricePerMonth || 0).toLocaleString("vi-VN")}₫
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ngày bắt đầu" name="startDate" rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}>
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ngày kết thúc" name="endDate" rules={[{ required: true, message: "Chọn ngày kết thúc" }]}>
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tiền cọc (VNĐ)" name="deposit" rules={[{ required: true, message: "Nhập tiền cọc" }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tiền thuê/tháng (VNĐ)" name="monthlyRent" rules={[{ required: true, message: "Nhập tiền thuê" }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Trạng thái" name="status" initialValue="ACTIVE" rules={[{ required: true }]}>
                <Select>
                  <Option value="ACTIVE">Đang hiệu lực</Option>
                  <Option value="ENDED">Đã kết thúc</Option>
                  <Option value="CANCELED">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Drawer: Detail view */}
      <ContractDetailDrawer
        open={detailVisible}
        onClose={closeDetail}
        contract={selectedContract}
        tenants={tenants}
        rooms={rooms}
      />
    </div>
  );
};

export default ContractsAD;

