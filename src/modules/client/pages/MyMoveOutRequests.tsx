import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  message,
  Descriptions,
  Divider,
} from "antd";
import { PlusOutlined, LogoutOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { clientMoveOutRequestService, type MoveOutRequest } from "../services/moveOutRequest";
import { clientBillService } from "../services/bill";
import api from "../services/api";

const { TextArea } = Input;

interface FinalContract {
  _id: string;
  roomId: { _id: string; roomNumber: string } | string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent?: number; // Tiền thuê/tháng
  status: string;
  originContractId?: string | { _id: string };
  linkedContractId?: string | { _id: string };
  totalDepositPaid?: number; // Tổng tiền cọc đã thanh toán (Khoản 1 + Khoản 2)
}

const MyMoveOutRequests = () => {
  const [requests, setRequests] = useState<MoveOutRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [myContracts, setMyContracts] = useState<FinalContract[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    loadMyContracts();
  }, [requests]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await clientMoveOutRequestService.getMyRequests();
      setRequests(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const loadMyContracts = async () => {
    try {
      // Load tất cả final contracts (gọi nhiều lần nếu cần)
      let allContracts: any[] = [];
      let page = 1;
      const limit = 100; // Max limit theo validation
      let hasMore = true;

      while (hasMore) {
        const response = await api.get(`/final-contracts/my-contracts?page=${page}&limit=${limit}`);
        const contracts = response.data.data || [];
        allContracts = [...allContracts, ...contracts];
        
        const pagination = response.data.pagination;
        hasMore = pagination && page < pagination.totalPages;
        page++;
      }
      
      console.log("Loaded finalContracts:", allContracts.length);
      
      // Lọc chỉ lấy các FinalContract SIGNED và chưa có yêu cầu PENDING
      const signedContracts = allContracts.filter((fc: any) => {
        // Chỉ lấy SIGNED contracts
        if (fc.status !== "SIGNED") {
          return false;
        }
        
        // Lấy contractId từ linkedContractId hoặc originContractId (có thể là object hoặc string)
        const linkedId = typeof fc.linkedContractId === 'object' 
          ? fc.linkedContractId?._id 
          : fc.linkedContractId;
        const originId = typeof fc.originContractId === 'object' 
          ? fc.originContractId?._id 
          : fc.originContractId;
        const contractId = linkedId || originId;
        
        if (!contractId) {
          return false;
        }
        
        // Kiểm tra xem đã có yêu cầu PENDING chưa
        const hasPendingRequest = requests.some(r => {
          const rContractId = typeof r.contractId === 'object' 
            ? r.contractId?._id 
            : r.contractId;
          return rContractId && contractId && rContractId.toString() === contractId.toString() && r.status === "PENDING";
        });
        
        return !hasPendingRequest;
      });
      
      console.log("Filtered signedContracts:", signedContracts.length);
      
      // Tính tổng tiền cọc từ 2 bills (RECEIPT + CONTRACT) cho mỗi contract
      const contractsWithDeposit = await Promise.all(signedContracts.map(async (fc: any) => {
        let totalDepositPaid = 0;
        
        // Lấy contractId (từ Contract, không phải FinalContract)
        const linkedId = typeof fc.linkedContractId === 'object' 
          ? fc.linkedContractId?._id 
          : fc.linkedContractId;
        const originId = typeof fc.originContractId === 'object' 
          ? fc.originContractId?._id 
          : fc.originContractId;
        const contractId = linkedId || originId;
        
        // Tính tổng tiền cọc = Khoản 1 (Cọc giữ phòng) + Khoản 2 (Cọc 1 tháng tiền phòng)
        // Theo nghiệp vụ: Tiền cọc = 1 tháng tiền phòng = monthlyRent
        
        // Cách đơn giản: Tiền cọc = 1 tháng tiền phòng (monthlyRent)
        // Hoặc tính chi tiết từ bills nếu muốn
        const monthlyRent = Number(fc.monthlyRent) || 
                           (typeof fc.roomId === 'object' ? Number(fc.roomId.pricePerMonth) : 0) || 
                           0;
        
        if (monthlyRent > 0) {
          // Cách đơn giản: Tiền cọc = 1 tháng tiền phòng
          totalDepositPaid = monthlyRent;
        } else {
          // Cách 2: Tính từ bills (nếu không có monthlyRent)
          if (contractId || fc._id) {
            try {
              // 1. Lấy RECEIPT bill (Cọc giữ phòng) - Khoản 1
              const myBills = await clientBillService.getMyBills({ page: 1, limit: 100 });
              const receiptBills = myBills.data.filter(
                (bill: any) => {
                  const billContractId = typeof bill.contractId === 'object' 
                    ? bill.contractId?._id 
                    : bill.contractId;
                  return bill.billType === "RECEIPT" && 
                         bill.status === "PAID" &&
                         contractId &&
                         String(billContractId) === String(contractId);
                }
              );
              
              let receiptPaid = 0;
              if (receiptBills.length > 0) {
                receiptPaid = Number(receiptBills[0].amountPaid) || Number(receiptBills[0].amountDue) || 0;
              }
              
              // 2. Lấy CONTRACT bill - chỉ tính lineItem "Tiền cọc (1 tháng tiền phòng)" - Khoản 2
              // KHÔNG tính "Tiền thuê tháng đầu"
              const contractBills = await clientBillService.getBillsByFinalContract(fc._id);
              const paidContractBill = contractBills.find(
                (bill: any) => bill.billType === "CONTRACT" && bill.status === "PAID"
              );
              
              let contractDeposit = 0;
              if (paidContractBill && paidContractBill.lineItems && paidContractBill.lineItems.length > 0) {
                // Tìm lineItem có chứa "cọc" hoặc "tiền cọc"
                const depositLineItem = paidContractBill.lineItems.find(
                  (item: any) => 
                    item.item && (
                      item.item.toLowerCase().includes('cọc') || 
                      item.item.toLowerCase().includes('deposit')
                    )
                );
                if (depositLineItem) {
                  contractDeposit = Number(depositLineItem.lineTotal) || 0;
                } else if (paidContractBill.lineItems.length >= 2) {
                  // Fallback: lineItem thứ 2 thường là "Tiền cọc (1 tháng tiền phòng)"
                  contractDeposit = Number(paidContractBill.lineItems[1].lineTotal) || 0;
                }
              }
              
              totalDepositPaid = receiptPaid + contractDeposit;
              
              // Nếu không tính được, fallback về 1 tháng tiền phòng
              if (totalDepositPaid === 0) {
                totalDepositPaid = Number(fc.deposit) || 0;
              }
            } catch (err) {
              console.error(`Error loading deposit for contract ${contractId}:`, err);
              // Fallback về deposit nếu có lỗi
              totalDepositPaid = Number(fc.deposit) || 0;
            }
          } else {
            // Nếu không có contractId, dùng deposit từ FinalContract
            totalDepositPaid = Number(fc.deposit) || 0;
          }
        }
        
        return {
          ...fc,
          totalDepositPaid,
        };
      }));
      
      setMyContracts(contractsWithDeposit);
    } catch (error: any) {
      console.error("Load contracts error:", error);
      message.error(error.response?.data?.message || "Lỗi khi tải danh sách hợp đồng");
    }
  };

  const handleCreate = async (values: {
    contractId: string;
    moveOutDate: Dayjs;
    reason: string;
  }) => {
    try {
      await clientMoveOutRequestService.create({
        contractId: values.contractId,
        moveOutDate: values.moveOutDate.format("YYYY-MM-DD"),
        reason: values.reason,
      });
      message.success("Tạo yêu cầu thành công");
      setCreateModalVisible(false);
      form.resetFields();
      loadRequests();
      loadMyContracts();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tạo yêu cầu");
    }
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      PENDING: { color: "processing", text: "Chờ xử lý" },
      APPROVED: { color: "success", text: "Đã duyệt" },
      REJECTED: { color: "error", text: "Từ chối" },
      COMPLETED: { color: "default", text: "Đã hoàn tất" },
    };
    const s = map[status] || { color: "default", text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const columns = [
    {
      title: "Phòng",
      dataIndex: ["roomId", "roomNumber"],
      key: "roomNumber",
    },
    {
      title: "Ngày dự kiến chuyển đi",
      dataIndex: "moveOutDate",
      key: "moveOutDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Ngày tạo",
      dataIndex: "requestedAt",
      key: "requestedAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <LogoutOutlined />
            <span>Yêu cầu hoàn cọc</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Tạo yêu cầu mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record: MoveOutRequest) => {
              if (record.status === "COMPLETED" && record.contractId.depositRefund) {
                const refund = record.contractId.depositRefund;
                return (
                  <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 8 }}>
                    <Descriptions title="Chi tiết hoàn cọc" bordered column={2} size="small">
                      <Descriptions.Item label="Tiền cọc ban đầu">
                        <strong style={{ color: "#1890ff", fontSize: 16 }}>
                          {record.contractId.deposit.toLocaleString("vi-VN")} ₫
                        </strong>
                      </Descriptions.Item>
                      <Descriptions.Item label="Dịch vụ tháng cuối">
                        {refund.finalMonthServiceFee?.toLocaleString("vi-VN") || 0} ₫
                      </Descriptions.Item>
                      <Descriptions.Item label="Thiệt hại">
                        {refund.damageAmount?.toLocaleString("vi-VN") || 0} ₫
                      </Descriptions.Item>
                      <Descriptions.Item label="Số tiền hoàn lại">
                        <strong style={{ color: "#52c41a", fontSize: 16 }}>
                          {refund.amount?.toLocaleString("vi-VN") || 0} ₫
                        </strong>
                      </Descriptions.Item>
                      {refund.damageNote && (
                        <Descriptions.Item label="Ghi chú thiệt hại" span={2}>
                          {refund.damageNote}
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Phương thức">
                        {refund.method === "BANK" ? "Chuyển khoản" : refund.method === "CASH" ? "Tiền mặt" : "Khác"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày hoàn cọc">
                        {refund.refundedAt ? dayjs(refund.refundedAt).format("DD/MM/YYYY HH:mm") : "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                );
              }
              return (
                <div style={{ padding: 16 }}>
                  <p><strong>Lý do:</strong> {record.reason}</p>
                  {record.adminNote && (
                    <p><strong>Ghi chú từ admin:</strong> {record.adminNote}</p>
                  )}
                  {record.processedBy && (
                    <p><strong>Người xử lý:</strong> {record.processedBy.fullName}</p>
                  )}
                  {record.processedAt && (
                    <p><strong>Thời gian xử lý:</strong> {dayjs(record.processedAt).format("DD/MM/YYYY HH:mm")}</p>
                  )}
                </div>
              );
            },
          }}
        />
      </Card>

      {/* Modal tạo yêu cầu mới */}
      <Modal
        title="Tạo yêu cầu chuyển đi / hoàn cọc"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            label="Chọn hợp đồng"
            name="contractId"
            rules={[{ required: true, message: "Vui lòng chọn hợp đồng" }]}
          >
            <Select
              placeholder="Chọn hợp đồng muốn kết thúc"
              style={{ width: "100%" }}
              options={myContracts.map(c => {
                const roomNumber = typeof c.roomId === 'object' 
                  ? c.roomId?.roomNumber 
                  : 'N/A';
                const depositAmount = c.totalDepositPaid || c.deposit || 0;
                // Lấy contractId từ originContractId hoặc linkedContractId (Contract ID, không phải FinalContract ID)
                const linkedId = typeof c.linkedContractId === 'object' 
                  ? c.linkedContractId?._id 
                  : c.linkedContractId;
                const originId = typeof c.originContractId === 'object' 
                  ? c.originContractId?._id 
                  : c.originContractId;
                const contractId = originId || linkedId || c._id; // Fallback về _id nếu không có contractId
                return {
                  value: contractId, // Dùng contractId thay vì finalContractId
                  label: `Phòng ${roomNumber} - Từ ${dayjs(c.startDate).format("DD/MM/YYYY")} - Cọc ${depositAmount.toLocaleString("vi-VN")} ₫`,
                };
              })}
            />
          </Form.Item>

          <Form.Item
            label="Ngày dự kiến chuyển đi"
            name="moveOutDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày chuyển đi" },
              {
                validator: (_: any, value: Dayjs) => {
                  if (value && value.isBefore(dayjs().add(30, 'day').startOf('day'))) {
                    return Promise.reject("Ngày chuyển đi phải cách ít nhất 30 ngày");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày chuyển đi"
              disabledDate={(current) => current && current < dayjs().add(30, 'day').startOf('day')}
            />
          </Form.Item>

          <Form.Item
            label="Lý do chuyển đi"
            name="reason"
            rules={[
              { required: true, message: "Vui lòng nhập lý do" },
              { max: 500, message: "Lý do không được quá 500 ký tự" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Ví dụ: Chuyển công tác, hết nhu cầu thuê, ..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyMoveOutRequests;

