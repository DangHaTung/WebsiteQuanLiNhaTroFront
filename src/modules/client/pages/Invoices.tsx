import React, { useEffect, useState } from "react";
import { Table, Tag, Card, Button, message, Space, Tabs, Row, Col, Statistic, Modal } from "antd";
import { FileTextOutlined, CreditCardOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { clientBillService, type Bill } from "../services/bill";

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"unpaid" | "paid">("unpaid");

  useEffect(() => {
    loadBills();
    
    // Kiểm tra URL params để hiển thị thông báo thanh toán
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const provider = urlParams.get("provider");
    const transactionId = urlParams.get("transactionId");
    
    if (paymentStatus === "success" && provider) {
      message.success({
        content: `Thanh toán ${provider.toUpperCase()} thành công! Mã GD: ${transactionId || "N/A"}`,
        duration: 5,
      });
      
      // Xóa params khỏi URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Reload data sau 1 giây để cập nhật trạng thái
      setTimeout(() => {
        loadBills();
      }, 1000);
    }
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const response = await clientBillService.getMyBills({ limit: 100 });
      // Lấy bill MONTHLY, CONTRACT và RECEIPT (hóa đơn hàng tháng + tiền tháng đầu + phiếu thu tiền cọc)
      const payableBills = (response.data || []).filter(bill => 
        bill.billType === "MONTHLY" || bill.billType === "CONTRACT" || bill.billType === "RECEIPT"
      );
      setBills(payableBills);
      

    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (bill: Bill) => {
    if (bill.status === "PAID") {
      message.info("Hóa đơn này đã được thanh toán");
      return;
    }
    
    Modal.confirm({
      title: "Chọn phương thức thanh toán",
      content: (
        <div style={{ marginTop: 16 }}>
          <p>Số tiền: <strong style={{ color: "#1890ff", fontSize: 18 }}>{bill.amountDue.toLocaleString("vi-VN")} đ</strong></p>
        </div>
      ),
      okText: "Thanh toán Online",
      cancelText: "Thanh toán Tiền mặt",
      onOk: () => handleOnlinePayment(bill),
      onCancel: () => handleCashPayment(bill),
      width: 500,
    });
  };

  const handleOnlinePayment = async (bill: Bill) => {
    const createPayment = async (provider: "vnpay" | "momo" | "zalopay") => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("token");
        
        const endpoint = provider === "zalopay" 
          ? `${apiUrl}/api/payment/zalopay/create`
          : `${apiUrl}/api/payment/${provider}/create`;

        // Tenant thanh toán xong phải về trang /invoices
        const returnUrl = `${window.location.origin}/invoices`;

        // Tính số tiền còn lại phải thanh toán
        // Với CONTRACT bill: tính từ lineItems để đảm bảo chính xác
        let remainingAmount = bill.amountDue - (bill.amountPaid || 0);
        
        if (bill.billType === "CONTRACT" && bill.lineItems && bill.lineItems.length > 0) {
          // Tính tổng từ lineItems (depositRemaining + firstMonthRent)
          const convertToNumber = (value: any): number => {
            if (typeof value === 'number' && !isNaN(value)) {
              return value;
            } else if (typeof value === 'string') {
              return parseFloat(value) || 0;
            }
            return 0;
          };
          
          // Tính tổng tất cả lineItems của CONTRACT bill
          let totalFromLineItems = 0;
          bill.lineItems.forEach((item: any) => {
            const itemTotal = convertToNumber(item.lineTotal);
            totalFromLineItems += itemTotal;
            console.log(`📋 CONTRACT lineItem: ${item.item} = ${itemTotal}`);
          });
          
          console.log(`💰 CONTRACT bill - Total from lineItems: ${totalFromLineItems}, amountDue from DB: ${bill.amountDue}, amountPaid: ${bill.amountPaid}`);
          
          // Số tiền còn lại = tổng từ lineItems - amountPaid
          remainingAmount = totalFromLineItems - (bill.amountPaid || 0);
          
          // Đảm bảo không âm
          if (remainingAmount < 0) remainingAmount = 0;
          
          console.log(`✅ CONTRACT payment amount: ${remainingAmount}`);
        }
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ 
            billId: bill._id, 
            amount: remainingAmount,
            returnUrl: returnUrl,
          }),
        });
        const data = await response.json();

        let paymentUrl = null;
        if (provider === "vnpay") {
          paymentUrl = data.url || data.paymentUrl;
        } else if (provider === "momo") {
          paymentUrl = data.payUrl || data.data?.payUrl;
        } else if (provider === "zalopay") {
          paymentUrl = data.payUrl || data.zaloData?.order_url || data.order_url;
        }

        if (paymentUrl) {
          window.open(paymentUrl, "_blank");
          message.success(`Đã mở cổng thanh toán ${provider.toUpperCase()}`);
        } else {
          message.error(data.message || data.error || "Lỗi tạo link thanh toán");
        }
      } catch (error: any) {
        message.error("Lỗi kết nối payment gateway");
      }
    };

    Modal.info({
      title: "Chọn cổng thanh toán",
      width: 500,
      content: (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>
            Số tiền: <strong style={{ color: "#1890ff" }}>{bill.amountDue.toLocaleString("vi-VN")} đ</strong>
          </p>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button 
              type="primary" 
              block 
              size="large"
              onClick={() => {
                Modal.destroyAll();
                createPayment("vnpay");
              }}
              style={{ backgroundColor: "#1890ff" }}
            >
              💳 VNPAY
            </Button>
            <Button 
              type="primary" 
              block 
              size="large"
              onClick={() => {
                Modal.destroyAll();
                createPayment("momo");
              }}
              style={{ backgroundColor: "#a50064" }}
            >
              🟣 MOMO
            </Button>
            <Button 
              type="primary" 
              block 
              size="large"
              onClick={() => {
                Modal.destroyAll();
                createPayment("zalopay");
              }}
              style={{ backgroundColor: "#0068ff" }}
            >
              💙 ZaloPay
            </Button>
          </Space>
        </div>
      ),
      okText: "Đóng",
      onOk: () => Modal.destroyAll(),
    });
  };

  const handleCashPayment = async (bill: Bill) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");
      
      // Tính số tiền còn lại phải thanh toán (amountDue - amountPaid)
      const remainingAmount = bill.amountDue - (bill.amountPaid || 0);
      
      const response = await fetch(`${apiUrl}/api/bills/${bill._id}/pay-cash`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: remainingAmount }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("❌ Pay cash error:", data);
        message.error(data.message || `Lỗi ${response.status}: ${data.error || "Lỗi khi thanh toán"}`);
        return;
      }
      
      if (data.success) {
        message.success("Đã gửi yêu cầu thanh toán tiền mặt. Vui lòng chờ admin xác nhận.");
        loadBills();
      } else {
        message.error(data.message || "Lỗi khi thanh toán");
      }
    } catch (error) {
      message.error("Lỗi khi thanh toán tiền mặt");
    }
  };

  const unpaidBills = bills.filter(b => b.status === "UNPAID" || b.status === "PENDING_CASH_CONFIRM" || b.status === "PARTIALLY_PAID");
  const paidBills = bills.filter(b => b.status === "PAID");
  
  // Tính tổng amountDue của các bill chưa thanh toán (không trừ amountPaid)
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + bill.amountDue, 0);
  const totalPaid = paidBills.reduce((sum, bill) => sum + bill.amountPaid, 0);

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      PAID: { color: "success", text: "Đã thanh toán", icon: <CheckCircleOutlined /> },
      UNPAID: { color: "error", text: "Chưa thanh toán", icon: <ClockCircleOutlined /> },
      PENDING_CASH_CONFIRM: { color: "gold", text: "Chờ xác nhận tiền mặt", icon: <ClockCircleOutlined /> },
      PARTIALLY_PAID: { color: "warning", text: "Thanh toán 1 phần", icon: <ClockCircleOutlined /> },
    };
    const m = map[status] || { color: "default", text: status, icon: null };
    return <Tag color={m.color} icon={m.icon}>{m.text}</Tag>;
  };

  const getBillTypeTag = (billType: string) => {
    const map: Record<string, { color: string; text: string }> = {
      RECEIPT: { color: "purple", text: "Phiếu thu (Cọc)" },
      CONTRACT: { color: "cyan", text: "Hợp đồng" },
      MONTHLY: { color: "magenta", text: "Hàng tháng" },
    };
    const m = map[billType] || { color: "default", text: billType };
    return <Tag color={m.color}>{m.text}</Tag>;
  };

  const columns = [
    {
      title: "Loại",
      dataIndex: "billType",
      key: "billType",
      render: (type: string) => getBillTypeTag(type),
    },
    {
      title: "Tháng",
      dataIndex: "billingDate",
      key: "billingDate",
      render: (date: string) => <strong>{dayjs(date).format("MM/YYYY")}</strong>,
    },
    {
      title: "Ngày lập",
      dataIndex: "billingDate",
      key: "billingDate2",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "amountDue",
      key: "amountDue",
      align: "right" as const,
      render: (amount: number, record: Bill) => {
        // Tính tổng tiền ban đầu:
        // - Nếu đã thanh toán (PAID) và amountDue = 0, tổng = amountPaid
        // - Nếu thanh toán một phần (PARTIALLY_PAID), tổng = amountDue + amountPaid
        // - Nếu chưa thanh toán, tổng = amountDue
        let totalAmount = amount;
        if (record.status === "PAID" && amount === 0) {
          totalAmount = record.amountPaid || 0;
        } else if (record.status === "PARTIALLY_PAID") {
          totalAmount = amount + (record.amountPaid || 0);
        }
        
        // Nếu vẫn là 0, thử tính từ lineItems
        if (totalAmount === 0 && record.lineItems && record.lineItems.length > 0) {
          totalAmount = record.lineItems.reduce((sum: number, item: any) => {
            return sum + (item.lineTotal || 0);
          }, 0);
        }
        
        return (
          <strong style={{ color: "#1890ff", fontSize: 16 }}>
            {totalAmount.toLocaleString("vi-VN")} ₫
          </strong>
        );
      },
    },
    {
      title: "Đã thanh toán",
      dataIndex: "amountPaid",
      key: "amountPaid",
      align: "right" as const,
      render: (amount: number) => (
        <span style={{ color: "#52c41a" }}>
          {amount.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Bill) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/invoices/${record._id}`)}
          >
            Chi tiết
          </Button>
          {record.status !== "PAID" && (
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              onClick={() => handlePayment(record)}
            >
              Thanh toán
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <FileTextOutlined style={{ color: "#1890ff" }} />
            Hóa đơn & Phiếu thu
          </h2>
          <p style={{ color: "#666", marginTop: 8, marginBottom: 0 }}>
            💡 Nếu bạn ở chung phòng với người khác, cả hai đều có thể xem và thanh toán hóa đơn này. Phiếu thu tiền cọc sẽ hiển thị khi admin tạo và gán cho tài khoản của bạn.
          </p>
        </div>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Chưa thanh toán"
                value={totalUnpaid}
                suffix="₫"
                valueStyle={{ color: "#ff4d4f" }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Đã thanh toán"
                value={totalPaid}
                suffix="₫"
                valueStyle={{ color: "#52c41a" }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key as "unpaid" | "paid")}
          items={[
            {
              key: "unpaid",
              label: (
                <span>
                  <ClockCircleOutlined />
                  Chưa thanh toán ({unpaidBills.length})
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={unpaidBills}
                  rowKey="_id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: "paid",
              label: (
                <span>
                  <CheckCircleOutlined />
                  Đã thanh toán ({paidBills.length})
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={paidBills}
                  rowKey="_id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Invoices;
