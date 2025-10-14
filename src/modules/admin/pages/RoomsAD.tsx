import React, { useState, useEffect } from "react";
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
        <Tag color="blue" style={{ fontWeight: 500 }}>
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

        <Table
          columns={columns}
          dataSource={rooms}
          rowKey="_id"
          loading={loading}
          bordered={false}
          pagination={{ pageSize: 6 }}
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
          <Form.Item
            label="Số phòng"
            name="roomNumber"
            rules={[{ required: true, message: "Vui lòng nhập số phòng" }]}
          >
            <Input placeholder="VD: A101" />
          </Form.Item>

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

          <Form.Item
            label="Giá thuê (VNĐ/tháng)"
            name="pricePerMonth"
            rules={[{ required: true, message: "Nhập giá thuê" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập giá thuê"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as any}
            />
          </Form.Item>

          <Form.Item label="Diện tích (m²)" name="areaM2">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item label="Tầng" name="floor">
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item label="Khu vực / Quận" name="district">
            <Input placeholder="VD: Quận 1" />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status" initialValue="AVAILABLE">
            <Select>
              <Option value="AVAILABLE">Còn trống</Option>
              <Option value="OCCUPIED">Đã thuê</Option>
              <Option value="MAINTENANCE">Bảo trì</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ảnh phòng (URL)" name="image">
            <Input placeholder="Nhập đường dẫn ảnh" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomsAD;
