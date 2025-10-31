import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Typography,
  Avatar,
  Statistic,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { adminRoomService } from "../services/room";
import type { Room } from "../../../types/room";
import "../../../assets/styles/roomAd.css";
import RoomDetailDrawer from "../components/RoomDetailDrawer";
import { isAdmin } from "../../../utils/roleChecker";

const { Title } = Typography;
const { Option } = Select;

const RoomsAD: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();

  const [filterType, setFilterType] = useState<Room["type"] | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<Room["status"] | "ALL">("ALL");

  // Image upload & preview
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [existingImages, setExistingImages] = useState<{ url: string; publicId?: string; keep?: boolean }[]>([]);

  // Drawer detail
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files).filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    setSelectedFiles(filesArray);

    // Preview chỉ show ảnh mới
    const urls = filesArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls); // ko còn ghép ảnh cũ nữa
  };

  useEffect(() => {
    fetchRooms();
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await adminRoomService.getAll();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách phòng!");
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (key !== "images") formData.append(key, (values as any)[key]);
      });

      // chỉ gửi ảnh cũ được giữ
      existingImages.filter((img) => img.keep).forEach((img) => {
        if (img.url) formData.append("images", img.url);
      });

      // thêm ảnh mới
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (editingRoom) {
        await adminRoomService.update(editingRoom._id!, formData);
        message.success("Cập nhật phòng thành công!");
      } else {
        await adminRoomService.create(formData);
        message.success("Thêm phòng thành công!");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingRoom(null);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setExistingImages([]);
      fetchRooms();
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra!");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    form.resetFields();
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const onEdit = (room: Room) => {
    setEditingRoom(room);
    form.setFieldsValue({
      roomNumber: room.roomNumber,
      type: room.type,
      pricePerMonth: room.pricePerMonth,
      areaM2: room.areaM2,
      status: room.status,
      floor: room.floor,
      district: room.district,
    });
    setIsModalOpen(true);

    // load ảnh cũ
    if (room.images?.length) {
      const imgs = room.images.map((img) =>
        typeof img === "string" ? { url: img, keep: true } : { ...(img as any), keep: true }
      );
      setExistingImages(imgs);
    } else {
      setExistingImages([]);
    }

    setSelectedFiles([]); // reset ảnh mới
    setPreviewUrls([]);   // reset preview ảnh mới
  };

  const onDelete = (room: Room) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa phòng ${room.roomNumber}?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await adminRoomService.remove(room._id!);
          message.success("Xóa phòng thành công!");
          fetchRooms();
        } catch (error) {
          message.error("Xóa phòng thất bại!");
        }
      },
    });
  };

  // Thống kê
  const availableCount = useMemo(() => rooms.filter((r) => r.status === "AVAILABLE").length, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const statusMatch = filterStatus === "ALL" || r.status === filterStatus;
      const typeMatch = filterType === "ALL" || r.type === filterType;
      return statusMatch && typeMatch;
    });
  }, [rooms, filterStatus, filterType]);

  const openDetail = (room: Room) => {
    setSelectedRoomId(room._id || null);
    setDetailVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (imageUrl: string, record: Room) => {
        // Ưu tiên image, sau đó lấy ảnh đầu tiên từ images array
        const displayImage = imageUrl || (record.images && record.images.length > 0 ? record.images[0] : null);

        return displayImage ? (
          <Avatar
            shape="square"
            size={64}
            src={displayImage}
            className="avatar-hover"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e?.stopPropagation();
              openDetail(record);
            }}
          />
        ) : (
          <Avatar
            shape="square"
            size={64}
            style={{ backgroundColor: "#f0f0f0", cursor: "pointer" }}
            onClick={() => openDetail(record)}
          >
            <ApartmentOutlined style={{ fontSize: 24, color: "#999" }} />
          </Avatar>
        );
      },
    },
    {
      title: "Số phòng",
      dataIndex: "roomNumber",
      key: "roomNumber",
      render: (text: string, record: Room) => (
        <b style={{ cursor: "pointer" }} onClick={() => openDetail(record)}>
          {text}
        </b>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: Room["type"]) => {
        const colors: Record<string, string> = {
          SINGLE: "linear-gradient(90deg,#95de64,#73d13d)",
          DOUBLE: "linear-gradient(90deg,#69c0ff,#40a9ff)",
          DORM: "linear-gradient(90deg,#ffd666,#ffa940)",
          STUDIO: "linear-gradient(90deg,#9254de,#722ed1)",
          VIP: "linear-gradient(90deg,#ff4d4f,#cf1322)",
        };
        return (
          <Tag
            style={{
              fontWeight: 600,
              borderRadius: 12,
              backgroundImage: colors[type],
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.3s",
            }}
            className="tag-hover"
          >
            {type}
          </Tag>
        );
      },
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "pricePerMonth",
      key: "pricePerMonth",
      render: (price: number) => <span style={{ color: "#1890ff", fontWeight: 600 }}>{price?.toLocaleString()}</span>,
    },
    {
      title: "Diện tích (m²)",
      dataIndex: "areaM2",
      key: "areaM2",
      render: (area: number) => <span>{area} m²</span>,
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      render: (status: Room["status"]) => {
        const colors: Record<string, string> = {
          AVAILABLE: "#52c41a",
          OCCUPIED: "#fa8c16",
          MAINTENANCE: "#8c8c8c",
        };
        const labels: Record<string, string> = {
          AVAILABLE: "Còn trống",
          OCCUPIED: "Đang thuê",
          MAINTENANCE: "Bảo trì",
        };
        return (
          <Tag
            style={{
              fontWeight: 600,
              borderRadius: 12,
              color: "#fff",
              backgroundColor: colors[status],
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              transition: "all 0.3s",
            }}
            className="tag-hover"
          >
            {labels[status]}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Room) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            shape="circle"
            onClick={(e) => {
              e?.stopPropagation();
              onEdit(record);
            }}
            className="btn-hover"
          />
          {isAdmin() && (
            <Tooltip title="Xóa">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                shape="circle"
                onClick={(e) => {
                  e?.stopPropagation();
                  onDelete(record);
                }}
                className="btn-hover"
              />
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
        <Row justify="space-between" align="middle" className="header-animate" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <ApartmentOutlined style={{ color: "#1890ff", fontSize: 28 }} /> Quản lý Phòng
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => {
                form.resetFields();
                setSelectedFiles([]);
                setPreviewUrls([]);
                setEditingRoom(null);
                setIsModalOpen(true);
              }}
              className="btn-hover-gradient"
            >
              Thêm phòng
            </Button>
          </Col>
        </Row>

        {/* Statistic */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card" onClick={() => setFilterStatus("AVAILABLE")}>
              <ApartmentOutlined style={{ fontSize: 28, color: "#52c41a", marginBottom: 8 }} />
              <Statistic title="Còn trống" value={availableCount} valueStyle={{ color: "#52c41a", fontWeight: 600 }} />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card" onClick={() => setFilterStatus("OCCUPIED")}>
              <ApartmentOutlined style={{ fontSize: 28, color: "#fa8c16", marginBottom: 8 }} />
              <Statistic
                title="Đang thuê"
                value={rooms.filter((r) => r.status === "OCCUPIED").length}
                valueStyle={{ color: "#fa8c16", fontWeight: 600 }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card" onClick={() => setFilterStatus("MAINTENANCE")}>
              <ApartmentOutlined style={{ fontSize: 28, color: "#8c8c8c", marginBottom: 8 }} />
              <Statistic
                title="Bảo trì"
                value={rooms.filter((r) => r.status === "MAINTENANCE").length}
                valueStyle={{ color: "#8c8c8c", fontWeight: 600 }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="filter-card filter-card-column">
              <span style={{ fontWeight: 600, marginBottom: 8 }}>Loại phòng:</span>
              {["SINGLE", "DOUBLE"].map((type) => (
                <Tag
                  key={type}
                  color={filterType === type ? "blue" : "default"}
                  onClick={() => setFilterType(type as Room["type"])}
                  style={{ cursor: "pointer", marginBottom: 6 }}
                >
                  {type}
                </Tag>
              ))}
              <Tag
                color={filterType === "ALL" ? "blue" : "default"}
                onClick={() => {
                  setFilterType("ALL");
                  setFilterStatus("ALL");
                }}
                style={{ cursor: "pointer", marginBottom: 6 }}
              >
                Tất cả
              </Tag>
            </div>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredRooms}
          rowKey={(r) => r._id?.toString() || Math.random().toString()}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: [5, 8, 10, 20] }}
          size="middle"
          rowClassName={() => "hover-row"}
          onRow={(record) => ({
            onClick: () => openDetail(record),
          })}
        />
      </div>

      {/* Modal (Add/Edit) */}
      <Modal
        title={editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
        centered
        okButtonProps={{ style: { background: "#1890ff", borderColor: "#1890ff" } }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Số phòng" name="roomNumber" rules={[{ required: true, message: "Nhập số phòng!" }]}>
                <Input placeholder="VD: 101" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Loại phòng" name="type" rules={[{ required: true, message: "Chọn loại phòng!" }]}>
                <Select placeholder="Chọn loại">
                  <Option value="SINGLE">SINGLE</Option>
                  <Option value="DOUBLE">DOUBLE</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Giá (VNĐ)" name="pricePerMonth" rules={[{ required: true, message: "Nhập giá phòng!" }]}>
                <InputNumber
                  placeholder="VD: 5.000.000"
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value: any) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Diện tích (m²)" name="areaM2" rules={[{ required: true, message: "Nhập diện tích!" }]}>
                <InputNumber placeholder="VD: 20" style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Tình trạng" name="status" rules={[{ required: true, message: "Chọn tình trạng!" }]}>
                <Select placeholder="Chọn tình trạng">
                  <Option value="AVAILABLE">Còn trống</Option>
                  <Option value="OCCUPIED">Đang thuê</Option>
                  <Option value="MAINTENANCE">Bảo trì</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tầng" name="floor">
                <InputNumber placeholder="VD: 1" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Quận" name="district">
            <Input placeholder="VD: Quận 1" />
          </Form.Item>

          <Form.Item label="Ảnh phòng">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {existingImages.map((img, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  <img
                    src={img.url}
                    alt={`old-${idx}`}
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, opacity: img.keep ? 1 : 0.4 }}
                  />
                  <Button
                    size="small"
                    danger
                    style={{ position: "absolute", top: 2, right: 2 }}
                    onClick={() => {
                      setExistingImages((prev) =>
                        prev.map((e, i) => (i === idx ? { ...e, keep: !e.keep } : e))
                      );
                    }}
                  >
                    {img.keep ? "X" : "↺"}
                  </Button>
                </div>
              ))}
              {previewUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`new-${idx}`}
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                />
              ))}
            </div>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer: Detail view */}
      <RoomDetailDrawer
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        roomId={selectedRoomId}
      />
    </div>
  );
};

export default RoomsAD;
