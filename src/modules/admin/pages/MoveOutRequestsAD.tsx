// Import các thư viện cần thiết
import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Descriptions,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Divider,
  Image,
  Drawer,
  Avatar,
  Badge,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined,
  QrcodeOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { adminMoveOutRequestService } from "../services/moveOutRequest";
import { adminContractService } from "../services/contract";
import type { MoveOutRequest } from "../../client/services/moveOutRequest";
import api from "../services/api";
import { roomFeeService, type FeeCalculation } from "../services/roomFee";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Helper function để convert Decimal128 sang number
const dec = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v) || 0;
  if (typeof v === "object") {
    // MongoDB Decimal128 có thể có $numberDecimal
    if (typeof (v as any).$numberDecimal === "string") return Number((v as any).$numberDecimal) || 0;
    // Hoặc có method toString()
    if (typeof (v as any).toString === "function") {
      const s = (v as any).toString();
      const n = Number(s);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
};

/**
 * Component quản lý các yêu cầu chuyển đi của người dùng (Admin)
 * - Hiển thị danh sách yêu cầu chuyển đi
 * - Xử lý phê duyệt/từ chối yêu cầu
 * - Tính toán và xử lý hoàn tiền
 */
const MoveOutRequestsAD: React.FC = () => {
  const [requests, setRequests] = useState<MoveOutRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<MoveOutRequest | null>(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundForm] = Form.useForm();
  const [calculatedServiceFee, setCalculatedServiceFee] = useState<FeeCalculation | null>(null);
  const [roomOccupantCount, setRoomOccupantCount] = useState<number>(1);
  const [totalDepositPaid, setTotalDepositPaid] = useState<number>(0); // Tiền cọc = 1 tháng tiền phòng
  const [previousElectricityReading, setPreviousElectricityReading] = useState<number | null>(null); // Số điện cũ từ check-in + tổng số điện đã dùng
  const [vehiclesFromCheckin, setVehiclesFromCheckin] = useState<any[]>([]); // Vehicles từ check-in
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [detailRequest, setDetailRequest] = useState<MoveOutRequest | null>(null);
  const [detailTotalDepositPaid, setDetailTotalDepositPaid] = useState<number>(0); // Tiền cọc tính lại cho detail view
  
  // Theo dõi giá trị damageAmount từ form để tự động cập nhật hiển thị
  const damageAmount = Form.useWatch("damageAmount", refundForm) || 0;

  // Load lại danh sách yêu cầu khi thay đổi bộ lọc trạng thái
  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  /**
   * Tải danh sách yêu cầu chuyển đi từ API
   * Sử dụng bộ lọc trạng thái nếu được chọn
   */
  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "ALL" ? { status: statusFilter } : {};
      const data = await adminMoveOutRequestService.getAll(params);
      setRequests(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý phê duyệt yêu cầu chuyển đi
   * @param id - ID của yêu cầu cần phê duyệt
   */
  const handleApprove = async (id: string) => {
    try {
      await adminMoveOutRequestService.updateStatus(id, { status: "APPROVED" });
      message.success("Đã duyệt yêu cầu");
      loadRequests();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi duyệt yêu cầu");
    }
  };

  /**
   * Xử lý từ chối yêu cầu chuyển đi
   * @param id - ID của yêu cầu cần từ chối
   * @param adminNote - Ghi chú từ admin khi từ chối
   */
  const handleReject = async (id: string, adminNote?: string) => {
    try {
      await adminMoveOutRequestService.updateStatus(id, {
        status: "REJECTED",
        adminNote,
      });
      message.success("Đã từ chối yêu cầu");
      loadRequests();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi từ chối yêu cầu");
    }
  };

  /**
   * Tính tổng tiền cọc từ RECEIPT + CONTRACT bills (giống logic trong handleOpenRefundModal)
   * @param contractId - ID của contract
   * @returns Tổng tiền cọc (RECEIPT + CONTRACT deposit)
   */
  const calculateTotalDepositPaid = async (contractId: string): Promise<number> => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const token = localStorage.getItem("admin_token");
    let totalDeposit = 0;
    
    // 1. Lấy RECEIPT bill (Cọc giữ phòng)
    const receiptBillsResponse = await fetch(`${apiUrl}/api/bills?contractId=${contractId}&billType=RECEIPT&status=PAID&limit=10`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    
    if (receiptBillsResponse.ok) {
      const receiptBillsData = await receiptBillsResponse.json();
      const receiptBills = receiptBillsData.data || [];
      if (receiptBills.length > 0) {
        const receiptPaid = dec(receiptBills[0].amountPaid) || 0;
        totalDeposit += receiptPaid;
        console.log(`[MoveOutRequestsAD] calculateTotalDepositPaid - Found RECEIPT bill: amountPaid=${receiptPaid}`);
      }
    }
    
    // 2. Lấy CONTRACT bill (Cọc còn lại - phần "Tiền cọc (1 tháng tiền phòng)")
    const finalContractsResponse = await fetch(`${apiUrl}/api/final-contracts?originContractId=${contractId}&limit=10`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    
    if (finalContractsResponse.ok) {
      const finalContractsData = await finalContractsResponse.json();
      const finalContracts = finalContractsData.data || [];
      
      for (const fc of finalContracts) {
        const finalContractId = typeof fc._id === 'string' ? fc._id : fc._id;
        const contractBillsResponse = await fetch(`${apiUrl}/api/bills?finalContractId=${finalContractId}&billType=CONTRACT&status=PAID&limit=10`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (contractBillsResponse.ok) {
          const contractBillsData = await contractBillsResponse.json();
          const contractBills = contractBillsData.data || [];
          if (contractBills.length > 0) {
            const contractBill = contractBills[0];
            if (contractBill.lineItems && Array.isArray(contractBill.lineItems)) {
              const depositLineItem = contractBill.lineItems.find((item: any) => 
                item.item && (
                  item.item.toLowerCase().includes('cọc') || 
                  item.item.toLowerCase().includes('deposit')
                )
              );
              
              if (depositLineItem) {
                const contractDeposit = dec(depositLineItem.lineTotal) || 0;
                totalDeposit += contractDeposit;
                console.log(`[MoveOutRequestsAD] calculateTotalDepositPaid - Found CONTRACT bill deposit: ${contractDeposit}`);
                break;
              } else if (contractBill.lineItems.length >= 2) {
                const contractDeposit = dec(contractBill.lineItems[1].lineTotal) || 0;
                totalDeposit += contractDeposit;
                console.log(`[MoveOutRequestsAD] calculateTotalDepositPaid - Found CONTRACT bill deposit (fallback): ${contractDeposit}`);
                break;
              }
            }
          }
        }
      }
    }
    
    // Fallback: nếu không tìm thấy bills, lấy từ contract
    if (totalDeposit === 0) {
      try {
        const contract = await adminContractService.getById(contractId);
        if (contract.roomId && typeof contract.roomId === 'object') {
          totalDeposit = dec(contract.roomId.pricePerMonth) || dec(contract.monthlyRent) || 0;
        } else {
          totalDeposit = dec(contract.monthlyRent) || 0;
        }
        
        if (totalDeposit === 0) {
          totalDeposit = dec(contract.deposit) || 0;
        }
        console.log(`[MoveOutRequestsAD] calculateTotalDepositPaid - Using monthlyRent/deposit as fallback: ${totalDeposit}`);
      } catch (error) {
        console.error('[MoveOutRequestsAD] calculateTotalDepositPaid - Error fetching contract:', error);
      }
    }
    
    console.log(`[MoveOutRequestsAD] calculateTotalDepositPaid - Total deposit: ${totalDeposit}`);
    return totalDeposit;
  };

  /**
   * Mở modal xử lý hoàn tiền
   * @param request - Yêu cầu chuyển đi cần xử lý hoàn tiền
   */
  const handleOpenRefundModal = async (request: MoveOutRequest) => {
    setSelectedRequest(request);
    setRefundModalVisible(true);
    refundForm.resetFields();
    setCalculatedServiceFee(null);
    setTotalDepositPaid(0);
    
    // Load room để lấy số người ở (giống DraftBills), tiền cọc (1 tháng tiền phòng), và số điện cũ
    try {
      const contractId = request.contractId._id;
      const contract = await adminContractService.getById(contractId);
      const roomId = typeof contract.roomId === 'object' ? contract.roomId._id : contract.roomId;
      
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("admin_token");
      
      // Tính tiền cọc = Cọc giữ phòng (RECEIPT) + Cọc còn lại (CONTRACT)
      const totalDeposit = await calculateTotalDepositPaid(contractId);
      setTotalDepositPaid(totalDeposit);
      
      // Lấy số điện cũ theo logic giống DraftBills:
      // 1. Lấy số điện chốt từ check-in (initialElectricReading)
      // 2. Lấy tổng số điện đã dùng từ các hóa đơn MONTHLY đã thanh toán
      // 3. Số điện "Trước" = initialElectricReading + totalElectricityUsed
      let previousReading: number | null = null;
      let vehicles: any[] = [];
      
      // 1. Lấy số điện chốt và vehicles từ check-in
      const checkinResponse = await fetch(`${apiUrl}/api/checkins?contractId=${contractId}&limit=1`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      let initialElectricReading = 0;
      if (checkinResponse.ok) {
        const checkinData = await checkinResponse.json();
        const checkins = checkinData.data || [];
        if (checkins.length > 0) {
          const checkin = checkins[0];
          if (checkin.initialElectricReading !== undefined && checkin.initialElectricReading !== null) {
            const initialReading = Number(checkin.initialElectricReading);
            if (!isNaN(initialReading) && initialReading >= 0) {
              initialElectricReading = initialReading;
            }
          }
          // Lấy vehicles từ checkin
          if (checkin.vehicles && Array.isArray(checkin.vehicles)) {
            vehicles = checkin.vehicles;
            console.log(`[MoveOutRequestsAD] Found ${vehicles.length} vehicles from checkin`);
          }
        }
      }
      
      // 2. Lấy tổng số điện đã dùng từ các hóa đơn MONTHLY đã thanh toán (PAID hoặc UNPAID - đã phát hành, không tính DRAFT)
      const billsResponse = await fetch(`${apiUrl}/api/bills?contractId=${contractId}&billType=MONTHLY&limit=100&sort=-billingDate`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      let totalElectricityUsed = 0;
      if (billsResponse.ok) {
        const billsData = await billsResponse.json();
        const previousBills = billsData.data || [];
        console.log(`[MoveOutRequestsAD] Contract ${contractId}: Found ${previousBills.length} MONTHLY bills`);
        
        for (const prevBill of previousBills) {
          // Bỏ qua DRAFT bills
          if (prevBill.status === "DRAFT") {
            console.log(`[MoveOutRequestsAD] Skipping DRAFT bill ${prevBill._id}`);
            continue;
          }
          
          console.log(`[MoveOutRequestsAD] Processing bill ${prevBill._id}, status=${prevBill.status}, lineItems=${prevBill.lineItems?.length || 0}`);
          
          if (prevBill.lineItems && Array.isArray(prevBill.lineItems)) {
            for (const item of prevBill.lineItems) {
              // Tìm item tiền điện
              if (item.item && item.item.includes("Tiền điện")) {
                console.log(`[MoveOutRequestsAD] Found electricity item:`, item);
                
                // Cách 1: Parse từ tên item "Tiền điện (200 kWh)"
                const match = item.item.match(/\((\d+(?:\.\d+)?)\s*kWh\)/i);
                if (match && match[1]) {
                  const kwh = Number(match[1]);
                  if (!isNaN(kwh) && kwh > 0) {
                    totalElectricityUsed += kwh;
                    console.log(`[MoveOutRequestsAD] Parsed ${kwh} kWh from item name`);
                  }
                } 
                // Cách 2: Lấy từ quantity
                else if (item.quantity && Number(item.quantity) > 0) {
                  const kwh = Number(item.quantity);
                  if (!isNaN(kwh) && kwh > 0) {
                    totalElectricityUsed += kwh;
                    console.log(`[MoveOutRequestsAD] Got ${kwh} kWh from quantity`);
                  }
                }
              }
            }
          }
        }
      }
      
      // Số điện "Trước" = số điện chốt + tổng số điện đã dùng
      previousReading = initialElectricReading + totalElectricityUsed;
      console.log(`[MoveOutRequestsAD] Contract ${contractId}: initial=${initialElectricReading}, used=${totalElectricityUsed}, previous=${previousReading}, vehicles=${vehicles.length}`);
      
      setPreviousElectricityReading(previousReading);
      setVehiclesFromCheckin(vehicles);
      
      // Lưu vehicles vào form để hiển thị
      if (vehicles.length > 0) {
        refundForm.setFieldsValue({ vehicles: vehicles });
      }
      
      if (roomId) {
        // Load tất cả rooms với pagination để lấy occupantCount (giống DraftBills)
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("admin_token");
        
        let allRooms: any[] = [];
        let page = 1;
        const limit = 100;
        let hasMore = true;
        
        while (hasMore) {
          try {
            const roomsResponse = await fetch(`${apiUrl}/api/rooms?page=${page}&limit=${limit}`, {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            
            if (!roomsResponse.ok) break;
            
            const roomsData = await roomsResponse.json();
            if (!roomsData.success) break;
            
            const rooms = roomsData.data || [];
            allRooms = [...allRooms, ...rooms];
            
            const pagination = roomsData.pagination;
            hasMore = pagination && page < pagination.totalPages;
            page++;
          } catch (error: any) {
            console.error("Error loading rooms:", error);
            break;
          }
        }
        
        // Tìm room và lấy occupantCount
        const room = allRooms.find((r: any) => String(r._id) === String(roomId));
        if (room && room.occupantCount !== undefined) {
          setRoomOccupantCount(room.occupantCount);
          console.log(`[MoveOutRequestsAD] Loaded occupantCount=${room.occupantCount} for room ${roomId}`);
        } else {
          setRoomOccupantCount(1);
        }
        
        // Tự động tính toán với giá trị mặc định (điện = 0) để bảng tính luôn hiện ra
        setTimeout(() => {
          calculateServiceFee({ electricityKwh: 0 });
        }, 100);
      }
    } catch (error: any) {
      console.error("Error loading room occupant count:", error);
      setRoomOccupantCount(1);
    }
  };

  /**
   * Tính toán phí dịch vụ dựa trên số điện và số xe
   * @param values - Đối tượng chứa số điện mới (kWh) và số xe
   */
  const calculateServiceFee = async (values: {
    electricityKwh: number;
    vehicleCount?: number;
  }) => {
    if (!selectedRequest) return;

    try {
      const contractId = selectedRequest.contractId._id;
      const contract = await adminContractService.getById(contractId);
      const roomId = typeof contract.roomId === 'object' ? contract.roomId._id : contract.roomId;

      if (!roomId) {
        message.error("Không tìm thấy thông tin phòng");
        return;
      }

      // Tính số điện tiêu thụ = số điện mới - số điện cũ
      const currentReading = Number(values.electricityKwh) || 0;
      const prevReading = previousElectricityReading || 0;
      const consumption = Math.max(0, currentReading - prevReading);

      console.log(`[MoveOutRequestsAD] Electricity calculation: current=${currentReading}, previous=${prevReading}, consumption=${consumption}`);

      // Sử dụng roomFeeService để tính toán giống DraftBills
      // Số người tự động lấy từ roomOccupantCount (đã load khi mở modal)
      // Sử dụng vehicles từ check-in thay vì vehicleCount
      const vehicles = vehiclesFromCheckin || [];
      const result = await roomFeeService.calculateFees(
        roomId,
        consumption, // Sử dụng số điện tiêu thụ (consumption) thay vì số điện mới
        roomOccupantCount, // Tự động lấy từ room
        0, // vehicleCount = 0 (deprecated, dùng vehicles thay thế)
        vehicles // Sử dụng vehicles từ check-in
      );

      setCalculatedServiceFee(result);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tính phí dịch vụ");
    }
  };

  /**
   * Xử lý hoàn tiền cọc cho người thuê
   * @param values - Đối tượng chứa thông tin hoàn tiền (số điện, số xe, tiền bồi thường, v.v.)
   */
  const handleRefund = async (values: any) => {
    if (!selectedRequest) return;

    try {
      // Kiểm tra xem contract đã được hoàn cọc chưa
      const contractId = selectedRequest.contractId._id;
      const contract = await adminContractService.getById(contractId);
      
      if (contract.depositRefunded) {
        // Nếu contract đã hoàn cọc rồi, không làm gì cả
        message.warning("Hợp đồng này đã được hoàn cọc trước đó.");
        setRefundModalVisible(false);
        refundForm.resetFields();
        setCalculatedServiceFee(null);
        setRoomOccupantCount(1);
        setPreviousElectricityReading(null);
        setVehiclesFromCheckin([]);
        loadRequests();
        return;
      }
      
      // Tính số điện tiêu thụ = số điện mới - số điện cũ
      const currentReading = Number(values.electricityKwh) || 0;
      const prevReading = previousElectricityReading || 0;
      const consumption = Math.max(0, currentReading - prevReading);
      
      console.log(`[MoveOutRequestsAD] Refund: current=${currentReading}, previous=${prevReading}, consumption=${consumption}`);
      
      // Sử dụng vehicles từ check-in thay vì vehicleCount
      const vehicles = vehiclesFromCheckin || [];
      // Gọi API hoàn cọc (backend sẽ tự động set status = WAITING_CONFIRMATION)
      await adminContractService.refundDeposit(contractId, {
        electricityKwh: consumption, // Gửi số điện tiêu thụ (consumption) thay vì số điện mới
        waterM3: 0, // Không cần nhập nước, tính tự động
        occupantCount: roomOccupantCount, // Tự động lấy từ room
        vehicleCount: vehicles.length, // Dùng số lượng vehicles từ check-in
        vehicles: vehicles, // Gửi vehicles chi tiết
        damageAmount: values.damageAmount || 0,
        damageNote: values.damageNote,
        method: values.method || "BANK",
        note: values.note,
      });

      // KHÔNG gọi complete nữa vì backend đã set status = WAITING_CONFIRMATION
      message.success("Hoàn cọc thành công. Đang chờ khách hàng xác nhận nhận được tiền.");
      setRefundModalVisible(false);
      refundForm.resetFields();
      setCalculatedServiceFee(null);
      setRoomOccupantCount(1);
      loadRequests();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi hoàn cọc");
    }
  };

  /**
   * Tạo tag hiển thị trạng thái yêu cầu với màu sắc tương ứng
   * @param status - Trạng thái của yêu cầu (PENDING, APPROVED, REJECTED, WAITING_CONFIRMATION, COMPLETED)
   * @returns ReactNode - Thẻ Tag với màu sắc và văn bản phù hợp
   */
  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      PENDING: { color: "processing", text: "Chờ xử lý" },
      APPROVED: { color: "success", text: "Đã duyệt" },
      REJECTED: { color: "error", text: "Từ chối" },
      WAITING_CONFIRMATION: { color: "purple", text: "Chờ khách xác nhận" },
      COMPLETED: { color: "default", text: "Đã hoàn tất" },
    };
    const s = map[status] || { color: "default", text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  /**
   * Mở drawer xem chi tiết yêu cầu
   * @param request - Yêu cầu cần xem chi tiết
   */
  const handleViewDetail = async (request: MoveOutRequest) => {
    console.log('[MoveOutRequestsAD] Opening detail for request:', request._id);
    console.log('[MoveOutRequestsAD] refundQrCode:', request.refundQrCode);
    setDetailRequest(request);
    setDetailDrawerVisible(true);
    
    // Tính lại totalDepositPaid từ RECEIPT + CONTRACT bills (giống form tính toán)
    if (request.contractId && request.contractId._id) {
      const contractId = typeof request.contractId._id === 'string' ? request.contractId._id : request.contractId._id;
      const totalDeposit = await calculateTotalDepositPaid(contractId);
      setDetailTotalDepositPaid(totalDeposit);
    }
  };

  // Cấu hình các cột cho bảng hiển thị danh sách yêu cầu
  const columns: ColumnsType<MoveOutRequest> = [
    {
      title: "Phòng",
      dataIndex: ["roomId", "roomNumber"],
      key: "roomNumber",
    },
    {
      title: "Người thuê",
      key: "tenant",
      render: (_: any, record: MoveOutRequest) => (
        <div>
          <div>{record.tenantId.fullName}</div>
          <small style={{ color: "#666" }}>{record.tenantId.phone}</small>
        </div>
      ),
    },
    {
      title: "Ngày dự kiến chuyển đi",
      dataIndex: "moveOutDate",
      key: "moveOutDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: MoveOutRequest) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.status === "PENDING" && (
            <>
              <Button
                size="small"
                type="primary"
                onClick={() => handleApprove(record._id)}
              >
                Duyệt
              </Button>
              <Button
                size="small"
                danger
                onClick={() => {
                  let rejectNote = '';
                  Modal.confirm({
                    title: "Từ chối yêu cầu",
                    content: (
                      <Input
                        placeholder="Nhập lý do từ chối (tùy chọn)"
                        onChange={(e) => {
                          rejectNote = e.target.value;
                        }}
                      />
                    ),
                    onOk: () => {
                      handleReject(record._id, rejectNote);
                    },
                  });
                }}
              >
                Từ chối
              </Button>
            </>
          )}
          {record.status === "APPROVED" && (
            <Button
              size="small"
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => handleOpenRefundModal(record)}
            >
              Hoàn cọc
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Lọc danh sách yêu cầu dựa trên bộ lọc trạng thái
  const filteredRequests = statusFilter === "ALL"
    ? requests
    : requests.filter(r => r.status === statusFilter);

  // Đếm số lượng yêu cầu theo từng trạng thái để hiển thị thống kê
  const pendingCount = requests.filter(r => r.status === "PENDING").length;
  const approvedCount = requests.filter(r => r.status === "APPROVED").length;
  const completedCount = requests.filter(r => r.status === "COMPLETED").length;

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý Yêu cầu Chuyển đi / Hoàn cọc
            </Title>
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 200 }}
            >
              <Select.Option value="ALL">Tất cả</Select.Option>
              <Select.Option value="PENDING">Chờ xử lý</Select.Option>
              <Select.Option value="APPROVED">Đã duyệt</Select.Option>
              <Select.Option value="REJECTED">Từ chối</Select.Option>
              <Select.Option value="COMPLETED">Đã hoàn tất</Select.Option>
            </Select>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Chờ xử lý"
                value={pendingCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đã duyệt"
                value={approvedCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đã hoàn tất"
                value={completedCount}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Modal Hoàn cọc */}
      <Modal
        title="Hoàn cọc"
        open={refundModalVisible}
        onCancel={() => {
          setRefundModalVisible(false);
          refundForm.resetFields();
          setCalculatedServiceFee(null);
          setRoomOccupantCount(1);
          setPreviousElectricityReading(null);
          setVehiclesFromCheckin([]);
        }}
        onOk={() => refundForm.submit()}
        width={800}
      >
        {selectedRequest && (
          <Form
            form={refundForm}
            layout="vertical"
            onFinish={handleRefund}
            onValuesChange={(changedValues, allValues) => {
              // Tự động tính toán khi thay đổi số điện
              if (changedValues.electricityKwh !== undefined) {
                calculateServiceFee(allValues);
              }
            }}
          >
            <Descriptions title="Thông tin hợp đồng" bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Phòng">
                {selectedRequest.roomId.roomNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Người thuê">
                {selectedRequest.tenantId.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Tiền cọc ban đầu">
                <strong style={{ color: "#1890ff", fontSize: 16 }}>
                  {selectedRequest.contractId.deposit.toLocaleString("vi-VN")} ₫
                </strong>
              </Descriptions.Item>
            </Descriptions>

            <Form.Item
              label="Số điện (kWh)"
              name="electricityKwh"
              initialValue={0}
              extra={previousElectricityReading !== null ? `Số điện cũ: ${previousElectricityReading.toLocaleString("vi-VN")} kWh` : "Chưa có số điện cũ"}
            >
              <InputNumber 
                min={previousElectricityReading || 0} 
                style={{ width: "100%" }} 
                placeholder="Nhập số điện mới"
              />
            </Form.Item>
            
            {vehiclesFromCheckin.length > 0 && (
              <Form.Item label="Thông tin xe (tự động lấy từ check-in)">
                <div style={{ padding: 12, background: "#f5f5f5", borderRadius: 6 }}>
                  {vehiclesFromCheckin.map((vehicle, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <Tag color="blue">
                        {vehicle.type === 'motorbike' ? '🏍️ Xe máy' : 
                         vehicle.type === 'electric_bike' ? '⚡ Xe điện' : 
                         '🚲 Xe đạp'}
                        {vehicle.licensePlate && ` - ${vehicle.licensePlate}`}
                      </Tag>
                    </div>
                  ))}
                </div>
              </Form.Item>
            )}

            <Form.Item label="Số người ở">
              <InputNumber 
                value={roomOccupantCount} 
                disabled 
                style={{ width: "100%" }}
              />
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                (Tự động lấy từ quản lý phòng)
              </div>
            </Form.Item>

            {calculatedServiceFee && calculatedServiceFee.breakdown && calculatedServiceFee.breakdown.length > 0 && (
              <Card size="small" style={{ marginBottom: 16, background: "#f0f2f5" }}>
                <Alert
                  message="Chi tiết dịch vụ tháng cuối"
                  description="Đây là chi tiết các khoản phí dựa trên số điện, số người và số xe đã nhập."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Descriptions title="Chi tiết từng khoản" column={1} bordered>
                  {calculatedServiceFee.breakdown
                    .filter((item) => item.type !== "rent") // Bỏ tiền thuê phòng
                    .map((item, index) => {
                      const typeNames: Record<string, string> = {
                        electricity: "⚡ Tiền điện",
                        water: "💧 Tiền nước",
                        internet: "📡 Internet",
                        cleaning: "🧹 Phí dọn dẹp",
                        parking: "🚗 Phí đỗ xe",
                      };

                      return (
                        <Descriptions.Item key={index} label={typeNames[item.type] || item.type}>
                          <Space direction="vertical" size="small" style={{ width: "100%" }}>
                            {item.kwh !== undefined && <Text>Số điện: {item.kwh} kWh</Text>}
                            {item.occupantCount !== undefined && <Text>Số người: {item.occupantCount}</Text>}
                            {item.vehicleCount !== undefined && <Text>Số xe: {item.vehicleCount}</Text>}
                            {item.baseRate !== undefined && <Text>Đơn giá: {item.baseRate.toLocaleString("vi-VN")} ₫</Text>}
                            {item.subtotal !== undefined && <Text>Tiền điện: {item.subtotal.toLocaleString("vi-VN")} ₫</Text>}
                            {item.vat !== undefined && <Text>VAT: {item.vat.toLocaleString("vi-VN")} ₫</Text>}
                            <Text strong style={{ color: "#1890ff" }}>
                              Tổng: {item.total.toLocaleString("vi-VN")} ₫
                            </Text>
                          </Space>
                        </Descriptions.Item>
                      );
                    })}
                </Descriptions>
                <Divider />
                <div style={{ textAlign: "right" }}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Tổng dịch vụ (không bao gồm tiền phòng):</Text>
                    <Text strong style={{ fontSize: 20, color: "#52c41a" }}>
                      {calculatedServiceFee.breakdown
                        .filter((item) => item.type !== "rent")
                        .reduce((sum, item) => sum + (item.total || 0), 0)
                        .toLocaleString("vi-VN")} ₫
                    </Text>
                  </Space>
                </div>
              </Card>
            )}

            <Form.Item
              label="Thiệt hại (VNĐ)"
              name="damageAmount"
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Ghi chú thiệt hại"
              name="damageNote"
            >
              <TextArea rows={2} maxLength={500} />
            </Form.Item>

            <Form.Item
              label="Phương thức hoàn cọc"
              name="method"
              initialValue="BANK"
            >
              <Select>
                <Select.Option value="BANK">Chuyển khoản</Select.Option>
                <Select.Option value="CASH">Tiền mặt</Select.Option>
                <Select.Option value="OTHER">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Ghi chú"
              name="note"
            >
              <TextArea rows={2} maxLength={500} />
            </Form.Item>

            {(calculatedServiceFee || damageAmount) && selectedRequest && (
              <Card size="small" style={{ marginTop: 16, background: "#e6f7ff" }}>
                <Descriptions title="Tính toán hoàn cọc" bordered column={1} size="small">
                  <Descriptions.Item label="Tiền cọc ban đầu (1 tháng tiền phòng)">
                    <strong style={{ color: "#1890ff", fontSize: 16 }}>
                      {(totalDepositPaid || dec(selectedRequest.contractId.deposit) || 0).toLocaleString("vi-VN")} ₫
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Dịch vụ tháng cuối (không bao gồm tiền phòng)">
                    <span style={{ color: "#ff4d4f" }}>
                      - {(calculatedServiceFee?.breakdown
                        ?.filter((item) => item.type !== "rent")
                        .reduce((sum, item) => sum + (item.total || 0), 0) || 0)
                        .toLocaleString("vi-VN")} ₫
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thiệt hại">
                    <span style={{ color: "#ff4d4f" }}>
                      - {Number(damageAmount || 0).toLocaleString("vi-VN")} ₫
                    </span>
                  </Descriptions.Item>
                  <Divider style={{ margin: "8px 0" }} />
                  <Descriptions.Item label="Số tiền hoàn lại">
                    {(() => {
                      const deposit = (totalDepositPaid || dec(selectedRequest.contractId.deposit) || 0);
                      const serviceFee = (calculatedServiceFee?.breakdown
                        ?.filter((item) => item.type !== "rent")
                        .reduce((sum, item) => sum + (item.total || 0), 0) || 0);
                      const damage = Number(damageAmount || 0);
                      const calculatedRefund = deposit - serviceFee - damage;
                      
                      return (
                        <>
                          <strong style={{ 
                            color: calculatedRefund >= 0 ? "#52c41a" : "#ff4d4f", 
                            fontSize: 18 
                          }}>
                            {calculatedRefund >= 0 ? '+' : ''}{calculatedRefund.toLocaleString("vi-VN")} ₫
                          </strong>
                          {calculatedRefund < 0 && (
                            <div style={{ fontSize: 12, color: "#ff4d4f", marginTop: 4 }}>
                              (Khách hàng cần thanh toán thêm: {Math.abs(calculatedRefund).toLocaleString("vi-VN")} ₫)
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </Form>
        )}
      </Modal>

      {/* Drawer xem chi tiết */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FileTextOutlined style={{ fontSize: 20, color: "#1890ff" }} />
            <span>Chi tiết yêu cầu chuyển đi / hoàn cọc</span>
          </div>
        }
        placement="right"
        width={window.innerWidth < 768 ? "90%" : 720}
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setDetailRequest(null);
        }}
        styles={{
          body: {
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            background: "#f5f5f5",
          },
        }}
      >
        {detailRequest && (
          <div style={{ wordBreak: "break-word", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Thông tin yêu cầu */}
            <Card 
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <HomeOutlined style={{ color: "#1890ff" }} />
                  <span>Thông tin yêu cầu</span>
                </div>
              }
              size="small"
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Space direction="vertical" size={4}>
                    <div style={{ fontSize: 12, color: "#8c8c8c", fontWeight: 500 }}>Phòng</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#1890ff" }}>
                      <HomeOutlined style={{ marginRight: 8 }} />
                      {detailRequest.roomId.roomNumber}
                    </div>
                  </Space>
                </Col>
                <Col xs={24} sm={12}>
                  <Space direction="vertical" size={4}>
                    <div style={{ fontSize: 12, color: "#8c8c8c", fontWeight: 500 }}>Trạng thái</div>
                    <div>{getStatusTag(detailRequest.status)}</div>
                  </Space>
                </Col>
              </Row>
              
              <Divider style={{ margin: "16px 0" }} />
              
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#8c8c8c", fontWeight: 500, marginBottom: 8 }}>Người thuê</div>
                  <Space>
                    <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
                    <Space direction="vertical" size={4}>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{detailRequest.tenantId.fullName}</div>
                      <Space size={12}>
                        <span style={{ color: "#666", fontSize: 13 }}>
                          <MailOutlined style={{ marginRight: 4 }} />
                          {detailRequest.tenantId.email}
                        </span>
                      </Space>
                      <span style={{ color: "#666", fontSize: 13 }}>
                        <PhoneOutlined style={{ marginRight: 4 }} />
                        {detailRequest.tenantId.phone}
                      </span>
                    </Space>
                  </Space>
                </div>
                
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Space direction="vertical" size={4}>
                      <div style={{ fontSize: 12, color: "#8c8c8c", fontWeight: 500 }}>Ngày dự kiến chuyển đi</div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        <CalendarOutlined style={{ marginRight: 8, color: "#fa8c16" }} />
                        {dayjs(detailRequest.moveOutDate).format("DD/MM/YYYY")}
                      </div>
                    </Space>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Space direction="vertical" size={4}>
                      <div style={{ fontSize: 12, color: "#8c8c8c", fontWeight: 500 }}>Ngày tạo yêu cầu</div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        <ClockCircleOutlined style={{ marginRight: 8, color: "#722ed1" }} />
                        {dayjs(detailRequest.requestedAt).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </Space>
                  </Col>
                </Row>
                
                <div>
                  <div style={{ fontSize: 12, color: "#8c8c8c", fontWeight: 500, marginBottom: 8 }}>Lý do</div>
                  <div style={{ 
                    padding: 12, 
                    background: "#fafafa", 
                    borderRadius: 6, 
                    wordBreak: "break-word", 
                    whiteSpace: "pre-wrap",
                    borderLeft: "3px solid #1890ff"
                  }}>
                    {detailRequest.reason}
                  </div>
                </div>
              </Space>
            </Card>

            {/* QR Code */}
            {detailRequest.refundQrCode && (
              (detailRequest.refundQrCode.url || 
               detailRequest.refundQrCode.secure_url || 
               (typeof detailRequest.refundQrCode === 'object' && Object.keys(detailRequest.refundQrCode).length > 0)) && (
                <Card 
                  title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <QrcodeOutlined style={{ color: "#52c41a" }} />
                      <span>QR nhận tiền hoàn cọc</span>
                    </div>
                  }
                  size="small"
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <div style={{ 
                    textAlign: "center", 
                    padding: 16,
                    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                    borderRadius: 12,
                    border: "2px dashed #91d5ff"
                  }}>
                    <Image
                      src={detailRequest.refundQrCode.secure_url || detailRequest.refundQrCode.url || ''}
                      alt="QR code nhận tiền hoàn cọc"
                      width={280}
                      style={{ 
                        borderRadius: 12, 
                        maxWidth: "100%",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                      preview={{
                        mask: "Phóng to",
                      }}
                      onError={(e) => {
                        console.error('[MoveOutRequestsAD] Error loading QR image:', e);
                        console.error('[MoveOutRequestsAD] refundQrCode data:', detailRequest.refundQrCode);
                      }}
                    />
                  </div>
                </Card>
              )
            )}

            {/* Thông tin hoàn cọc (nếu đã hoàn tất hoặc chờ xác nhận) */}
            {(detailRequest.status === "COMPLETED" || detailRequest.status === "WAITING_CONFIRMATION") && detailRequest.contractId.depositRefund && (
              <Card title="Thông tin hoàn cọc" size="small">
                <Descriptions column={1} size="small" bordered>
                  {(() => {
                    // Sử dụng detailTotalDepositPaid (tính từ RECEIPT + CONTRACT bills) thay vì initialDeposit đã lưu
                    const initialDeposit = detailTotalDepositPaid > 0 ? detailTotalDepositPaid : (dec(detailRequest.contractId.depositRefund.initialDeposit) || dec(detailRequest.contractId.deposit) || 0);
                    const serviceFee = dec(detailRequest.contractId.depositRefund.finalMonthServiceFee || 0);
                    const damage = dec(detailRequest.contractId.depositRefund.damageAmount || 0);
                    // Tính lại số tiền hoàn lại (giống form tính toán)
                    const calculatedRefund = initialDeposit - serviceFee - damage;
                    const savedRefund = dec(detailRequest.contractId.depositRefund.amount);
                    
                    return (
                      <>
                        <Descriptions.Item label="Tiền cọc ban đầu (1 tháng tiền phòng)">
                          <strong style={{ color: "#1890ff", fontSize: 16 }}>
                            {initialDeposit.toLocaleString("vi-VN")} ₫
                          </strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Dịch vụ tháng cuối (không bao gồm tiền phòng)">
                          <span style={{ color: "#ff4d4f" }}>
                            - {serviceFee.toLocaleString("vi-VN")} ₫
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Thiệt hại">
                          <span style={{ color: "#ff4d4f" }}>
                            - {damage.toLocaleString("vi-VN")} ₫
                          </span>
                          {detailRequest.contractId.depositRefund.damageNote && (
                            <div style={{ fontSize: 12, color: "#666", marginTop: 4, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                              {detailRequest.contractId.depositRefund.damageNote}
                            </div>
                          )}
                        </Descriptions.Item>
                        <Divider style={{ margin: "8px 0" }} />
                        <Descriptions.Item label="Số tiền hoàn lại">
                          <strong style={{ 
                            color: calculatedRefund >= 0 ? "#52c41a" : "#ff4d4f", 
                            fontSize: 18 
                          }}>
                            {calculatedRefund >= 0 ? '+' : ''}{calculatedRefund.toLocaleString("vi-VN")} ₫
                          </strong>
                          {calculatedRefund < 0 && (
                            <div style={{ fontSize: 12, color: "#ff4d4f", marginTop: 4 }}>
                              (Khách hàng cần thanh toán thêm: {Math.abs(calculatedRefund).toLocaleString("vi-VN")} ₫)
                            </div>
                          )}
                          {calculatedRefund >= 0 && Math.abs(calculatedRefund - savedRefund) > 1 && (
                            <div style={{ fontSize: 12, color: "#ff4d4f", marginTop: 4 }}>
                              (Đã sửa: {savedRefund.toLocaleString("vi-VN")} ₫ → {calculatedRefund.toLocaleString("vi-VN")} ₫)
                            </div>
                          )}
                        </Descriptions.Item>
                        {detailRequest.contractId.depositRefund.method && (
                          <Descriptions.Item label="Phương thức hoàn cọc">
                            {detailRequest.contractId.depositRefund.method === "BANK" ? "Chuyển khoản" :
                             detailRequest.contractId.depositRefund.method === "CASH" ? "Tiền mặt" :
                             detailRequest.contractId.depositRefund.method}
                          </Descriptions.Item>
                        )}
                        {detailRequest.contractId.depositRefund.transactionId && (
                          <Descriptions.Item label="Mã giao dịch">
                            {detailRequest.contractId.depositRefund.transactionId}
                          </Descriptions.Item>
                        )}
                        {detailRequest.contractId.depositRefund.note && (
                          <Descriptions.Item label="Ghi chú">
                            <div style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                              {detailRequest.contractId.depositRefund.note}
                            </div>
                          </Descriptions.Item>
                        )}
                        {detailRequest.contractId.depositRefund.refundedAt && (
                          <Descriptions.Item label="Ngày hoàn cọc">
                            {dayjs(detailRequest.contractId.depositRefund.refundedAt).format("DD/MM/YYYY HH:mm")}
                          </Descriptions.Item>
                        )}
                      </>
                    );
                  })()}
                </Descriptions>
              </Card>
            )}

            {/* Action Buttons */}
            <Card 
              size="small" 
              style={{ 
                marginTop: "auto",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                background: detailRequest.status === "PENDING" ? "linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%)" : "white",
                border: detailRequest.status === "PENDING" ? "1px solid #ffd591" : "1px solid #d9d9d9"
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size={16}>
                {(detailRequest.processedBy || detailRequest.processedAt || detailRequest.adminNote) && (
                  <>
                    {detailRequest.processedBy && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <UserOutlined style={{ color: "#1890ff" }} />
                        <span style={{ fontSize: 13, color: "#666" }}>Người xử lý: </span>
                        <strong>{detailRequest.processedBy.fullName}</strong>
                      </div>
                    )}
                    {detailRequest.processedAt && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ClockCircleOutlined style={{ color: "#722ed1" }} />
                        <span style={{ fontSize: 13, color: "#666" }}>Thời gian xử lý: </span>
                        <strong>{dayjs(detailRequest.processedAt).format("DD/MM/YYYY HH:mm")}</strong>
                      </div>
                    )}
                    {detailRequest.adminNote && (
                      <div>
                        <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
                          <FileTextOutlined style={{ marginRight: 4 }} />
                          Ghi chú từ admin:
                        </div>
                        <div style={{ 
                          padding: 12, 
                          background: "#fafafa", 
                          borderRadius: 6, 
                          wordBreak: "break-word", 
                          whiteSpace: "pre-wrap",
                          borderLeft: "3px solid #faad14"
                        }}>
                          {detailRequest.adminNote}
                        </div>
                      </div>
                    )}
                    <Divider style={{ margin: "8px 0" }} />
                  </>
                )}
                <Space style={{ width: "100%", justifyContent: "flex-end" }} size={12}>
                  {detailRequest.status === "PENDING" && (
                    <>
                      <Button
                        type="primary"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        style={{
                          borderRadius: 8,
                          height: 40,
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
                        }}
                        onClick={() => {
                          handleApprove(detailRequest._id);
                          setDetailDrawerVisible(false);
                          setDetailRequest(null);
                        }}
                      >
                        Duyệt yêu cầu
                      </Button>
                      <Button
                        danger
                        size="large"
                        icon={<CloseCircleOutlined />}
                        style={{
                          borderRadius: 8,
                          height: 40,
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)",
                        }}
                        onClick={() => {
                          let rejectNote = '';
                          Modal.confirm({
                            title: "Từ chối yêu cầu",
                            content: (
                              <Input
                                placeholder="Nhập lý do từ chối (tùy chọn)"
                                onChange={(e) => {
                                  rejectNote = e.target.value;
                                }}
                              />
                            ),
                            onOk: () => {
                              handleReject(detailRequest._id, rejectNote);
                              setDetailDrawerVisible(false);
                              setDetailRequest(null);
                            },
                          });
                        }}
                      >
                        Từ chối
                      </Button>
                    </>
                  )}
                  {detailRequest.status === "APPROVED" && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<DollarOutlined />}
                      style={{
                        borderRadius: 8,
                        height: 40,
                        fontWeight: 600,
                        boxShadow: "0 2px 8px rgba(82, 196, 26, 0.3)",
                        background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                        border: "none",
                      }}
                      onClick={() => {
                        handleOpenRefundModal(detailRequest);
                        setDetailDrawerVisible(false);
                        setDetailRequest(null);
                      }}
                    >
                      Hoàn cọc
                    </Button>
                  )}
                </Space>
              </Space>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MoveOutRequestsAD;

