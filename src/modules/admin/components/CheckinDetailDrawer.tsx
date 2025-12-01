import React from "react";
import { Drawer, Descriptions, Divider, Tag, Typography, Space, Image, Row, Col } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, UserOutlined, HomeOutlined, DollarOutlined, FileTextOutlined, IdcardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Checkin } from "../../../types/checkin";
import type { Room } from "../../../types/room";
import type { User } from "../../../types/user";

const { Title, Text } = Typography;

interface CheckinDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  checkin: Checkin | null;
  rooms: Room[];
  users: User[];
}

const CheckinDetailDrawer: React.FC<CheckinDetailDrawerProps> = ({
  open,
  onClose,
  checkin,
  rooms,
  users,
}) => {
  if (!checkin) return null;

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      CREATED: { color: "blue", text: "Đã tạo" },
      COMPLETED: { color: "green", text: "Hoàn thành" },
      CANCELED: { color: "red", text: "Đã hủy" },
    };
    const m = map[status] || { color: "default", text: status };
    return <Tag color={m.color}>{m.text}</Tag>;
  };

  const getReceiptBillStatusTag = (bill: any) => {
    if (!bill) return null;
    const status = bill.status || (typeof bill === 'object' && (bill as any).status);
    const map: Record<string, { color: string; text: string }> = {
      DRAFT: { color: "orange", text: "Nháp" },
      PAID: { color: "green", text: "Đã thanh toán" },
      UNPAID: { color: "red", text: "Chờ thanh toán" },
      PARTIALLY_PAID: { color: "orange", text: "Một phần" },
      VOID: { color: "default", text: "Đã hủy" },
      PENDING_CASH_CONFIRM: { color: "gold", text: "Chờ xác nhận tiền mặt" },
    };
    const m = map[status] || { color: "default", text: status || "N/A" };
    return <Tag color={m.color}>{m.text}</Tag>;
  };

  // Lấy thông tin phòng
  const room = typeof checkin.roomId === "object" 
    ? checkin.roomId 
    : rooms.find((r) => r._id === checkin.roomId);

  // Lấy thông tin người thuê
  const tenant = typeof checkin.tenantId === "object" 
    ? checkin.tenantId 
    : (checkin.tenantId ? users.find((u) => u._id === checkin.tenantId) : null);

  // Lấy thông tin staff
  const staff = typeof checkin.staffId === "object" 
    ? checkin.staffId 
    : users.find((u) => u._id === checkin.staffId);

  // Lấy thông tin receipt bill
  const receiptBill = typeof checkin.receiptBillId === "object" 
    ? checkin.receiptBillId 
    : null;

  // Tính ngày kết thúc
  const checkinDate = dayjs(checkin.checkinDate);
  const endDate = checkinDate.add(checkin.durationMonths, "month");

  // Convert Decimal128 to number
  const convertToNumber = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    if (value && typeof value === 'object' && '$numberDecimal' in value) {
      return parseFloat(value.$numberDecimal) || 0;
    }
    return 0;
  };

  const deposit = convertToNumber(checkin.deposit);
  const monthlyRent = convertToNumber(checkin.monthlyRent);

  // Lấy ảnh CCCD
  const cccdImages = (checkin as any).cccdImages || {};

  return (
    <Drawer
      title={
        <Space>
          <FileTextOutlined style={{ fontSize: 22, color: "#1677ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết Check-in
          </Title>
        </Space>
      }
      placement="right"
      width={700}
      onClose={onClose}
      open={open}
      styles={{
        header: { backgroundColor: "#f0f2f5", borderBottom: "1px solid #e8e8e8" },
        body: { backgroundColor: "#f9f9f9" },
      }}
    >
      <Descriptions
        bordered
        column={1}
        size="middle"
        styles={{
          label: { fontWeight: 600, background: "#fafafa", width: "200px" },
          content: { background: "#fff" },
        }}
      >
        <Descriptions.Item label="Mã Check-in">
          <Text code>{checkin._id.substring(0, 8)}...</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Phòng">
          <Space>
            <HomeOutlined />
            <Text strong>{room?.roomNumber || "N/A"}</Text>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Ngày Check-in">
          {checkinDate.format("DD/MM/YYYY")}
        </Descriptions.Item>

        <Descriptions.Item label="Thời hạn thuê">
          {checkin.durationMonths} tháng
        </Descriptions.Item>

        <Descriptions.Item label="Ngày kết thúc dự kiến">
          {endDate.format("DD/MM/YYYY")}
        </Descriptions.Item>

        <Descriptions.Item label="Cọc giữ phòng">
          <Text strong style={{ color: "#1677ff" }}>
            {deposit.toLocaleString("vi-VN")} VNĐ
          </Text>
        </Descriptions.Item>

        {receiptBill && (
          <>
            <Descriptions.Item label="Trạng thái">
              {getReceiptBillStatusTag(receiptBill)}
            </Descriptions.Item>

            {(receiptBill as any).status === "PAID" && checkin.receiptPaidAt && (
              <Descriptions.Item label="Ngày thanh toán">
                {dayjs(checkin.receiptPaidAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}
          </>
        )}
      </Descriptions>

      <Divider orientation="left">Thông tin người thuê</Divider>
      
      <Descriptions
        bordered
        column={1}
        size="middle"
        styles={{
          label: { fontWeight: 600, background: "#fafafa", width: "200px" },
          content: { background: "#fff" },
        }}
      >
        <Descriptions.Item label="Họ tên">
          <Space>
            <UserOutlined />
            <Text strong>
              {tenant?.fullName || checkin.tenantSnapshot?.fullName || "N/A"}
            </Text>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Số điện thoại">
          {tenant?.phone || checkin.tenantSnapshot?.phone || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Email">
          {tenant?.email || checkin.tenantSnapshot?.email || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="CMND/CCCD">
          <Space>
            <IdcardOutlined />
            {checkin.tenantSnapshot?.identityNo || "N/A"}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Địa chỉ">
          {checkin.tenantSnapshot?.address || tenant?.address || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Ghi chú">
          {checkin.tenantSnapshot?.note || checkin.notes || "Không có"}
        </Descriptions.Item>
      </Descriptions>

      {(cccdImages.front || cccdImages.back) && (
        <>
          <Divider orientation="left">Ảnh CMND/CCCD</Divider>
          <Row gutter={16}>
            {cccdImages.front && (
              <Col span={12}>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Mặt trước:
                </Text>
                <Image
                  src={cccdImages.front.url || cccdImages.front.secure_url || cccdImages.front}
                  alt="CCCD mặt trước"
                  style={{ width: "100%", borderRadius: 8 }}
                  preview
                />
              </Col>
            )}
            {cccdImages.back && (
              <Col span={12}>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Mặt sau:
                </Text>
                <Image
                  src={cccdImages.back.url || cccdImages.back.secure_url || cccdImages.back}
                  alt="CCCD mặt sau"
                  style={{ width: "100%", borderRadius: 8 }}
                  preview
                />
              </Col>
            )}
          </Row>
        </>
      )}

    </Drawer>
  );
};

export default CheckinDetailDrawer;

