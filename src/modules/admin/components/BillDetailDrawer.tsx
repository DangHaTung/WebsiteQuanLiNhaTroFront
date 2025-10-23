import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Divider, Tag, Typography, Space, Spin, Table, message } from "antd";
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, DollarOutlined, PayCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Bill, BillStatus } from "../../../types/bill";
import type { Contract } from "../../../types/contract";
import type { Tenant } from "../../../types/tenant";
import type { Room } from "../../../types/room";
import { adminBillService } from "../services/bill";

interface BillDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  billId: string | null;
  contracts: Contract[];
  tenants: Tenant[];
  rooms: Room[];
}

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

  const statusConfig: Record<BillStatus, { color: string; label: string; icon: React.ReactNode }> = {
    PAID: { color: "#52c41a", label: "Đã thanh toán", icon: <CheckCircleOutlined /> },
    UNPAID: { color: "#ff4d4f", label: "Chưa thanh toán", icon: <ExclamationCircleOutlined /> },
    PARTIALLY_PAID: { color: "#fa8c16", label: "Thanh toán một phần", icon: <ClockCircleOutlined /> },
    VOID: { color: "#8c8c8c", label: "Đã hủy", icon: <ExclamationCircleOutlined /> },
  };

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

    fetchBill();
  }, [billId, open]);

  if (!bill && !loading) return null;

  const getContract = (contractId: string | Contract): Contract | null => {
    if (typeof contractId === "object") return contractId;
    return contracts.find(c => c._id === contractId) || null;
  };

  const getTenant = (tenantId: string | Tenant): Tenant | null => {
    if (typeof tenantId === "object") return tenantId;
    return tenants.find(t => t._id === tenantId) || null;
  };

  const getRoom = (roomId: string | Room): Room | null => {
    if (typeof roomId === "object") return rooms.find(r => r._id === roomId._id) || roomId;
    return rooms.find(r => r._id === roomId) || null;
  };

  const contract = bill ? getContract(bill.contractId) : null;
  const tenant = contract ? getTenant(contract.tenantId) : null;
  const room = contract ? getRoom(contract.roomId) : null;

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
                {(Number(bill.amountDue || 0) - Number(bill.amountPaid || 0)).toLocaleString("vi-VN")} ₫
              </Text>
            </Descriptions.Item>
            {/* Ngày tạo & cập nhật */}
            <Descriptions.Item label="Ngày tạo">{dayjs(bill.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">{dayjs(bill.updatedAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
          </Descriptions>

          {/* Thông tin hợp đồng */}
          {contract && (
            <>
              <Divider orientation="left">Thông tin hợp đồng</Divider>
              <Descriptions
                bordered
                column={1}
                size="small"
                styles={{
                  label: { fontWeight: 600, background: "#fafafa" },
                  content: { background: "#fff" },
                }}
              >
                <Descriptions.Item label="Mã hợp đồng">
                  <Text code>{contract._id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tiền thuê/tháng">
                  <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                    {Number(contract.monthlyRent ?? 0).toLocaleString("vi-VN")} ₫
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tiền cọc">
                  <Text strong style={{ color: "#fa8c16", fontSize: 16 }}>
                    {Number(contract.deposit ?? 0).toLocaleString("vi-VN")} ₫
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số phòng">{room?.roomNumber}</Descriptions.Item>
                {tenant && (
                  <Descriptions.Item label="Người thuê">{tenant.fullName}</Descriptions.Item>
                )}
                <Descriptions.Item label="Thời hạn hợp đồng">
                  <Text>
                    {dayjs(contract.startDate).format("DD/MM/YYYY")} - {dayjs(contract.endDate).format("DD/MM/YYYY")}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái hợp đồng">
                  <Tag color={contract.status ? "#52c41a" : "#ff4d4f"}>
                    {contract.status ? "Đang hiệu lực" : "Đã kết thúc"}
                  </Tag>
                </Descriptions.Item>
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
