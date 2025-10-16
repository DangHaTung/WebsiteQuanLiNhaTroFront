import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Typography,
  Space,
  Tag,
  Tooltip,
  Card,
  Row,
  Col,
  Statistic,
  Popover,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import type { Room } from "../../../types/room";
import dbData from "../../../../db.json";

const { Title } = Typography;
const { Option } = Select;

const RoomsAD: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [priceOpen, setPriceOpen] = useState(false);
  const [tempMin, setTempMin] = useState<number>(0);
  const [tempMax, setTempMax] = useState<number>(10000000);

  useEffect(() => {
    const roomsData: Room[] = (dbData as any).rooms.map((r: any) => ({
      ...r,
      pricePerMonth: Number(r.pricePerMonth),
    }));
    setRooms(roomsData);
    setLoading(false);
  }, []);

  const openModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      form.setFieldsValue(room);
    } else {
      setEditingRoom(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRoom) {
        const updated = rooms.map((r) =>
          r._id === editingRoom._id ? { ...r, ...values } : r
        );
        setRooms(updated);
        message.success("Cập nhật phòng thành công!");
      } else {
        const newRoom = {
          _id: Date.now().toString(),
          ...values,
          createdAt: new Date().toISOString(),
        };
        setRooms([...rooms, newRoom]);
        message.success("Thêm phòng mới thành công!");
      }
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    setRooms((prev) => prev.filter((r) => r._id !== id));
    message.success("Đã xóa phòng!");
  };

  const filteredRooms = useMemo(() => {
    let data = [...rooms];
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      data = data.filter(
        (r) =>
          (r.roomNumber || "").toLowerCase().includes(k) ||
          (r.district || "").toLowerCase().includes(k) ||
          (r.type || "").toLowerCase().includes(k)
      );
    }
    if (statusFilter) data = data.filter((r) => r.status === statusFilter);
    if (typeFilter) data = data.filter((r) => r.type === typeFilter);
    if (priceRange) {
      const [min, max] = priceRange;
      data = data.filter((r) => {
        const p = Number(r.pricePerMonth || 0);
        return p >= min && p <= max;
      });
    }
    return data;
  }, [rooms, keyword, statusFilter, typeFilter, priceRange]);

  const total = filteredRooms.length;
  const availableCount = useMemo(() => filteredRooms.filter((r) => r.status === "AVAILABLE").length, [filteredRooms]);

  const formatVND = (n: number) => `${Number(n || 0).toLocaleString("vi-VN")}₫`;

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      align: "center" as const,
      render: (img: string) => (
        <img
          src={img || "/no-image.jpg"}
          alt="room"
          style={{
            width: 80,
            height: 60,
            objectFit: "cover",
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        />
      ),
    },
    {
      title: "Số phòng",
      dataIndex: "roomNumber",
      key: "roomNumber",
      sorter: (a: any, b: any) => a.roomNumber.localeCompare(b.roomNumber),
      render: (num: string) => (
        <Tag color="blue" style={{ fontWeight: 500, whiteSpace: "normal", wordBreak: "break-word" }}>
          {num}
        </Tag>
      ),
    },
    {
      title: "Loại phòng",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const map: Record<string, string> = {
          SINGLE: "Phòng đơn",
          DOUBLE: "Phòng đôi",
          STUDIO: "Studio",
          VIP: "VIP",
        };
        return map[type] || type;
      },
    },
    {
      title: "Giá thuê (VNĐ)",
      dataIndex: "pricePerMonth",
      key: "pricePerMonth",
      align: "right" as const,
      render: (v: number) => (
        <span style={{ fontWeight: 500 }}>
          {v.toLocaleString("vi-VN")}₫
        </span>
      ),
    },
    {
      title: "Diện tích (m²)",
      dataIndex: "areaM2",
      key: "areaM2",
      align: "center" as const,
      render: (v: number) => (v ? `${v} m²` : "-"),
    },
    {
      title: "Tầng",
      dataIndex: "floor",
      key: "floor",
      align: "center" as const,
    },
    {
      title: "Khu vực",
      dataIndex: "district",
      key: "district",
      render: (v: string) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{v}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => {
        const color =
          status === "AVAILABLE"
            ? "green"
            : status === "OCCUPIED"
            ? "red"
            : "orange";
        const text =
          status === "AVAILABLE"
            ? "Còn trống"
            : status === "OCCUPIED"
            ? "Đã thuê"
            : "Bảo trì";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "",
      key: "actions",
      align: "center" as const,
      width: 100,
      render: (_: any, record: Room) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              type="primary"
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc muốn xóa phòng này?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button
                icon={<DeleteOutlined />}
                shape="circle"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f9fafc", minHeight: "100vh" }}>
      <Card
        bordered={false}
        style={{
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title
            level={3}
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <HomeOutlined /> Quản lý phòng trọ
          </Title>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            Thêm phòng
          </Button>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Input.Search
              placeholder="Tìm theo số phòng/khu vực/loại"
              allowClear
              onSearch={setKeyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              allowClear
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={[
                { label: "Còn trống", value: "AVAILABLE" },
                { label: "Đã thuê", value: "OCCUPIED" },
                { label: "Bảo trì", value: "MAINTENANCE" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              allowClear
              placeholder="Loại phòng"
              style={{ width: "100%" }}
              value={typeFilter}
              onChange={(v) => setTypeFilter(v)}
              options={[
                { label: "Phòng đơn", value: "SINGLE" },
                { label: "Phòng đôi", value: "DOUBLE" },
                { label: "Studio", value: "STUDIO" },
                { label: "VIP", value: "VIP" },
                { label: "Dorm", value: "DORM" },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <div>
              <Popover
                open={priceOpen}
                onOpenChange={(v) => setPriceOpen(v)}
                trigger="click"
                content={
                  <div style={{ width: 260 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <InputNumber
                        min={0}
                        value={tempMin}
                        onChange={(v) => setTempMin(Number(v))}
                        style={{ width: "50%" }}
                        placeholder="Từ"
                      />
                      <InputNumber
                        min={0}
                        value={tempMax}
                        onChange={(v) => setTempMax(Number(v))}
                        style={{ width: "50%" }}
                        placeholder="Đến"
                      />
                    </div>
                    <Divider style={{ margin: "8px 0" }} />
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Button
                        onClick={() => {
                          setPriceRange(null);
                          setTempMin(0);
                          setTempMax(10000000);
                          setPriceOpen(false);
                        }}
                      >
                        Xóa
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          setPriceRange([tempMin, tempMax]);
                          setPriceOpen(false);
                        }}
                      >
                        Áp dụng
                      </Button>
                    </Space>
                  </div>
                }
              >
                <Button style={{ width: "100%" }}>
                  {priceRange ? `Giá: ${formatVND(priceRange[0])} - ${formatVND(priceRange[1])}` : "Chọn khoảng giá"}
                </Button>
              </Popover>
            </div>
          </Col>
          <Col xs={24} sm={24} md={24} lg={4}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Tổng phòng" value={total} />
              </Col>
              <Col span={12}>
                <Statistic title="Còn trống" value={availableCount} valueStyle={{ color: "#52c41a" }} />
              </Col>
            </Row>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRooms}
          rowKey="_id"
          loading={loading}
          bordered={false}
          pagination={{ pageSize: 6, showSizeChanger: true, pageSizeOptions: [6, 10, 20] }}
          size="middle"
          style={{ background: "white", borderRadius: 8 }}
        />
      </Card>

      <Modal
        title={editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
        centered
        style={{ borderRadius: 10 }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Số phòng"
                name="roomNumber"
                rules={[{ required: true, message: "Vui lòng nhập số phòng" }]}
              >
                <Input placeholder="VD: A101" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Loại phòng"
                name="type"
                rules={[{ required: true, message: "Chọn loại phòng" }]}
              >
                <Select placeholder="Chọn loại phòng">
                  <Option value="SINGLE">Phòng đơn</Option>
                  <Option value="DOUBLE">Phòng đôi</Option>
                  <Option value="STUDIO">Studio</Option>
                  <Option value="VIP">VIP</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Giá thuê (VNĐ/tháng)"
                name="pricePerMonth"
                rules={[{ required: true, message: "Nhập giá thuê" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Nhập giá thuê"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Diện tích (m²)" name="areaM2">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tầng" name="floor">
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Khu vực / Quận" name="district">
                <Input placeholder="VD: Quận 1" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Trạng thái" name="status" initialValue="AVAILABLE">
                <Select>
                  <Option value="AVAILABLE">Còn trống</Option>
                  <Option value="OCCUPIED">Đã thuê</Option>
                  <Option value="MAINTENANCE">Bảo trì</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ảnh phòng (URL)" name="image">
                <Input placeholder="Nhập đường dẫn ảnh" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
;

export default RoomsAD;
