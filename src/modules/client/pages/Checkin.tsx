import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Button, Card, Typography, Select, DatePicker, Row, Col, Divider, Space, message, Radio, Avatar, Tag, Alert, Descriptions, Checkbox } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined, CheckCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import "../../../assets/styles/checkin.css";

import type { Room } from "../../../types/room";
import { getRoomById, getAllRooms } from "../services/room";
import type { CheckinFormData } from "../../../types/bill";
import { clientAuthService } from "../services/auth";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Checkin: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams<{ roomId: string }>();

  const depositValue = Form.useWatch("deposit", form) || 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Lấy tất cả phòng
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const rooms = await getAllRooms();
        const available = rooms.filter((r) => r.status === "AVAILABLE");
        setAvailableRooms(available);

        if (urlRoomId) {
          const room = await getRoomById(urlRoomId);
          if (room) {
            setSelectedRoom(room);
            form.setFieldsValue({
              roomId: String(room._id),
              deposit: room.pricePerMonth,
            });
          } else {
            message.error("Không tìm thấy phòng với ID này");
          }
        } else if (available.length > 0) {
          setSelectedRoom(available[0]);
          form.setFieldsValue({
            roomId: String(available[0]._id),
            deposit: available[0].pricePerMonth,
          });
        }
      } catch (error) {
        console.error(error);
        message.error("Không thể tải danh sách phòng");
      }
    };
    fetchRooms();
  }, [form, urlRoomId]);

  useEffect(() => {
    const currentUser = clientAuthService.getCurrentUser();
    if (currentUser) {
      form.setFieldsValue({
        fullName: currentUser.username,
        email: currentUser.email,
        // phone: currentUser.phone
      });
    }
  }, [form]);

  const handleRoomChange = async (roomId: string) => {
    try {
      const room = await getRoomById(roomId);
      setSelectedRoom(room);
      form.setFieldsValue({
        deposit: room.pricePerMonth,
      });
    } catch (error) {
      message.error("Không tìm thấy phòng");
    }
  };

  const handleProceedToContract = () => {
    if (selectedRoom) navigate(`/contracts/${String(selectedRoom._id)}`);
  };

  const onFinish = async (values: CheckinFormData) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Checkin form values:", values);

      form.resetFields();
      setSelectedRoom(null);
      setAcceptedTerms(false);

      message.success(
        "Đăng ký check-in thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất."
      );
    } catch (error) {
      message.error(
        "Có lỗi xảy ra khi đăng ký check-in. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ color: "#1890ff", marginBottom: 8 }}>
            Đăng Ký Check-in Phòng Trọ
          </Title>
          <Paragraph type="secondary">
            Điền thông tin bên dưới để đăng ký check-in phòng trọ bạn quan tâm
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {/* Form đăng ký */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  Thông Tin Cá Nhân
                </Space>
              }
              className="checkin-card"
              style={{ borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  duration: 6,
                  paymentMethod: "BANK",
                }}
              >
                {/* Họ và Tên */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Họ và Tên"
                      name="fullName"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ và tên!" },
                        { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Nhập họ và tên đầy đủ"
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  {/* Số điện thoại */}
                  <Col span={12}>
                    <Form.Item
                      label="Số Điện Thoại"
                      name="phone"
                      rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại!" },
                        { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ!" },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Nhập số điện thoại"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Email */}
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập địa chỉ email"
                    size="large"
                  />
                </Form.Item>

                {/* CMND/CCCD */}
                <Form.Item
                  label="Số CMND/CCCD"
                  name="idCard"
                  rules={[
                    { required: true, message: "Vui lòng nhập số CMND/CCCD!" },
                    { pattern: /^[0-9]{9,12}$/, message: "Số CMND/CCCD không hợp lệ!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập số chứng minh nhân dân hoặc căn cước công dân"
                    size="large"
                  />
                </Form.Item>

                {/* Người liên hệ khẩn cấp */}
                <Form.Item
                  label="Người Liên Hệ Khẩn Cấp"
                  name="emergencyContact"
                  rules={[{ required: true, message: "Vui lòng nhập thông tin liên hệ khẩn cấp!" }]}
                >
                  <Input
                    placeholder="Tên và số điện thoại người liên hệ khẩn cấp"
                    size="large"
                  />
                </Form.Item>

                <Divider>Thông Tin Thuê Phòng</Divider>

                {/* Chọn phòng */}
                <Form.Item
                  label="Chọn Phòng"
                  name="roomId"
                  rules={[{ required: true, message: "Vui lòng chọn phòng!" }]}
                >
                  {urlRoomId ? (
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "#f5f5f5",
                        borderRadius: 6,
                        border: "1px solid #d9d9d9",
                      }}
                    >
                      <Text strong>
                        Đã chọn: Phòng {selectedRoom?.roomNumber} - {selectedRoom?.type} -{" "}
                        {selectedRoom?.pricePerMonth !== undefined
                          ? new Intl.NumberFormat("vi-VN").format(selectedRoom.pricePerMonth)
                          : "0"}₫/tháng
                      </Text>
                    </div>
                  ) : (
                    <Select
                      placeholder="Chọn phòng muốn thuê"
                      size="large"
                      onChange={handleRoomChange}
                    >
                      {availableRooms.map((room) => (
                        <Option key={room._id} value={room._id}>
                          Phòng {room.roomNumber} - {room.type} -{" "}
                          {new Intl.NumberFormat("vi-VN").format(room.pricePerMonth)}₫/tháng
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>

                {/* Ngày check-in + Thời gian thuê */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Ngày Check-in"
                      name="checkinDate"
                      rules={[{ required: true, message: "Vui lòng chọn ngày check-in!" }]}
                    >
                      <DatePicker
                        placeholder="Chọn ngày nhận phòng"
                        size="large"
                        style={{ width: "100%" }}
                        disabledDate={(current) => current && current.isBefore(new Date(), "day")}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Thời Gian Thuê (tháng)"
                      name="duration"
                      rules={[{ required: true, message: "Vui lòng chọn thời gian thuê!" }]}
                    >
                      <Select size="large">
                        <Option value={6}>6 tháng</Option>
                        <Option value={12}>12 tháng</Option>
                        <Option value={24}>24 tháng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/* Tiền đặt cọc + Phương thức thanh toán */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Tiền Đặt Cọc" name="deposit">
                      <InputNumber
                        size="large"
                        disabled
                        addonBefore={<DollarOutlined />}
                        addonAfter="VNĐ"
                        precision={0}
                        style={{ width: "100%" }}
                        formatter={(value) => {
                          if (value === undefined || value === null || value === "") return "";
                          const numeric = Number(String(value).replace(/\D/g, ""));
                          return new Intl.NumberFormat("vi-VN").format(numeric);
                        }}
                        parser={(value) => (value ? Number(String(value).replace(/\D/g, "")) : 0)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Phương Thức Thanh Toán"
                      name="paymentMethod"
                      rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán!" }]}
                    >
                      <Radio.Group size="large">
                        <Radio value="CASH">Tiền mặt</Radio>
                        <Radio value="BANK">Chuyển khoản</Radio>
                        <Radio value="CARD">Thẻ tín dụng</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>

                {/* Ghi chú */}
                <Form.Item label="Ghi Chú Thêm" name="notes">
                  <Input.TextArea
                    rows={3}
                    placeholder="Ghi chú thêm về yêu cầu đặc biệt..."
                    size="large"
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Thông tin phòng */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <HomeOutlined />
                  Thông Tin Phòng
                </Space>
              }
              className="checkin-card room-info-card"
              style={{ borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
            >
              {selectedRoom ? (
                <>
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <Avatar
                      size={80}
                      src={selectedRoom.image}
                      shape="square"
                      style={{ borderRadius: 8, marginBottom: 12 }}
                    />
                    <Title level={4} style={{ margin: 0 }}>
                      Phòng {selectedRoom.roomNumber}
                    </Title>
                    <Tag color={selectedRoom.status === "AVAILABLE" ? "green" : "red"} style={{ marginTop: 4 }}>
                      {selectedRoom.status === "AVAILABLE" ? "Còn trống" : "Đã thuê"}
                    </Tag>
                  </div>

                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Loại phòng">
                      {selectedRoom.type === "SINGLE"
                        ? "Phòng đơn"
                        : selectedRoom.type === "DOUBLE"
                          ? "Phòng đôi"
                          : selectedRoom.type === "STUDIO"
                            ? "Studio"
                            : "VIP"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Diện tích">{selectedRoom.areaM2}m²</Descriptions.Item>
                    <Descriptions.Item label="Giá thuê">
                      <Text strong style={{ color: "#1890ff" }}>
                        {new Intl.NumberFormat("vi-VN").format(selectedRoom.pricePerMonth)} VNĐ/tháng
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tầng">{selectedRoom.floor}</Descriptions.Item>
                    <Descriptions.Item label="Khu vực">{selectedRoom.district}</Descriptions.Item>
                  </Descriptions>

                  <Divider>Tổng Chi Phí</Divider>

                  <div style={{ background: "#f6ffed", padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text>Tiền thuê :</Text>
                      <Text strong>
                        {selectedRoom?.pricePerMonth !== undefined
                          ? new Intl.NumberFormat("vi-VN").format(selectedRoom.pricePerMonth)
                          : "0"} VNĐ
                      </Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text>Tiền đặt cọc :</Text>
                      <Text strong>{new Intl.NumberFormat("vi-VN").format(Number(depositValue))} VNĐ</Text>
                    </div>
                    <Divider style={{ margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text strong>Tổng cộng:</Text>
                      <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                        {selectedRoom && !isNaN(depositValue)
                          ? new Intl.NumberFormat("vi-VN").format(selectedRoom.pricePerMonth + depositValue)
                          : "0"} VNĐ
                      </Text>
                    </div>
                  </div>

                  {/* Xác nhận + thanh toán */}
                  <div
                    style={{
                      padding: "16px",
                      background: "#fff7e6",
                      borderRadius: "8px",
                      border: "1px solid #ffd591",
                      marginTop: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                      <Checkbox checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                      <span>Tôi đã đọc kỹ hợp đồng và đồng ý với</span>
                      <Typography.Text
                        style={{ color: "#1890ff", textDecoration: "underline", cursor: "pointer" }}
                        onClick={handleProceedToContract}
                      >
                        ĐIỀU KHOẢN
                      </Typography.Text>
                    </div>

                    {acceptedTerms ? (
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        block
                        icon={<CheckCircleOutlined />}
                        className="btn-animated"
                        style={{ height: "48px", fontSize: "16px", border: "none", borderRadius: "8px" }}
                      >
                        {loading ? "Đang Xử Lý..." : "Thanh toán"}
                      </Button>
                    ) : (
                      <div style={{ textAlign: "center", padding: "8px 0", color: "#666", fontSize: "14px" }}>
                        ✓ Vui lòng xác nhận để tiếp tục thanh toán
                      </div>
                    )}
                  </div>

                  {/* Lưu ý quan trọng */}
                  <Alert
                    message="Lưu ý quan trọng"
                    description={
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>Thanh toán 50% tiền đặt cọc để giữ phòng</li>
                        <li>Thanh toán phần còn lại khi nhận phòng</li>
                        <li>Đọc kỹ hợp đồng trước khi ký</li>
                      </ul>
                    }
                    type="info"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                </>
              ) : (
                <div style={{ textAlign: "center", color: "#999" }}>
                  <HomeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <p>Chọn phòng để xem thông tin chi tiết</p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Checkin;
