import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Divider, Tag, Typography, Space, Spin, Table, message } from "antd";
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Bill, BillStatus } from "../../../types/bill";
import type { Tenant } from "../../../types/tenant";
import type { Room } from "../../../types/room";


interface Contract {
  _id: string;
  tenantId?: { fullName?: string } | string;
  roomId?: { roomNumber?: string } | string;
  tenantSnapshot?: {
    fullName?: string;
    phone?: string;
    identityNo?: string;
    address?: string;
    note?: string;
  };
  deposit?: any;
  monthlyRent?: any;
  startDate?: string;
  endDate?: string;
}
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
  const [receiptBill, setReceiptBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);
// Configuration for bill status display
  const statusConfig: Record<BillStatus, { color: string; label: string; icon: React.ReactNode }> = {
    DRAFT: { color: "#faad14", label: "Nháp", icon: <FileTextOutlined /> },
    PAID: { color: "#52c41a", label: "Đã thanh toán", icon: <CheckCircleOutlined /> },
    UNPAID: { color: "#ff4d4f", label: "Chưa thanh toán", icon: <ExclamationCircleOutlined /> },
    PARTIALLY_PAID: { color: "#fa8c16", label: "Thanh toán một phần", icon: <ClockCircleOutlined /> },
    VOID: { color: "#8c8c8c", label: "Đã hủy", icon: <ExclamationCircleOutlined /> },
    PENDING_CASH_CONFIRM: { color: "#faad14", label: "Chờ xác nhận tiền mặt", icon: <ClockCircleOutlined /> },
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
         
          // Nếu là bill CONTRACT, tìm receiptBill liên quan
          if (data.billType === "CONTRACT" && data.contractId) {
            const contractId = typeof data.contractId === "string" ? data.contractId : data.contractId._id;
            try {
              const bills = await adminBillService.getByContractId(contractId);
              const receipt = bills.find((b: Bill) => b.billType === "RECEIPT");
              if (receipt) {
                setReceiptBill(receipt);
              }
            } catch (err) {
              console.error("Lỗi khi lấy receipt bill:", err);
            }
          }
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
// Helper function to get room details
  const getRoom = (roomId: string | Room | { roomNumber?: string } | undefined): Room | null => {
    if (!roomId) return null;
    if (typeof roomId === "object" && "roomNumber" in roomId && !("_id" in roomId)) {
      // Nếu là object chỉ có roomNumber (từ contract.roomId), không có _id, không thể tìm được
      return null;
    }
    if (typeof roomId === "object" && "_id" in roomId) {
      return rooms.find(r => r._id === (roomId as any)._id) || (roomId as Room);
    }
    return rooms.find(r => r._id === roomId) || null;
  };
// Get related contract and room data
  const contract = bill ? getContract(bill.contractId) : null;
  const room = contract && contract.roomId ? getRoom(contract.roomId) : null;
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
        setReceiptBill(null);
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
                dataSource={(() => {
                  // Helper function để convert giá trị sang number (giống FinalContracts và InvoiceDetail)
                  const convertToNumber = (value: any): number => {
                    if (value === null || value === undefined) return 0;
                    if (typeof value === "number") return value;
                    if (typeof value === "string") return parseFloat(value) || 0;
                    if (typeof value === "object") {
                      if (typeof (value as any).$numberDecimal === "string") {
                        return parseFloat((value as any).$numberDecimal) || 0;
                      }
                      if (typeof value.toString === "function") {
                        return parseFloat(value.toString()) || 0;
                      }
                    }
                    return 0;
                  };


                  // Nếu là bill CONTRACT, tính toán giống như trong FinalContracts và InvoiceDetail
                  if (bill.billType === "CONTRACT") {
                    // 1. Tính Cọc giữ phòng từ receiptBill (nếu có)
                    let receiptAmount = 0;
                    if (receiptBill) {
                      if (receiptBill.status === "PAID") {
                        receiptAmount = convertToNumber(receiptBill.amountPaid);
                        if (receiptAmount === 0 && receiptBill.lineItems && receiptBill.lineItems.length > 0) {
                          receiptAmount = convertToNumber(receiptBill.lineItems[0]?.lineTotal);
                        }
                      } else {
                        receiptAmount = convertToNumber(receiptBill.amountDue);
                      }
                    }


                    // 2. Tính Cọc 1 tháng tiền phòng và Tiền phòng tháng đầu từ contractBill lineItems
                    let depositRemaining = 0;
                    let firstMonthRent = 0;
                   
                    if (bill.lineItems && bill.lineItems.length > 0) {
                      bill.lineItems.forEach((item: any) => {
                        const itemName = item.item || "";
                        const itemTotal = convertToNumber(item.lineTotal);
                        if (itemName.includes("Tiền cọc")) {
                          depositRemaining = itemTotal;
                        } else if (itemName.includes("Tiền thuê tháng đầu")) {
                          firstMonthRent = itemTotal;
                        }
                      });
                    }


                    // Tạo mảng lineItems với đúng thứ tự và tên (giống FinalContracts)
                    const items: any[] = [];
                   
                    // 1. Cọc giữ phòng
                    if (receiptAmount > 0) {
                      items.push({
                        item: "Cọc giữ phòng",
                        quantity: 1,
                        unitPrice: receiptAmount,
                        lineTotal: receiptAmount,
                      });
                    }
                   
                    // 2. Cọc 1 tháng tiền phòng
                    if (depositRemaining > 0) {
                      items.push({
                        item: "Cọc 1 tháng tiền phòng",
                        quantity: 1,
                        unitPrice: depositRemaining,
                        lineTotal: depositRemaining,
                      });
                    }
                   
                    // 3. Tiền phòng tháng đầu
                    if (firstMonthRent > 0) {
                      items.push({
                        item: "Tiền phòng tháng đầu",
                        quantity: 1,
                        unitPrice: firstMonthRent,
                        lineTotal: firstMonthRent,
                      });
                    }
                   
                    return items;
                  }
                 
                  // Nếu không phải CONTRACT, hiển thị bình thường
                  return bill.lineItems;
                })()}
                rowKey={(item, index) => `${item.item}-${item.unitPrice}-${item.lineTotal}-${index}`}
                pagination={false}
                size="small"
                columns={[
                  { title: "Tên khoản", dataIndex: "item", key: "item" },
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
