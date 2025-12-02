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
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  ApartmentOutlined,
  SettingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import RoomFeesModal from "../components/RoomFeesModal";
import RoomUtilitiesModal from "../components/RoomUtilitiesModal";
import { adminRoomService } from "../services/room";
import type { Room } from "../../../types/room";
import "../../../assets/styles/roomAd.css";
import RoomDetailDrawer from "../components/RoomDetailDrawer";
import ExpandableSearch from "../components/ExpandableSearch";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;
const { Option } = Select;

const RoomsAD: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState<string>("");

  const [filterStatus, setFilterStatus] = useState<Room["status"] | "ALL">("ALL");

  // Image upload & preview
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [existingImages, setExistingImages] = useState<{ url: string; publicId?: string; keep?: boolean }[]>([]);
  const [removedImages, setRemovedImages] = useState<Array<{ url: string; publicId?: string }>>([]);

  // Room Fees Modal
  const [roomFeesModalVisible, setRoomFeesModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Room Utilities Modal
  const [roomUtilitiesModalVisible, setRoomUtilitiesModalVisible] = useState(false);
  const [selectedRoomForUtils, setSelectedRoomForUtils] = useState<Room | null>(null);

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

      // Khi edit room: LUÔN gửi existingImages (kể cả khi rỗng để xóa hết ảnh)
      if (editingRoom) {
        const imagesToKeep = existingImages.map(img => img.url);
        formData.append("existingImages", JSON.stringify(imagesToKeep));
      }

      // Gửi ảnh mới upload (backend sẽ thêm vào cuối danh sách)
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
      setRemovedImages([]);
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
    });
    setIsModalOpen(true);

    if (room.images?.length) {
      const imgs = room.images.map((img) =>
        typeof img === "string" ? { url: img } : { ...(img as any) }
      );
      setExistingImages(imgs);
    } else {
      setExistingImages([]);
    }

    setSelectedFiles([]);
    setPreviewUrls([]);
    setRemovedImages([]);
  };



  // Thống kê
  const availableCount = useMemo(() => rooms.filter((r) => r.status === "AVAILABLE").length, [rooms]);

  const filteredRooms = useMemo(() => {
    let data = [...rooms];

    // Filter theo trạng thái
    if (filterStatus && filterStatus !== "ALL") {
      data = data.filter((r) => r.status === filterStatus);
    }

    // Filter theo keyword
    if (keyword.trim() !== "") {
      const k = keyword.toLowerCase();
      data = data.filter((r) => {
        const roomNumber = r.roomNumber?.toString().toLowerCase() || "";
        const type = r.type?.toLowerCase() || "";
        return roomNumber.includes(k) || type.includes(k);
      });
    }

    return data;
  }, [rooms, filterStatus, keyword]);

  const openDetail = (room: Room) => {
    setSelectedRoomId(room._id || null);
    setDetailVisible(true);
  };

  // Table columns
  const columns: ColumnsType<Room> = [
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
      align: "center",
      filters: [
        { text: "Phòng đơn", value: "SINGLE" },
        { text: "Phòng đôi", value: "DOUBLE" },
      ],
      onFilter: (val: any, record: { type: any; }) => record.type === val,
      render: (type: Room["type"]) => {
        const colors: Record<string, string> = {
          SINGLE: "linear-gradient(90deg,#95de64,#73d13d)",
          DOUBLE: "linear-gradient(90deg,#69c0ff,#40a9ff)",
        };
        const textMap: Record<string, string> = {
          SINGLE: "Phòng đơn",
          DOUBLE: "Phòng đôi",
        };
        return (
          <Tag
            style={{
              fontWeight: 600,
              borderRadius: 12,
              backgroundImage: colors[type] || "linear-gradient(90deg,#d9d9d9,#bfbfbf)",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.3s",
            }}
          >
            {textMap[type] || type}
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
      render: (area: number) => <span>{area}</span>,
    },
    {
      title: "Số người ở",
      dataIndex: "occupantCount",
      key: "occupantCount",
      align: "center",
      render: (count: number) => (
        <Tag color={count > 0 ? "green" : "default"} style={{ fontWeight: 600 }}>
          {count || 0} người
        </Tag>
      ),
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        { text: "Còn trống", value: "AVAILABLE" },
        { text: "Đã được cọc", value: "DEPOSITED" },
        { text: "Đang thuê", value: "OCCUPIED" },
        { text: "Bảo trì", value: "MAINTENANCE" },
      ],
      onFilter: (val: any, record: Room) => record.status === val,
      render: (status: Room["status"]) => {
        const colors: Record<string, string> = {
          AVAILABLE: "#52c41a",
          DEPOSITED: "#ff4d4f",
          OCCUPIED: "#fa8c16",
          MAINTENANCE: "#8c8c8c",
        };
        const labels: Record<string, string> = {
          AVAILABLE: "Còn trống",
          DEPOSITED: "Đã được cọc",
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
          <Tooltip title="Đồ đạc">
            <Button
              icon={<AppstoreOutlined />}
              shape="circle"
              onClick={(e) => {
                e?.stopPropagation();
                setSelectedRoomForUtils(record);
                setRoomUtilitiesModalVisible(true);
              }}
              className="btn-hover"
              style={{ color: "#52c41a", borderColor: "#52c41a" }}
            />
          </Tooltip>
          <Tooltip title="Phí dịch vụ">
            <Button
              icon={<SettingOutlined />}
              shape="circle"
              onClick={(e) => {
                e?.stopPropagation();
                setSelectedRoom(record);
                setRoomFeesModalVisible(true);
              }}
              className="btn-hover"
            />
          </Tooltip>
          <Tooltip title="Sửa">
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
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
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
          <Col span={24}>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              {/* Search box */}
              <Col xs={24} sm={12} md={8}>
                <ExpandableSearch
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo số phòng, loại phòng"
                />
              </Col>

              {/* Thẻ thống kê trạng thái phòng */}
              <Col xs={24} sm={24} md={16}>
                <Row gutter={[16, 16]} justify="end">
                  {[
                    { title: "Còn trống", status: "AVAILABLE", color: "#52c41a" },
                    { title: "Đang thuê", status: "OCCUPIED", color: "#fa8c16" },
                    { title: "Bảo trì", status: "MAINTENANCE", color: "#8c8c8c" },
                  ].map((item, idx) => {
                    const count =
                      item.status === "AVAILABLE"
                        ? availableCount
                        : rooms.filter((r) => r.status === item.status).length;

                    return (
                      <Col xs={24} sm={12} md={7} key={idx}>
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
                          <ApartmentOutlined
                            style={{ fontSize: 24, color: item.color, marginBottom: 4 }}
                          />
                          <Statistic
                            title={item.title}
                            value={count}
                            valueStyle={{
                              color: item.color,
                              fontWeight: 600,
                              fontSize: 18,
                            }}
                          />
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Col>
            </Row>
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
              <Form.Item 
                label="Số phòng" 
                name="roomNumber" 
                rules={[
                  { required: true, message: "Nhập số phòng!" },
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve();
                      const trimmedValue = value.trim();
                      if (!trimmedValue) {
                        return Promise.reject(new Error("Số phòng không được để trống"));
                      }
                      // Kiểm tra trùng với các phòng khác (trừ phòng đang edit)
                      const duplicateRoom = rooms.find(
                        (room) => 
                          room.roomNumber?.trim().toLowerCase() === trimmedValue.toLowerCase() &&
                          (!editingRoom || room._id !== editingRoom._id)
                      );
                      if (duplicateRoom) {
                        return Promise.reject(new Error(`Số phòng "${trimmedValue}" đã tồn tại`));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
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
                  <Option value="DEPOSITED">Đã được cọc</Option>
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

        

          <Form.Item label="Ảnh phòng">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {/* Ảnh cũ */}
              {existingImages.map((img, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  <img
                    src={img.url}
                    alt={`old-${idx}`}
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                  />
                  <Button
                    size="small"
                    danger
                    style={{ position: "absolute", top: 2, right: 2 }}
                    onClick={() => {
                      setRemovedImages((prev) => [...prev, img]);
                      setExistingImages((prev) => prev.filter((_, i) => i !== idx));
                    }}
                  >
                    X
                  </Button>
                </div>
              ))}

              {/* Ảnh mới */}
              {previewUrls.map((url, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  <img
                    src={url}
                    alt={`new-${idx}`}
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                  />
                  <Button
                    size="small"
                    danger
                    style={{ position: "absolute", top: 2, right: 2 }}
                    onClick={() => {
                      setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
                      setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
                    }}
                  >
                    X
                  </Button>
                </div>
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

      {/* Room Utilities Modal */}
      <RoomUtilitiesModal
        visible={roomUtilitiesModalVisible}
        room={selectedRoomForUtils}
        onClose={() => {
          setRoomUtilitiesModalVisible(false);
          setSelectedRoomForUtils(null);
        }}
      />

      {/* Room Fees Modal */}
      <RoomFeesModal
        visible={roomFeesModalVisible}
        room={selectedRoom}
        onClose={() => {
          setRoomFeesModalVisible(false);
          setSelectedRoom(null);
        }}
        onSuccess={() => {
          // Thông báo đã được hiển thị trong RoomFeesModal, không cần hiển thị lại ở đây
        }}
      />
    </div>
  );
};

export default RoomsAD;
