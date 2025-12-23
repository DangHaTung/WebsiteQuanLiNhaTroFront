import React, { useEffect, useState, useRef } from "react";
import { Alert, Card, Descriptions, Button, message, Space, Tag, Table, Divider, Modal, Spin, Row, Col, Typography, Upload, Form } from "antd";
import { ArrowLeftOutlined, CreditCardOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, FilePdfOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { clientBillService, type Bill } from "../services/bill";
import type { IUserToken } from "../../../types/user";
import type { UploadFile } from "antd/es/upload/interface";
import Tro360Logo from "../../../assets/images/logo.png";

const { Text } = Typography;

const InvoiceDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [receiptBill, setReceiptBill] = useState<Bill | null>(null);
  const [allReceiptBills, setAllReceiptBills] = useState<Bill[]>([]); // Lưu tất cả RECEIPT bills
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [cashPaymentModalVisible, setCashPaymentModalVisible] = useState(false);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

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
          
          // Tìm TẤT CẢ RECEIPT bills có cùng contractId (có thể có nhiều bills khi gia hạn)
          // QUAN TRỌNG: Tính tổng tất cả RECEIPT bills đã PAID, không chỉ lấy 1 bill
          const contractIdStr = typeof data.contractId === 'object' && (data.contractId as any)?._id 
            ? (data.contractId as any)._id 
            : data.contractId;
          
          const relatedReceipts = allBills.filter((b: Bill) => {
            const bContractId = typeof b.contractId === 'object' && (b.contractId as any)?._id 
              ? (b.contractId as any)._id 
              : b.contractId;
            return b.billType === "RECEIPT" && bContractId === contractIdStr;
          });
          
          if (relatedReceipts && relatedReceipts.length > 0) {
            // Lưu tất cả RECEIPT bills để tính tổng
            setAllReceiptBills(relatedReceipts);
            // Lấy receipt bill đầu tiên để setReceiptBill (cho backward compatible)
            setReceiptBill(relatedReceipts[0]);
          } else {
            // Nếu không tìm thấy, log để debug
            console.log("⚠️ RECEIPT bill not found for contractId:", data.contractId);
            setAllReceiptBills([]);
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

  // Helper function để tính số tiền còn lại phải thanh toán
  const getRemainingAmount = (bill: Bill | null): number => {
    if (!bill) return 0;
    // ✅ Nếu đã thanh toán xong thì "Còn lại" luôn = 0
    if (bill.status === "PAID") return 0;

    // Với CONTRACT bill: amountDue đã là tổng tiền cần thanh toán (đã trừ tiền cọc), nên không trừ amountPaid
    if (bill.billType === "CONTRACT") return bill.amountDue || 0;

    const amountPaid = Number(bill.amountPaid || 0);
    const totalFromLineItems =
      bill.lineItems?.reduce((sum: number, item: any) => {
        const v =
          typeof item?.lineTotal === "number"
            ? item.lineTotal
            : parseFloat(item?.lineTotal?.toString?.() || "0") || 0;
        return sum + v;
      }, 0) || 0;

    // Một số flow backend có thể set amountDue=0 sau khi thanh toán/điều chỉnh.
    // Tính "tổng gốc" theo trạng thái:
    // - PARTIALLY_PAID: tổng gốc = amountPaid + amountDue (amountDue thường là phần còn lại)
    // - Các trạng thái khác: ưu tiên amountDue, nếu 0 thì fallback tổng lineItems
    const totalOriginal =
      bill.status === "PARTIALLY_PAID"
        ? amountPaid + Number(bill.amountDue || 0)
        : Number(bill.amountDue || 0) > 0
          ? Number(bill.amountDue || 0)
          : totalFromLineItems;

    return Math.max(0, totalOriginal - amountPaid);
  };

  const handlePayment = () => {
    if (!bill || bill.status === "PAID") {
      message.info("Hóa đơn này đã được thanh toán");
      return;
    }
    
    const remainingAmount = getRemainingAmount(bill);
    
    Modal.confirm({
      title: "Chọn phương thức thanh toán",
      content: (
        <div style={{ marginTop: 16 }}>
          <p>Số tiền: <strong style={{ color: "#1890ff", fontSize: 18 }}>{remainingAmount.toLocaleString("vi-VN")} đ</strong></p>
        </div>
      ),
      okText: "Thanh toán Online",
      cancelText: "Thanh toán",
      onOk: () => handleOnlinePayment(),
      onCancel: () => {
        setCashPaymentModalVisible(true);
      },
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
    // Với CONTRACT bill: amountDue đã là tổng tiền cần thanh toán (đã trừ tiền cọc), nên không trừ amountPaid
    // Với các bill khác: trừ đi amountPaid
    const paymentAmount = getRemainingAmount(bill);

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

  // Thông tin tài khoản ngân hàng
  const bankInfo = {
    accountNumber: "1903 7801 6150 17",
    accountName: "HOANG VAN QUYNH",
    bankName: "TECHCOMBANK",
    bankBin: "970407"
  };

  // Tạo QR code URL từ VietQR API
  const getQRCodeUrl = (amount: number) => {
    const description = `Thanh toan hoa don ${bill?._id?.slice(-6) || ""}`;
    return `https://img.vietqr.io/image/${bankInfo.bankBin}-${bankInfo.accountNumber.replace(/\s/g, "")}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
  };

  const handleCashPayment = async () => {
    if (!bill) return;

    try {
      // Validate upload file
      if (uploadFileList.length === 0) {
        message.error("Vui lòng upload ảnh bill chuyển khoản");
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");
      
      // Tính số tiền còn lại phải thanh toán
      const remainingAmount = getRemainingAmount(bill);
      
      // Tạo FormData để upload file
      const formData = new FormData();
      formData.append("amount", remainingAmount.toString());
      if (uploadFileList[0].originFileObj) {
        formData.append("receiptImage", uploadFileList[0].originFileObj);
      }
      
      const response = await fetch(`${apiUrl}/api/bills/${bill._id}/pay-cash`, {
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
        loadBill(bill._id);
      } else {
        message.error(data.message || "Lỗi khi thanh toán");
      }
    } catch (error) {
      message.error("Lỗi khi thanh toán");
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

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      PAID: "Đã thanh toán",
      UNPAID: "Chưa thanh toán",
      PENDING_CASH_CONFIRM: "Chờ xác nhận",
      PARTIALLY_PAID: "Thanh toán 1 phần",
    };
    return map[status] || status;
  };

  const formatMoney = (n: any) => {
    const num = typeof n === "number" ? n : parseFloat(n?.toString?.() || "0") || 0;
    return `${num.toLocaleString("vi-VN")} ₫`;
  };

  const getRoomNumberFromBill = (b: Bill | null) => {
    if (!b) return "N/A";
    try {
      const contract = b.contractId && typeof b.contractId === "object" ? (b.contractId as any) : null;
      const room = contract?.roomId && typeof contract.roomId === "object" ? contract.roomId : null;
      return room?.roomNumber || room?.name || "N/A";
    } catch {
      return "N/A";
    }
  };

  const getTenantNameFromBill = (b: Bill | null) => {
    if (!b) return "N/A";
    // Ưu tiên bill.tenantId
    const tn =
      b.tenantId && typeof b.tenantId === "object"
        ? (b.tenantId as any)?.fullName
        : undefined;
    if (tn) return tn;
    // Fallback contract.tenantId
    const contract = b.contractId && typeof b.contractId === "object" ? (b.contractId as any) : null;
    const ctn =
      contract?.tenantId && typeof contract.tenantId === "object"
        ? contract.tenantId?.fullName
        : undefined;
    return ctn || "N/A";
  };

  const getPaymentMethodText = (b: any) => {
    const payments = Array.isArray(b?.payments) ? b.payments : [];
    const last = payments.length ? payments[payments.length - 1] : null;
    const method = (last?.method || "").toString().toUpperCase();
    const hasCashPaymentRequest = !!b?.metadata?.cashPaymentRequest;
    const map: Record<string, string> = {
      CASH: "Tiền mặt",
      BANK: "Chuyển khoản ngân hàng",
      MOMO: "MoMo",
      VNPAY: "VNPAY",
      ZALOPAY: "ZaloPay",
      OTHER: "Khác",
      REDIRECT: "Thanh toán online",
    };
    // Nếu tenant gửi ảnh bill chuyển khoản (cashPaymentRequest) thì hiển thị là chuyển khoản
    // (backend hiện đang dùng endpoint pay-cash cho cả chuyển khoản/tiền mặt)
    if (hasCashPaymentRequest) {
      // Nếu đang chờ xác nhận
      if (b?.status === "PENDING_CASH_CONFIRM") return "Chuyển khoản ngân hàng (chờ xác nhận)";
      // Nếu đã PAID, coi như đã xác nhận chuyển khoản
      if (b?.status === "PAID") return "Chuyển khoản ngân hàng";
    }

    if (method && map[method]) return map[method];

    // Fallback dựa trên status
    if (b?.status === "PENDING_CASH_CONFIRM") return "Chuyển khoản (chờ xác nhận)";
    if (b?.status === "PAID") return "Đã thanh toán (không có dữ liệu phương thức)";
    return "Chưa thanh toán";
  };

  // Export PDF function
  const handleExportPDF = async () => {
    if (!pdfRef.current || !bill) return;
    
    try {
      setExporting(true);
      message.loading({ content: "Đang tạo PDF...", key: "export-pdf" });
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const renderWidth = pdfWidth - margin * 2;
      const imgHeightMm = (canvas.height * renderWidth) / canvas.width;

      // Multi-page support
      let heightLeft = imgHeightMm;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, renderWidth, imgHeightMm);
      heightLeft -= pdfHeight - margin * 2;

      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imgHeightMm - heightLeft);
        pdf.addImage(imgData, "PNG", margin, position, renderWidth, imgHeightMm);
        heightLeft -= pdfHeight - margin * 2;
      }
      
      // Tạo tên file
      const billingMonth = dayjs(bill.billingDate).subtract(1, "month");
      const monthStr = billingMonth.format("MM-YYYY");
      const billTypeStr = bill.billType === "MONTHLY" ? "HangThang" : bill.billType === "CONTRACT" ? "HopDong" : "PhieuThu";
      
      // Lấy tên phòng từ contractId.roomId (nếu đã populate)
      let roomName = "";
      if (bill.contractId && typeof bill.contractId === "object") {
        const contract = bill.contractId as any;
        if (contract.roomId && typeof contract.roomId === "object") {
          roomName = contract.roomId.name || contract.roomId.roomNumber || "";
        }
      }
      const roomStr = roomName ? `_${roomName.replace(/\s+/g, "")}` : "";
      const invoiceNo = bill._id ? bill._id.slice(-6).toUpperCase() : "HOADON";
      const fileName = `HoaDon_${billTypeStr}${roomStr}_${invoiceNo}_T${monthStr}.pdf`;
      
      pdf.save(fileName);
      message.success({ content: "Xuất PDF thành công!", key: "export-pdf" });
    } catch (error) {
      console.error("Export PDF error:", error);
      message.error({ content: "Lỗi khi xuất PDF", key: "export-pdf" });
    } finally {
      setExporting(false);
    }
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

  const totalFromLineItems =
    bill.lineItems?.reduce((sum: number, item: any) => {
      const v =
        typeof item?.lineTotal === "number"
          ? item.lineTotal
          : parseFloat(item?.lineTotal?.toString?.() || "0") || 0;
      return sum + v;
    }, 0) || 0;

  const paidForDisplay =
    bill.status === "PAID" && (!bill.amountPaid || Number(bill.amountPaid) === 0)
      ? totalFromLineItems
      : Number(bill.amountPaid || 0);

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space style={{ marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/invoices")}>
            Quay lại
          </Button>
          <Button 
            type="primary" 
            icon={<FilePdfOutlined />} 
            onClick={handleExportPDF}
            loading={exporting}
          >
            Xuất PDF
          </Button>
        </Space>

        {/* Phần nội dung hóa đơn (UI) */}
        <div ref={invoiceRef} style={{ backgroundColor: "#fff", padding: 16 }}>
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
          {/* Tên phòng */}
          {bill.contractId && typeof bill.contractId === "object" && (bill.contractId as any).roomId && typeof (bill.contractId as any).roomId === "object" && (
            <Descriptions.Item label="Phòng">
              <strong>{(bill.contractId as any).roomId.name || (bill.contractId as any).roomId.roomNumber || "N/A"}</strong>
            </Descriptions.Item>
          )}
          {/* Tên người thuê */}
          {(() => {
            let tenantName = "";
            // Ưu tiên lấy từ bill.tenantId
            if (bill.tenantId && typeof bill.tenantId === "object" && (bill.tenantId as any).fullName) {
              tenantName = (bill.tenantId as any).fullName;
            }
            // Fallback: lấy từ contractId.tenantId
            else if (bill.contractId && typeof bill.contractId === "object") {
              const contract = bill.contractId as any;
              if (contract.tenantId && typeof contract.tenantId === "object" && contract.tenantId.fullName) {
                tenantName = contract.tenantId.fullName;
              }
            }
            return tenantName ? (
              <Descriptions.Item label="Người thuê">
                <strong>{tenantName}</strong>
              </Descriptions.Item>
            ) : null;
          })()}
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

              // Tính toán các khoản từ TẤT CẢ RECEIPT bills
              // QUAN TRỌNG: Tính tổng tất cả RECEIPT bills đã PAID, không chỉ lấy 1 bill
              let receiptAmount = 0;
              let receiptStatus = "Chưa thanh toán";
              
              // Sử dụng allReceiptBills nếu có, nếu không thì dùng receiptBill (backward compatible)
              const receiptsToCalculate = allReceiptBills.length > 0 ? allReceiptBills : (receiptBill ? [receiptBill] : []);
              
              if (receiptsToCalculate.length > 0) {
                // Tính tổng tất cả RECEIPT bills đã PAID
                const paidReceiptBills = receiptsToCalculate.filter((b: Bill) => b.status === "PAID");
                if (paidReceiptBills.length > 0) {
                  receiptAmount = paidReceiptBills.reduce((sum: number, b: Bill) => {
                    const amountPaid = convertToNumber(b.amountPaid);
                    if (amountPaid > 0) {
                      return sum + amountPaid;
                    } else if (b.lineItems && b.lineItems.length > 0) {
                      // Fallback: lấy từ lineItems nếu amountPaid = 0
                      return sum + convertToNumber(b.lineItems[0]?.lineTotal);
                    }
                    return sum;
                  }, 0);
                  receiptStatus = "Đã thanh toán";
                } else {
                  // Nếu không có bill nào đã PAID, lấy tổng amountDue của các bills chưa thanh toán
                  receiptAmount = receiptsToCalculate.reduce((sum: number, b: Bill) => {
                    return sum + convertToNumber(b.amountDue);
                  }, 0);
                  const hasPendingConfirm = receiptsToCalculate.some((b: Bill) => b.status === "PENDING_CASH_CONFIRM");
                  receiptStatus = hasPendingConfirm ? "Chờ xác nhận tiền mặt" : "Chờ thanh toán";
                }
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
                            {getRemainingAmount(bill).toLocaleString("vi-VN")} ₫
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
        </div>
        {/* Kết thúc phần nội dung export PDF */}

        {/* ===== PDF TEMPLATE (ẩn) ===== */}
        <div style={{ position: "absolute", left: -10000, top: 0, width: 0, height: 0, overflow: "hidden" }}>
          <div
            ref={pdfRef}
            style={{
              width: 794, // gần khổ A4 khi render canvas
              background: "#fff",
              color: "#000",
              fontFamily: "Arial, Helvetica, sans-serif",
              padding: 32,
              boxSizing: "border-box",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 120 }}>
                <img
                  src={Tro360Logo}
                  alt="Tro360"
                  style={{ width: "120px", height: "auto", display: "block" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase" }}>
                  Hệ thống Trọ 360
                </div>
                <div style={{ fontSize: 12, marginTop: 6, lineHeight: 1.45 }}>
                  Website: tro360.io.vn
                  <br />
                  Địa chỉ: 39 Ngõ 113 Yên Hoà - Cầu Giấy, Hà Nội
                  <br />
                  Hotline: 0842 346 871 — Email: admin@tro360.io.vn
                </div>
              </div>
              <div style={{ width: 210, textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>
                  Trạng thái:{" "}
                  <span style={{ color: bill.status === "PAID" ? "#16a34a" : "#dc2626" }}>
                    {getStatusText(bill.status)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #999", marginTop: 16 }} />

            {/* Title */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>
                  HÓA ĐƠN {bill._id ? bill._id.slice(-6).toUpperCase() : ""}
                </div>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  Hóa đơn ngày (Date invoice): <strong>{dayjs(bill.billingDate).format("DD/MM/YYYY")}</strong>
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Ngày đến hạn (Due date):{" "}
                  <strong>{dayjs((bill as any).dueDate || bill.billingDate).format("DD/MM/YYYY")}</strong>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #999", marginTop: 16 }} />

            {/* Buyer info */}
            <div style={{ marginTop: 14, fontSize: 12, lineHeight: 1.6 }}>
              <div>
                Họ tên người mua hàng (Buyer): <strong>{getTenantNameFromBill(bill)}</strong>
              </div>
              <div>
                Phòng (Room): <strong>{getRoomNumberFromBill(bill)}</strong>
              </div>
              <div>
                Hình thức thanh toán (Payment method): <strong>{getPaymentMethodText(bill as any)}</strong>
              </div>
            </div>

            {/* Table */}
            <div style={{ marginTop: 16 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #333", padding: "8px 6px", width: 48 }}>STT</th>
                    <th style={{ border: "1px solid #333", padding: "8px 6px" }}>
                      Tên hàng hóa, dịch vụ
                      <div style={{ fontSize: 11, fontStyle: "italic", fontWeight: 500 }}>
                        (Name of goods and services)
                      </div>
                    </th>
                    <th style={{ border: "1px solid #333", padding: "8px 6px", width: 80 }}>Số lượng</th>
                    <th style={{ border: "1px solid #333", padding: "8px 6px", width: 120 }}>Đơn giá</th>
                    <th style={{ border: "1px solid #333", padding: "8px 6px", width: 130 }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(bill.lineItems || []).map((it: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ border: "1px solid #333", padding: "8px 6px", textAlign: "center" }}>
                        {idx + 1}
                      </td>
                      <td style={{ border: "1px solid #333", padding: "8px 6px" }}>
                        {it.item || "N/A"}
                        {/* Hiển thị số điện cũ/mới nếu có */}
                        {String(it.item || "").toLowerCase().includes("tiền điện") && (bill as any).electricityReading ? (
                          <div style={{ fontSize: 11, color: "#111", marginTop: 4 }}>
                            Số cũ: {(bill as any).electricityReading?.previous ?? 0} → Số mới:{" "}
                            {(bill as any).electricityReading?.current ?? 0}
                          </div>
                        ) : null}
                      </td>
                      <td style={{ border: "1px solid #333", padding: "8px 6px", textAlign: "right" }}>
                        {Number(it.quantity || 0).toLocaleString("vi-VN")}
                      </td>
                      <td style={{ border: "1px solid #333", padding: "8px 6px", textAlign: "right" }}>
                        {formatMoney(it.unitPrice)}
                      </td>
                      <td style={{ border: "1px solid #333", padding: "8px 6px", textAlign: "right" }}>
                        {formatMoney(it.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
              <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: 320 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px 10px", border: "1px solid #333", fontWeight: 700 }}>
                      Tổng (Total)
                    </td>
                    <td style={{ padding: "8px 10px", border: "1px solid #333", textAlign: "right", fontWeight: 700 }}>
                      {formatMoney(totalFromLineItems)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 10px", border: "1px solid #333", fontWeight: 700 }}>
                      Đã thanh toán
                    </td>
                    <td style={{ padding: "8px 10px", border: "1px solid #333", textAlign: "right", color: "#16a34a", fontWeight: 700 }}>
                      {formatMoney(paidForDisplay)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 10px", border: "1px solid #333", fontWeight: 800, color: "#dc2626" }}>
                      Còn lại
                    </td>
                    <td style={{ padding: "8px 10px", border: "1px solid #333", textAlign: "right", fontWeight: 800, color: "#dc2626" }}>
                      {formatMoney(getRemainingAmount(bill))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note + signature */}
            <div style={{ marginTop: 18, fontSize: 12 }}>
              <div style={{ fontWeight: 700 }}>Ghi chú</div>
              <div style={{ marginTop: 6 }}>{bill.note || "-"}</div>
            </div>
          </div>
        </div>

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
          {bill && (
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
                        {getRemainingAmount(bill).toLocaleString("vi-VN")} ₫
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Bên phải: QR Code */}
                <Col xs={24} md={12}>
                  <Card title="Quét mã QR để chuyển khoản" style={{ marginBottom: 24 }}>
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={getQRCodeUrl(getRemainingAmount(bill))}
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
                  <Button onClick={() => {
                    setCashPaymentModalVisible(false);
                    setUploadFileList([]);
                    form.resetFields();
                  }}>
                    Hủy
                  </Button>
                  <Button type="primary" onClick={handleCashPayment}>
                    Xác nhận đã chuyển khoản
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

export default InvoiceDetail;
