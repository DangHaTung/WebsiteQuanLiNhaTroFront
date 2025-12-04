import React, { useEffect, useState } from "react";
import { Alert, Card, Descriptions, Button, message, Space, Tag, Table, Divider, Modal, Spin, Row, Col, Typography } from "antd";
import { ArrowLeftOutlined, CreditCardOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { clientBillService, type Bill } from "../services/bill";
import type { IUserToken } from "../../../types/user";

const { Text } = Typography;

const InvoiceDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [receiptBill, setReceiptBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Lấy userId từ token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<IUserToken>(token);
        setCurrentUserId(decoded.id || null);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Helper function để kiểm tra user có phải là co-tenant (không phải main tenant)
  const isCoTenant = (bill: Bill | null): boolean => {
    if (!currentUserId || !bill) return false;
    
    // Nếu bill có tenantId và khớp với currentUserId, thì là main tenant
    const billTenantId = typeof bill.tenantId === 'object' && bill.tenantId?._id 
      ? bill.tenantId._id 
      : bill.tenantId;
    if (billTenantId === currentUserId) {
      return false; // Là main tenant
    }

    // Kiểm tra contractId (nếu đã được populate)
    const contract = typeof bill.contractId === 'object' ? bill.contractId : null;
    if (!contract) return false;

    // Nếu contract.tenantId = currentUserId, thì là main tenant
    const contractTenantId = typeof contract.tenantId === 'object' && contract.tenantId?._id 
      ? contract.tenantId._id 
      : contract.tenantId;
    if (contractTenantId === currentUserId) {
      return false; // Là main tenant
    }

    // Kiểm tra xem currentUserId có trong coTenants không
    if (contract.coTenants && Array.isArray(contract.coTenants)) {
      const isInCoTenants = contract.coTenants.some((ct: any) => {
        const ctUserId = typeof ct.userId === 'object' && ct.userId?._id 
          ? ct.userId._id 
          : ct.userId;
        return ctUserId === currentUserId && ct.status === "ACTIVE";
      });
      return isInCoTenants; // Nếu có trong coTenants nhưng không phải tenantId, thì là co-tenant
    }

    return false;
  };

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
      
      // Nếu là CONTRACT bill, tìm RECEIPT bill liên quan
      if (data.billType === "CONTRACT" && data.contractId) {
        try {
          // Load tất cả bills để tìm RECEIPT bill
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
          const token = localStorage.getItem("token");
          const response = await fetch(`${apiUrl}/api/bills/my-bills?limit=100`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          const billsData = await response.json();
          const allBills = billsData.data || [];
          
          // Tìm RECEIPT bill có cùng contractId (RECEIPT bill được tạo cùng contract với CONTRACT bill)
          const contractIdStr = typeof data.contractId === 'object' && (data.contractId as any)?._id 
            ? (data.contractId as any)._id 
            : data.contractId;
          
          const relatedReceipt = allBills.find((b: Bill) => {
            const bContractId = typeof b.contractId === 'object' && (b.contractId as any)?._id 
              ? (b.contractId as any)._id 
              : b.contractId;
            return b.billType === "RECEIPT" && bContractId === contractIdStr;
          });
          
          if (relatedReceipt) {
            setReceiptBill(relatedReceipt);
          } else {
            // Nếu không tìm thấy, log để debug
            console.log("⚠️ RECEIPT bill not found for contractId:", data.contractId);
          }
        } catch (err) {
          console.error("Error loading receipt bill:", err);
          // Không hiển thị lỗi, chỉ log
        }
      }
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

    // Helper function để convert số
    const convertToNumber = (value: any): number => {
      if (typeof value === 'number' && !isNaN(value)) {
        return value;
      } else if (typeof value === 'string') {
        return parseFloat(value) || 0;
      }
      return 0;
    };

    // Tính số tiền cần thanh toán (số tiền còn lại)
    let paymentAmount = 0;
    if (bill.billType === "CONTRACT" && bill.lineItems && bill.lineItems.length > 0) {
      // Với CONTRACT bill: tính tổng từ lineItems
      // Nếu status = UNPAID, số tiền cần thanh toán = tổng từ lineItems (KHÔNG trừ amountPaid)
      // Vì amountPaid có thể là số tiền từ RECEIPT bill, không phải số tiền đã thanh toán cho CONTRACT bill
      let totalFromLineItems = 0;
      bill.lineItems.forEach((item: any) => {
        const itemTotal = convertToNumber(item.lineTotal);
        totalFromLineItems += itemTotal;
        console.log(`📋 CONTRACT lineItem (Frontend): ${item.item} = ${itemTotal}`);
      });
      
      // Chỉ trừ amountPaid nếu status là PARTIALLY_PAID (đã thanh toán một phần CONTRACT bill)
      // Với UNPAID hoặc PENDING_CASH_CONFIRM: số tiền cần thanh toán = tổng từ lineItems (KHÔNG trừ amountPaid)
      if (bill.status === "PARTIALLY_PAID") {
        const amountPaid = convertToNumber(bill.amountPaid || 0);
        paymentAmount = totalFromLineItems - amountPaid;
      } else {
        // Với UNPAID hoặc PENDING_CASH_CONFIRM: số tiền cần thanh toán = tổng từ lineItems
        paymentAmount = totalFromLineItems;
      }
      
      console.log("📊 Payment calculation (Frontend):", {
        totalFromLineItems,
        amountPaid: convertToNumber(bill.amountPaid || 0),
        paymentAmount,
        billAmountDue: convertToNumber(bill.amountDue),
        status: bill.status
      });
      
      // Đảm bảo paymentAmount >= 0
      if (paymentAmount < 0) paymentAmount = 0;
    } else {
      // Với các bill khác: dùng amountDue - amountPaid
      paymentAmount = convertToNumber(bill.amountDue) - convertToNumber(bill.amountPaid || 0);
    }

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
            amount: paymentAmount,
            returnUrl: `${window.location.origin}/invoices`
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          console.error(`❌ Payment error (${provider}):`, data);
          const errorMsg = data.message || data.error || `Lỗi ${response.status}: Không thể tạo link thanh toán`;
          message.error(errorMsg);
          return;
        }

        let paymentUrl = null;
        if (provider === "vnpay") {
          paymentUrl = data.url || data.paymentUrl;
        } else if (provider === "momo") {
          paymentUrl = data.payUrl || data.data?.payUrl;
        } else if (provider === "zalopay") {
          paymentUrl = data.order_url || data.zaloData?.order_url;
        }

        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          message.error(data.message || data.error || "Lỗi tạo link thanh toán");
        }
      } catch (error: any) {
        console.error(`❌ Payment connection error (${provider}):`, error);
        message.error("Lỗi kết nối payment gateway");
      }
    };

    Modal.info({
      title: "Chọn cổng thanh toán",
      width: 500,
      content: (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>
            Số tiền: <strong style={{ color: "#1890ff" }}>{paymentAmount.toLocaleString("vi-VN")} đ</strong>
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
      PENDING_CASH_CONFIRM: { color: "gold", text: "Chờ xác nhận tiền mặt", icon: <ClockCircleOutlined /> },
      PARTIALLY_PAID: { color: "warning", text: "Thanh toán 1 phần", icon: <ClockCircleOutlined /> },
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
      render: (item: string) => {
        // Kiểm tra nếu là dòng tiền điện (không phải xe điện)
        const isElectricityFee = item && item.toLowerCase().includes("tiền điện");
        if (isElectricityFee) {
          // Ưu tiên hiển thị từ electricityReading nếu có
          if (bill?.electricityReading) {
            const { previous, current } = bill.electricityReading;
            return (
              <div>
                <div>{item}</div>
                {(previous !== undefined || current !== undefined) && (
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                     Số cũ: <strong>{previous ?? 0}</strong> → Số mới: <strong>{current ?? 0}</strong>
                  
                  </div>
                )}
              </div>
            );
          }
          // Fallback: parse số kWh từ tên item nếu không có electricityReading
          const kwhMatch = item.match(/\((\d+(?:\.\d+)?)\s*kWh\)/i);
          if (kwhMatch && kwhMatch[1]) {
            const kwh = Number(kwhMatch[1]);
            return (
              <div>
                <div>{item}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                   Tiêu thụ: <strong>{kwh} kWh</strong>
                </div>
              </div>
            );
          }
        }
        return item || "N/A";
      },
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
          <h2 style={{ margin: 0 }}>
            {bill.billType === "RECEIPT" 
              ? "Chi tiết phiếu thu"
              : bill.billType === "CONTRACT"
              ? "Chi tiết hóa đơn hợp đồng"
              : bill.billType === "MONTHLY"
              ? "Chi tiết hóa đơn hàng tháng"
              : "Chi tiết hóa đơn"}
          </h2>
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

        {/* Hiển thị chi tiết cho CONTRACT bill */}
        {bill.billType === "CONTRACT" ? (
          <div>
            {(() => {
              // Helper function để convert số
              const convertToNumber = (value: any): number => {
                if (typeof value === 'number' && !isNaN(value)) {
                  return value;
                } else if (typeof value === 'string') {
                  return parseFloat(value) || 0;
                }
                return 0;
              };

              // Tính toán các khoản từ RECEIPT bill
              // Nếu có receiptBill, dùng dữ liệu từ đó
              // Nếu không có receiptBill nhưng bill.amountPaid > 0, dùng amountPaid làm fallback
              let receiptAmount = 0;
              let receiptStatus = "Chưa thanh toán";
              if (receiptBill) {
                if (receiptBill.status === "PAID") {
                  receiptAmount = convertToNumber(receiptBill.amountPaid);
                  if (receiptAmount === 0 && receiptBill.lineItems && receiptBill.lineItems.length > 0) {
                    receiptAmount = convertToNumber(receiptBill.lineItems[0]?.lineTotal);
                  }
                  receiptStatus = "Đã thanh toán";
                } else {
                  receiptAmount = convertToNumber(receiptBill.amountDue);
                  receiptStatus = receiptBill.status === "PENDING_CASH_CONFIRM" ? "Chờ xác nhận tiền mặt" : "Chờ thanh toán";
                }
              } else {
                // Nếu không có receiptBill, không hiển thị khoản "Cọc giữ phòng"
                // (Không dùng bill.amountPaid vì đó là số tiền đã thanh toán của CONTRACT bill, không phải RECEIPT bill)
                receiptAmount = 0;
                receiptStatus = "Chưa thanh toán";
              }

              // Lấy từ lineItems của CONTRACT bill
              let depositRemaining = 0; // Cọc còn lại
              let firstMonthRent = 0; // Tiền thuê tháng đầu
              let contractStatus = "Chờ thanh toán";
              let totalDue = 0; // Tổng phải thanh toán
              
              contractStatus = bill.status === "PAID" ? "Đã thanh toán" 
                : bill.status === "PARTIALLY_PAID" ? "Thanh toán 1 phần"
                : bill.status === "PENDING_CASH_CONFIRM" ? "Chờ xác nhận tiền mặt"
                : "Chờ thanh toán";
              
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
              
              // Tổng phải thanh toán = tổng từ lineItems (depositRemaining + firstMonthRent)
              // Không dùng amountDue vì có thể không chính xác
              totalDue = depositRemaining + firstMonthRent;

              return (
                <div>
                  {/* 1. Cọc giữ phòng - Chỉ hiển thị khi có receiptBill */}
                  {receiptBill && receiptAmount > 0 && (
                    <div style={{ marginBottom: 16, padding: 12, border: "1px solid #d9d9d9", borderRadius: 4 }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong>1. Cọc giữ phòng</Text>
                        </Col>
                        <Col>
                          <Space>
                            <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                              {receiptAmount.toLocaleString("vi-VN")} đ
                            </Text>
                            <Tag color={receiptStatus === "Đã thanh toán" ? "success" : receiptStatus === "Chờ xác nhận tiền mặt" ? "warning" : "error"}>
                              {receiptStatus}
                            </Tag>
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* 2. Cọc 1 tháng tiền phòng */}
                  {depositRemaining > 0 && (
                    <div style={{ marginBottom: 16, padding: 12, border: "1px solid #d9d9d9", borderRadius: 4 }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong>2. Cọc 1 tháng tiền phòng</Text>
                        </Col>
                        <Col>
                          <Space>
                            <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                              {depositRemaining.toLocaleString("vi-VN")} đ
                            </Text>
                            <Tag color={
                              bill.status === "PAID" ? "success" 
                              : bill.status === "PENDING_CASH_CONFIRM" ? "warning"
                              : "error"
                            }>
                              {bill.status === "PAID" ? "Đã thanh toán"
                                : bill.status === "PENDING_CASH_CONFIRM" ? "Chờ xác nhận tiền mặt"
                                : "Chờ thanh toán"}
                            </Tag>
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* 3. Tiền phòng tháng đầu */}
                  {firstMonthRent > 0 && (
                    <div style={{ marginBottom: 16, padding: 12, border: "1px solid #d9d9d9", borderRadius: 4 }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong>3. Tiền phòng tháng đầu</Text>
                        </Col>
                        <Col>
                          <Space>
                            <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                              {firstMonthRent.toLocaleString("vi-VN")} đ
                            </Text>
                            <Tag color={
                              bill.status === "PAID" ? "success" 
                              : bill.status === "PENDING_CASH_CONFIRM" ? "warning"
                              : "error"
                            }>
                              {bill.status === "PAID" ? "Đã thanh toán"
                                : bill.status === "PENDING_CASH_CONFIRM" ? "Chờ xác nhận tiền mặt"
                                : "Chờ thanh toán"}
                            </Tag>
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* Tổng phải thanh toán - Chỉ hiển thị khi chưa thanh toán */}
                  {totalDue > 0 && bill.status !== "PAID" && (
                    <div style={{ marginTop: 24, padding: 16, backgroundColor: "#f0f2f5", borderRadius: 4, border: "2px solid #1890ff" }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong style={{ fontSize: 18 }}>Tổng phải thanh toán</Text>
                        </Col>
                        <Col>
                          <Text strong style={{ color: "#1890ff", fontSize: 20 }}>
                            {totalDue.toLocaleString("vi-VN")} đ
                          </Text>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          /* Hiển thị bình thường cho các bill khác (RECEIPT, MONTHLY, etc.) */
          bill.lineItems && bill.lineItems.length > 0 ? (
          <Table
            columns={lineItemColumns}
            dataSource={bill.lineItems}
            rowKey={(record, index) => `${record.item}-${index}`}
            pagination={false}
            size="middle"
            summary={() => {
              // Tính tổng từ lineItems (đảm bảo hiển thị đúng số tiền)
              const totalFromLineItems = bill.lineItems?.reduce((sum: number, item: any) => {
                const itemTotal = typeof item.lineTotal === 'number' 
                  ? item.lineTotal 
                  : parseFloat(item.lineTotal?.toString() || '0') || 0;
                return sum + itemTotal;
              }, 0) || 0;
              
              // Với RECEIPT bill: Tổng cộng = tổng từ lineItems hoặc amountPaid (nếu đã thanh toán)
              const totalAmount = bill.billType === "RECEIPT" 
                ? (bill.status === "PAID" && bill.amountPaid > 0 ? bill.amountPaid : totalFromLineItems)
                : totalFromLineItems;
              
              return (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <strong>Tổng cộng</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong style={{ fontSize: 18, color: "#1890ff" }}>
                        {totalAmount.toLocaleString("vi-VN")} ₫
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {bill.billType === "RECEIPT" ? (
                    // Với RECEIPT bill: chỉ hiển thị Trạng thái
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <strong>Trạng thái</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        {getStatusTag(bill.status)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  ) : (
                    // Với các bill khác: hiển thị Đã thanh toán và Còn lại
                    <>
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
                    </>
                  )}
                </Table.Summary>
              );
            }}
          />
        ) : (
          <Alert message="Chưa có chi tiết các khoản phí" type="info" showIcon />
          )
        )}

        {bill.note && (
          <>
            <Divider orientation="left">Ghi chú</Divider>
            <p>{bill.note}</p>
          </>
        )}

        {bill.status !== "PAID" && !isCoTenant(bill) && (
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
        {bill.status !== "PAID" && isCoTenant(bill) && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Alert
              message="Chỉ người đại diện (người làm hợp đồng) mới có thể thanh toán hóa đơn này"
              type="info"
              showIcon
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvoiceDetail;
