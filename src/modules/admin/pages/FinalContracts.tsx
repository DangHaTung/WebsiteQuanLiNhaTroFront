import { useState, useEffect } from "react";
import { Table, Button, Tag, Modal, Upload, message, Space, Popconfirm, Image, Tooltip, Select, Descriptions, Divider, Form, Input, Card, Tabs, Avatar } from "antd";
import { UploadOutlined, EyeOutlined, DeleteOutlined, FilePdfOutlined, PlusOutlined, DollarOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

// Import services
import { adminFinalContractService } from "../services/finalContract";
import { adminContractService } from "../services/contract";
import { adminBillService } from "../services/bill";
import { adminUserService } from "../services/user";
import type { Contract } from "../../../types/contract";

// Define types locally to avoid import issues
interface FileInfo {
  url: string;
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
  viewUrl?: string;
  downloadUrl?: string;
  inlineUrl?: string;
}

interface FinalContract {
  _id: string;
  tenantId?: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
    pricePerMonth: number;
    type?: string;
  };
  originContractId?: string | {
    _id: string;
    tenantSnapshot?: {
      fullName?: string;
      phone?: string;
      email?: string;
    };
  };
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  pricingSnapshot?: {
    roomNumber: string;
    monthlyRent: number;
    deposit: number;
  };
  terms?: string;
  status: "DRAFT" | "WAITING_SIGN" | "SIGNED" | "CANCELED";
  images?: FileInfo[];
  tenantSignedAt?: string;
  ownerApprovedAt?: string;
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
}



const FinalContracts = () => {
  const [contracts, setContracts] = useState<FinalContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [selectedContract, setSelectedContract] = useState<FinalContract | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [contractBills, setContractBills] = useState<any[]>([]);
  
  // New contract upload
  const [newContractModalVisible, setNewContractModalVisible] = useState(false);
  const [availableContracts, setAvailableContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [newContractFiles, setNewContractFiles] = useState<UploadFile[]>([]);
  
  // Assign tenant modal
  const [assignTenantModalVisible, setAssignTenantModalVisible] = useState(false);
  const [assigningContract, setAssigningContract] = useState<FinalContract | null>(null);
  const [tenantForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<"search" | "create">("search");
  const [searchTenants, setSearchTenants] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  
  // PDF viewer modal
  const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string>("");

  const handleViewFile = async (file: FileInfo, type: "images", index: number) => {
    const isPdf = file.resource_type === "raw" || 
                  file.format === "pdf" || 
                  file.secure_url?.includes(".pdf") || 
                  file.secure_url?.includes("/raw/");
    
    if (isPdf && selectedContract?._id) {
      try {
        // Fetch PDF với Authorization header
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("admin_token");
        const typeParam = "contract";
        
        const response = await fetch(`${apiUrl}/api/final-contracts/${selectedContract._id}/view/${typeParam}/${index}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
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
      } catch (error) {
        console.error("Load PDF error:", error);
        message.error("Lỗi khi tải PDF");
      }
    } else {
      // Mở ảnh trong tab mới
      const url = file.viewUrl || file.inlineUrl || file.secure_url || file.url;
      window.open(url, "_blank");
    }
  };

  const fetchContracts = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await adminFinalContractService.getAll({ page, limit });
      setContracts(response.data);
      setPagination({
        current: response.pagination?.currentPage || 1,
        pageSize: response.pagination?.limit || 10,
        total: response.pagination?.totalRecords || 0,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải danh sách hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get originContractId as string
  const getOriginContractId = (contract: FinalContract | null): string | undefined => {
    if (!contract?.originContractId) return undefined;
    return typeof contract.originContractId === 'string' 
      ? contract.originContractId 
      : contract.originContractId._id;
  };

  const loadAvailableContracts = async () => {
    try {
      // Load checkins đã COMPLETED (đã thanh toán tiền cọc)
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${apiUrl}/api/checkins?limit=100`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const checkinsData = data.data || [];
      
      console.log("📥 Raw checkins from API:", checkinsData.length);
      
      // Lọc chỉ lấy checkins COMPLETED và chưa có FinalContract
      const existingFinalContractIds = contracts
        .map(fc => getOriginContractId(fc))
        .filter(Boolean);
      
      console.log("🔍 Existing FinalContract contract IDs:", existingFinalContractIds);
      
      const completedCheckins = checkinsData.filter((checkin: any) => {
        // Chỉ hiển thị checkin COMPLETED và chưa có FinalContract
        const contractId = typeof checkin.contractId === 'string' 
          ? checkin.contractId 
          : checkin.contractId?._id;
        
        return checkin.status === "COMPLETED" && 
               contractId &&
               !existingFinalContractIds.includes(contractId);
      });
      
      console.log("✅ Completed checkins:", completedCheckins.length);
      
      // Convert checkins sang format Contract để UI không cần đổi nhiều
      const contractsFromCheckins = completedCheckins.map((checkin: any) => {
        const contractId = typeof checkin.contractId === 'string' 
          ? checkin.contractId 
          : checkin.contractId?._id;
        
        return {
          _id: contractId,
          roomId: checkin.roomId,
          tenantId: checkin.tenantId,
          tenantSnapshot: checkin.tenantSnapshot,
          startDate: checkin.checkinDate,
          deposit: checkin.deposit,
          monthlyRent: checkin.monthlyRent,
          durationMonths: checkin.durationMonths,
        };
      });
      
      console.log("🎯 Final contracts from checkins:", contractsFromCheckins.length);
      setAvailableContracts(contractsFromCheckins);
    } catch (error: any) {
      console.error("Load checkins error:", error);
      message.error(error.response?.data?.message || "Lỗi khi tải danh sách check-in");
      setAvailableContracts([]);
    }
  };

  const handleUploadNewContract = async () => {
    if (!selectedContractId) {
      message.warning("Vui lòng chọn phiếu thu");
      return;
    }
    if (newContractFiles.length === 0) {
      message.warning("Vui lòng chọn file hợp đồng đã ký");
      return;
    }

    try {
      // Bước 1: Tạo Final Contract từ Contract
      const finalContract = await adminFinalContractService.createFromContract({ 
        contractId: selectedContractId 
      });
      
      // Bước 2: Upload files
      const files = newContractFiles.map((f) => f.originFileObj as File);
      await adminFinalContractService.uploadFiles(finalContract._id, files);
      
      message.success("Upload hợp đồng thành công!");
      setNewContractModalVisible(false);
      setSelectedContractId("");
      setNewContractFiles([]);
      fetchContracts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi upload hợp đồng");
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const openDetail = async (contract: FinalContract) => {
    setViewModalVisible(true);
    setSelectedContract(contract); // Set immediately để tránh undefined
    setContractBills([]); // Clear bills
    
    // Load full contract details with populated originContractId
    try {
      const fullContract = await adminFinalContractService.getById(contract._id);
      setSelectedContract(fullContract);
      
      // Load bills của Contract (để thanh toán bill CONTRACT - tháng đầu)
      const contractId = typeof fullContract.originContractId === 'string' 
        ? fullContract.originContractId 
        : (fullContract.originContractId as { _id: string } | undefined)?._id;
      
      if (contractId) {
        console.log("Loading bills for Contract:", contractId);
        try {
          const token = localStorage.getItem("admin_token");
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
          const response = await fetch(`${apiUrl}/api/bills?contractId=${contractId}&limit=100`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          const data = await response.json();
          console.log("Bills API response:", data);
          console.log("Sample bill data:", data.data?.[0]);
          
          const bills = data.data || [];
          // Debug: Log để kiểm tra amountDue và amountPaid
          bills.forEach((bill: any, idx: number) => {
            console.log(`Bill ${idx}:`, {
              billType: bill.billType,
              status: bill.status,
              amountDue: bill.amountDue,
              amountDueType: typeof bill.amountDue,
              amountPaid: bill.amountPaid,
              amountPaidType: typeof bill.amountPaid,
            });
          });
          // Hiển thị tất cả bills của contract (CONTRACT, MONTHLY, RECEIPT)
          // Ưu tiên hiển thị bills chưa thanh toán trước
          const sortedBills = bills.sort((a: any, b: any) => {
            // Chưa thanh toán trước
            if (a.status !== "PAID" && b.status === "PAID") return -1;
            if (a.status === "PAID" && b.status !== "PAID") return 1;
            // Sau đó sort theo ngày tạo (mới nhất trước)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          console.log("All bills for contract:", sortedBills);
          setContractBills(sortedBills);
        } catch (err) {
          console.error("Load bills error:", err);
          message.error("Lỗi khi tải danh sách hóa đơn");
          setContractBills([]);
        }
      } else {
        console.warn("No contractId found in final contract");
        setContractBills([]);
      }
    } catch (error: any) {
      console.error("Load contract details error:", error);
      message.error("Lỗi khi tải chi tiết hợp đồng");
    }
  };

  const handleConfirmCashPayment = async (billId: string) => {
    try {
      await adminBillService.confirmPayment(billId);
      message.success("Xác nhận thanh toán tiền mặt thành công!");
      
      // Reload bills
      if (selectedContract) {
        const contractId = typeof selectedContract.originContractId === 'string' 
          ? selectedContract.originContractId 
          : selectedContract.originContractId?._id;
        
        if (contractId) {
          try {
            const token = localStorage.getItem("admin_token");
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
            const response = await fetch(`${apiUrl}/api/bills?contractId=${contractId}&limit=100`, {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            const data = await response.json();
            const bills = data.data || [];
            // Hiển thị tất cả bills, sort theo status và ngày
            const sortedBills = bills.sort((a: any, b: any) => {
              if (a.status !== "PAID" && b.status === "PAID") return -1;
              if (a.status === "PAID" && b.status !== "PAID") return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setContractBills(sortedBills);
          } catch (err) {
            console.error("Reload bills error:", err);
          }
        }
      }
      
      fetchContracts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi xác nhận thanh toán");
    }
  };

  const handleOnlinePayment = async (billId: string, amount: number) => {
    const createPayment = async (provider: "vnpay" | "momo" | "zalopay") => {
      try {
        const token = localStorage.getItem("admin_token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        
        const endpoint = provider === "zalopay" 
          ? `${apiUrl}/api/payment/zalopay/create`
          : `${apiUrl}/api/payment/${provider}/create`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ billId, amount }),
        });
        const data = await response.json();

        let paymentUrl = null;
        if (provider === "vnpay") {
          // VNPAY trả về "url" hoặc "paymentUrl"
          paymentUrl = data.url || data.paymentUrl;
        } else if (provider === "momo") {
          paymentUrl = data.payUrl;
        } else if (provider === "zalopay") {
          paymentUrl = data.order_url;
        }

        if (paymentUrl) {
          window.open(paymentUrl, "_blank");
          message.success(`Đã mở cổng thanh toán ${provider.toUpperCase()}`);
        } else {
          console.error("Payment error:", data);
          message.error(data.message || data.error || "Lỗi tạo link thanh toán");
        }
      } catch (error: any) {
        message.error("Lỗi kết nối payment gateway");
      }
    };

    Modal.info({
      title: "Chọn phương thức thanh toán online",
      width: 500,
      content: (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>
            Số tiền: <strong style={{ color: "#1890ff" }}>{amount.toLocaleString("vi-VN")} đ</strong>
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

  const handleSearchTenants = async (keyword: string) => {
    setSearchLoading(true);
    try {
      console.log("Searching tenants with keyword:", keyword);
      const tenants = await adminUserService.searchTenants(keyword || undefined);
      console.log("Found tenants:", tenants);
      setSearchTenants(tenants);
    } catch (error) {
      console.error("Search tenants error:", error);
      message.error("Lỗi khi tìm kiếm người thuê");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectExistingTenant = async () => {
    if (!selectedTenantId) {
      message.warning("Vui lòng chọn người thuê");
      return;
    }
    
    try {
      await adminFinalContractService.assignTenant(assigningContract!._id, selectedTenantId);
      message.success("Đã gán người thuê thành công!");
      setAssignTenantModalVisible(false);
      setSelectedTenantId("");
      setSearchTenants([]);
      fetchContracts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("Assign tenant error:", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleAssignTenant = async () => {
    try {
      const values = await tenantForm.validateFields();
      
      // Bước 1: Lấy thông tin Contract để lấy tenantSnapshot
      let tenantSnapshot = null;
      const originId = getOriginContractId(assigningContract);
      if (originId) {
        try {
          const contract = await adminContractService.getById(originId) as any;
          tenantSnapshot = contract.tenantSnapshot;
        } catch (err) {
          console.warn("Cannot load contract snapshot:", err);
        }
      }

      // Bước 2: Tạo User (tài khoản TENANT)
      console.log("Creating user with data:", {
        fullName: values.fullName || tenantSnapshot?.fullName,
        email: values.email,
        phone: values.phone || tenantSnapshot?.phone,
        role: "TENANT",
      });
      
      const userResponse = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          fullName: values.fullName || tenantSnapshot?.fullName,
          email: values.email,
          phone: values.phone || tenantSnapshot?.phone,
          password: values.password || "123456",
          role: "TENANT",
        }),
      });
      const userData = await userResponse.json();
      console.log("User creation response:", userData);
      
      if (!userData.success) {
        message.error(userData.message || "Lỗi tạo tài khoản");
        return;
      }

      const newUserId = userData.data._id || userData.data.id;
      console.log("New user ID:", newUserId);
      
      if (!newUserId) {
        message.error("Không lấy được ID người dùng mới");
        return;
      }

      // Bước 3: Gán User vào FinalContract
      console.log("Assigning tenant to final contract:", assigningContract!._id, newUserId);
      await adminFinalContractService.assignTenant(assigningContract!._id, newUserId);
      
      message.success("Đã tạo tài khoản và gán người thuê thành công!");
      setAssignTenantModalVisible(false);
      tenantForm.resetFields();
      fetchContracts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("handleAssignTenant error:", error);
      message.error(error.response?.data?.message || error.message || "Có lỗi xảy ra");
    }
  };

  const handleUploadContract = async () => {
    if (!selectedContract || fileList.length === 0) {
      message.warning("Vui lòng chọn file để upload");
      return;
    }

    try {
      const files = fileList.map((f) => f.originFileObj as File);
      await adminFinalContractService.uploadFiles(selectedContract._id, files);
      message.success("Upload hợp đồng thành công");
      setUploadModalVisible(false);
      setFileList([]);
      fetchContracts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi upload hợp đồng");
    }
  };


  const handleDeleteFile = async (contractId: string, type: "images", index: number) => {
    try {
      await adminFinalContractService.deleteFile(contractId, type, index);
      message.success("Xóa file thành công");
      if (selectedContract?._id === contractId) {
        const updated = await adminFinalContractService.getById(contractId);
        setSelectedContract(updated);
      }
      fetchContracts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi xóa file");
    }
  };

  const handleDeleteContract = async (id: string) => {
    try {
      await adminFinalContractService.remove(id);
      message.success("Xóa hợp đồng thành công");
      fetchContracts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi xóa hợp đồng");
    }
  };

  const handleCancelContract = async (id: string) => {
    try {
      await adminFinalContractService.cancel(id);
      message.success("Hủy hợp đồng thành công");
      fetchContracts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi hủy hợp đồng");
    }
  };

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

  const columns = [
    {
      title: "Phòng",
      dataIndex: ["roomId", "roomNumber"],
      key: "roomNumber",
      width: 100,
    },
    {
      title: "Người thuê",
      dataIndex: ["tenantId", "fullName"],
      key: "tenant",
      render: (_: any, record: FinalContract) => {
        if (record.tenantId?.fullName) {
          return record.tenantId.fullName;
        }
        return (
          <Button
            size="small"
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              setAssigningContract(record);
              setAssignTenantModalVisible(true);
            }}
          >
            + Gán người thuê
          </Button>
        );
      },
    },
    {
      title: "Thời gian",
      key: "duration",
      render: (_: any, record: FinalContract) => (
        <div>
          <div>{dayjs(record.startDate).format("DD/MM/YYYY")}</div>
          <div>→ {dayjs(record.endDate).format("DD/MM/YYYY")}</div>
        </div>
      ),
    },
    {
      title: "Tiền cọc",
      dataIndex: "deposit",
      key: "deposit",
      render: (val: number) => val?.toLocaleString("vi-VN") + " đ",
    },
    {
      title: "Tiền thuê/tháng",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
      render: (val: number) => val?.toLocaleString("vi-VN") + " đ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: FinalContract) => getStatusTag(status, record),
    },
    {
      title: "Files",
      key: "files",
      render: (_: any, record: FinalContract) => (
        <Space>
          <Tooltip title="Hợp đồng">
            <Tag color="blue">{record.images?.length || 0}</Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: FinalContract) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openDetail(record)}
          >
            Xem
          </Button>
          <Button
            size="small"
            icon={<UploadOutlined />}
            onClick={() => {
              setSelectedContract(record);
              setUploadModalVisible(true);
            }}
          >
            Upload HĐ
          </Button>
          {record.status !== "CANCELED" && (
            <Popconfirm title="Xác nhận hủy hợp đồng?" onConfirm={() => handleCancelContract(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
                Hủy
            </Button>
          </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Quản lý Hợp đồng Chính thức (Final Contracts)</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            loadAvailableContracts();
            setNewContractModalVisible(true);
          }}
        >
          Upload hợp đồng mới
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={contracts}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchContracts(page, pageSize),
        }}
      />

      {/* Upload Contract Modal */}
      <Modal
        title="Upload Hợp đồng đã ký"
        open={uploadModalVisible}
        onOk={handleUploadContract}
        onCancel={() => {
          setUploadModalVisible(false);
          setFileList([]);
        }}
      >
        <Upload
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          accept="image/*,.pdf"
          multiple
        >
          <Button icon={<UploadOutlined />}>Chọn file (ảnh hoặc PDF)</Button>
        </Upload>
      </Modal>

      {/* Upload New Contract Modal */}
      <Modal
        title="Upload hợp đồng mới"
        open={newContractModalVisible}
        onOk={handleUploadNewContract}
        onCancel={() => {
          setNewContractModalVisible(false);
          setSelectedContractId("");
          setNewContractFiles([]);
        }}
        okText="Upload hợp đồng"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8 }}>Chọn phiếu thu (Contract):</label>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn phiếu thu"
            value={selectedContractId || undefined}
            onChange={(value) => setSelectedContractId(value)}
          >
            {availableContracts && availableContracts.length > 0 ? (
              availableContracts.map((contract) => {
                const roomNumber = contract.roomId && typeof contract.roomId === "object" 
                  ? contract.roomId.roomNumber 
                  : contract.roomId || "N/A";
                
                // Ưu tiên lấy từ tenantId, nếu không có thì lấy từ tenantSnapshot
                let tenantName = "N/A";
                if (contract.tenantId && typeof contract.tenantId === "object") {
                  tenantName = contract.tenantId.fullName;
                } else if (contract.tenantSnapshot?.fullName) {
                  tenantName = contract.tenantSnapshot.fullName;
                }
                
                return (
                  <Option key={contract._id} value={contract._id}>
                    Phòng: {roomNumber} - Người thuê: {tenantName} - {dayjs(contract.startDate).format("DD/MM/YYYY")}
                  </Option>
                );
              })
            ) : (
              <Option disabled value="">Không có phiếu thu nào</Option>
            )}
          </Select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 8 }}>Upload hợp đồng đã ký (PDF/ảnh):</label>
          <Upload
            fileList={newContractFiles}
            onChange={({ fileList }) => setNewContractFiles(fileList)}
            beforeUpload={() => false}
            accept="image/*,.pdf"
            multiple
          >
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </div>
      </Modal>

      {/* Assign Tenant Modal */}
      <Modal
        title="🔍 Gán người thuê"
        open={assignTenantModalVisible}
        onOk={activeTab === "search" ? handleSelectExistingTenant : handleAssignTenant}
        onCancel={() => {
          setAssignTenantModalVisible(false);
          tenantForm.resetFields();
          setActiveTab("search");
          setSearchTenants([]);
          setSelectedTenantId("");
        }}
        okText={activeTab === "search" ? "Gán người thuê" : "Tạo và gán"}
        cancelText="Hủy"
        width={700}
        afterOpenChange={async (open) => {
          if (open && assigningContract) {
            setActiveTab("search");
            setSelectedTenantId("");
            
            const originId = getOriginContractId(assigningContract);
            
            // Load contract info để fill form
            if (originId) {
              try {
                const contract = await adminContractService.getById(originId) as any;
                if (contract.tenantSnapshot) {
                  const suggestedEmail = contract.tenantSnapshot.email || 
                    (contract.tenantSnapshot.phone ? `${contract.tenantSnapshot.phone}@gmail.com` : '');
                  
                  tenantForm.setFieldsValue({
                    fullName: contract.tenantSnapshot.fullName,
                    phone: contract.tenantSnapshot.phone,
                    email: suggestedEmail,
                  });
                  
                  // Auto search với phone hoặc email để suggest
                  if (contract.tenantSnapshot.phone) {
                    await handleSearchTenants(contract.tenantSnapshot.phone);
                  } else if (contract.tenantSnapshot.email) {
                    await handleSearchTenants(contract.tenantSnapshot.email);
                  } else {
                    // Nếu không có thông tin, load tất cả
                    await handleSearchTenants("");
                  }
                  return;
                }
              } catch (err) {
                console.warn("Cannot load contract:", err);
              }
            }
            
            // Fallback: Load tất cả người thuê nếu không có contract info
            await handleSearchTenants("");
          } else if (!open) {
            // Reset khi đóng modal
            setSearchTenants([]);
            setSelectedTenantId("");
          }
        }}
      >
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as "search" | "create")}>
          <Tabs.TabPane tab={<span><SearchOutlined /> Chọn người thuê có sẵn</span>} key="search">
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                  Tìm và chọn người thuê:
                </label>
                <Select
                  showSearch
                  placeholder="Tìm theo tên, email hoặc số điện thoại..."
                  style={{ width: "100%" }}
                  size="large"
                  value={selectedTenantId || undefined}
                  onChange={(value) => setSelectedTenantId(value)}
                  onSearch={handleSearchTenants}
                  onFocus={() => {
                    // Load data nếu chưa có
                    if (searchTenants.length === 0 && !searchLoading) {
                      handleSearchTenants("");
                    }
                  }}
                  loading={searchLoading}
                  filterOption={false}
                  notFoundContent={searchLoading ? "Đang tìm kiếm..." : "Không tìm thấy người thuê"}
                  optionLabelProp="label"
                >
                  {searchTenants.map((tenant: any) => (
                    <Option 
                      key={tenant._id} 
                      value={tenant._id}
                      label={tenant.fullName}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{tenant.fullName}</div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            📧 {tenant.email} | 📱 {tenant.phone}
                          </div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>
              
              {selectedTenantId && searchTenants.find((t: any) => t._id === selectedTenantId) && (
                <Card size="small" style={{ backgroundColor: "#f0f9ff" }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div style={{ fontWeight: 500, fontSize: 16 }}>
                      ✅ Đã chọn: {searchTenants.find((t: any) => t._id === selectedTenantId)?.fullName}
                    </div>
                    <div style={{ color: "#666" }}>
                      📧 {searchTenants.find((t: any) => t._id === selectedTenantId)?.email}
                    </div>
                    <div style={{ color: "#666" }}>
                      📱 {searchTenants.find((t: any) => t._id === selectedTenantId)?.phone}
                    </div>
                  </Space>
                </Card>
              )}
            </Space>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab={<span><PlusOutlined /> Tạo tài khoản mới</span>} key="create">
            <Form form={tenantForm} layout="vertical">
              <Form.Item
                label="Họ tên"
                name="fullName"
                rules={[{ required: true, message: "Nhập họ tên" }]}
              >
                <Input placeholder="Từ thông tin check-in" />
              </Form.Item>
              <Form.Item
                label="Email (dùng để đăng nhập)"
                name="email"
                rules={[
                  { required: true, message: "Nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: "Nhập số điện thoại" }]}
              >
                <Input placeholder="Từ thông tin check-in" />
              </Form.Item>
              <Form.Item
                label="Mật khẩu"
                name="password"
                initialValue="123456"
                rules={[{ required: true, message: "Nhập mật khẩu" }]}
              >
                <Input.Password />
              </Form.Item>
              <p style={{ color: "#999", fontSize: 12 }}>
                * Tài khoản sẽ được tạo với role TENANT để khách có thể đăng nhập và xem hóa đơn
              </p>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Modal>

      {/* View Contract Modal */}
      <Modal
        title="Chi tiết Hợp đồng Chính thức"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setContractBills([]);
        }}
        width={900}
        footer={null}
      >
        {selectedContract && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Phòng">{selectedContract.roomId?.roomNumber}</Descriptions.Item>
              <Descriptions.Item label="Người thuê">
                {selectedContract.tenantId?.fullName || 
                 (typeof selectedContract.originContractId === 'object' && 
                  selectedContract.originContractId?.tenantSnapshot?.fullName) ||
                 "Chưa gán"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{getStatusTag(selectedContract.status, selectedContract)}</Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {selectedContract.startDate 
                  ? `${dayjs(selectedContract.startDate).format("DD/MM/YYYY")} → ${dayjs(selectedContract.endDate).format("DD/MM/YYYY")}`
                  : (typeof selectedContract.originContractId === 'object' && (selectedContract.originContractId as any)?.startDate
                      ? `${dayjs((selectedContract.originContractId as any).startDate).format("DD/MM/YYYY")} → ${dayjs((selectedContract.originContractId as any).endDate).format("DD/MM/YYYY")}`
                      : "N/A"
                    )
                }
              </Descriptions.Item>
              <Descriptions.Item label="Tiền cọc">
                {(selectedContract.deposit || 
                  (typeof selectedContract.originContractId === 'object' && (selectedContract.originContractId as any)?.deposit) || 
                  0).toLocaleString("vi-VN")} đ
              </Descriptions.Item>
              <Descriptions.Item label="Tiền thuê/tháng">
                {(selectedContract.monthlyRent || 
                  (typeof selectedContract.originContractId === 'object' && (selectedContract.originContractId as any)?.monthlyRent) || 
                  0).toLocaleString("vi-VN")} đ
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <DollarOutlined /> Hóa đơn thanh toán
            </Divider>
            {contractBills.length > 0 ? (
              <Table
                size="small"
                dataSource={contractBills}
                rowKey="_id"
                pagination={false}
                columns={[
                  {
                    title: "Loại",
                    dataIndex: "billType",
                    render: (type: string) => {
                      const typeMap: Record<string, { color: string; text: string }> = {
                        RECEIPT: { color: "blue", text: "Phiếu thu (Cọc)" },
                        CONTRACT: { color: "green", text: "Tháng đầu" },
                        MONTHLY: { color: "orange", text: "Hàng tháng" },
                      };
                      const t = typeMap[type] || { color: "default", text: type };
                      return <Tag color={t.color}>{t.text}</Tag>;
                    },
                  },
                  {
                    title: "Số tiền",
                    dataIndex: "amountDue",
                    align: "right" as const,
                    render: (val: any, record: any) => {
                      // Convert Decimal128 hoặc number sang number
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
                      
                      const amountDue = convertToNumber(record.amountDue);
                      const amountPaid = convertToNumber(record.amountPaid);
                      
                      // Hiển thị số tiền ban đầu của hóa đơn (tổng số tiền cần thanh toán ban đầu)
                      // Khi PAID: amountDue = 0, amountPaid = số tiền ban đầu
                      // Khi UNPAID: amountDue = số tiền ban đầu, amountPaid = 0
                      // Khi PARTIALLY_PAID: amountDue = số tiền còn lại, amountPaid = số tiền đã trả
                      // => Tổng ban đầu = amountDue + amountPaid
                      const totalAmount = amountDue + amountPaid;
                      
                      return <strong style={{ color: "#1890ff", fontSize: 16 }}>{totalAmount.toLocaleString("vi-VN")} đ</strong>;
                    },
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    render: (status: string) => {
                      const statusMap: Record<string, { color: string; text: string }> = {
                        PAID: { color: "success", text: "Đã thanh toán" },
                        UNPAID: { color: "error", text: "Chưa thanh toán" },
                        PENDING_CASH_CONFIRM: { color: "warning", text: "Chờ xác nhận TM" },
                        PARTIALLY_PAID: { color: "processing", text: "Thanh toán 1 phần" },
                      };
                      const s = statusMap[status] || { color: "default", text: status };
                      return <Tag color={s.color}>{s.text}</Tag>;
                    },
                  },
                  {
                    title: "Thao tác",
                    key: "action",
                    width: 200,
                    align: "center" as const,
                    render: (_: any, record: any) => {
                      if (record.status === "PENDING_CASH_CONFIRM" || record.status === "UNPAID" || record.status === "PARTIALLY_PAID") {
                        // Convert amountDue để tính số tiền còn lại
                        let amountDue = 0;
                        if (typeof record.amountDue === 'number') {
                          amountDue = record.amountDue;
                        } else if (typeof record.amountDue === 'string') {
                          amountDue = parseFloat(record.amountDue) || 0;
                        } else if (record.amountDue && typeof record.amountDue.toString === 'function') {
                          amountDue = parseFloat(record.amountDue.toString()) || 0;
                        }
                        
                        let amountPaid = 0;
                        if (typeof record.amountPaid === 'number') {
                          amountPaid = record.amountPaid;
                        } else if (typeof record.amountPaid === 'string') {
                          amountPaid = parseFloat(record.amountPaid) || 0;
                        } else if (record.amountPaid && typeof record.amountPaid.toString === 'function') {
                          amountPaid = parseFloat(record.amountPaid.toString()) || 0;
                        }
                        
                        const remaining = Math.max(amountDue - amountPaid, 0);
                        
                        return (
                          <Space>
                            <Popconfirm
                              title="Xác nhận đã nhận tiền mặt?"
                              onConfirm={() => handleConfirmCashPayment(record._id)}
                              okText="Xác nhận"
                              cancelText="Hủy"
                            >
                              <Button size="small" type="primary" icon={<DollarOutlined />}>
                                TM
                              </Button>
                            </Popconfirm>
                            <Button 
                              size="small" 
                              type="default" 
                              onClick={() => handleOnlinePayment(record._id, remaining)}
                            >
                              Online
                            </Button>
                          </Space>
                        );
                      }
                      return null; // Không hiển thị gì khi đã thanh toán
                    },
                  },
                ]}
              />
            ) : (
              <p style={{ textAlign: "center", color: "#999" }}>Không có hóa đơn</p>
            )}

            <Divider orientation="left">Files Hợp đồng ({selectedContract.images?.length || 0})</Divider>
            {selectedContract.images && selectedContract.images.length > 0 ? (
              <Space wrap direction="vertical" style={{ width: "100%" }}>
                {selectedContract.images.map((file, idx) => {
                  const isPdf = file.resource_type === "raw" || 
                                file.format === "pdf" || 
                                file.secure_url?.includes(".pdf") || 
                                file.secure_url?.includes("/raw/");
                  
                  return (
                    <Card key={idx} size="small" style={{ width: "100%" }}>
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Space>
                          {isPdf ? (
                            <>
                              <FilePdfOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />
                              <span>Hợp đồng PDF {idx + 1}</span>
                            </>
                          ) : (
                            <>
                              <Image src={file.secure_url} width={60} height={60} style={{ objectFit: "cover" }} />
                              <span>Ảnh {idx + 1}</span>
                            </>
                          )}
                        </Space>
                        <Space>
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewFile(file, "images", idx)}
                          >
                            Xem
                          </Button>
                          <Popconfirm title="Xóa file này?" onConfirm={() => handleDeleteFile(selectedContract._id, "images", idx)}>
                            <Button danger icon={<DeleteOutlined />}>
                              Xóa
                            </Button>
                          </Popconfirm>
                        </Space>
                      </Space>
                    </Card>
                  );
                })}
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

export default FinalContracts;
