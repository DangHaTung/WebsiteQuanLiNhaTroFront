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
import dayjs, { Dayjs } from "dayjs";
import dbData from "../../../../db.json";

const { Title } = Typography;
const { Option } = Select;

interface ContractFormValues {
  tenantId: string;
  roomId: string;
  startDate: Dayjs;
  endDate: Dayjs;
  deposit: number;
  monthlyRent: number;
  status: "ACTIVE" | "ENDED" | "PENDING";
}

const ContractsAD: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form] = Form.useForm<ContractFormValues>();
  const [keyword, setKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  useEffect(() => {
    const list: Contract[] = (dbData as any).contracts || [];
    setContracts(list);
    setLoading(false);
  }, []);

  const openModal = (record?: Contract) => {
    if (record) {
      setEditing(record);
      form.setFieldsValue({
        tenantId: record.tenantId,
        roomId: record.roomId,
        startDate: dayjs(record.startDate),
        endDate: dayjs(record.endDate),
        deposit: Number(record.deposit ?? 0),
        monthlyRent: Number(record.monthlyRent ?? 0),
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
      const payload: Contract = {
        _id: editing?._id || Date.now().toString(),
        tenantId: values.tenantId,
        roomId: values.roomId,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        deposit: String(values.deposit ?? "0"),
        monthlyRent: String(values.monthlyRent ?? "0"),
        status: values.status,
        createdAt: editing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editing) {
        setContracts((prev) => prev.map((c) => (c._id === editing._id ? { ...payload } : c)));
        message.success("Cập nhật hợp đồng thành công!");
      } else {
        setContracts((prev) => [...prev, payload]);
        message.success("Thêm hợp đồng thành công!");
      }
      closeModal();
    } catch (e) {
      // antd will show validation errors
    }
  };

  const handleDelete = (id: string) => {
    setContracts((prev) => prev.filter((c) => c._id !== id));
    message.success("Đã xóa hợp đồng!");
  };

  const filteredContracts = useMemo(() => {
    let data = [...contracts];
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      data = data.filter(
        (c) => c._id.toLowerCase().includes(k) || c.tenantId.toLowerCase().includes(k) || c.roomId.toLowerCase().includes(k)
      );
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
  }, [contracts, keyword, statusFilter, dateRange]);

  const total = filteredContracts.length;
  const activeCount = useMemo(() => filteredContracts.filter((c) => c.status === "ACTIVE").length, [filteredContracts]);
  const totalMonthly = useMemo(
    () => filteredContracts.reduce((sum, c) => sum + Number(c.monthlyRent || 0), 0),
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
      title: "Người thuê (tenantId)",
      dataIndex: "tenantId",
      key: "tenantId",
      render: (v: string) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{v}</span>
      ),
    },
    {
      title: "Phòng (roomId)",
      dataIndex: "roomId",
      key: "roomId",
      render: (v: string) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{v}</span>
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
      render: (v: string) => Number(v).toLocaleString("vi-VN"),
    },
    {
      title: "Tiền thuê (VNĐ)",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
      align: "right",
      render: (v: string) => Number(v).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        { text: "Đang hiệu lực", value: "ACTIVE" },
        { text: "Đã kết thúc", value: "ENDED" },
        { text: "Chờ", value: "PENDING" },
      ],
      onFilter: (val, record) => record.status === val,
      render: (s: Contract["status"]) => {
        const map: Record<string, { color: string; text: string }> = {
          ACTIVE: { color: "green", text: "Đang hiệu lực" },
          ENDED: { color: "default", text: "Đã kết thúc" },
          PENDING: { color: "orange", text: "Chờ" },
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
              placeholder="Tìm theo mã/tenantId/roomId"
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
                { label: "Chờ", value: "PENDING" },
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
              <Form.Item label="Người thuê (tenantId)" name="tenantId" rules={[{ required: true, message: "Nhập tenantId" }]}>
                <Input placeholder="tenant id" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Phòng (roomId)" name="roomId" rules={[{ required: true, message: "Nhập roomId" }]}>
                <Input placeholder="room id" />
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
                  <Option value="PENDING">Chờ</Option>
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
