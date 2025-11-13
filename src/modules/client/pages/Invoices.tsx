import React, { useEffect, useState } from "react";
import { Table, Tag, Card, Button, message, Space, Alert, Row, Col, Statistic } from "antd";
import { DollarOutlined, FileTextOutlined, CreditCardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { tenantBillService } from "../../admin/services/bill";
import type { Bill } from "../../../types/bill";

const Invoices: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
    loadPendingBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await tenantBillService.getMyBills({ limit: 50 });
      setBills(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingBills = async () => {
    try {
      const data = await tenantBillService.getPendingPayment();
      setPendingBills(data);
    } catch (error: any) {
      console.error("Lỗi khi tải hóa đơn chưa thanh toán:", error);
    }
  };

  const handlePayment = (_bill: Bill) => {
    message.info("Tính năng thanh toán đang được phát triển");
    // TODO: Integrate with VNPay/MoMo/ZaloPay
  };

  const totalPending = pendingBills.reduce((sum, bill) => sum + (bill.amountDue || 0), 0);
  const totalPaid = bills.filter(b => b.status === "PAID").reduce((sum, bill) => sum + (bill.amountPaid || 0), 0);

  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => id.substring(0, 8) + "...",
    },
    {
      title: "Loại",
      dataIndex: "billType",
      key: "billType",
      render: (type: string) => {
        const map: Record<string, { color: string; text: string }> = {
          RECEIPT: { color: "purple", text: "Phiếu thu" },
          CONTRACT: { color: "cyan", text: "Hợp đồng" },
          MONTHLY: { color: "magenta", text: "Hàng tháng" },
        };
        const m = map[type] || { color: "default", text: type };
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
    {
      title: "Ngày lập",
      dataIndex: "billingDate",
      key: "billingDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Số tiền",
      dataIndex: "amountDue",
      key: "amountDue",
      align: "right" as const,
      render: (amount: number) => amount.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Đã thanh toán",
      dataIndex: "amountPaid",
      key: "amountPaid",
      align: "right" as const,
      render: (amount: number) => amount.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const map: Record<string, { color: string; text: string }> = {
          DRAFT: { color: "orange", text: "Nháp" },
          PAID: { color: "green", text: "Đã thanh toán" },
          UNPAID: { color: "red", text: "Chưa thanh toán" },
          PARTIALLY_PAID: { color: "orange", text: "Một phần" },
          PENDING_CASH_CONFIRM: { color: "gold", text: "Chờ xác nhận" },
        };
        const m = map[status] || { color: "default", text: status };
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      render: (_: any, record: Bill) => {
        if (record.status === "UNPAID" || record.status === "PARTIALLY_PAID") {
          return (
            <Button
              type="primary"
              size="small"
              icon={<CreditCardOutlined />}
              onClick={() => handlePayment(record)}
            >
              Thanh toán
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px" }}>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Hóa đơn chưa thanh toán"
              value={pendingBills.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng tiền chưa thanh toán"
              value={totalPending}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng đã thanh toán"
              value={totalPaid}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Pending Bills Alert */}
      {pendingBills.length > 0 && (
        <Alert
          message="Bạn có hóa đơn chưa thanh toán"
          description={`Có ${pendingBills.length} hóa đơn chưa thanh toán với tổng số tiền ${totalPending.toLocaleString("vi-VN")} ₫`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card
        title={
          <Space>
            <FileTextOutlined />
            Danh sách Hóa đơn
          </Space>
        }
      >
        <Alert
          message="Lưu ý"
          description="Hóa đơn hàng tháng sẽ được admin tạo vào ngày 5 hàng tháng. Bạn sẽ nhận thông báo khi có hóa đơn mới."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Table
          columns={columns}
          dataSource={bills}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Invoices;
