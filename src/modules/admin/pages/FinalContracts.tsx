import { useState, useEffect } from "react";
import { Table, Button, Tag, Modal, Upload, message, Space, Popconfirm, Image, Tooltip, Select, Descriptions, Divider, Form, Input, Card, Tabs, Avatar, Row, Col, Typography, Alert } from "antd";
import { UploadOutlined, EyeOutlined, DeleteOutlined, FilePdfOutlined, PlusOutlined, DollarOutlined, SearchOutlined, UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import ExtendContractModal from "../components/ExtendContractModal";
import type { UploadFile } from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { Text } = Typography;

// Import services
import { adminFinalContractService } from "../services/finalContract";
import { adminContractService } from "../services/contract";
import { adminBillService } from "../services/bill";
import { adminUserService } from "../services/user";

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
  canceledAt?: string; // Ngày hủy hợp đồng (nếu hủy trước hạn)
  images?: FileInfo[];
  tenantSignedAt?: string;
  ownerApprovedAt?: string;
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
}



const FinalContracts = () => {
  const location = useLocation();
  const [contracts, setContracts] = useState<FinalContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [selectedContract, setSelectedContract] = useState<FinalContract | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [contractBills, setContractBills] = useState<any[]>([]);
  // Map để lưu bills của từng contract (key: contractId, value: bills[])
  const [contractBillsMap, setContractBillsMap] = useState<Map<string, any[]>>(new Map());
   // New contract upload
  const [newContractModalVisible, setNewContractModalVisible] = useState(false);
  const [availableContracts, setAvailableContracts] = useState<any[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
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
   // Extend contract modal
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [extendingContract, setExtendingContract] = useState<FinalContract | null>(null);

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
      
      // Load bills CONTRACT cho từng finalContract để check trạng thái thanh toán
      // Lưu ý: bill CONTRACT được tạo với finalContractId, không phải contractId
      const newBillsMap = new Map<string, any[]>();
      
      for (const contract of response.data) {
        const finalContractId = contract._id;
        
        if (finalContractId) {
          try {
            // Load bills CONTRACT theo finalContractId bằng adminBillService
            const bills = await adminBillService.getAll({
              finalContractId: finalContractId,
              billType: "CONTRACT",
              limit: 100,
              page: 1
            });
            newBillsMap.set(finalContractId, bills || []);
          } catch (error) {
            console.error(`Error loading contract bills for finalContract ${finalContractId}:`, error);
          }
        }
      }
      
      setContractBillsMap(newBillsMap);
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
      
      // Debug: Log tất cả checkins để kiểm tra
      checkinsData.forEach((checkin: any) => {
        const roomNumber = checkin.roomId?.roomNumber || "N/A";
        const status = checkin.status;
        const contractId = typeof checkin.contractId === 'string' 
          ? checkin.contractId 
          : checkin.contractId?._id;
        console.log(`  - Room ${roomNumber}: status=${status}, contractId=${contractId || "MISSING"}`);
      });
      
      // Lọc chỉ lấy checkins COMPLETED
      // Logic: Hiển thị tất cả checkin COMPLETED, backend sẽ validate khi tạo
      // (Backend sẽ kiểm tra xem có FinalContract nào với bill CONTRACT đã thanh toán không)
      const completedCheckins = checkinsData.filter((checkin: any) => {
        const contractId = typeof checkin.contractId === 'string' 
          ? checkin.contractId 
          : checkin.contractId?._id;
        
        // Chỉ hiển thị checkin COMPLETED và có contractId
        const isValid = checkin.status === "COMPLETED" && contractId;
        if (!isValid) {
          const roomNumber = checkin.roomId?.roomNumber || "N/A";
          console.log(`  ⚠️ Filtered out Room ${roomNumber}: status=${checkin.status}, contractId=${contractId || "MISSING"}`);
        }
        return isValid;
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

    try {
      // Tạo Final Contract từ Contract (sẽ tự động tạo bill CONTRACT)
      const finalContract = await adminFinalContractService.createFromContract({ 
        contractId: selectedContractId 
      });
      
      message.success("Tạo hóa đơn hợp đồng thành công! Khách hàng có thể thanh toán ở account của mình");
      setNewContractModalVisible(false);
      setSelectedContractId("");
      fetchContracts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tạo hóa đơn hợp đồng");
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Xử lý tự động mở detail modal khi có contractId từ state (khi navigate từ RoomDetailDrawer)
  useEffect(() => {
    const state = location.state as { contractId?: string } | null;
    if (state?.contractId && contracts.length > 0 && !loading) {
      const contract = contracts.find((c) => c._id === state.contractId);
      if (contract) {
        openDetail(contract);
        // Clear state để tránh mở lại khi refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, contracts, loading]);

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
          
          // ✅ FILTER: Chỉ hiển thị bills không bị hủy (VOID)
          // Lưu ý: Vẫn hiển thị bills ngay cả khi FinalContract đã bị hủy để xem lịch sử
          // 1. Loại bỏ bills có status VOID
          // 2. Chỉ hiển thị bills có finalContractId khớp với FinalContract hiện tại (nếu có finalContractId)
          const filteredBills = bills.filter((bill: any) => {
            // Loại bỏ bills đã bị hủy (VOID)
            if (bill.status === "VOID") {
              return false;
            }
            
            // Kiểm tra nếu bill có finalContractId
            const billFinalContractId = typeof bill.finalContractId === 'string' 
              ? bill.finalContractId 
              : bill.finalContractId?._id;
            
            // Nếu bill có finalContractId, chỉ hiển thị nếu khớp với FinalContract hiện tại
            if (billFinalContractId) {
              return billFinalContractId === fullContract._id;
            }
            
            // Nếu bill không có finalContractId (bill CONTRACT cũ), hiển thị
            return true;
          });
          
          console.log(`Filtered bills: ${filteredBills.length}/${bills.length} (showing only CONTRACT + this tenant's bills)`);
          
          // Ưu tiên hiển thị bills chưa thanh toán trước
          const sortedBills = filteredBills.sort((a: any, b: any) => {
            // Chưa thanh toán trước
            if (a.status !== "PAID" && b.status === "PAID") return -1;
            if (a.status === "PAID" && b.status !== "PAID") return 1;
            // Sau đó sort theo ngày tạo (mới nhất trước)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          console.log("Filtered & sorted bills:", sortedBills);
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
            
            // ✅ FILTER: Chỉ hiển thị bills của người này
            const filteredBills = bills.filter((bill: any) => {
              if (bill.billType === "CONTRACT") return true;
              const billFinalContractId = typeof bill.finalContractId === 'string' 
                ? bill.finalContractId 
                : bill.finalContractId?._id;
              return billFinalContractId === selectedContract._id;
            });
            
            // Sort theo status và ngày
            const sortedBills = filteredBills.sort((a: any, b: any) => {
              if (a.status !== "PAID" && b.status === "PAID") return -1;
              if (a.status === "PAID" && b.status !== "PAID") return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setContractBills(sortedBills);
            
            // Cập nhật contractBillsMap để đảm bảo modal hiển thị đúng khi mở lại
            if (selectedContract) {
              setContractBillsMap(prev => {
                const newMap = new Map(prev);
                newMap.set(selectedContract._id, sortedBills);
                return newMap;
              });
            }
          } catch (err) {
            console.error("Reload bills error:", err);
          }
        }
        
        // Reload lại selectedContract để đảm bảo data mới nhất
        if (selectedContract) {
          try {
            const updatedContract = await adminFinalContractService.getById(selectedContract._id);
            setSelectedContract(updatedContract);
          } catch (err) {
            console.error("Reload contract error:", err);
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
      const errorMsg = error.response?.data?.message || "Lỗi khi upload hợp đồng";
      message.error(errorMsg);
      console.error("Upload error:", error);
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

  // Helper: Kiểm tra bill CONTRACT đã thanh toán chưa
  const isContractBillPaid = (bills: any[]): boolean => {
    const contractBill = bills.find((bill: any) => bill.billType === "CONTRACT");
    return contractBill?.status === "PAID";
  };

  const getStatusTag = (status: string, record?: FinalContract) => {
    // Nếu bị hủy thì vẫn hiển thị "Đã hủy"
    if (status === "CANCELED") {
      return <Tag color="error">Đã hủy</Tag>;
    }
    
    // Logic: File hợp đồng chỉ được upload khi đã thanh toán hóa đơn hợp đồng
    // Hợp đồng có hiệu lực từ ngày upload file (finalizedAt), không phải từ ngày check-in (startDate)
    if (record && record.images && record.images.length > 0) {
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
    
    // Nếu chưa upload file → kiểm tra trạng thái bill CONTRACT
    if (record) {
      const bills = contractBillsMap.get(record._id) || [];
      const contractBill = bills.find((bill: any) => bill.billType === "CONTRACT");
      
      if (contractBill) {
        if (contractBill.status === "PAID") {
          // Đã thanh toán nhưng chưa upload file
          return <Tag color="default">Chờ upload file</Tag>;
        } else if (contractBill.status === "PENDING_CASH_CONFIRM") {
          return <Tag color="gold">Chờ xác nhận thanh toán</Tag>;
        } else {
          // Bill CONTRACT chưa thanh toán
          return <Tag color="error">Chờ thanh toán</Tag>;
        }
      }
    }
    
    // Nếu chưa có bill CONTRACT, kiểm tra status FinalContract
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
    
    // Fallback
    return <Tag color="error">Chờ thanh toán</Tag>;
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
          {record.status === "CANCELED" && record.canceledAt && (
            <div style={{ marginTop: 4 }}>
              <small style={{ color: "#ff4d4f", fontWeight: 500 }}>
                Hủy: {dayjs(record.canceledAt).format("DD/MM/YYYY")}
              </small>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Cọc giữ phòng",
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
          {record.status === "SIGNED" && (
            <Tooltip title="Gia hạn hợp đồng">
              <Button
                size="small"
                icon={<ClockCircleOutlined />}
                onClick={() => {
                  setExtendingContract(record);
                  setExtendModalVisible(true);
                }}
              >
                Gia hạn
              </Button>
            </Tooltip>
          )}
          {(() => {
            // Chỉ hiển thị nút Upload HĐ khi bill CONTRACT đã thanh toán
            const bills = contractBillsMap.get(record._id) || [];
            const contractBill = bills.find((bill: any) => bill.billType === "CONTRACT");
            const isContractBillPaid = contractBill?.status === "PAID";
            
            // Chỉ hiển thị nút khi bill CONTRACT đã thanh toán và status chưa SIGNED
            if (isContractBillPaid && record.status !== "SIGNED") {
              return (
                <Tooltip title="Upload hợp đồng đã ký">
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
                </Tooltip>
              );
            }
            return null;
          })()}
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
          Tạo hóa đơn hợp đồng
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
        okText="Upload hợp đồng"
        okButtonProps={{ disabled: fileList.length === 0 }}
      >
        <p style={{ marginBottom: 16 }}>
          Phòng: <strong>{selectedContract?.roomId?.roomNumber}</strong>
          <br />
          Người thuê: <strong>{selectedContract?.tenantId?.fullName || "Chưa gán"}</strong>
        </p>
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

      {/* Create Contract Bill Modal */}
      <Modal
        title="Tạo hóa đơn hợp đồng"
        open={newContractModalVisible}
        onOk={handleUploadNewContract}
        onCancel={() => {
          setNewContractModalVisible(false);
          setSelectedContractId("");
        }}
        okText="Tạo hóa đơn"
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
                <div>
                  {selectedContract.startDate 
                    ? `${dayjs(selectedContract.startDate).format("DD/MM/YYYY")} → ${dayjs(selectedContract.endDate).format("DD/MM/YYYY")}`
                    : (typeof selectedContract.originContractId === 'object' && (selectedContract.originContractId as any)?.startDate
                        ? `${dayjs((selectedContract.originContractId as any).startDate).format("DD/MM/YYYY")} → ${dayjs((selectedContract.originContractId as any).endDate).format("DD/MM/YYYY")}`
                        : "N/A"
                      )
                  }
                  {selectedContract.status === "CANCELED" && selectedContract.canceledAt && (
                    <div style={{ marginTop: 4 }}>
                      <small style={{ color: "#ff4d4f", fontWeight: 500 }}>
                        Hủy ngày: {dayjs(selectedContract.canceledAt).format("DD/MM/YYYY HH:mm")}
                      </small>
                    </div>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Tiền đã cọc">
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
              <div>
                {(() => {
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

                  // Tìm RECEIPT bill và CONTRACT bill
                  const receiptBill = contractBills.find((b: any) => b.billType === "RECEIPT");
                  const contractBill = contractBills.find((b: any) => b.billType === "CONTRACT");
                  
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
                  let totalDue = 0; // Tổng phải thanh toán
                  
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
                    
                    // Tổng phải thanh toán = tổng từ lineItems (depositRemaining + firstMonthRent)
                    // Không dùng amountDue vì có thể không chính xác
                    totalDue = depositRemaining + firstMonthRent;
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

                      {/* Tổng phải thanh toán - Chỉ hiển thị khi chưa thanh toán */}
                      {contractBill && totalDue > 0 && contractBill.status !== "PAID" && (
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

                      {/* Thao tác cho CONTRACT bill */}
                      {contractBill && (contractBill.status === "PENDING_CASH_CONFIRM" || contractBill.status === "UNPAID" || contractBill.status === "PARTIALLY_PAID") && (
                        <div style={{ marginTop: 16, textAlign: "center" }}>
                          <Space>
                            <Popconfirm
                              title="Xác nhận đã nhận tiền mặt?"
                              onConfirm={() => handleConfirmCashPayment(contractBill._id)}
                              okText="Xác nhận"
                              cancelText="Hủy"
                            >
                              <Button type="primary" icon={<DollarOutlined />}>
                                Xác nhận tiền mặt
                              </Button>
                            </Popconfirm>
                            <Button 
                              type="default"
                              onClick={() => {
                                const contractAmountDue = convertToNumber(contractBill.amountDue);
                                const contractAmountPaid = convertToNumber(contractBill.amountPaid);
                                const remaining = Math.max(0, contractAmountDue - contractAmountPaid);
                                console.log("🔍 Frontend payment calculation:", {
                                  amountDue: contractAmountDue,
                                  amountPaid: contractAmountPaid,
                                  remaining,
                                  rawAmountDue: contractBill.amountDue,
                                  rawAmountPaid: contractBill.amountPaid
                                });
                                handleOnlinePayment(contractBill._id, remaining);
                              }}
                            >
                              Gửi link thanh toán Online
                            </Button>
                          </Space>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <Alert message="Chưa có hóa đơn" type="info" />
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

      {/* Extend Contract Modal */}
      <ExtendContractModal
        visible={extendModalVisible}
        contract={extendingContract}
        onClose={() => {
          setExtendModalVisible(false);
          setExtendingContract(null);
        }}
        onSuccess={() => {
          fetchContracts(pagination.current, pagination.pageSize);
        }}
      />
    </div>
  );
};

export default FinalContracts;
