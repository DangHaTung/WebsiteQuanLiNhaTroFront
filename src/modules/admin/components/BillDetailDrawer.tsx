import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Divider, Tag, Typography, Space, Spin, Table, message } from "antd";
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, DollarOutlined, PayCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Bill, BillStatus } from "../../../types/bill";
import type { Contract } from "../../../types/contract";
import type { Tenant } from "../../../types/tenant";
import type { Room } from "../../../types/room";
import { adminBillService } from "../services/bill";
// Helper function to safely convert various types to number
const dec = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v) || 0;
  if (typeof v === "object") {
    if (typeof (v as any).$numberDecimal === "string") return Number((v as any).$numberDecimal) || 0;
    if (typeof (v as any).toString === "function") {
      const s = (v as any).toString();
      const n = Number(s);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
};
// Props for BillDetailDrawer component
interface BillDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  billId: string | null;
  contracts: Contract[];
  tenants: Tenant[];
  rooms: Room[];
}
// Main component for displaying bill details in a drawer
const { Title, Text } = Typography;

const BillDetailDrawer: React.FC<BillDetailDrawerProps> = ({
  open,
  onClose,
  billId,
  contracts,
  tenants,
  rooms,
}) => {
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);
// Configuration for bill status display
  const statusConfig: Record<BillStatus, { color: string; label: string; icon: React.ReactNode }> = {
    PAID: { color: "#52c41a", label: "Đã thanh toán", icon: <CheckCircleOutlined /> },
    UNPAID: { color: "#ff4d4f", label: "Chưa thanh toán", icon: <ExclamationCircleOutlined /> },
    PARTIALLY_PAID: { color: "#fa8c16", label: "Thanh toán một phần", icon: <ClockCircleOutlined /> },
    VOID: { color: "#8c8c8c", label: "Đã hủy", icon: <ExclamationCircleOutlined /> },
  };
// Fetch bill details when billId or open state changes
  useEffect(() => {
    const fetchBill = async () => {
      if (!billId || !open) return;
      setLoading(true);
      try {
        const data = await adminBillService.getById(billId);
        if (!data) {
          message.warning("Không tìm thấy dữ liệu hóa đơn");
        } else {
          setBill(data);
          console.log("Dữ liệu hóa đơn:", data);
        }
      } catch (err: any) {
        console.error("Lỗi API:", err);
        message.error(err.message || "Lỗi khi lấy chi tiết hóa đơn");
      } finally {
        setLoading(false);
      }
    };
// Trigger the bill fetch
    fetchBill();
  }, [billId, open]);
// Return null if no bill data and not loading
  if (!bill && !loading) return null;

  const getContract = (contractId: string | Contract): Contract | null => {
    if (typeof contractId === "object") return contractId;
    return contracts.find(c => c._id === contractId) || null;
  };
// Helper functions to get tenant and room details
  const getTenant = (tenantId: string | Tenant): Tenant | null => {
    if (typeof tenantId === "object") return tenantId;
    return tenants.find(t => t._id === tenantId) || null;
  };
// Helper function to get room details
  const getRoom = (roomId: string | Room): Room | null => {
    if (typeof roomId === "object") return rooms.find(r => r._id === roomId._id) || roomId;
    return rooms.find(r => r._id === roomId) || null;
  };
// Get related contract, tenant, and room data
  const contract = bill ? getContract(bill.contractId) : null;
  const tenant = contract ? getTenant(contract.tenantId) : null;
  const room = contract ? getRoom(contract.roomId) : null;
// Render the drawer with bill details
  return (
    <Drawer
      title={
        <Space>
          <FileTextOutlined style={{ fontSize: 22, color: "#1677ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết hóa đơn {bill?._id?.substring(0, 8)}...
          </Title>
        </Space>
      }
      placement="right"
      width={600}
      onClose={() => {
        setBill(null);
        onClose();
      }}
      open={open}
      styles={{
        header: { backgroundColor: "#f0f2f5", borderBottom: "1px solid #e8e8e8" },
        body: { backgroundColor: "#f9f9f9" },
      }}
    >
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
          <Spin size="large" />
        </div>
      ) : bill ? (
        <>
          {/* Thông tin hóa đơn */}
          <Descriptions
            bordered
            column={1}
            size="middle"
            styles={{
              label: { fontWeight: 600, background: "#fafafa" },
              content: { background: "#fff" },
            }}
          >
            <Descriptions.Item label="Mã hóa đơn"><Text code>{bill._id}</Text></Descriptions.Item>
            <Descriptions.Item label="Ngày lập">{dayjs(bill.billingDate).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusConfig[bill.status]?.color} icon={statusConfig[bill.status]?.icon} style={{ fontSize: 14, padding: "4px 12px", borderRadius: 16 }}>
                {statusConfig[bill.status]?.label || bill.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phải thu">
              <Text strong style={{ color: "#ff4d4f", fontSize: 16 }}>
                {Number(bill.amountDue || 0).toLocaleString("vi-VN")} ₫
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Đã thu">
              <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                {Number(bill.amountPaid || 0).toLocaleString("vi-VN")} ₫
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Còn lại">
              <Text strong style={{ color: "#fa8c16", fontSize: 16 }}>
                {Math.max(Number(bill.amountDue || 0) - Number(bill.amountPaid || 0), 0).toLocaleString("vi-VN")} ₫
              </Text>
            </Descriptions.Item>
            {/* Ngày tạo & cập nhật */}
            <Descriptions.Item label="Ngày tạo">{dayjs(bill.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">{dayjs(bill.updatedAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
          </Descriptions>

          {/* Thông tin khách thuê (từ tenantSnapshot khi tạo) */}
          {contract && contract.tenantSnapshot && (
            <>
              <Divider orientation="left">Thông tin khách thuê</Divider>
              <Descriptions
                bordered
                column={1}
                size="small"
                styles={{
                  label: { fontWeight: 600, background: "#fafafa" },
                  content: { background: "#fff" },
                }}
              >
                {contract.tenantSnapshot.fullName && (
                  <Descriptions.Item label="Họ tên">
                    <Text strong>{contract.tenantSnapshot.fullName}</Text>
                  </Descriptions.Item>
                )}
                {contract.tenantSnapshot.phone && (
                  <Descriptions.Item label="Số điện thoại">
                    {contract.tenantSnapshot.phone}
                  </Descriptions.Item>
                )}
                {contract.tenantSnapshot.identityNo && (
                  <Descriptions.Item label="CMND/CCCD">
                    {contract.tenantSnapshot.identityNo}
                  </Descriptions.Item>
                )}
                {contract.tenantSnapshot.address && (
                  <Descriptions.Item label="Địa chỉ">
                    {contract.tenantSnapshot.address}
                  </Descriptions.Item>
                )}
                {contract.tenantSnapshot.note && (
                  <Descriptions.Item label="Ghi chú khách thuê">
                    {contract.tenantSnapshot.note}
                  </Descriptions.Item>
                )}
                {room && (
                  <Descriptions.Item label="Số phòng">
                    <Text strong>{room.roomNumber}</Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Tiền cọc">
                  <Text strong style={{ color: "#fa8c16", fontSize: 16 }}>
                    {dec(contract.deposit).toLocaleString("vi-VN")} ₫
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tiền thuê/tháng">
                  <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                    {dec(contract.monthlyRent).toLocaleString("vi-VN")} ₫
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thời hạn thuê">
                  <Text>
                    {dayjs(contract.startDate).format("DD/MM/YYYY")} - {dayjs(contract.endDate).format("DD/MM/YYYY")}
                  </Text>
                </Descriptions.Item>
                {bill.note && (
                  <Descriptions.Item label="Ghi chú">
                    {bill.note}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </>
          )}

          {/* Chi tiết các khoản thu */}
          {bill.lineItems?.length > 0 && (
            <>
              <Divider orientation="left"><DollarOutlined /> Chi tiết các khoản thu</Divider>
              <Table
                dataSource={bill.lineItems}
                rowKey={item => `${item.item}-${item.unitPrice}-${item.lineTotal}`}
                pagination={false}
                size="small"
                columns={[
                  { title: "Tên khoản", dataIndex: "description", key: "description" },
                  { title: "Đơn giá (₫)", dataIndex: "unitPrice", key: "unitPrice", align: "right" as const, render: val => Number(val || 0).toLocaleString("vi-VN") },
                  { title: "Thành tiền (₫)", dataIndex: "lineTotal", key: "lineTotal", align: "right" as const, render: val => Number(val || 0).toLocaleString("vi-VN") },
                ]}
              />
            </>
          )}

          {/* Lịch sử thanh toán */}
          {/* {bill.payments?.length > 0 && (
            <>
              <Divider orientation="left"><PayCircleOutlined /> Lịch sử thanh toán</Divider>
              <Table
                dataSource={bill.payments}
                rowKey={item => item._id}
                pagination={false}
                size="small"
                columns={[
                  { title: "Ngày thanh toán", dataIndex: "paymentDate", key: "paymentDate", render: val => dayjs(val).format("DD/MM/YYYY HH:mm") },
                  { title: "Số tiền (₫)", dataIndex: "amount", key: "amount", align: "right" as const, render: val => Number(val || 0).toLocaleString("vi-VN") },
                  { title: "Phương thức", dataIndex: "method", key: "method" },
                ]}
              />
            </>
          )} */}
        </>
      ) : (
        <Text>Không có dữ liệu hóa đơn</Text>
      )}
    </Drawer>
  );
};

export default BillDetailDrawer;
