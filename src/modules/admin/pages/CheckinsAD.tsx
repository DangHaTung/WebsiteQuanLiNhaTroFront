import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Tag,
  message,
  Row,
  Col,
  Space,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckOutlined,
  SendOutlined,
  DownloadOutlined,
  CarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Checkin, Vehicle, VehicleType } from "../../../types/checkin";
import type { Room } from "../../../types/room";
import type { User } from "../../../types/user";
import dayjs, { Dayjs } from "dayjs";
import { useLocation } from "react-router-dom";
import { adminCheckinService } from "../services/checkin";
import { adminRoomService } from "../services/room";
import { adminUserService } from "../services/user";
import { adminBillService } from "../services/bill";
import { adminFinalContractService } from "../services/finalContract";
import { adminContractService } from "../services/contract";
import CheckinDetailDrawer from "../components/CheckinDetailDrawer";

const { Option } = Select;

interface CheckinFormValues {
  roomId: string;
  checkinDate: Dayjs;
  duration: number;
  deposit: number;
  identityNo?: string;
  address?: string;
  initialElectricReading?: number;
  tenantId?: string;
  notes?: string;
}

const CheckinsAD: React.FC = () => {
  const location = useLocation();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<CheckinFormValues>();

  // Detail Drawer States
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);

  // Extend Receipt Modal States
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [extendingCheckin, setExtendingCheckin] = useState<Checkin | null>(null);
  const [extendForm] = Form.useForm<{ additionalDeposit: number }>();

  // CCCD Upload Modal States
  const [cccdUploadModalVisible, setCccdUploadModalVisible] = useState(false);
  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string | null>(null);
  const [cccdBackPreview, setCccdBackPreview] = useState<string | null>(null);

  // File input refs
  const cccdFrontInputRef = useRef<HTMLInputElement>(null);
  const cccdBackInputRef = useRef<HTMLInputElement>(null);

  // Vehicle management states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicleType, setNewVehicleType] = useState<VehicleType>('motorbike');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');

  // State để theo dõi đã load các dữ liệu phụ chưa
  const [hasLoadedRooms, setHasLoadedRooms] = useState(false);
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);
   // Map để lưu bill CONTRACT theo finalContractId (key: finalContractId, value: bill CONTRACT)
  const [contractBillsMap, setContractBillsMap] = useState<Map<string, any>>(new Map());
   // Map để lưu FinalContract info theo finalContractId (key: finalContractId, value: FinalContract)
  const [finalContractsMap, setFinalContractsMap] = useState<Map<string, any>>(new Map());
   // Map để lưu Contract info theo contractId (key: contractId, value: Contract) - để kiểm tra contract bị hủy
  const [contractsMap, setContractsMap] = useState<Map<string, any>>(new Map());
   // Map để lưu Receipt Bill info theo receiptBillId (key: receiptBillId, value: Bill) - để kiểm tra trạng thái thanh toán
  const [receiptBillsMap, setReceiptBillsMap] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    loadCheckins();
  }, []);

  // Xử lý tự động mở drawer khi có checkinId từ state (khi navigate từ RoomDetailDrawer)
  useEffect(() => {
    const state = location.state as { checkinId?: string } | null;
    if (state?.checkinId && checkins.length > 0) {
      const checkin = checkins.find((c) => c._id === state.checkinId);
      if (checkin) {
        setSelectedCheckin(checkin);
        setDetailVisible(true);
        // Clear state để tránh mở lại khi refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, checkins]);

  const loadCheckins = async () => {
    try {
      setLoading(true);
      const response = await adminCheckinService.getAll({ limit: 100 });
      const allCheckins = response.data || [];
     
      // Hiển thị tất cả checkins, không ẩn bất kỳ checkin nào (kể cả đã thanh toán)
      setCheckins(allCheckins);
     
      // Load các bill CONTRACT để kiểm tra trạng thái thanh toán
      await loadContractBills(allCheckins);
     
      // Load FinalContract info để kiểm tra images
      await loadFinalContracts(allCheckins);
     
      // Load Contract info để kiểm tra contract bị hủy
      await loadContracts(allCheckins);
     
      // Load Receipt Bills để kiểm tra trạng thái thanh toán
      await loadReceiptBills(allCheckins);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu check-in");
    } finally {
      setLoading(false);
    }
  };

  // Load các bill CONTRACT để kiểm tra trạng thái thanh toán
  const loadContractBills = async (checkins: Checkin[]) => {
    try {
      const finalContractIds = new Set<string>();
     
      // Lấy tất cả finalContractId từ checkins
      checkins.forEach((checkin: any) => {
        if (checkin.finalContractId) {
          const fcId = typeof checkin.finalContractId === 'string'
            ? checkin.finalContractId
            : checkin.finalContractId._id;
          if (fcId) {
            finalContractIds.add(fcId);
          }
        }
      });

      if (finalContractIds.size === 0) {
        return;
      }

      // Load bills CONTRACT cho từng finalContractId
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("admin_token");
      const newContractBillsMap = new Map<string, any>();

      await Promise.all(
        Array.from(finalContractIds).map(async (fcId) => {
          try {
            // Lấy bills CONTRACT theo finalContractId
            const response = await fetch(`${apiUrl}/api/bills?finalContractId=${fcId}&billType=CONTRACT&limit=100`, {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            const data = await response.json();
            const bills = data.data || [];
           
            // Tìm bill CONTRACT đã thanh toán (PAID)
            const paidContractBill = bills.find((bill: any) =>
              bill.billType === "CONTRACT" && bill.status === "PAID"
            );
           
            if (paidContractBill) {
              newContractBillsMap.set(fcId, paidContractBill);
            }
          } catch (error) {
            console.error(`Error loading contract bill for finalContractId ${fcId}:`, error);
          }
        })
      );

      setContractBillsMap(newContractBillsMap);
    } catch (error) {
      console.error("Error loading contract bills:", error);
    }
  };

  // Load FinalContract info để kiểm tra images
  const loadFinalContracts = async (checkins: Checkin[]) => {
    try {
      const finalContractIds = new Set<string>();
     
      // Lấy tất cả finalContractId từ checkins
      checkins.forEach((checkin: any) => {
        if (checkin.finalContractId) {
          const fcId = typeof checkin.finalContractId === 'string'
            ? checkin.finalContractId
            : checkin.finalContractId._id;
          if (fcId) {
            finalContractIds.add(fcId);
          }
        }
      });

      if (finalContractIds.size === 0) {
        return;
      }

      // Load FinalContract cho từng finalContractId
      const newFinalContractsMap = new Map<string, any>();

      await Promise.all(
        Array.from(finalContractIds).map(async (fcId) => {
          try {
            // Lấy FinalContract theo ID
            const finalContract = await adminFinalContractService.getById(fcId);
            if (finalContract) {
              newFinalContractsMap.set(fcId, finalContract);
            }
          } catch (error) {
            console.error(`Error loading FinalContract ${fcId}:`, error);
          }
        })
      );

      setFinalContractsMap(newFinalContractsMap);
    } catch (error) {
      console.error("Error loading FinalContracts:", error);
    }
  };

  // Load Contract info để kiểm tra contract bị hủy
  const loadContracts = async (checkins: Checkin[]) => {
    try {
      const contractIds = new Set<string>();
     
      // Lấy tất cả contractId từ checkins
      checkins.forEach((checkin: any) => {
        if (checkin.contractId) {
          const contractId = typeof checkin.contractId === 'string'
            ? checkin.contractId
            : checkin.contractId._id;
          if (contractId) {
            contractIds.add(contractId);
          }
        }
      });

      if (contractIds.size === 0) {
        return;
      }

      // Load Contract cho từng contractId
      const newContractsMap = new Map<string, any>();

      await Promise.all(
        Array.from(contractIds).map(async (contractId) => {
          try {
            // Lấy Contract theo ID
            const contract = await adminContractService.getById(contractId);
            if (contract) {
              newContractsMap.set(contractId, contract);
            }
          } catch (error) {
            console.error(`Error loading Contract ${contractId}:`, error);
          }
        })
      );

      setContractsMap(newContractsMap);
    } catch (error) {
      console.error("Error loading Contracts:", error);
    }
  };

  // Load Receipt Bills để kiểm tra trạng thái thanh toán
  const loadReceiptBills = async (checkins: Checkin[]) => {
    try {
      const receiptBillIds = new Set<string>();
     
      // Lấy tất cả receiptBillId từ checkins
      checkins.forEach((checkin: any) => {
        if (checkin.receiptBillId) {
          const billId = typeof checkin.receiptBillId === 'string'
            ? checkin.receiptBillId
            : checkin.receiptBillId._id;
          if (billId) {
            receiptBillIds.add(billId);
          }
        }
      });

      if (receiptBillIds.size === 0) {
        return;
      }

      // Load Receipt Bill cho từng receiptBillId
      const newReceiptBillsMap = new Map<string, any>();

      await Promise.all(
        Array.from(receiptBillIds).map(async (billId) => {
          try {
            // Lấy Bill theo ID
            const bill = await adminBillService.getById(billId);
            if (bill) {
              newReceiptBillsMap.set(billId, bill);
            }
          } catch (error) {
            console.error(`Error loading Receipt Bill ${billId}:`, error);
          }
        })
      );

      setReceiptBillsMap(newReceiptBillsMap);
    } catch (error) {
      console.error("Error loading Receipt Bills:", error);
    }
  };

  const loadRoomsIfNeeded = async () => {
    if (!hasLoadedRooms) {
    try {
        const roomsData = await adminRoomService.getAll({ limit: 100 });
      setRooms(roomsData);
        setHasLoadedRooms(true);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu phòng");
      }
    }
  };

  const loadUsersIfNeeded = async () => {
    if (!hasLoadedUsers) {
      try {
        const usersData = await adminUserService.list();
        setUsers(usersData);
        setHasLoadedUsers(true);
      } catch (error: any) {
        message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu người dùng");
      }
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    form.resetFields();
    setCccdFrontFile(null);
    setCccdBackFile(null);
    setCccdFrontPreview(null);
    setCccdBackPreview(null);
    setVehicles([]);
    setNewVehicleType('motorbike');
    setNewVehiclePlate('');
    loadRoomsIfNeeded();
    loadUsersIfNeeded();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
    setCccdFrontFile(null);
    setCccdBackFile(null);
    setCccdFrontPreview(null);
    setCccdBackPreview(null);
    setVehicles([]);
    setNewVehicleType('motorbike');
    setNewVehiclePlate('');
  };

  // Vehicle management functions
  const addVehicle = () => {
    if (['motorbike', 'electric_bike'].includes(newVehicleType) && !newVehiclePlate.trim()) {
      message.error('Xe máy và xe điện phải có biển số');
      return;
    }
    
    const newVehicle: Vehicle = {
      type: newVehicleType,
      licensePlate: newVehicleType === 'bicycle' ? undefined : newVehiclePlate.trim().toUpperCase(),
    };
    
    setVehicles([...vehicles, newVehicle]);
    setNewVehiclePlate('');
  };

  const removeVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const vehicleTypeLabels: Record<VehicleType, string> = {
    motorbike: "🏍️ Xe máy",
    electric_bike: "⚡ Xe điện",
    bicycle: "🚲 Xe đạp",
  };

  const openCccdUploadModal = () => {
    setCccdUploadModalVisible(true);
  };

  const closeCccdUploadModal = () => {
    setCccdUploadModalVisible(false);
  };

  const handleCccdUpload = (type: "front" | "back", file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      if (type === "front") {
        setCccdFrontFile(file);
        setCccdFrontPreview(preview);
      } else {
        setCccdBackFile(file);
        setCccdBackPreview(preview);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCccdImage = (type: "front" | "back") => {
    if (type === "front") {
      setCccdFrontFile(null);
      setCccdFrontPreview(null);
    } else {
      setCccdBackFile(null);
      setCccdBackPreview(null);
    }
  };

  const handleFinishCccdUpload = () => {
    if (cccdFrontFile && cccdBackFile) {
      closeCccdUploadModal();
      message.success("Đã upload ảnh CCCD thành công");
    } else {
      message.warning("Vui lòng upload đầy đủ ảnh mặt trước và mặt sau");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
     
      // Validate CCCD images
      if (!cccdFrontFile || !cccdBackFile) {
        message.error("Vui lòng upload đầy đủ ảnh CCCD mặt trước và mặt sau");
        return;
      }

      const formData = new FormData();
      formData.append("roomId", values.roomId);
      formData.append("checkinDate", values.checkinDate.format("YYYY-MM-DD"));
      formData.append("duration", values.duration.toString());
      formData.append("deposit", values.deposit.toString());
      // Mặc định là ONLINE vì khách hàng sẽ tự chọn phương thức thanh toán ở client
      formData.append("paymentMethod", "ONLINE");
     
      if (values.identityNo) {
        formData.append("identityNo", values.identityNo);
      }
      if (values.address) {
        formData.append("address", values.address);
      }
      if (values.initialElectricReading !== undefined && values.initialElectricReading !== null) {
        formData.append("initialElectricReading", values.initialElectricReading.toString());
      }
      if (values.tenantId) {
        formData.append("tenantId", values.tenantId);
      }
      if (values.notes) {
        formData.append("notes", values.notes);
      }
      
      // Thêm vehicles vào formData
      if (vehicles.length > 0) {
        formData.append("vehicles", JSON.stringify(vehicles));
      }

      formData.append("cccdFront", cccdFrontFile);
      formData.append("cccdBack", cccdBackFile);

      setLoading(true);
     
      // Luôn dùng createOnlineWithFiles vì khách sẽ thanh toán online ở client
      await adminCheckinService.createOnlineWithFiles(formData);

      message.success("Tạo phiếu thu thành công");
      closeModal();
      loadCheckins();
    } catch (error: any) {
      if (error?.errorFields) {
        // Form validation error
        return;
      }
      message.error(error?.response?.data?.message || "Lỗi khi tạo phiếu thu");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      CREATED: { color: "processing", text: "Đã tạo", icon: <ClockCircleOutlined /> },
      COMPLETED: { color: "success", text: "Hoàn thành", icon: <CheckCircleOutlined /> },
      CANCELED: { color: "error", text: "Đã hủy", icon: <DeleteOutlined /> },
    };
    const m = map[status] || { color: "default", text: status, icon: null };
    return <Tag color={m.color} icon={m.icon}>{m.text}</Tag>;
  };

  const handleConfirmCashPayment = async (receiptBillId: string) => {
    try {
      await adminBillService.confirmPayment(receiptBillId);
      message.success("Xác nhận thanh toán tiền mặt thành công!");
      // Reload để cập nhật receiptPaidAt và receiptBill status
      await loadCheckins();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi xác nhận thanh toán");
    }
  };

  const handleSendPaymentLink = async (billId: string) => {
    try {
      const result = await adminBillService.generatePaymentLink(billId);
      message.success(
        `Đã tạo link thanh toán! Link: ${result.paymentUrl}`,
        10
      );
     
      // Copy link to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(result.paymentUrl);
        message.info("Đã copy link vào clipboard");
      }
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (errorData?.message) {
        message.error(errorData.message);
      } else {
        message.error(errorData?.message || "Lỗi khi gửi link thanh toán");
      }
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await adminCheckinService.complete(id);
      message.success("Đã đánh dấu check-in hoàn thành!");
      loadCheckins();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi hoàn thành check-in");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await adminCheckinService.cancel(id, "Hủy bởi admin");
      message.success("Đã hủy check-in!");
      loadCheckins();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi hủy check-in");
    }
  };

  const handleDownloadDocx = async (id: string) => {
    try {
      const blob = await adminCheckinService.downloadSampleDocx(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `HopDongMau-${id}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("Tải hợp đồng mẫu thành công!");
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải hợp đồng mẫu");
    }
  };

  const handleOpenExtendModal = (checkin: Checkin) => {
    setExtendingCheckin(checkin);
    setExtendModalVisible(true);
    extendForm.resetFields();
  };

  const handleExtendReceipt = async () => {
    if (!extendingCheckin) return;

    try {
      const values = await extendForm.validateFields();
      await adminCheckinService.extendReceipt(extendingCheckin._id, {
        additionalDeposit: values.additionalDeposit,
      });
      message.success("Gia hạn phiếu thu thành công!");
      setExtendModalVisible(false);
      setExtendingCheckin(null);
      extendForm.resetFields();
      loadCheckins();
    } catch (error: any) {
      if (error?.errorFields) {
        // Form validation error
        return;
      }
      message.error(error?.response?.data?.message || "Lỗi khi gia hạn phiếu thu");
    }
  };

  const columns: ColumnsType<Checkin> = [
    {
      title: "Phòng",
      dataIndex: "roomId",
      key: "roomId",
      render: (roomId: string | Room, record: Checkin) => {
        const room = typeof roomId === "object" ? roomId : rooms.find((r) => r._id === roomId);
        return (
          <span
            style={{ cursor: "pointer", color: "#1677ff", fontWeight: 500 }}
            onClick={() => {
              setSelectedCheckin(record);
              setDetailVisible(true);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            {room?.roomNumber || (typeof roomId === "string" ? roomId : "")}
          </span>
        );
      },
    },
    {
      title: "Ngày Check-in",
      dataIndex: "checkinDate",
      key: "checkinDate",
      render: (date: string, record: Checkin) => (
        <span
          style={{ cursor: "pointer", color: "#1677ff", fontWeight: 500 }}
          onClick={() => {
            setSelectedCheckin(record);
            setDetailVisible(true);
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          {dayjs(date).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Thời hạn (tháng)",
      dataIndex: "durationMonths",
      key: "durationMonths",
    },
    {
      title: "Tiền cọc",
      dataIndex: "deposit",
      key: "deposit",
      render: (val: number) => val?.toLocaleString("vi-VN") + " đ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: Checkin) => {
        if (record.status === "CANCELED") {
          return <Tag color="error">Đã hủy</Tag>;
        }
        const receiptBill = typeof record.receiptBillId === "object" ? record.receiptBillId : null;
        if (receiptBill) {
          const billStatus = (receiptBill as any).status;
          const map: Record<string, { color: string; text: string }> = {
            DRAFT: { color: "orange", text: "Nháp" },
            PAID: { color: "green", text: "Đã thanh toán" },
            UNPAID: { color: "red", text: "Chờ thanh toán" },
            PARTIALLY_PAID: { color: "orange", text: "Một phần" },
            VOID: { color: "default", text: "Đã hủy" },
            PENDING_CASH_CONFIRM: { color: "gold", text: "Chờ xác nhận tiền mặt" },
          };
          const m = map[billStatus] || { color: "default", text: billStatus || "Trạng thái" };
          return <Tag color={m.color}>{m.text}</Tag>;
        }
        return getStatusTag(record.status);
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thời hạn",
      key: "expiration",
      align: "center",
      render: (_: any, record: Checkin) => {
        // Kiểm tra xem Contract có bị hủy không (ưu tiên kiểm tra Contract trước)
        const contractId = (record as any).contractId;
        if (contractId) {
          const cId = typeof contractId === 'string' ? contractId : contractId._id;
          const contract = contractsMap.get(cId);
          if (contract && contract.status === "CANCELED") {
            return <Tag color="error">Hợp đồng đã hủy</Tag>;
          }
        }
        
        // Kiểm tra xem có finalContractId và bill CONTRACT đã thanh toán chưa
        const finalContractId = (record as any).finalContractId;
        if (finalContractId) {
          const fcId = typeof finalContractId === 'string' ? finalContractId : finalContractId._id;
          const contractBill = contractBillsMap.get(fcId);
          const finalContract = finalContractsMap.get(fcId);
         
          // Kiểm tra xem FinalContract có bị hủy không
          if (finalContract && finalContract.status === "CANCELED") {
            return <Tag color="error">Hợp đồng đã hủy</Tag>;
          }
         
          // Nếu bill CONTRACT đã thanh toán (PAID)
          if (contractBill && contractBill.status === "PAID") {
            // Kiểm tra xem FinalContract có file upload chưa
            const hasImages = finalContract && finalContract.images && Array.isArray(finalContract.images) && finalContract.images.length > 0;
           
            if (hasImages) {
              // Đã upload file → "Hợp đồng đã được ký"
              return <Tag color="success">Hợp đồng đã được ký</Tag>;
            } else {
              // Chưa upload file → "Chờ upload file"
              return <Tag color="gold">Chờ upload file</Tag>;
            }
          }
         
          // Nếu có finalContractId nhưng chưa thanh toán bill CONTRACT, hiển thị đếm ngược
        }
       
        // Nếu chưa có receiptPaidAt, chưa thanh toán phiếu thu
        if (!record.receiptPaidAt) {
          return <Tag color="default">Chưa bắt đầu</Tag>;
        }
       
        // Hiển thị đếm ngược thời hạn (3 ngày từ khi thanh toán phiếu thu)
        // Nếu có đếm ngược nghĩa là đã thanh toán phiếu thu
        const receiptPaidAt = dayjs(record.receiptPaidAt);
        const now = dayjs();
        const expirationDate = receiptPaidAt.add(3, 'day');
        const daysRemaining = expirationDate.diff(now, 'day', true);
        const hoursRemaining = expirationDate.diff(now, 'hour', true);
       
        if (daysRemaining < 0) {
          return <Tag color="error">Đã hết hạn</Tag>;
        } else if (daysRemaining < 1) {
          const hours = Math.floor(hoursRemaining);
          const minutes = Math.floor((hoursRemaining - hours) * 60);
          return (
            <Tag color="warning">
              Còn {hours}h {minutes}m
            </Tag>
          );
        } else {
          const days = Math.floor(daysRemaining);
          const hours = Math.floor((daysRemaining - days) * 24);
          return (
            <Tag color={days <= 1 ? "warning" : "blue"}>
              Còn {days} ngày {hours > 0 ? `${hours}h` : ''}
            </Tag>
          );
        }
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 200,
      render: (_: any, record: Checkin) => {
        if (record.status === "CANCELED") {
          return <span style={{ color: "#999" }}>-</span>;
        }
        
        // Lấy receiptBillId
        const receiptBillId = typeof record.receiptBillId === "object" 
          ? (record.receiptBillId as any)?._id 
          : (typeof record.receiptBillId === "string" ? record.receiptBillId : null);
        
        // Lấy receiptBill từ map hoặc từ populated object
        let receiptBill = typeof record.receiptBillId === "object" ? record.receiptBillId : null;
        if (receiptBillId && !receiptBill) {
          receiptBill = receiptBillsMap.get(receiptBillId) || null;
        }
        
        // Nếu vẫn không có receiptBill, thử load từ populated object
        if (!receiptBill && receiptBillId) {
          // receiptBill có thể đã được populate nhưng chưa có trong map
          receiptBill = typeof record.receiptBillId === "object" ? record.receiptBillId : null;
        }
        
        const isPendingCash = receiptBill && (receiptBill as any).status === "PENDING_CASH_CONFIRM";
        const isUnpaid = receiptBill && (receiptBill as any).status === "UNPAID";
        const isPaid = receiptBill && (receiptBill as any).status === "PAID";
        
        // Kiểm tra xem có đếm ngược thời hạn không (có receiptPaidAt)
        // Nếu có receiptPaidAt thì chắc chắn đã thanh toán (đang đếm ngược hoặc đã hết hạn)
        const hasReceiptPaidAt = !!record.receiptPaidAt;
        
        // Kiểm tra xem có đang đếm ngược hoặc đã hết hạn không
        let isCountingDown = false;
        let isExpired = false;
        if (hasReceiptPaidAt) {
          const receiptPaidAt = dayjs(record.receiptPaidAt);
          const now = dayjs();
          const expirationDate = receiptPaidAt.add(3, 'day');
          const daysRemaining = expirationDate.diff(now, 'day', true);
          isCountingDown = daysRemaining >= 0;
          isExpired = daysRemaining < 0;
        }
        
        // Có thể gia hạn nếu: có receiptPaidAt (đang đếm ngược HOẶC đã hết hạn) và chưa bị hủy
        // Cho phép gia hạn ngay cả khi status = "COMPLETED" nếu vẫn còn đếm ngược hoặc đã hết hạn
        // Note: record.status đã được narrow sau check "CANCELED" ở trên, nên luôn true ở đây
        const canExtend = hasReceiptPaidAt;
        
        // Debug: Log để kiểm tra
        if (hasReceiptPaidAt) {
          console.log(`[Checkin ${(record.roomId as any)?.roomNumber || record._id}] canExtend:`, {
            hasReceiptPaidAt,
            status: record.status,
            receiptPaidAt: record.receiptPaidAt,
            canExtend,
            isCountingDown,
            isExpired
          });
        }

        return (
          <Space size="small" wrap={false}>
            {(isPendingCash || isUnpaid) && receiptBillId && (
              <>
                <Tooltip title="Xác nhận đã nhận tiền mặt">
                  <Popconfirm
                    title="Xác nhận đã nhận tiền mặt?"
                    okText="Xác nhận"
                    cancelText="Hủy"
                    onConfirm={() => handleConfirmCashPayment(receiptBillId)}
                  >
                    <Button
                      size="small"
                      type="primary"
                      icon={<DollarOutlined />}
                    />
                  </Popconfirm>
                </Tooltip>
                <Tooltip title="Gửi link thanh toán qua email">
                  <Button
                    size="small"
                    type="default"
                    icon={<SendOutlined />}
                    onClick={() => handleSendPaymentLink(receiptBillId)}
                  />
                </Tooltip>
              </>
            )}
            {isPaid && record.status === "CREATED" && (
              <Tooltip title="Đánh dấu hoàn thành">
                <Popconfirm
                  title="Đánh dấu check-in hoàn thành?"
                  okText="Hoàn thành"
                  cancelText="Hủy"
                  onConfirm={() => handleComplete(record._id)}
                >
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            )}
            {/* Button gia hạn: hiển thị khi đang đếm ngược hoặc đã hết hạn, và chưa hoàn thành */}
            {canExtend && (
              <Tooltip title="Gia hạn phiếu thu">
                <Button
                  size="small"
                  icon={<ClockCircleOutlined />}
                  onClick={() => handleOpenExtendModal(record)}
                >
                  Gia hạn
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Tải DOCX">
              <Button
                size="small"
                type="default"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadDocx(record._id)}
                disabled={(record.status as string) === "CANCELED" || !isPaid}
              />
            </Tooltip>
            {record.status === "CREATED" && isUnpaid && (
              <Tooltip title="Hủy">
                <Popconfirm
                  title="Hủy check-in này? (Sẽ mất 100% tiền cọc)"
                  okText="Hủy"
                  cancelText="Không"
                  onConfirm={() => handleCancel(record._id)}
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Quản lý Check-in</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
          Tạo phiếu thu mới
            </Button>
      </div>

        <Table<Checkin>
          columns={columns}
        dataSource={checkins}
          rowKey={(r) => r._id}
          loading={loading}
        pagination={{ pageSize: 10 }}
        />

      {/* Modal tạo phiếu thu */}
      <Modal
        title="Tạo phiếu thu mới"
        open={isModalOpen}
        onOk={handleSave}
        onCancel={closeModal}
        okText="Lưu"
        cancelText="Hủy"
        width={800}
        centered
        okButtonProps={{ loading, style: { background: "#1890ff", borderColor: "#1890ff" } }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Phòng"
                name="roomId"
                rules={[{ required: true, message: "Chọn phòng!" }]}
              >
                <Select placeholder="Chọn phòng" showSearch optionFilterProp="children">
                  {rooms
                    .filter((room) => room.status === "AVAILABLE")
                    .map((room) => (
                      <Option key={room._id} value={room._id}>
                        {room.roomNumber} - Còn trống
                      </Option>
                    ))}
                  {rooms.filter((room) => room.status === "AVAILABLE").length === 0 && (
                    <Option disabled value="">
                      Không có phòng trống
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Ngày Check-in"
                name="checkinDate"
                rules={[{ required: true, message: "Chọn ngày Check-in!" }]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Thời hạn thuê (tháng)"
                name="duration"
                rules={[
                  { required: true, message: "Nhập thời hạn thuê!" },
                  { type: "number", min: 1, message: "Thời hạn thuê tối thiểu là 1 tháng" },
                  { type: "number", max: 36, message: "Thời hạn thuê tối đa là 36 tháng (3 năm)" },
                ]}
              >
                <InputNumber min={1} max={36} style={{ width: "100%" }} placeholder="Nhập thời hạn thuê (tối đa 36 tháng)" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tiền cọc giữ phòng(VNĐ)"
                name="deposit"
                rules={[
                  { required: true, message: "Nhập tiền cọc!" },
                  {
                    validator: (_, value) => {
                      if (!value && value !== 0) {
                        return Promise.resolve();
                      }
                      const depositNum = Number(value);
                      if (isNaN(depositNum)) {
                        return Promise.reject(new Error("Tiền cọc phải là số!"));
                      }
                      if (depositNum < 500000) {
                        return Promise.reject(new Error("Cọc giữ phòng tối thiểu là 500,000 VNĐ"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => {
                    if (!value) return 0 as any;
                    const parsed = value.replace(/\$\s?|(,*)/g, "");
                    return (parsed === "" ? 0 : Number(parsed) || 0) as any;
                  }}
                  placeholder="Nhập tiền cọc (tối thiểu 500,000 VNĐ)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                label="CMND/CCCD"
                name="identityNo"
                rules={[
                  { required: true, message: "Nhập số CMND/CCCD!" },
                  {
                    pattern: /^\d{12}$/,
                    message: "Số CMND/CCCD phải là 12 chữ số",
                  },
                ]}
              >
                <Input placeholder="Nhập số CMND/CCCD" maxLength={12} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                label="Địa chỉ"
                name="address"
                rules={[
                  { required: true, message: "Nhập địa chỉ!" },
                ]}
              >
                <Input placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                label="Số điện hiện tại (kWh)"
                name="initialElectricReading"
                rules={[
                  { required: true, message: "Nhập số điện hiện tại!" },
                ]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: "100%" }} 
                  placeholder="Nhập số điện hiện tại"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Vehicle Management Section */}
          <div style={{ marginBottom: 16, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <CarOutlined style={{ fontSize: 18 }} />
              <strong>Quản lý xe ({vehicles.length} xe)</strong>
            </div>
            
            {/* Add vehicle form */}
            <Row gutter={8} style={{ marginBottom: 12 }}>
              <Col xs={8}>
                <Select
                  value={newVehicleType}
                  onChange={(v) => setNewVehicleType(v)}
                  style={{ width: "100%" }}
                >
                  <Option value="motorbike">Xe máy</Option>
                  <Option value="electric_bike">Xe điện</Option>
                  <Option value="bicycle">Xe đạp</Option>
                </Select>
              </Col>
              <Col xs={10}>
                <Input
                  placeholder="Biển số (VD: 29A-12345)"
                  value={newVehiclePlate}
                  onChange={(e) => setNewVehiclePlate(e.target.value)}
                  disabled={newVehicleType === 'bicycle'}
                  onPressEnter={addVehicle}
                />
              </Col>
              <Col xs={6}>
                <Button type="primary" icon={<PlusOutlined />} onClick={addVehicle} block>
                  Thêm
                </Button>
              </Col>
            </Row>
            
            {/* Vehicle list */}
            {vehicles.length > 0 && (
              <div style={{ backgroundColor: "#fff", padding: 8, borderRadius: 4 }}>
                {vehicles.map((vehicle, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "8px 12px",
                      borderBottom: index < vehicles.length - 1 ? "1px solid #f0f0f0" : "none"
                    }}
                  >
                    <span>
                      {vehicleTypeLabels[vehicle.type]}
                      {vehicle.licensePlate && ` - ${vehicle.licensePlate}`}
                    </span>
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeVehicle(index)}
                      size="small"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {vehicles.length === 0 && (
              <div style={{ color: "#999", textAlign: "center", padding: 8 }}>
                Chưa có xe nào. Thêm xe để tính phí đỗ xe hàng tháng.
              </div>
            )}
          </div>

          <Form.Item
            label="Tài khoản khách hàng"
            name="tenantId"
            rules={[{ required: true, message: "Chọn tài khoản khách hàng!" }]}
            tooltip="Chọn tài khoản để khách hàng có thể thấy và thanh toán phiếu thu tiền cọc này"
          >
            <Select
              showSearch
              placeholder="Chọn tài khoản"
              optionFilterProp="children"
              filterOption={(input, option: any) => {
                const children = option?.children;
                if (children && typeof children === "string") {
                  return children.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
            >
              {users.length === 0 ? (
                <Option disabled value="">
                  Không có tài khoản nào
                </Option>
              ) : (
                users
                  .filter((u) => u.role === "USER" || u.role === "TENANT")
                  .map((user) => (
                    <Option key={user._id} value={user._id}>
                      {user.fullName} {user.email && `(${user.email})`}
                    </Option>
                  ))
              )}
            </Select>
          </Form.Item>

          <Form.Item label="Upload ảnh CCCD">
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={openCccdUploadModal}
              size="middle"
            >
              Upload ảnh CCCD
            </Button>
            {cccdFrontFile && cccdBackFile && (
              <span style={{ marginLeft: "12px", color: "#52c41a" }}>
                ✓ Đã upload đầy đủ ảnh CCCD
              </span>
            )}
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal upload CCCD */}
      <Modal
        title="Upload ảnh CCCD"
        open={cccdUploadModalVisible}
        onCancel={closeCccdUploadModal}
        footer={[
          <Button key="cancel" onClick={closeCccdUploadModal}>
            Hủy
          </Button>,
          <Button
            key="finish"
            type="primary"
            onClick={handleFinishCccdUpload}
            disabled={!cccdFrontFile || !cccdBackFile}
          >
            Hoàn thành
          </Button>,
        ]}
        width={800}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ marginBottom: "12px" }}>Mặt trước CCCD</h4>
              <input
                ref={cccdFrontInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleCccdUpload("front", file);
                  }
                }}
              />
              {!cccdFrontPreview ? (
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => cccdFrontInputRef.current?.click()}
                  block
                  size="large"
                >
                  Chọn ảnh mặt trước
                </Button>
              ) : (
                <div>
                  <img
                    src={cccdFrontPreview}
                    alt="CCCD mặt trước"
                    style={{ width: "100%", maxHeight: "300px", objectFit: "contain", marginBottom: "12px", border: "1px solid #d9d9d9", borderRadius: "4px", padding: "8px" }}
                  />
                  <Space>
                    <Button
                      type="default"
                      icon={<UploadOutlined />}
                      onClick={() => cccdFrontInputRef.current?.click()}
                    >
                      Thay đổi
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveCccdImage("front")}
                    >
                      Xóa
                    </Button>
                  </Space>
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ marginBottom: "12px" }}>Mặt sau CCCD</h4>
              <input
                ref={cccdBackInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleCccdUpload("back", file);
                  }
                }}
              />
              {!cccdBackPreview ? (
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => cccdBackInputRef.current?.click()}
                  block
                  size="large"
                >
                  Chọn ảnh mặt sau
                </Button>
              ) : (
                <div>
                  <img
                    src={cccdBackPreview}
                    alt="CCCD mặt sau"
                    style={{ width: "100%", maxHeight: "300px", objectFit: "contain", marginBottom: "12px", border: "1px solid #d9d9d9", borderRadius: "4px", padding: "8px" }}
                  />
                  <Space>
                    <Button
                      type="default"
                      icon={<UploadOutlined />}
                      onClick={() => cccdBackInputRef.current?.click()}
                    >
                      Thay đổi
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveCccdImage("back")}
                    >
                      Xóa
                    </Button>
                  </Space>
                </div>
              )}
            </div>
          </Col>
        </Row>
        {(!cccdFrontFile || !cccdBackFile) && (
          <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#fff7e6", borderRadius: "4px", border: "1px solid #ffd591" }}>
            <span style={{ color: "#d46b08" }}>
              ⚠️ Vui lòng upload đầy đủ ảnh mặt trước và mặt sau
            </span>
          </div>
        )}
      </Modal>

      {/* Extend Receipt Modal */}
      <Modal
        title="Gia hạn phiếu thu"
        open={extendModalVisible}
        onOk={handleExtendReceipt}
        onCancel={() => {
          setExtendModalVisible(false);
          setExtendingCheckin(null);
          extendForm.resetFields();
        }}
        okText="Gia hạn"
        cancelText="Hủy"
        width={600}
      >
        {extendingCheckin && (
          <Form form={extendForm} layout="vertical">
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: "#f0f9ff", borderRadius: 4 }}>
              <div><strong>Thông tin hiện tại:</strong></div>
              <div>Tiền cọc đã đóng: {Number(extendingCheckin.deposit?.toString() || 0).toLocaleString("vi-VN")} VNĐ</div>
              <div>Thời hạn thuê: {extendingCheckin.durationMonths} tháng</div>
            </div>
            <Form.Item
              label="Tiền cọc gia hạn (VNĐ)"
              name="additionalDeposit"
              rules={[
                { required: true, message: "Nhập tiền cọc gia hạn!" },
                { type: "number", min: 500000, message: "Tiền cọc tối thiểu là 500,000 VNĐ" },
              ]}
            >
              <InputNumber
                min={500000}
                style={{ width: "100%" }}
                placeholder="Nhập tiền cọc gia hạn (tối thiểu 500,000 VNĐ)"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, "")) as unknown as 500000}
              />
            </Form.Item>
            <div style={{ marginTop: 16, padding: 12, backgroundColor: "#fff7e6", borderRadius: 4 }}>
              <div style={{ color: "#d46b08" }}>
                <strong>💡 Lưu ý:</strong>
                <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                  <li>Gia hạn này dùng để kéo dài thời hạn cọc giữ phòng (thêm 3 ngày) khi khách bận chưa tới làm hợp đồng.</li>
                  <li>Sau khi gia hạn, hệ thống sẽ tạo phiếu thu mới cho số tiền cọc gia hạn.</li>
                  <li>Khách hàng cần thanh toán phiếu thu mới này trong vòng 3 ngày để tiếp tục giữ phòng.</li>
                  <li>Thời hạn đếm ngược sẽ được reset lại 3 ngày từ khi thanh toán phiếu thu mới.</li>
                  <li>Nếu đã có hóa đơn hợp đồng (CONTRACT bill), tiền cọc còn lại sẽ được tính lại tự động.</li>
                </ul>
              </div>
            </div>
          </Form>
        )}
      </Modal>

      {/* Checkin Detail Drawer */}
      <CheckinDetailDrawer
        open={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setSelectedCheckin(null);
        }}
        checkin={selectedCheckin}
        rooms={rooms}
        users={users}
      />
    </div>
  );
};

export default CheckinsAD;

