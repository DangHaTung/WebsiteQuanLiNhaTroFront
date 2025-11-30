import { useState, useEffect } from "react";
import { Card, Descriptions, Divider, Image, Space, Tag, Table, Button, message, Modal } from "antd";
import { FileTextOutlined, FilePdfOutlined, EyeOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../services/api";
import { clientBillService } from "../services/bill";
// Định nghĩa kiểu dữ liệu hợp đồng
interface FinalContract {
  _id: string;
  roomId: { _id: string; roomNumber: string; pricePerMonth: number };
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  status: "DRAFT" | "WAITING_SIGN" | "SIGNED" | "CANCELED";
  images?: Array<{ url: string; secure_url: string; viewUrl?: string; format?: string }>;
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
// Hàm mở modal chi tiết hợp đồng
  const openDetail = async (contract: FinalContract) => {
    setSelectedContract(contract);
    setViewModalVisible(true);
    // Load hóa đơn liên quan hợp đồng
    try {
      const billsData = await clientBillService.getBillsByFinalContract(contract._id);
      setBills(billsData);
    } catch (error) {
      console.error("Load bills error:", error);
      setBills([]);
    }
  };
// Hàm hiển thị tag trạng thái hợp đồng
  const getStatusTag = (status: string, record?: FinalContract) => {
    if (status === "CANCELED") {
      return <Tag color="error">Đã hủy</Tag>;
    }
    if (status === "DRAFT") {
      return <Tag color="default">Nháp</Tag>;
    }
    if (status === "WAITING_SIGN") {
      return <Tag color="processing">Chờ ký</Tag>;
    }
    if (status === "SIGNED" && record) {
      const now = dayjs();
      const startDate = dayjs(record.startDate);
      const endDate = dayjs(record.endDate);
      if (now.isBefore(startDate)) {
        return <Tag color="default">Chưa hiệu lực</Tag>;
      } else if (now.isAfter(endDate)) {
        return <Tag color="warning">Hết hạn</Tag>;
      } else {
        return <Tag color="success">Hiệu lực</Tag>;
      }
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
              <DollarOutlined /> Hóa đơn
            </Divider>
            {bills.length > 0 ? (
              <Table
                size="small"
                dataSource={bills}
                rowKey="_id"
                pagination={false}
                columns={[
                  {
                    title: "Loại",
                    dataIndex: "billType",
                    render: (type: string) => {
                      const typeMap: Record<string, string> = {
                        RECEIPT: "Phiếu thu (Cọc)",
                        CONTRACT: "Tháng đầu",
                        MONTHLY: "Hàng tháng",
                      };
                      return typeMap[type] || type;
                    },
                  },
                  {
                    title: "Số tiền",
                    dataIndex: "amountDue",
                    render: (val: number) => `${val?.toLocaleString("vi-VN")} đ`,
                  },
                  {
                    title: "Đã thanh toán",
                    dataIndex: "amountPaid",
                    render: (val: number) => `${val?.toLocaleString("vi-VN")} đ`,
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    render: (status: string) => getBillStatusTag(status),
                  },
                ]}
              />
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
