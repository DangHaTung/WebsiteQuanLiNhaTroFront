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
import type { Contract } from "../../../types/contract";
import type { Tenant } from "../../../types/tenant";
import type { Room } from "../../../types/room";
import dayjs, { Dayjs } from "dayjs";
import { adminContractService } from "../services/contract";
import { adminTenantService } from "../services/tenant";
import { adminRoomService } from "../services/room";

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
  const [keyword, setKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

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
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      data = data.filter((c) => {
        const id = c._id.toLowerCase();
        const tenantName = getTenantName(c.tenantId).toLowerCase();
        const roomNumber = getRoomNumber(c.roomId).toLowerCase();
        return id.includes(k) || tenantName.includes(k) || roomNumber.includes(k);
      });
    }
    if (statusFilter) {
      data = data.filter((c) => c.status === statusFilter);
    }
    if (dateRange) {
      const [start, end] = dateRange;
      data = data.filter((c) => {
        const s = dayjs(c.startDate);
        return s.isAfter(start.startOf("day")) && s.isBefore(end.endOf("day"));
      });
    }
    return data;
  }, [contracts, keyword, statusFilter, dateRange, tenants, rooms]);

  const total = filteredContracts.length;
  const activeCount = useMemo(() => filteredContracts.filter((c) => c.status === "ACTIVE").length, [filteredContracts]);
  const totalMonthly = useMemo(
    () => filteredContracts.reduce((sum, c) => {
      // Backend đã chuyển đổi Decimal128 sang number, chỉ cần kiểm tra NaN
      const rent = typeof c.monthlyRent === 'number' && !isNaN(c.monthlyRent) ? c.monthlyRent : 0;
      return sum + rent;
    }, 0),
    [filteredContracts]
  );

  const columns: ColumnsType<Contract> = [
    {
      title: "Mã hợp đồng",
      dataIndex: "_id",
      key: "_id",
      width: 160,
      render: (v: string) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{v}</span>
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
    <div style={{ padding: 24, background: "#f9fafc", minHeight: "100vh" }}>
      <Card bordered={false} style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>Quản lý hợp đồng</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} style={{ borderRadius: 6, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
            Thêm hợp đồng
          </Button>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="Tìm theo mã/tên người thuê/phòng"
              allowClear
              onSearch={setKeyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              allowClear
              placeholder="Lọc trạng thái"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={[
                { label: "Đang hiệu lực", value: "ACTIVE" },
                { label: "Đã kết thúc", value: "ENDED" },
                { label: "Đã hủy", value: "CANCELED" },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              onChange={(v) => setDateRange(v as any)}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={4}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Tổng HĐ" value={total} />
              </Col>
              <Col span={12}>
                <Statistic title="Đang hiệu lực" value={activeCount} valueStyle={{ color: "#52c41a" }} />
              </Col>
            </Row>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 12 }}>
          <Col span={24}>
            <Statistic title="Tổng tiền thuê/tháng (lọc)" value={totalMonthly} suffix="₫" valueRender={() => (
              <span style={{ fontWeight: 600 }}>{Number(totalMonthly).toLocaleString("vi-VN")}₫</span>
            )} />
          </Col>
        </Row>

        <Table<Contract>
          columns={columns}
          dataSource={filteredContracts}
          rowKey={(r) => r._id}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: [5, 8, 10, 20] }}
          size="middle"
          style={{ background: "white", borderRadius: 8 }}
        />
      </Card>

      <Modal
        title={editing ? "Chỉnh sửa hợp đồng" : "Thêm hợp đồng"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
        width={640}
        centered
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
    </div>
  );
};

export default ContractsAD;
