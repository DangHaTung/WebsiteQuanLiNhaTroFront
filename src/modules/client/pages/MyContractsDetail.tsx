import { useState, useEffect } from "react";
import { Card, Descriptions, Divider, Image, Space, Tag, Table, Button, message, Modal, Row, Col, Typography } from "antd";
import { FileTextOutlined, FilePdfOutlined, EyeOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../services/api";
import { clientBillService } from "../services/bill";

const { Text } = Typography;
// Định nghĩa kiểu dữ liệu hợp đồng
interface FinalContract {
  _id: string;
  roomId: { _id: string; roomNumber: string; pricePerMonth: number };
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  status: "DRAFT" | "WAITING_SIGN" | "SIGNED" | "CANCELED";
  originContractId?: string | { _id: string };
  images?: Array<{ url: string; secure_url: string; viewUrl?: string; format?: string }>;
  finalizedAt?: string;
  tenantSignedAt?: string;
  createdAt: string;
}
// Trang chi tiết hợp đồng của khách hàng
const MyContractsDetail = () => {
  const [contracts, setContracts] = useState<FinalContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState<FinalContract | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [bills, setBills] = useState<any[]>([]);
  
  // PDF viewer modal
  const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string>("");

  const handleViewFile = async (file: any, type: "images", index: number) => {
    const isPdf = file.format === "pdf" || 
                  file.secure_url?.includes(".pdf") || 
                  file.secure_url?.includes("/raw/");
    
    if (isPdf && selectedContract?._id) {
      try {
        // Fetch PDF với Authorization header
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("token");
        const typeParam = "contract";
        // Gọi API lấy file PDF
        const response = await fetch(`${apiUrl}/api/final-contracts/${selectedContract._id}/view/${typeParam}/${index}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        // Kiểm tra response
        if (!response.ok) {
          message.error("Không thể tải PDF");
          return;
        }
        
        // Convert response sang blob và tạo URL
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        // Mở PDF trong modal viewer
        setPdfViewerUrl(blobUrl);
        setPdfViewerVisible(true);
        // Lưu ý: URL sẽ được revoke khi đóng modal
      } catch (error) {
        console.error("Load PDF error:", error);
        message.error("Lỗi khi tải PDF");
      }
    } else {
      // Mở ảnh trong tab mới
      const url = file.viewUrl || file.secure_url || file.url;
      window.open(url, "_blank");
    }
  };
// Load danh sách hợp đồng khi component mount
  useEffect(() => {
    loadContracts();
  }, []);
// Hàm load hợp đồng từ API
  const loadContracts = async () => {
    setLoading(true);
    // Gọi API lấy hợp đồng của khách hàng
    try {
      const response = await api.get("/final-contracts/my-contracts");
      setContracts(response.data.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải hợp đồng");
    } finally {
      // Giải phóng tài nguyên
      setLoading(false);
    }
  };
// Helper function để convert số
const convertToNumber = (value: any): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  } else if (typeof value === 'string') {
    return parseFloat(value) || 0;
  } else if (value && typeof value.toString === 'function') {
    return parseFloat(value.toString()) || 0;
  }
  return 0;
};

// Hàm mở modal chi tiết hợp đồng
  const openDetail = async (contract: FinalContract) => {
    setSelectedContract(contract);
    setViewModalVisible(true);
    setBills([]); // Clear bills
    
    // Load full contract details với originContractId và finalizedAt
    try {
      const fullContractResponse = await api.get(`/final-contracts/public/${contract._id}`);
      const fullContract = fullContractResponse.data.data;
      setSelectedContract(fullContract);
      
      // Load bills từ contractId (giống admin)
      const contractId = typeof fullContract.originContractId === 'string' 
        ? fullContract.originContractId 
        : (fullContract.originContractId as { _id: string } | undefined)?._id;
      
      if (contractId) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
          const token = localStorage.getItem("token");
          
          // Load bills từ my-bills API
          const myBillsResponse = await fetch(`${apiUrl}/api/bills/my-bills?limit=100`, {
            headers: { "Authorization": `Bearer ${token}` },
          });
          
          const myBillsData = await myBillsResponse.json();
          const allBillsFromMyBills = myBillsData.data || [];
          
          // Filter: lấy RECEIPT và CONTRACT bills liên quan đến contract này
          const contractBills = allBillsFromMyBills.filter((bill: any) => {
            const billContractId = typeof bill.contractId === 'object' && (bill.contractId as any)?._id 
              ? (bill.contractId as any)._id 
              : bill.contractId;
            
            // Lấy RECEIPT và CONTRACT bills có cùng contractId
            if (billContractId === contractId && (bill.billType === "RECEIPT" || bill.billType === "CONTRACT")) {
              // Nếu là CONTRACT bill, kiểm tra finalContractId (nếu có)
              if (bill.billType === "CONTRACT") {
                const billFinalContractId = typeof bill.finalContractId === 'string' 
                  ? bill.finalContractId 
                  : bill.finalContractId?._id;
                // Nếu có finalContractId, chỉ hiển thị nếu khớp với FinalContract hiện tại
                if (billFinalContractId) {
                  return billFinalContractId === fullContract._id;
                }
                // Nếu không có finalContractId (bill CONTRACT cũ), vẫn hiển thị
                return true;
              }
              // RECEIPT bill: luôn hiển thị nếu có cùng contractId
              return true;
            }
            return false;
          });
          
          setBills(contractBills);
        } catch (error) {
          console.error("Load bills error:", error);
          setBills([]);
        }
      } else {
        // Fallback: load từ finalContractId nếu không có contractId
        try {
          const billsData = await clientBillService.getBillsByFinalContract(contract._id);
          setBills(billsData);
        } catch (error) {
          console.error("Load bills error:", error);
          setBills([]);
        }
      }
    } catch (error) {
      console.error("Load contract detail error:", error);
      // Fallback: load từ finalContractId
      try {
        const billsData = await clientBillService.getBillsByFinalContract(contract._id);
        setBills(billsData);
      } catch (err) {
        console.error("Load bills error:", err);
        setBills([]);
      }
    }
  };
// Hàm hiển thị tag trạng thái hợp đồng
  const getStatusTag = (status: string, record?: FinalContract) => {
    if (status === "CANCELED") {
      return <Tag color="error">Đã hủy</Tag>;
    }
    
    // Logic: File hợp đồng chỉ được upload khi đã thanh toán hóa đơn hợp đồng
    // Hợp đồng có hiệu lực từ ngày upload file (finalizedAt), không phải từ ngày check-in (startDate)
    if (record) {
      const hasImages = record.images && Array.isArray(record.images) && record.images.length > 0;
      
      if (hasImages) {
        // Đã upload file → hợp đồng có hiệu lực từ ngày upload file (finalizedAt hoặc tenantSignedAt)
        const now = dayjs();
        // Ngày bắt đầu hiệu lực = ngày upload file (finalizedAt hoặc tenantSignedAt)
        const effectiveStartDate = record.finalizedAt 
          ? dayjs(record.finalizedAt) 
          : (record.tenantSignedAt ? dayjs(record.tenantSignedAt) : dayjs(record.startDate));
        // EndDate vẫn dùng từ record.endDate (tính từ ngày check-in + duration)
        const endDate = dayjs(record.endDate);
        
        if (now.isBefore(effectiveStartDate)) {
          return <Tag color="default">Chưa hiệu lực</Tag>;
        } else if (now.isAfter(endDate)) {
          return <Tag color="warning">Hết hạn</Tag>;
        } else {
          return <Tag color="success">Hiệu lực</Tag>;
        }
      }
    }
    
    // Nếu chưa upload file → hiển thị các trạng thái khác
    if (status === "DRAFT") {
      return <Tag color="default">Chờ upload file</Tag>;
    }
    if (status === "WAITING_SIGN") {
      return <Tag color="processing">Chờ ký</Tag>;
    }
    if (status === "SIGNED") {
      // Nếu SIGNED nhưng chưa có images, vẫn hiển thị "Chờ upload file"
      return <Tag color="default">Chờ upload file</Tag>;
    }
    return <Tag color="default">{status || "N/A"}</Tag>;
  };
// Hàm hiển thị tag trạng thái hóa đơn
  const getBillStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      PAID: { color: "success", text: "Đã thanh toán" },
      UNPAID: { color: "error", text: "Chưa thanh toán" },
      PENDING_CASH_CONFIRM: { color: "gold", text: "Chờ xác nhận tiền mặt" },
      PARTIALLY_PAID: { color: "processing", text: "Thanh toán 1 phần" },
    };
    const s = statusMap[status] || { color: "default", text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };
// Định nghĩa cột cho bảng hợp đồng
  const columns = [
    {
      title: "Phòng",
      dataIndex: ["roomId", "roomNumber"],
      key: "roomNumber",
    },
    // Hiển thị thời gian thuê
    {
      title: "Thời gian thuê",
      key: "duration",
      render: (_: any, record: FinalContract) => (
        <div>
          <div>{dayjs(record.startDate).format("DD/MM/YYYY")}</div>
          <div>→ {dayjs(record.endDate).format("DD/MM/YYYY")}</div>
        </div>
      ),
    },
    // Hiển thị tiền cọc
    {
      title: "Tiền cọc",
      dataIndex: "deposit",
      key: "deposit",
      render: (val: number) => `${val?.toLocaleString("vi-VN")} đ`,
    },
    // Hiển thị tiền thuê hàng tháng
    {
      title: "Tiền thuê/tháng",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
      render: (val: number) => `${val?.toLocaleString("vi-VN")} đ`,
    },
    // Hiển thị trạng thái hợp đồng
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: FinalContract) => getStatusTag(status, record),
    },
    // Hành động xem chi tiết
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: FinalContract) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => openDetail(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>Hợp đồng của tôi</span>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Chi tiết Hợp đồng"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setBills([]);
          // Reload lại danh sách hợp đồng để cập nhật trạng thái sau khi upload file
          loadContracts();
        }}
        width={900}
        footer={null}
      >
        {selectedContract && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Phòng">{selectedContract.roomId?.roomNumber}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{getStatusTag(selectedContract.status, selectedContract)}</Descriptions.Item>
              <Descriptions.Item label="Thời gian thuê">
                {dayjs(selectedContract.startDate).format("DD/MM/YYYY")} → {dayjs(selectedContract.endDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Tiền cọc">{selectedContract.deposit?.toLocaleString("vi-VN")} đ</Descriptions.Item>
              <Descriptions.Item label="Tiền thuê/tháng">{selectedContract.monthlyRent?.toLocaleString("vi-VN")} đ</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <DollarOutlined /> Hóa đơn thanh toán
            </Divider>
            {bills.length > 0 ? (
              <div>
                {(() => {
                  // Tìm RECEIPT bill và CONTRACT bill
                  const receiptBill = bills.find((b: any) => b.billType === "RECEIPT");
                  const contractBill = bills.find((b: any) => b.billType === "CONTRACT");
                  
                  // Tính toán các khoản
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
                  }

                  // Lấy từ lineItems của CONTRACT bill
                  let depositRemaining = 0; // Cọc còn lại
                  let firstMonthRent = 0; // Tiền thuê tháng đầu
                  let contractStatus = "Chờ thanh toán";
                  
                  if (contractBill) {
                    contractStatus = contractBill.status === "PAID" ? "Đã thanh toán" 
                      : contractBill.status === "PARTIALLY_PAID" ? "Thanh toán 1 phần"
                      : contractBill.status === "PENDING_CASH_CONFIRM" ? "Chờ xác nhận tiền mặt"
                      : "Chờ thanh toán";
                    
                    if (contractBill.lineItems && contractBill.lineItems.length > 0) {
                      contractBill.lineItems.forEach((item: any) => {
                        const itemName = item.item || "";
                        const itemTotal = convertToNumber(item.lineTotal);
                        if (itemName.includes("Tiền cọc")) {
                          depositRemaining = itemTotal;
                        } else if (itemName.includes("Tiền thuê tháng đầu")) {
                          firstMonthRent = itemTotal;
                        }
                      });
                    }
                  }

                  return (
                    <div>
                      {/* 1. Cọc giữ phòng */}
                      {receiptBill && (
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
                                <Tag color={receiptBill.status === "PAID" ? "success" : "warning"}>
                                  {receiptStatus}
                                </Tag>
                              </Space>
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* 2. Cọc 1 tháng tiền phòng */}
                      {contractBill && depositRemaining > 0 && (
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
                                  contractBill.status === "PAID" ? "success" 
                                  : contractBill.status === "PENDING_CASH_CONFIRM" ? "warning"
                                  : "error"
                                }>
                                  {contractBill.status === "PAID" ? "Đã thanh toán"
                                    : contractBill.status === "PENDING_CASH_CONFIRM" ? "Chờ xác nhận tiền mặt"
                                    : "Chờ thanh toán"}
                                </Tag>
                              </Space>
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* 3. Tiền phòng tháng đầu */}
                      {contractBill && firstMonthRent > 0 && (
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
                                  contractBill.status === "PAID" ? "success" 
                                  : contractBill.status === "PENDING_CASH_CONFIRM" ? "warning"
                                  : "error"
                                }>
                                  {contractBill.status === "PAID" ? "Đã thanh toán"
                                    : contractBill.status === "PENDING_CASH_CONFIRM" ? "Chờ xác nhận tiền mặt"
                                    : "Chờ thanh toán"}
                                </Tag>
                              </Space>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#999" }}>Không có hóa đơn</p>
            )}

            <Divider orientation="left">Files Hợp đồng ({selectedContract.images?.length || 0})</Divider>
            {selectedContract.images && selectedContract.images.length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {selectedContract.images.map((file, idx) => (
                  <Card key={idx} size="small">
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Space>
                        {file.format === "pdf" || file.secure_url?.includes(".pdf") || file.secure_url?.includes("/raw/") ? (
                          <>
                            <FilePdfOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />
                            <span>Hợp đồng PDF {idx + 1}</span>
                          </>
                        ) : (
                          <>
                            <Image src={file.secure_url} width={60} height={60} style={{ objectFit: "cover" }} />
                            <span>Ảnh hợp đồng {idx + 1}</span>
                          </>
                        )}
                      </Space>
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewFile(file, "images", idx)}
                      >
                        Xem file
                      </Button>
                    </Space>
                  </Card>
                ))}
              </Space>
            ) : (
              <p style={{ color: "#999", textAlign: "center" }}>Chưa có file hợp đồng</p>
            )}

          </div>
        )}
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal
        title="Xem PDF"
        open={pdfViewerVisible}
        onCancel={() => {
          setPdfViewerVisible(false);
          // Revoke blob URL để giải phóng memory
          if (pdfViewerUrl.startsWith("blob:")) {
            URL.revokeObjectURL(pdfViewerUrl);
          }
          setPdfViewerUrl("");
        }}
        width="90%"
        style={{ top: 20 }}
        footer={null}
      >
        <div style={{ height: "80vh" }}>
          {pdfViewerUrl && (
            <iframe
              src={pdfViewerUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              title="PDF Viewer"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MyContractsDetail;
