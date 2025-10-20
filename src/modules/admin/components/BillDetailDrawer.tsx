import React from "react";
import { Drawer, Descriptions, Divider, Tag, Typography, Table } from "antd";
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined,
  FileTextOutlined,
  DollarOutlined
} from "@ant-design/icons";
import type { Bill, BillStatus } from "../../../types/bill";
import type { Contract } from "../../../types/contract";
import type { Tenant } from "../../../types/tenant";
import type { Room } from "../../../types/room";
import dayjs from "dayjs";

interface BillDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  bill: Bill | null;
  contracts: Contract[];
  tenants: Tenant[];
  rooms: Room[];
}

const { Title, Text } = Typography;

const BillDetailDrawer: React.FC<BillDetailDrawerProps> = ({ open, onClose, bill, contracts, tenants, rooms }) => {
  if (!bill) return null;

  const statusConfig: Record<
    BillStatus,
    { color: string; label: string; icon: React.ReactNode }
  > = {
    PAID: {
      color: "#52c41a",
      label: "Đã thanh toán",
      icon: <CheckCircleOutlined />,
    },
    UNPAID: {
      color: "#ff4d4f",
      label: "Chưa thanh toán",
      icon: <ExclamationCircleOutlined />,
    },
    PARTIALLY_PAID: {
      color: "#fa8c16",
      label: "Thanh toán một phần",
      icon: <ClockCircleOutlined />,
    },
    VOID: {
      color: "#8c8c8c",
      label: "Đã hủy",
      icon: <ExclamationCircleOutlined />,
    },
  };

  const getContractInfo = (contractId: string | Contract): Contract | null => {
    if (typeof contractId === "object" && contractId?._id) {
      return contractId;
    }
    return contracts.find((c) => c._id === contractId) || null;
  };

  const getTenantInfo = (tenantId: string | Tenant): Tenant | null => {
    if (typeof tenantId === "object" && tenantId?._id) {
      return tenantId;
    }
    return tenants.find((t) => t._id === tenantId) || null;
  };

  const getRoomInfo = (roomId: string | Room): Room | null => {
    // Ưu tiên lấy từ rooms array để có đầy đủ thông tin
    if (typeof roomId === "object" && roomId?._id) {
      const fullRoomInfo = rooms.find((r) => r._id === roomId._id);
      return fullRoomInfo || roomId; // fallback về populated data nếu không tìm thấy
    }
    return rooms.find((r) => r._id === roomId) || null;
  };

  const contract = getContractInfo(bill.contractId);
  const tenant = contract ? getTenantInfo(contract.tenantId) : null;
  const room = contract ? getRoomInfo(contract.roomId) : null;

  const lineItemsColumns = [
    {
      title: "Đơn giá (₫)",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right" as const,
      render: (value: number) => {
        const amount = Number(value || 0);
        return isNaN(amount) ? "0" : amount.toLocaleString("vi-VN");
      },
    },
    {
      title: "Thành tiền (₫)",
      dataIndex: "lineTotal",
      key: "lineTotal",
      align: "right" as const,
      render: (value: number) => {
        const amount = Number(value || 0);
        return (
          <Text strong style={{ color: "#1677ff" }}>
            {isNaN(amount) ? "0" : amount.toLocaleString("vi-VN")}
          </Text>
        );
      },
    },
  ];

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileTextOutlined style={{ fontSize: 22, color: "#1677ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết hóa đơn {bill._id.substring(0, 8)}...
          </Title>
        </div>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      styles={{
        body: { backgroundColor: "#f9f9f9" },
        header: { backgroundColor: "#f0f2f5", borderBottom: "1px solid #e8e8e8" },
      }}
    >
      {/* Thông tin hóa đơn */}
      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, background: "#fafafa" }}
        contentStyle={{ background: "#fff" }}
      >
        <Descriptions.Item label="Mã hóa đơn">
          <Text code>{bill._id}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Hợp đồng">
          <Text code>{contract?._id || "N/A"}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày lập">
          {dayjs(bill.billingDate).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Tình trạng">
          <Tag
            color={statusConfig[bill.status].color}
            style={{ fontSize: 14, padding: "4px 12px", borderRadius: 16 }}
            icon={statusConfig[bill.status].icon}
          >
            {statusConfig[bill.status].label}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Phải thu">
          <Text strong style={{ color: "#ff4d4f", fontSize: 16 }}>
            {(() => {
              const amount = Number(bill.amountDue || 0);
              return isNaN(amount) ? "0" : amount.toLocaleString("vi-VN");
            })()} ₫
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Đã thu">
          <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
            {(() => {
              const amount = Number(bill.amountPaid || 0);
              return isNaN(amount) ? "0" : amount.toLocaleString("vi-VN");
            })()} ₫
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Còn lại">
          <Text strong style={{ color: "#fa8c16", fontSize: 16 }}>
            {(() => {
              const due = Number(bill.amountDue || 0);
              const paid = Number(bill.amountPaid || 0);
              const remaining = isNaN(due) || isNaN(paid) ? 0 : due - paid;
              return remaining.toLocaleString("vi-VN");
            })()} ₫
          </Text>
        </Descriptions.Item>
      </Descriptions>

      {/* Thông tin hợp đồng liên quan */}
      {contract && (
        <>
          <Divider orientation="left" style={{ marginTop: 24 }}>
            Thông tin hợp đồng
          </Divider>
          <Descriptions
            bordered
            column={1}
            size="small"
            labelStyle={{ fontWeight: 600, background: "#fafafa" }}
            contentStyle={{ background: "#fff" }}
          >
            <Descriptions.Item label="Mã hợp đồng">
              <Text code>{contract._id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Người thuê">
              {tenant?.fullName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Phòng">
              {room?.roomNumber || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Tiền thuê/tháng">
              <Text strong style={{ color: "#1677ff" }}>
                {(() => {
                  // Ưu tiên lấy từ room, sau đó từ contract
                  let amount = 0;
                  
                  // Thử lấy từ room trước
                  if (room?.pricePerMonth) {
                    if (typeof room.pricePerMonth === 'number' && !isNaN(room.pricePerMonth)) {
                      amount = room.pricePerMonth;
                    } else if (typeof room.pricePerMonth === 'object' && (room.pricePerMonth as any).$numberDecimal) {
                      amount = parseFloat((room.pricePerMonth as any).$numberDecimal);
                    }
                  }
                  
                  // Nếu room không có, thử từ contract
                  if (!amount && contract?.monthlyRent) {
                    if (typeof contract.monthlyRent === 'number' && !isNaN(contract.monthlyRent)) {
                      amount = contract.monthlyRent;
                    } else if (typeof contract.monthlyRent === 'object' && (contract.monthlyRent as any).$numberDecimal) {
                      amount = parseFloat((contract.monthlyRent as any).$numberDecimal);
                    }
                  }
                  
                  return amount.toLocaleString("vi-VN");
                })()} ₫
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tiền cọc">
              <Text strong style={{ color: "#fa8c16" }}>
                {(() => {
                  // Xử lý Decimal128 object từ MongoDB
                  if (contract?.deposit) {
                    if (typeof contract.deposit === 'number' && !isNaN(contract.deposit)) {
                      return contract.deposit.toLocaleString("vi-VN");
                    } else if (typeof contract.deposit === 'object' && (contract.deposit as any).$numberDecimal) {
                      // Xử lý Decimal128: {$numberDecimal: "10000000"}
                      const value = parseFloat((contract.deposit as any).$numberDecimal);
                      return isNaN(value) ? "0" : value.toLocaleString("vi-VN");
                    } else if (typeof contract.deposit === 'string') {
                      const value = parseFloat(contract.deposit);
                      return isNaN(value) ? "0" : value.toLocaleString("vi-VN");
                    }
                  }
                  return "0";
                })()} ₫
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thời hạn">
              {dayjs(contract.startDate).format("DD/MM/YYYY")} - {dayjs(contract.endDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  contract.status === "ACTIVE" ? "#52c41a" :
                  contract.status === "ENDED" ? "#8c8c8c" : "#ff4d4f"
                }
                style={{ borderRadius: 12, fontWeight: 600 }}
              >
                {contract.status === "ACTIVE" ? "Đang hiệu lực" :
                 contract.status === "ENDED" ? "Đã kết thúc" : "Đã hủy"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </>
      )}

      {/* Chi tiết các khoản thu */}
      {bill.lineItems && bill.lineItems.length > 0 && (
        <>
          <Divider orientation="left" style={{ marginTop: 24 }}>
            <DollarOutlined /> Chi tiết các khoản thu
          </Divider>
          <Table
            columns={lineItemsColumns}
            dataSource={bill.lineItems}
            pagination={false}
            size="small"
            bordered
            style={{ background: "#fff" }}
          />
        </>
      )}

      <style>{`
        .ant-descriptions-item-label {
          font-weight: 600 !important;
        }
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600 !important;
        }
      `}</style>
    </Drawer>
  );
};

export default BillDetailDrawer;
