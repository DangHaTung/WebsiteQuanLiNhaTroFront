import React, { useEffect, useState } from "react";
import { Table, Tag, Card, Button, message, Space, Tabs, Row, Col, Statistic, Modal, Upload, Alert, Form } from "antd";
import { FileTextOutlined, CreditCardOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { clientBillService, type Bill } from "../services/bill";
import type { IUserToken } from "../../../types/user";
import type { UploadFile } from "antd/es/upload/interface";
import { useSocket } from "../../../contexts/SocketContext";

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"unpaid" | "paid">("unpaid");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [cashPaymentModalVisible, setCashPaymentModalVisible] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [submittingCashPayment, setSubmittingCashPayment] = useState(false);

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
  const isCoTenant = (bill: Bill): boolean => {
    if (!currentUserId) return false;
    
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

  // Realtime: refresh bills when receiving BILL_CREATED or new-bill events
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      try {
        const n = data?.notification;
        if (n?.type === "BILL_CREATED") {
          message.info("Có hóa đơn mới, đang cập nhật...");
          loadBills();
        }
      } catch (err) {
        console.error("[Invoices] handleNewNotification error:", err);
      }
    };

    const handleNewBill = (_data: any) => {
      message.info("Có hóa đơn mới được phát hành.");
      loadBills();
    };

    socket.on("new-notification", handleNewNotification);
    socket.on("new-bill", handleNewBill);

    return () => {
      socket.off("new-notification", handleNewNotification);
      socket.off("new-bill", handleNewBill);
    };
  }, [socket]);

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
    
    // Tính số tiền còn lại phải thanh toán
    // Với CONTRACT bill: amountDue đã là tổng tiền cần thanh toán (đã trừ tiền cọc), nên không trừ amountPaid
    // Với các bill khác: trừ đi amountPaid
    const remainingAmount = bill.billType === "CONTRACT" 
      ? bill.amountDue 
      : bill.amountDue - (bill.amountPaid || 0);
    
    Modal.confirm({
      title: "Chọn phương thức thanh toán",
      content: (
        <div style={{ marginTop: 16 }}>
          <p>Số tiền: <strong style={{ color: "#1890ff", fontSize: 18 }}>{remainingAmount.toLocaleString("vi-VN")} đ</strong></p>
        </div>
      ),
      okText: "Thanh toán Online",
      cancelText: "Thanh toán",
      onOk: () => handleOnlinePayment(bill),
      onCancel: () => {
        setCurrentBill(bill);
        setCashPaymentModalVisible(true);
      },
      width: 500,
    });
  };

  const handleOnlinePayment = async (bill: Bill) => {
    // Tính số tiền còn lại phải thanh toán (dùng chung cho cả modal và payment)
    // Với CONTRACT bill: amountDue đã là tổng tiền cần thanh toán (đã trừ tiền cọc), nên không trừ amountPaid
    // Với các bill khác: trừ đi amountPaid
    const remainingAmount = bill.billType === "CONTRACT" 
      ? bill.amountDue 
      : bill.amountDue - (bill.amountPaid || 0);

    const createPayment = async (provider: "vnpay" | "momo" | "zalopay") => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("token");
        
        const endpoint = provider === "zalopay" 
          ? `${apiUrl}/api/payment/zalopay/create`
          : `${apiUrl}/api/payment/${provider}/create`;

        // Tenant thanh toán xong phải về trang /invoices
        const returnUrl = `${window.location.origin}/invoices`;
        
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
            Số tiền: <strong style={{ color: "#1890ff" }}>{remainingAmount.toLocaleString("vi-VN")} đ</strong>
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

  // Thông tin tài khoản ngân hàng
  const bankInfo = {
    accountNumber: "1903 7801 6150 17",
    accountName: "HOANG VAN QUYNH",
    bankName: "TECHCOMBANK",
    bankBin: "970407"
  };

  // Tạo QR code URL từ VietQR API
  const getQRCodeUrl = (amount: number) => {
    const description = `Thanh toan hoa don ${currentBill?._id?.slice(-6) || ""}`;
    return `https://img.vietqr.io/image/${bankInfo.bankBin}-${bankInfo.accountNumber.replace(/\s/g, "")}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
  };

  // Helper function để tính số tiền còn lại phải thanh toán (giống InvoiceDetail.tsx)
  const getRemainingAmount = (bill: Bill | null): number => {
    if (!bill) return 0;
    // Với CONTRACT bill: amountDue đã là tổng tiền cần thanh toán (đã trừ tiền cọc), nên không trừ amountPaid
    // Với các bill khác: trừ đi amountPaid
    return bill.billType === "CONTRACT" 
      ? bill.amountDue 
      : bill.amountDue - (bill.amountPaid || 0);
  };

  const handleCashPayment = async () => {
    if (!currentBill) return;

    try {
      // Validate upload file
      if (uploadFileList.length === 0) {
        message.error("Vui lòng upload ảnh bill chuyển khoản");
        return;
      }

      setSubmittingCashPayment(true);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");
      
      // Tính số tiền còn lại phải thanh toán (dùng helper function)
      const remainingAmount = getRemainingAmount(currentBill);
      
      // Tạo FormData để upload file
      const formData = new FormData();
      formData.append("amount", remainingAmount.toString());
      if (uploadFileList[0].originFileObj) {
        formData.append("receiptImage", uploadFileList[0].originFileObj);
      }
      
      const response = await fetch(`${apiUrl}/api/bills/${currentBill._id}/pay-cash`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("❌ Pay cash error:", data);
        message.error(data.message || `Lỗi ${response.status}: ${data.error || "Lỗi khi thanh toán"}`);
        return;
      }
      
      if (data.success) {
        message.success("Đã gửi yêu cầu thanh toán. Vui lòng chờ admin xác nhận.");
        setCashPaymentModalVisible(false);
        setUploadFileList([]);
        form.resetFields();
        loadBills();
      } else {
        message.error(data.message || "Lỗi khi thanh toán");
      }
    } catch (error) {
      message.error("Lỗi khi thanh toán");
    } finally {
      setSubmittingCashPayment(false);
    }
  };

  const unpaidBills = bills.filter(b => b.status === "UNPAID" || b.status === "PENDING_CASH_CONFIRM" || b.status === "PARTIALLY_PAID");
  const paidBills = bills.filter(b => b.status === "PAID");
  
  // Tính tổng amountDue của các bill chưa thanh toán (không trừ amountPaid)
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + bill.amountDue, 0);
  
  // Tính tổng "Đã thanh toán": tính tất cả bills đã thanh toán (bao gồm cả RECEIPT, CONTRACT, MONTHLY)
  const totalPaid = paidBills.reduce((sum, bill) => {
    // Với bill đã thanh toán (PAID):
    // - Ưu tiên lấy amountPaid (số tiền đã thanh toán thực tế)
    // - Nếu amountPaid = 0 hoặc không có, lấy từ lineItems
    // - Nếu vẫn không có, lấy amountDue
    let paidAmount = bill.amountPaid || 0;
    
    // Nếu amountPaid = 0, tính từ lineItems
    if (paidAmount === 0 && bill.lineItems && bill.lineItems.length > 0) {
      paidAmount = bill.lineItems.reduce((itemSum: number, item: any) => {
        return itemSum + (item.lineTotal || 0);
      }, 0);
    }
    
    // Nếu vẫn = 0, lấy amountDue
    if (paidAmount === 0) {
      paidAmount = bill.amountDue || 0;
    }
    
    console.log(`[Invoices] Bill ${bill.billType} (${bill._id}): amountPaid=${bill.amountPaid}, amountDue=${bill.amountDue}, calculated=${paidAmount}`);
    
    return sum + paidAmount;
  }, 0);
  
  console.log(`[Invoices] Total Paid: ${totalPaid}, Paid Bills Count: ${paidBills.length}`);
  
  // Debug: Log khi totalPaid thay đổi
  useEffect(() => {
    console.log(`[Invoices] useEffect - totalPaid changed to: ${totalPaid}`);
  }, [totalPaid]);

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

  // Render chi tiết các khoản phí (expandable row)
  const expandedRowRender = (record: Bill) => {
    if (!record.lineItems || record.lineItems.length === 0) {
      return <span style={{ color: "#999" }}>Không có chi tiết</span>;
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
            if (record.electricityReading) {
              const { previous, current } = record.electricityReading;
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
        render: (price: number) => (price?.toLocaleString("vi-VN") || "0") + " ₫",
      },
      {
        title: "Thành tiền",
        dataIndex: "lineTotal",
        key: "lineTotal",
        align: "right" as const,
        render: (total: number) => (
          <strong style={{ color: "#1890ff" }}>
            {(total?.toLocaleString("vi-VN") || "0")} ₫
          </strong>
        ),
      },
    ];

    return (
      <Table
        columns={lineItemColumns}
        dataSource={record.lineItems}
        rowKey={(item, index) => `${item.item}-${index}`}
        pagination={false}
        size="small"
        style={{ margin: 0 }}
      />
    );
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Bill) => {
        const isCoTenantUser = isCoTenant(record);
        return (
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/invoices/${record._id}`)}
            >
              Chi tiết
            </Button>
            {record.status !== "PAID" && !isCoTenantUser && (
              <Button
                type="primary"
                icon={<CreditCardOutlined />}
                onClick={() => handlePayment(record)}
              >
                Thanh toán
              </Button>
            )}
            {record.status !== "PAID" && isCoTenantUser && (
              <span style={{ color: "#999", fontSize: 12 }}>
                Chỉ người đại diện mới có thể thanh toán
              </span>
            )}
          </Space>
        );
      },
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
            💡 Nếu bạn ở chung phòng với người khác, cả hai đều có thể xem thông tin hóa đơn. Chỉ người đại diện (người làm hợp đồng) mới có thể thanh toán. Phiếu thu tiền cọc sẽ hiển thị khi admin tạo và gán cho tài khoản của bạn.
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a" }} />
                <div>
                  <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Đã thanh toán</div>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>
                    {totalPaid.toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              </div>
              {/* Debug */}
       
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
                  expandable={{
                    expandedRowRender,
                    rowExpandable: (record) => record.lineItems && record.lineItems.length > 0,
                  }}
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
                  expandable={{
                    expandedRowRender,
                    rowExpandable: (record) => record.lineItems && record.lineItems.length > 0,
                  }}
                />
              ),
            },
          ]}
        />

        {/* Modal thanh toán tiền mặt */}
        <Modal
          title="Thanh toán"
          open={cashPaymentModalVisible}
          onCancel={() => {
            setCashPaymentModalVisible(false);
            setUploadFileList([]);
            form.resetFields();
          }}
          footer={null}
          width={900}
        >
          {currentBill && (
            <div>
              <Alert
                message="Lưu ý quan trọng"
                description="Vui lòng chuyển đúng số tiền. Nếu chuyển sai số tiền, vui lòng liên hệ với admin để được hỗ trợ."
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />
              
              <Row gutter={24}>
                {/* Bên trái: Thông tin STK */}
                <Col xs={24} md={12}>
                  <Card title="Thông tin chuyển khoản" style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>Ngân hàng:</div>
                      <div style={{ fontSize: 16, fontWeight: "bold" }}>🏦 {bankInfo.bankName}</div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>Số tài khoản:</div>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}>
                        {bankInfo.accountNumber}
                      </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>Tên chủ tài khoản:</div>
                      <div style={{ fontSize: 16, fontWeight: "bold" }}>{bankInfo.accountName}</div>
                    </div>
                    <div>
                      <div style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>Số tiền:</div>
                      <div style={{ fontSize: 20, fontWeight: "bold", color: "#52c41a" }}>
                        {getRemainingAmount(currentBill).toLocaleString("vi-VN")} ₫
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Bên phải: QR Code */}
                <Col xs={24} md={12}>
                  <Card title="Quét mã QR để chuyển khoản" style={{ marginBottom: 24 }}>
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={getQRCodeUrl(getRemainingAmount(currentBill))}
                        alt="QR Code"
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          borderRadius: 8,
                          border: "2px solid #d9d9d9",
                        }}
                      />
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Upload bill chuyển khoản */}
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Upload ảnh bill chuyển khoản"
                  required
                  rules={[{ required: true, message: "Vui lòng upload ảnh bill chuyển khoản" }]}
                >
                  <Upload
                    listType="picture-card"
                    fileList={uploadFileList}
                    onChange={({ fileList }) => setUploadFileList(fileList)}
                    beforeUpload={() => false}
                    accept="image/*"
                    maxCount={1}
                  >
                    {uploadFileList.length < 1 && (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Form>

              <div style={{ textAlign: "right", marginTop: 24 }}>
                <Space>
                  <Button 
                    onClick={() => {
                      setCashPaymentModalVisible(false);
                      setUploadFileList([]);
                      form.resetFields();
                    }}
                    disabled={submittingCashPayment}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleCashPayment}
                    loading={submittingCashPayment}
                    disabled={submittingCashPayment}
                  >
                    {submittingCashPayment ? "Đang xử lý..." : "Xác nhận đã chuyển khoản"}
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Invoices;
