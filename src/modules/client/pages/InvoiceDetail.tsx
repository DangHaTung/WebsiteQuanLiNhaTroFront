import React, { useEffect, useState } from "react";
import { Alert, Card, Descriptions, Button, message, Space, Tag, Table, Divider, Modal, Spin } from "antd";
import { ArrowLeftOutlined, CreditCardOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { clientBillService, type Bill } from "../services/bill";

const InvoiceDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBill(id);
    }
  }, [id]);
  
  // Debug: Log bill data
  useEffect(() => {
    if (bill) {
      console.log("📊 Bill data:", bill);
      console.log("📋 LineItems:", bill.lineItems);
    }
  }, [bill]);

  const loadBill = async (billId: string) => {
    try {
      setLoading(true);
      const data = await clientBillService.getById(billId);
      setBill(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải hóa đơn");
      navigate("/invoices");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!bill || bill.status === "PAID") {
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
      onOk: () => handleOnlinePayment(),
      onCancel: () => handleCashPayment(),
      width: 500,
    });
  };

  const handleOnlinePayment = async () => {
    if (!bill) return;

    const createPayment = async (provider: "vnpay" | "momo" | "zalopay") => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("token");
        
        const endpoint = provider === "zalopay" 
          ? `${apiUrl}/api/payment/zalopay/create`
          : `${apiUrl}/api/payment/${provider}/create`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ 
            billId: bill._id, 
            amount: bill.amountDue,
            returnUrl: `${window.location.origin}/invoice-detail/${bill._id}`
          }),
        });
        const data = await response.json();

        let paymentUrl = null;
        if (provider === "vnpay") {
          paymentUrl = data.url || data.paymentUrl;
        } else if (provider === "momo") {
          paymentUrl = data.payUrl;
        } else if (provider === "zalopay") {
          paymentUrl = data.order_url;
        }

        if (paymentUrl) {
          window.location.href = paymentUrl;
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

  const handleCashPayment = async () => {
    if (!bill) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${apiUrl}/api/bills/${bill._id}/pay-cash`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: bill.amountDue }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success("Đã gửi yêu cầu thanh toán tiền mặt. Vui lòng chờ admin xác nhận.");
        loadBill(bill._id);
      } else {
        message.error(data.message || "Lỗi khi thanh toán");
      }
    } catch (error) {
      message.error("Lỗi khi thanh toán tiền mặt");
    }
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      PAID: { color: "success", text: "Đã thanh toán", icon: <CheckCircleOutlined /> },
      UNPAID: { color: "error", text: "Chưa thanh toán", icon: <ClockCircleOutlined /> },
      PARTIALLY_PAID: { color: "warning", text: "Thanh toán 1 phần", icon: <ClockCircleOutlined /> },
      PENDING_CASH_CONFIRM: { color: "processing", text: "Chờ xác nhận TM", icon: <ClockCircleOutlined /> },
    };
    const m = map[status] || { color: "default", text: status, icon: null };
    return <Tag color={m.color} icon={m.icon}>{m.text}</Tag>;
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <p>Không tìm thấy hóa đơn</p>
          <Button onClick={() => navigate("/invoices")}>Quay lại</Button>
        </Card>
      </div>
    );
  }

  const lineItemColumns = [
    {
      title: "Khoản mục",
      dataIndex: "item",
      key: "item",
      render: (item: string) => item || "N/A",
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right" as const,
      render: (price: number) => price?.toLocaleString("vi-VN") + " ₫" || "0 ₫",
    },
    {
      title: "Thành tiền",
      dataIndex: "lineTotal",
      key: "lineTotal",
      align: "right" as const,
      render: (total: number) => (
        <strong style={{ color: "#1890ff" }}>
          {total?.toLocaleString("vi-VN") || "0"} ₫
        </strong>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space style={{ marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/invoices")}>
            Quay lại
          </Button>
        </Space>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>Chi tiết hóa đơn tháng {dayjs(bill.billingDate).format("MM/YYYY")}</h2>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã hóa đơn" span={2}>
            <code>{bill._id}</code>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày lập">
            {dayjs(bill.billingDate).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {getStatusTag(bill.status)}
          </Descriptions.Item>
          {bill.dueDate && (
            <Descriptions.Item label="Hạn thanh toán" span={2}>
              {dayjs(bill.dueDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider orientation="left">
          <DollarOutlined /> Chi tiết các khoản phí
        </Divider>

        {/* Debug info */}
        {import.meta.env.DEV && (
          <Alert 
            message={`Debug: Bill status = ${bill.status}, LineItems count = ${bill.lineItems?.length || 0}`} 
            type="warning" 
            style={{ marginBottom: 16 }}
          />
        )}
        
        {bill.lineItems && bill.lineItems.length > 0 ? (
          <Table
            columns={lineItemColumns}
            dataSource={bill.lineItems}
            rowKey={(record, index) => `${record.item}-${index}`}
            pagination={false}
            size="middle"
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong style={{ fontSize: 18, color: "#1890ff" }}>
                      {bill.amountDue.toLocaleString("vi-VN")} ₫
                    </strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <strong>Đã thanh toán</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong style={{ fontSize: 18, color: "#52c41a" }}>
                    {bill.amountPaid.toLocaleString("vi-VN")} ₫
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <strong style={{ color: "#ff4d4f" }}>Còn lại</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong style={{ fontSize: 20, color: "#ff4d4f" }}>
                    {(bill.amountDue - bill.amountPaid).toLocaleString("vi-VN")} ₫
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
          />
        ) : (
          <Alert message="Chưa có chi tiết các khoản phí" type="info" showIcon />
        )}

        {bill.note && (
          <>
            <Divider orientation="left">Ghi chú</Divider>
            <p>{bill.note}</p>
          </>
        )}

        {bill.status !== "PAID" && (
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button
              type="primary"
              size="large"
              icon={<CreditCardOutlined />}
              onClick={handlePayment}
            >
              Thanh toán ngay
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvoiceDetail;
