import { useState, useEffect } from "react";
import { Table, Button, Tag, Modal, Upload, message, Space, Popconfirm, Image, Tooltip, Select } from "antd";
import { UploadOutlined, EyeOutlined, DeleteOutlined, FilePdfOutlined, IdcardOutlined, PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

// Import services
import { adminFinalContractService } from "../services/finalContract";
import { adminContractService } from "../services/contract";

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
  originContractId?: string;
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

interface Contract {
  _id: string;
  tenantId: any;
  roomId: any;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  status: string;
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
  
  // New contract upload
  const [newContractModalVisible, setNewContractModalVisible] = useState(false);
  const [availableContracts, setAvailableContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [newContractFiles, setNewContractFiles] = useState<UploadFile[]>([]);

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
      render: (_: any, record: FinalContract) => record.tenantId?.fullName || "Chưa gán",
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
            onClick={() => {
              setSelectedContract(record);
              setViewModalVisible(true);
            }}
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
                const tenantName = contract.tenantId && typeof contract.tenantId === "object" 
                  ? contract.tenantId.fullName 
                  : "N/A";
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

      {/* View Contract Modal */}
      <Modal
        title="Chi tiết Hợp đồng Chính thức"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedContract && (
          <div>
            <p>
              <strong>Phòng:</strong> {selectedContract.roomId?.roomNumber}
            </p>
            <p>
              <strong>Người thuê:</strong> {selectedContract.tenantId?.fullName || "Chưa gán"}
            </p>
            <p>
              <strong>Trạng thái:</strong> {getStatusTag(selectedContract.status)}
            </p>
            <p>
              <strong>Thời gian:</strong> {dayjs(selectedContract.startDate).format("DD/MM/YYYY")} →{" "}
              {dayjs(selectedContract.endDate).format("DD/MM/YYYY")}
            </p>
            <p>
              <strong>Tiền cọc:</strong> {selectedContract.deposit?.toLocaleString("vi-VN")} đ
            </p>
            <p>
              <strong>Tiền thuê/tháng:</strong> {selectedContract.monthlyRent?.toLocaleString("vi-VN")} đ
            </p>

            <h4>Files Hợp đồng ({selectedContract.images?.length || 0})</h4>
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

            <h4 style={{ marginTop: 16 }}>Files CCCD ({selectedContract.cccdFiles?.length || 0})</h4>
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
