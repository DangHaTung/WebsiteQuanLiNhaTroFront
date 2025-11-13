import { useState, useEffect } from "react";
import { Table, Button, Tag, Modal, Upload, message, Space, Popconfirm, Image, Tooltip, Select, Descriptions, Divider, Form, Input } from "antd";
import { UploadOutlined, EyeOutlined, DeleteOutlined, FilePdfOutlined, IdcardOutlined, PlusOutlined, DollarOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

// Import services
import { adminFinalContractService } from "../services/finalContract";
import { adminContractService } from "../services/contract";
import { adminBillService } from "../services/bill";
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
  status: "DRAFT" | "WAITING_SIGN" | "SIGNED";
  images?: FileInfo[];
  cccdFiles?: FileInfo[];
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
  const [cccdModalVisible, setCccdModalVisible] = useState(false);
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
      const contractsData = await adminContractService.getAll({ limit: 100 });
      setAvailableContracts(contractsData || []);
    } catch (error: any) {
      console.error("Load contracts error:", error);
      message.error(error.response?.data?.message || "Lỗi khi tải danh sách phiếu thu");
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
    
    // Load full contract details with populated originContractId
    try {
      const fullContract = await adminFinalContractService.getById(contract._id);
      setSelectedContract(fullContract);
      
      // Load bills của FinalContract này - CHỈ HIỂN THỈ BILLS CỦA FINALCONTRACT NÀY
      console.log("Loading bills for FinalContract:", fullContract._id);
      try {
        // Gọi trực tiếp API để tránh TypeScript cache issue
        const token = localStorage.getItem("admin_token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(`${apiUrl}/api/bills/final-contract/${fullContract._id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log("Bills API response:", data);
        
        const bills = data.data || [];
        // Lọc chỉ lấy bill CONTRACT (tháng đầu) chưa thanh toán
        const contractBills = bills.filter(
          (bill: any) => bill.billType === "CONTRACT" && bill.status !== "PAID"
        );
        console.log("Filtered bills:", contractBills);
        setContractBills(contractBills);
      } catch (err) {
        console.error("Load bills error:", err);
        setContractBills([]);
      }
    } catch (error: any) {
      console.error("Load contract details error:", error);
      setSelectedContract(contract);
      setContractBills([]);
    }
  };

  const handleConfirmCashPayment = async (billId: string) => {
    try {
      await adminBillService.confirmPayment(billId);
      message.success("Xác nhận thanh toán tiền mặt thành công!");
      // Reload bills - CHỈ HIỂN THỊ BILL CONTRACT CHƯA THANH TOÁN
      if (selectedContract?._id) {
        try {
          const token = localStorage.getItem("admin_token");
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
          const response = await fetch(`${apiUrl}/api/bills/final-contract/${selectedContract._id}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          const data = await response.json();
          const bills = data.data || [];
          const contractBills = bills.filter(
            (bill: any) => bill.billType === "CONTRACT" && bill.status !== "PAID"
          );
          setContractBills(contractBills);
        } catch (err) {
          console.error("Reload bills error:", err);
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

  const handleUploadCCCD = async () => {
    if (!selectedContract || fileList.length === 0) {
      message.warning("Vui lòng chọn file CCCD để upload");
      return;
    }

    try {
      const files = fileList.map((f) => f.originFileObj as File);
      await adminFinalContractService.uploadCCCD(selectedContract._id, files);
      message.success("Upload CCCD thành công");
      setCccdModalVisible(false);
      setFileList([]);
      fetchContracts(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi upload CCCD");
    }
  };

  const handleDeleteFile = async (contractId: string, type: "images" | "cccdFiles", index: number) => {
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

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      DRAFT: { color: "default", text: "Nháp" },
      WAITING_SIGN: { color: "processing", text: "Chờ ký" },
      SIGNED: { color: "success", text: "Đã ký" },
    };
    const s = statusMap[status] || { color: "default", text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
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
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Files",
      key: "files",
      render: (_: any, record: FinalContract) => (
        <Space>
          <Tooltip title="Hợp đồng">
            <Tag color="blue">{record.images?.length || 0}</Tag>
          </Tooltip>
          <Tooltip title="CCCD">
            <Tag color="green">{record.cccdFiles?.length || 0}</Tag>
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
          <Button
            size="small"
            icon={<IdcardOutlined />}
            onClick={() => {
              setSelectedContract(record);
              setCccdModalVisible(true);
            }}
          >
            Upload CCCD
          </Button>
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDeleteContract(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
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

      {/* Upload CCCD Modal */}
      <Modal
        title="Upload CCCD"
        open={cccdModalVisible}
        onOk={handleUploadCCCD}
        onCancel={() => {
          setCccdModalVisible(false);
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
          <Button icon={<UploadOutlined />}>Chọn file CCCD (ảnh hoặc PDF)</Button>
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
        okText="Tạo hợp đồng"
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
        title="Tạo tài khoản và gán người thuê"
        open={assignTenantModalVisible}
        onOk={handleAssignTenant}
        onCancel={() => {
          setAssignTenantModalVisible(false);
          tenantForm.resetFields();
        }}
        okText="Tạo và gán"
        cancelText="Hủy"
        afterOpenChange={async (open) => {
          if (open && assigningContract) {
            const originId = getOriginContractId(assigningContract);
            if (originId) {
              try {
                const contract = await adminContractService.getById(originId) as any;
                if (contract.tenantSnapshot) {
                  // Tự động tạo email từ số điện thoại nếu chưa có
                  const suggestedEmail = contract.tenantSnapshot.email || 
                    (contract.tenantSnapshot.phone ? `${contract.tenantSnapshot.phone}@gmail.com` : '');
                  
                  tenantForm.setFieldsValue({
                    fullName: contract.tenantSnapshot.fullName,
                    phone: contract.tenantSnapshot.phone,
                    email: suggestedEmail,
                  });
                }
              } catch (err) {
                console.warn("Cannot load contract:", err);
              }
            }
          }
        }}
      >
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
              <Descriptions.Item label="Trạng thái">{getStatusTag(selectedContract.status)}</Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {dayjs(selectedContract.startDate).format("DD/MM/YYYY")} → {dayjs(selectedContract.endDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Tiền cọc">{selectedContract.deposit?.toLocaleString("vi-VN")} đ</Descriptions.Item>
              <Descriptions.Item label="Tiền thuê/tháng">{selectedContract.monthlyRent?.toLocaleString("vi-VN")} đ</Descriptions.Item>
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
                    render: (_: any, record: any) => {
                      if (record.status === "PENDING_CASH_CONFIRM" || record.status === "UNPAID") {
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
                              onClick={() => handleOnlinePayment(record._id, record.amountDue)}
                            >
                              Online
                            </Button>
                          </Space>
                        );
                      }
                      return <Tag color="success">Đã thanh toán</Tag>;
                    },
                  },
                ]}
              />
            ) : (
              <p style={{ textAlign: "center", color: "#999" }}>Không có hóa đơn</p>
            )}

            <Divider orientation="left">Files Hợp đồng ({selectedContract.images?.length || 0})</Divider>
            <Space wrap>
              {selectedContract.images?.map((file, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  {file.resource_type === "raw" || file.format === "pdf" ? (
                    <a href={file.viewUrl || file.secure_url} target="_blank" rel="noopener noreferrer">
                      <FilePdfOutlined style={{ fontSize: 48, color: "#ff4d4f" }} />
                    </a>
                  ) : (
                    <Image src={file.secure_url} width={100} height={100} style={{ objectFit: "cover" }} />
                  )}
                  <Popconfirm title="Xóa file này?" onConfirm={() => handleDeleteFile(selectedContract._id, "images", idx)}>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ position: "absolute", top: 0, right: 0 }}
                    />
                  </Popconfirm>
                </div>
              ))}
            </Space>

            <Divider orientation="left">Files CCCD ({selectedContract.cccdFiles?.length || 0})</Divider>
            <Space wrap>
              {selectedContract.cccdFiles?.map((file, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  {file.resource_type === "raw" || file.format === "pdf" ? (
                    <a href={file.viewUrl || file.secure_url} target="_blank" rel="noopener noreferrer">
                      <FilePdfOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                    </a>
                  ) : (
                    <Image src={file.secure_url} width={100} height={100} style={{ objectFit: "cover" }} />
                  )}
                  <Popconfirm title="Xóa file này?" onConfirm={() => handleDeleteFile(selectedContract._id, "cccdFiles", idx)}>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ position: "absolute", top: 0, right: 0 }}
                    />
                  </Popconfirm>
                </div>
              ))}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FinalContracts;
