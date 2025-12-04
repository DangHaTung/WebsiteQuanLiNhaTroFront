import React, { useEffect, useState } from "react";
import { Button, Card, InputNumber, message, Space, Table, Tag, Typography, Row, Col, Statistic, Modal, Alert, Descriptions, Divider, Select, Input, List, Popconfirm } from "antd";
import { FileTextOutlined, ThunderboltOutlined, CheckOutlined, EyeOutlined, CalculatorOutlined, CarOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { roomFeeService, type FeeCalculation, type Vehicle } from "../services/roomFee";
import type { ColumnsType } from "antd/es/table";
import type { Bill } from "../../../types/bill";
import type { Contract } from "../../../types/contract";
import dayjs from "dayjs";
import { adminBillService } from "../services/bill";

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function để convert Decimal128 sang number
const dec = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v) || 0;
  if (typeof v === "object") {
    if (typeof (v as any).$numberDecimal === "string") return Number((v as any).$numberDecimal) || 0;
    if (typeof (v as any).toString === "function") {
      const s = (v as any).toString();
      const n = Number(s);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
};

// Vehicle type labels
const vehicleTypeLabels: Record<string, string> = {
  motorbike: "🏍️ Xe máy",
  electric_bike: "⚡ Xe điện",
  bicycle: "🚲 Xe đạp",
};

interface DraftBillWithElectricity extends Bill {
  electricityKwh?: number;
  initialElectricReading?: number;
  lastElectricReading?: number;
  occupantCount?: number;
  vehicleCount?: number;
  vehicles?: Vehicle[];
}

const DraftBills: React.FC = () => {
  const [draftBills, setDraftBills] = useState<DraftBillWithElectricity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [calculatingBill, setCalculatingBill] = useState<string | null>(null);
  const [calculationResult, setCalculationResult] = useState<FeeCalculation | null>(null);
  const [calculationVisible, setCalculationVisible] = useState(false);
  
  // Vehicle management modal
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [currentBillId, setCurrentBillId] = useState<string | null>(null);
  const [tempVehicles, setTempVehicles] = useState<Vehicle[]>([]);
  const [newVehicleType, setNewVehicleType] = useState<'motorbike' | 'electric_bike' | 'bicycle'>('motorbike');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  
  // Ref để lưu trữ draftBills mới nhất (để tránh stale closure)
  const draftBillsRef = React.useRef<DraftBillWithElectricity[]>([]);
  
  // Sync ref với state
  React.useEffect(() => {
    draftBillsRef.current = draftBills;
  }, [draftBills]);

  useEffect(() => {
    loadDraftBills();
  }, []);


  const loadDraftBills = async () => {
    try {
      setLoading(true);
      const data = await adminBillService.getDrafts({ limit: 100 });
      
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("admin_token");
      
      // Lấy tất cả rooms với số người ở
      let allRooms: any[] = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        try {
          const roomsResponse = await fetch(`${apiUrl}/api/rooms?page=${page}&limit=${limit}`, {
            headers: { "Authorization": `Bearer ${token}` },
          });
          
          if (!roomsResponse.ok) {
            const errorData = await roomsResponse.json().catch(() => ({}));
            console.error("Failed to load rooms:", roomsResponse.status, errorData);
            message.error(`Lỗi khi tải danh sách phòng: ${errorData.message || roomsResponse.statusText}`);
            break;
          }
          
          const roomsData = await roomsResponse.json();
          if (!roomsData.success) break;
          
          const rooms = roomsData.data || [];
          allRooms = [...allRooms, ...rooms];
          
          const pagination = roomsData.pagination;
          hasMore = pagination && page < pagination.totalPages;
          page++;
        } catch (error: any) {
          console.error("Error loading rooms:", error);
          message.error("Lỗi khi tải danh sách phòng");
          break;
        }
      }
      
      const rooms = allRooms;
      const roomOccupantMap = new Map<string, number>();
      rooms.forEach((room: any) => {
        if (room.occupantCount !== undefined && room._id) {
          roomOccupantMap.set(String(room._id), room.occupantCount);
        }
      });
      
      // Helper để lấy số điện và vehicles từ checkin
      // Logic: Số điện "Trước" = số điện chốt từ check-in + tổng số điện đã dùng từ các hóa đơn PAID
      const getCheckinData = async (contractId: string): Promise<{ initialElectricReading: number; currentElectricReading: number; vehicles: Vehicle[] }> => {
        try {
          let initialElectricReading = 0;
          let vehicles: Vehicle[] = [];
          
          // 1. Lấy số điện chốt và vehicles từ check-in
          const checkinResponse = await fetch(`${apiUrl}/api/checkins?contractId=${contractId}&limit=1`, {
            headers: { "Authorization": `Bearer ${token}` },
          });
          
          if (checkinResponse.ok) {
            const checkinData = await checkinResponse.json();
            const checkins = checkinData.data || [];
            console.log(`[getCheckinData] Contract ${contractId}: Found ${checkins.length} checkins`);
            if (checkins.length > 0) {
              const checkin = checkins[0];
              console.log(`[getCheckinData] Checkin data:`, {
                _id: checkin._id,
                initialElectricReading: checkin.initialElectricReading,
                vehicles: checkin.vehicles,
              });
              if (checkin.initialElectricReading !== undefined && checkin.initialElectricReading !== null) {
                const initialReading = Number(checkin.initialElectricReading);
                if (!isNaN(initialReading) && initialReading >= 0) {
                  initialElectricReading = initialReading;
                }
              }
              // Lấy vehicles từ checkin
              if (checkin.vehicles && Array.isArray(checkin.vehicles)) {
                vehicles = checkin.vehicles;
                console.log(`[getCheckinData] Found ${vehicles.length} vehicles from checkin`);
              }
            }
          }
          
          // 2. Lấy tổng số điện đã dùng từ các hóa đơn MONTHLY đã thanh toán (PAID hoặc UNPAID - đã phát hành)
          const billsResponse = await fetch(`${apiUrl}/api/bills?contractId=${contractId}&billType=MONTHLY&limit=100&sort=-billingDate`, {
            headers: { "Authorization": `Bearer ${token}` },
          });
          
          let totalElectricityUsed = 0;
          
          if (billsResponse.ok) {
            const billsData = await billsResponse.json();
            const previousBills = billsData.data || [];
            console.log(`[getElectricReadings] Contract ${contractId}: Found ${previousBills.length} MONTHLY bills`);
            
            for (const prevBill of previousBills) {
              // Bỏ qua DRAFT bills
              if (prevBill.status === "DRAFT") {
                console.log(`[getElectricReadings] Skipping DRAFT bill ${prevBill._id}`);
                continue;
              }
              
              console.log(`[getElectricReadings] Processing bill ${prevBill._id}, status=${prevBill.status}, lineItems=${prevBill.lineItems?.length || 0}`);
              
              if (prevBill.lineItems && Array.isArray(prevBill.lineItems)) {
                for (const item of prevBill.lineItems) {
                  // Tìm item tiền điện
                  if (item.item && item.item.includes("Tiền điện")) {
                    console.log(`[getElectricReadings] Found electricity item:`, item);
                    
                    // Cách 1: Parse từ tên item "Tiền điện (200 kWh)"
                    const match = item.item.match(/\((\d+(?:\.\d+)?)\s*kWh\)/i);
                    if (match && match[1]) {
                      const kwh = Number(match[1]);
                      if (!isNaN(kwh) && kwh > 0) {
                        totalElectricityUsed += kwh;
                        console.log(`[getElectricReadings] Parsed ${kwh} kWh from item name`);
                      }
                    } 
                    // Cách 2: Lấy từ quantity
                    else if (item.quantity && Number(item.quantity) > 0) {
                      const kwh = Number(item.quantity);
                      if (!isNaN(kwh) && kwh > 0) {
                        totalElectricityUsed += kwh;
                        console.log(`[getElectricReadings] Got ${kwh} kWh from quantity`);
                      }
                    }
                  }
                }
              }
            }
          }
          
          // Số điện hiện tại = số điện chốt + tổng số điện đã dùng
          const currentElectricReading = initialElectricReading + totalElectricityUsed;
          console.log(`[getCheckinData] Contract ${contractId}: initial=${initialElectricReading}, used=${totalElectricityUsed}, current=${currentElectricReading}, vehicles=${vehicles.length}`);
          
          return { initialElectricReading, currentElectricReading, vehicles };
        } catch (error) {
          console.error("Error getting checkin data:", error);
          return { initialElectricReading: 0, currentElectricReading: 0, vehicles: [] };
        }
      };
      
      const contractIds = data.map(bill => {
        const contract = bill.contractId as Contract;
        return typeof contract === 'object' && contract?._id ? contract._id : (typeof contract === 'string' ? contract : null);
      }).filter(Boolean) as string[];
      
      const checkinDataList = await Promise.all(
        contractIds.map(contractId => getCheckinData(contractId))
      );
      
      const checkinDataMap = new Map<string, { initialElectricReading: number; currentElectricReading: number; vehicles: Vehicle[] }>();
      contractIds.forEach((contractId, index) => {
        checkinDataMap.set(contractId, checkinDataList[index] || { initialElectricReading: 0, currentElectricReading: 0, vehicles: [] });
      });
      
      const billsWithElectricity = await Promise.all(data.map(async (bill) => {
        const contract = bill.contractId as Contract;
        const contractId = typeof contract === 'object' && contract?._id ? contract._id : (typeof contract === 'string' ? contract : null);
        let roomId: string | undefined;
        
        if (contract) {
          if (contract.roomId) {
            if (typeof contract.roomId === 'object' && contract.roomId._id) {
              roomId = String(contract.roomId._id);
            } else if (typeof contract.roomId === 'string') {
              roomId = contract.roomId;
            } else if (contract.roomId._id) {
              roomId = String(contract.roomId._id);
            }
          }
        }
        
        const occupantCount = roomId ? (roomOccupantMap.get(roomId) ?? 1) : 1;
        const checkinData = contractId ? (checkinDataMap.get(contractId) || { initialElectricReading: 0, currentElectricReading: 0, vehicles: [] }) : { initialElectricReading: 0, currentElectricReading: 0, vehicles: [] };
        const { initialElectricReading, currentElectricReading, vehicles } = checkinData;
        
        return {
          ...bill,
          electricityKwh: undefined,
          initialElectricReading,
          lastElectricReading: currentElectricReading,
          occupantCount,
          vehicleCount: vehicles.length,
          vehicles: vehicles, // Lấy vehicles từ checkin
        };
      }));
      setDraftBills(billsWithElectricity);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải hóa đơn nháp");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraftBills = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("admin_token");
      
      const response = await fetch(`${apiUrl}/api/monthly-bills/auto-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const created = data.data?.summary?.created || data.data?.created || 0;
        message.success(`Đã tạo ${created} hóa đơn nháp thành công!`);
        loadDraftBills();
      } else {
        message.error(data.message || "Lỗi khi tạo hóa đơn nháp");
      }
    } catch (error: any) {
      message.error("Lỗi khi tạo hóa đơn nháp");
    } finally {
      setLoading(false);
    }
  };


  // Vehicle management functions
  const openVehicleModal = (billId: string) => {
    const bill = draftBills.find(b => b._id === billId);
    if (bill) {
      setCurrentBillId(billId);
      setTempVehicles(bill.vehicles || []);
      setNewVehicleType('motorbike');
      setNewVehiclePlate('');
      setVehicleModalVisible(true);
    }
  };

  const addVehicle = () => {
    const bill = draftBills.find(b => b._id === currentBillId);
    if (!bill) return;
    
    // Validate
    if (tempVehicles.length >= (bill.occupantCount || 1)) {
      message.error(`Số xe không được vượt quá số người ở (${bill.occupantCount || 1})`);
      return;
    }
    
    if (['motorbike', 'electric_bike'].includes(newVehicleType) && !newVehiclePlate.trim()) {
      message.error('Xe máy và xe điện phải có biển số');
      return;
    }
    
    const newVehicle: Vehicle = {
      type: newVehicleType,
      licensePlate: newVehicleType === 'bicycle' ? undefined : newVehiclePlate.trim().toUpperCase(),
    };
    
    setTempVehicles([...tempVehicles, newVehicle]);
    setNewVehiclePlate('');
  };

  const removeVehicle = (index: number) => {
    setTempVehicles(tempVehicles.filter((_, i) => i !== index));
  };

  const saveVehicles = async () => {
    if (!currentBillId) return;
    
    // Lấy bill hiện tại trước khi update
    const bill = draftBills.find(b => b._id === currentBillId);
    
    // Nếu có xe, tự động gán phí parking cho phòng (nếu chưa có)
    if (tempVehicles.length > 0 && bill) {
      const contract = bill.contractId as Contract;
      if (contract?.roomId) {
        const roomId = typeof contract.roomId === 'string' ? contract.roomId : contract.roomId._id;
        if (roomId) {
          try {
            // Lấy phí hiện tại của phòng
            const currentFees = await roomFeeService.getRoomFees(roomId);
            const currentTypes = currentFees?.appliedTypes || [];
            
            // Thêm parking nếu chưa có
            if (!currentTypes.includes('parking')) {
              const newTypes = [...currentTypes, 'parking'];
              await roomFeeService.assignFees(roomId, newTypes);
              console.log(`[saveVehicles] Added parking fee to room ${roomId}. New types: ${newTypes.join(', ')}`);
              message.info('Đã tự động gán phí đỗ xe cho phòng');
            }
          } catch (error: any) {
            console.error(`[saveVehicles] Error assigning fees:`, error);
            // Nếu phòng chưa có RoomFee, tạo mới với tất cả phí
            if (error?.response?.status === 404) {
              try {
                await roomFeeService.assignFees(roomId, ['electricity', 'water', 'internet', 'cleaning', 'parking']);
                console.log(`[saveVehicles] Created new RoomFee with all fees for room ${roomId}`);
                message.info('Đã tự động gán phí cho phòng');
              } catch (err) {
                console.error(`[saveVehicles] Error creating RoomFee:`, err);
              }
            }
          }
        }
      }
    }
    
    // Update state và ref với vehicles mới
    const updatedBills = draftBills.map(b => {
      if (b._id === currentBillId) {
        return { ...b, vehicles: tempVehicles, vehicleCount: tempVehicles.length };
      }
      return b;
    });
    
    // Update ref ngay lập tức (trước khi setDraftBills)
    draftBillsRef.current = updatedBills;
    setDraftBills(updatedBills);
    
    // Auto-calculate với vehicles mới (truyền tempVehicles trực tiếp, không lấy từ state)
    if (bill && bill.electricityKwh !== undefined && bill.electricityKwh > 0) {
      // Tạo bill mới với vehicles đã update để tính toán
      const updatedBill = { ...bill, vehicles: tempVehicles };
      await autoCalculateWithVehicles(updatedBill, bill.electricityKwh, bill.occupantCount || 1, tempVehicles);
    }
    
    setVehicleModalVisible(false);
    message.success('Đã cập nhật danh sách xe');
  };

  // Auto-calculate with vehicles
  const autoCalculateWithVehicles = async (bill: DraftBillWithElectricity, currentElectricReading: number, occupantCount: number, vehicles: Vehicle[]) => {
    try {
      const contract = bill.contractId as Contract;
      if (!contract?.roomId) return;

      const roomId = typeof contract.roomId === 'string' ? contract.roomId : contract.roomId._id;
      if (!roomId) return;
      
      // Dùng lastElectricReading (số điện sau các hóa đơn trước) để tính số điện tiêu thụ
      const previousReading = bill.lastElectricReading || 0;
      const electricityConsumption = Math.max(0, currentElectricReading - previousReading);
      
      console.log(`[autoCalculateWithVehicles] Calling API with vehicles:`, vehicles);
      
      const result = await roomFeeService.calculateFees(roomId, electricityConsumption, occupantCount, 0, vehicles);

      console.log(`[autoCalculateWithVehicles] Result:`, result);

      // Update ref và state
      const updatedBills = draftBillsRef.current.map(b =>
        b._id === bill._id 
          ? { ...b, amountDue: result.total, calculatedBreakdown: result.breakdown } 
          : b
      );
      draftBillsRef.current = updatedBills;
      setDraftBills(updatedBills);
    } catch (error) {
      console.error("Auto-calculate error:", error);
    }
  };

  const handleElectricityChange = async (billId: string, value: number | null) => {
    const currentElectricReading = value || 0;
    
    // Lấy bill hiện tại từ ref
    const currentBill = draftBillsRef.current.find(b => b._id === billId);
    if (!currentBill) return;
    
    // Tạo bill mới với electricityKwh đã update
    const updatedBill = { ...currentBill, electricityKwh: currentElectricReading };
    
    // Update ref và state
    const updatedBills = draftBillsRef.current.map(bill => 
      bill._id === billId ? updatedBill : bill
    );
    draftBillsRef.current = updatedBills;
    setDraftBills(updatedBills);
    
    // Auto-calculate với vehicles từ bill
    await autoCalculateWithVehicles(updatedBill, currentElectricReading, updatedBill.occupantCount || 1, updatedBill.vehicles || []);
  };

  const handleOccupantChange = async (billId: string, value: number | null) => {
    const occupantCount = value || 1;
    
    // Lấy bill hiện tại từ ref
    const currentBill = draftBillsRef.current.find(b => b._id === billId);
    if (!currentBill) return;
    
    // Tạo bill mới với occupantCount đã update
    const updatedBill = { ...currentBill, occupantCount };
    
    // Update ref và state
    const updatedBills = draftBillsRef.current.map(bill => 
      bill._id === billId ? updatedBill : bill
    );
    draftBillsRef.current = updatedBills;
    setDraftBills(updatedBills);
    
    if (updatedBill.electricityKwh && updatedBill.electricityKwh > 0) {
      await autoCalculateWithVehicles(updatedBill, updatedBill.electricityKwh, occupantCount, updatedBill.vehicles || []);
    }
  };

  const handleCalculate = async (bill: DraftBillWithElectricity) => {
    // Lấy bill mới nhất từ ref (để tránh stale closure)
    const currentBill = draftBillsRef.current.find(b => b._id === bill._id) || bill;
    
    console.log(`[handleCalculate] currentBill:`, {
      _id: currentBill._id,
      vehicles: currentBill.vehicles,
      vehicleCount: currentBill.vehicleCount,
      electricityKwh: currentBill.electricityKwh,
    });
    
    if (!currentBill.electricityKwh && currentBill.electricityKwh !== 0) {
      message.warning("Vui lòng nhập số điện trước");
      return;
    }

    const contractId = currentBill.contractId;
    if (typeof contractId !== "object" || !contractId.roomId) {
      message.error("Không tìm thấy thông tin phòng");
      return;
    }

    const roomId = typeof contractId.roomId === "object" ? contractId.roomId._id! : contractId.roomId;

    try {
      setCalculatingBill(currentBill._id);
      
      // Dùng lastElectricReading (số điện sau các hóa đơn trước) để tính số điện tiêu thụ
      const previousReading = currentBill.lastElectricReading || 0;
      const currentElectricReading = currentBill.electricityKwh;
      
      if (currentElectricReading === undefined || currentElectricReading === null) {
        message.error("Vui lòng nhập số điện hiện tại");
        setCalculatingBill(null);
        return;
      }
      
      if (currentElectricReading < previousReading) {
        message.error(`Số điện hiện tại (${currentElectricReading.toLocaleString()} kWh) không được nhỏ hơn số điện trước (${previousReading.toLocaleString()} kWh)`);
        setCalculatingBill(null);
        return;
      }
      
      const electricityConsumption = Math.max(0, currentElectricReading - previousReading);
      
      if (electricityConsumption <= 0) {
        message.error("Số điện tiêu thụ phải lớn hơn 0. Vui lòng kiểm tra lại số điện đã nhập.");
        setCalculatingBill(null);
        return;
      }
      
      const vehicles = currentBill.vehicles || [];
      const occupantCountToSend = currentBill.occupantCount ?? 1;
      
      console.log(`[handleCalculate] Calling API with:`, {
        roomId,
        electricityConsumption,
        occupantCountToSend,
        vehicles,
      });
      
      const result = await roomFeeService.calculateFees(
        roomId, 
        electricityConsumption,
        occupantCountToSend, 
        0, // vehicleCount = 0 khi dùng vehicles array
        vehicles
      );
      
      console.log(`[handleCalculate] API result:`, result);
      console.log(`[handleCalculate] Breakdown:`, result.breakdown);
      
      // Kiểm tra xem có parking trong breakdown không
      const parkingItem = result.breakdown.find(item => item.type === 'parking');
      if (parkingItem) {
        console.log(`[handleCalculate] Parking found:`, parkingItem);
      } else if (vehicles.length > 0) {
        console.log(`[handleCalculate] Parking NOT found in breakdown but has ${vehicles.length} vehicles. Phòng chưa được gán phí parking.`);
        message.warning(`Phòng chưa được gán phí đỗ xe. Vui lòng vào Quản lý phòng để gán phí parking.`);
      }
      
      setCalculationResult(result);
      setCalculationVisible(true);
    } catch (error: any) {
      console.error(`[DraftBills] handleCalculate error:`, error);
      message.error(error?.response?.data?.message || "Lỗi khi tính toán chi phí");
    } finally {
      setCalculatingBill(null);
    }
  };


  const handlePublishSingle = async (bill: DraftBillWithElectricity) => {
    // Lấy bill mới nhất từ ref
    const currentBill = draftBillsRef.current.find(b => b._id === bill._id) || bill;
    
    const currentElectricReading = currentBill.electricityKwh;
    // Dùng lastElectricReading (số điện sau các hóa đơn trước) để tính số điện tiêu thụ
    const previousReading = currentBill.lastElectricReading || 0;
    
    if (currentElectricReading === undefined || currentElectricReading === null) {
      message.error("Vui lòng nhập số điện hiện tại");
      return;
    }
    
    if (currentElectricReading < previousReading) {
      message.error(`Số điện hiện tại (${currentElectricReading.toLocaleString()} kWh) không được nhỏ hơn số điện trước (${previousReading.toLocaleString()} kWh)`);
      return;
    }

    const electricityConsumption = Math.max(0, currentElectricReading - previousReading);
    
    if (electricityConsumption <= 0) {
      message.error("Số điện tiêu thụ phải lớn hơn 0. Vui lòng kiểm tra lại số điện đã nhập.");
      return;
    }

    console.log(`[handlePublishSingle] Publishing with vehicles:`, currentBill.vehicles);

    try {
      setPublishing(true);
      await adminBillService.publishDraft(currentBill._id, {
        electricityKwh: electricityConsumption,
        occupantCount: currentBill.occupantCount || 1,
        vehicles: currentBill.vehicles || [],
        previousReading: previousReading, // Số điện cũ
        currentReading: currentElectricReading, // Số điện mới
      });
      message.success("Phát hành hóa đơn thành công!");
      loadDraftBills();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi phát hành hóa đơn");
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishBatch = async () => {
    // Lấy từ ref để có dữ liệu mới nhất
    const billsToPublish = draftBillsRef.current.filter(bill => selectedBills.includes(bill._id));
    
    if (billsToPublish.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 hóa đơn");
      return;
    }

    const missingElectricity = billsToPublish.filter(bill => bill.electricityKwh === undefined || bill.electricityKwh === null);
    if (missingElectricity.length > 0) {
      message.error("Vui lòng nhập số điện cho tất cả hóa đơn đã chọn");
      return;
    }

    const invalidElectricity = billsToPublish.filter(bill => {
      const currentReading = bill.electricityKwh;
      // Dùng lastElectricReading (số điện sau các hóa đơn trước)
      const previousReading = bill.lastElectricReading || 0;
      return currentReading !== undefined && currentReading !== null && currentReading < previousReading;
    });
    
    if (invalidElectricity.length > 0) {
      const firstInvalid = invalidElectricity[0];
      const contract = firstInvalid.contractId as Contract;
      const roomNumber = typeof contract?.roomId === 'object' ? contract.roomId?.roomNumber : 'N/A';
      message.error(
        `Số điện không hợp lệ ở phòng ${roomNumber}. ` +
        `Số điện hiện tại (${firstInvalid.electricityKwh?.toLocaleString()} kWh) ` +
        `phải >= số điện trước (${(firstInvalid.lastElectricReading || 0).toLocaleString()} kWh)`
      );
      return;
    }

    try {
      setPublishing(true);
      const payload = billsToPublish.map(bill => {
        const currentElectricReading = bill.electricityKwh!;
        // Dùng lastElectricReading (số điện sau các hóa đơn trước)
        const previousReading = bill.lastElectricReading || 0;
        const electricityConsumption = currentElectricReading - previousReading;
        
        if (electricityConsumption <= 0) {
          throw new Error(`Số điện tiêu thụ phải lớn hơn 0 cho hóa đơn ${bill._id}`);
        }
        
        return {
          billId: bill._id,
          electricityKwh: electricityConsumption,
          occupantCount: bill.occupantCount || 1,
          vehicles: bill.vehicles || [],
          previousReading: previousReading, // Số điện cũ
          currentReading: currentElectricReading, // Số điện mới
        };
      });

      const result = await adminBillService.publishBatch(payload);
      message.success(`Phát hành ${result.data.success.length} hóa đơn thành công!`);
      
      if (result.data.failed.length > 0) {
        message.warning(`${result.data.failed.length} hóa đơn thất bại`);
      }

      setSelectedBills([]);
      loadDraftBills();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi phát hành hóa đơn");
    } finally {
      setPublishing(false);
    }
  };

  const handlePreview = () => {
    const billsToPreview = draftBills.filter(bill => selectedBills.includes(bill._id));
    
    if (billsToPreview.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 hóa đơn");
      return;
    }

    const totalAmount = billsToPreview.reduce((sum, bill) => {
      return sum + (bill.amountDue || 0);
    }, 0);

    setPreviewData({
      bills: billsToPreview,
      totalAmount,
      count: billsToPreview.length,
    });
    setPreviewVisible(true);
  };

  const getContractInfo = (contractId: string | Contract): { roomNumber: string; tenantName: string } => {
    if (typeof contractId === "object" && contractId) {
      const roomNumber = typeof contractId.roomId === "object" ? contractId.roomId?.roomNumber : "N/A";
      const tenantName = typeof contractId.tenantId === "object" ? contractId.tenantId?.fullName : "N/A";
      return { roomNumber, tenantName };
    }
    return { roomNumber: "N/A", tenantName: "N/A" };
  };


  const columns: ColumnsType<DraftBillWithElectricity> = [
    {
      title: "Phòng",
      dataIndex: "contractId",
      key: "room",
      width: 100,
      render: (contractId: string | Contract) => {
        const { roomNumber } = getContractInfo(contractId);
        return <b>{roomNumber}</b>;
      },
    },
    {
      title: "Người thuê",
      dataIndex: "contractId",
      key: "tenant",
      width: 150,
      render: (contractId: string | Contract) => {
        const { tenantName } = getContractInfo(contractId);
        return tenantName;
      },
    },
    {
      title: "Ngày lập",
      dataIndex: "billingDate",
      key: "billingDate",
      width: 120,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Số điện (kWh)",
      key: "electricity",
      width: 150,
      render: (_: any, record: DraftBillWithElectricity) => {
        // lastElectricReading = số điện sau khi cộng các hóa đơn trước (số điện "Trước" cho hóa đơn mới)
        // initialElectricReading = số điện chốt từ check-in (dùng để tính tổng số điện tiêu thụ)
        const previousReading = record.lastElectricReading || 0;
        const currentReading = record.electricityKwh;
        const isValidReading = currentReading !== undefined && currentReading !== null && currentReading >= previousReading;
        const consumption = isValidReading ? currentReading - previousReading : 0;
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Trước: {previousReading.toLocaleString()} kWh
            </Text>
            <InputNumber
              min={previousReading}
              value={currentReading}
              status={currentReading !== undefined && currentReading !== null && currentReading < previousReading ? "error" : undefined}
              onChange={(value) => {
                if (value !== null && value < previousReading) {
                  message.error(`Số điện mới (${value?.toLocaleString()} kWh) không được nhỏ hơn số điện trước (${previousReading.toLocaleString()} kWh)`);
                }
                handleElectricityChange(record._id, value);
              }}
              placeholder="Nhập số điện hiện tại"
              style={{ width: "100%" }}
            />
            {currentReading !== undefined && currentReading !== null && currentReading < previousReading && (
              <Text type="danger" style={{ fontSize: '12px' }}>
                ⚠️ Số điện phải {'>='} {previousReading.toLocaleString()} kWh
              </Text>
            )}
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Dùng: {consumption.toLocaleString()} kWh
            </Text>
          </div>
        );
      },
    },
    {
      title: "Số người",
      key: "occupant",
      width: 100,
      render: (_: any, record: DraftBillWithElectricity) => (
        <InputNumber
          min={1}
          value={record.occupantCount}
          onChange={(value) => handleOccupantChange(record._id, value)}
          style={{ width: "100%" }}
          disabled
        />
      ),
    },
    {
      title: "Xe",
      key: "vehicles",
      width: 150,
      render: (_: any, record: DraftBillWithElectricity) => {
        const vehicles = record.vehicles || [];
        const maxVehicles = record.occupantCount || 1;
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Button 
              size="small" 
              icon={<CarOutlined />}
              onClick={() => openVehicleModal(record._id)}
            >
              Quản lý xe ({vehicles.length}/{maxVehicles})
            </Button>
            {vehicles.length > 0 && (
              <div style={{ fontSize: '11px', color: '#666' }}>
                {vehicles.map((v, i) => (
                  <div key={i}>
                    {v.type === 'motorbike' && '🏍️'}
                    {v.type === 'electric_bike' && '⚡'}
                    {v.type === 'bicycle' && '🚲'}
                    {v.licensePlate && ` ${v.licensePlate}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Tiền phòng (₫)",
      key: "monthlyRent",
      align: "right",
      width: 130,
      render: (_: any, record: DraftBillWithElectricity) => {
        const contract = record.contractId as Contract;
        if (!contract) return "0";
        const monthlyRent = contract.pricingSnapshot?.monthlyRent 
          ? dec(contract.pricingSnapshot.monthlyRent)
          : dec(contract.monthlyRent);
        return monthlyRent.toLocaleString("vi-VN");
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 100,
      render: () => <Tag color="orange">Nháp</Tag>,
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      width: 200,
      render: (_: any, record: DraftBillWithElectricity) => (
        <Space>
          <Button
            size="small"
            icon={<CalculatorOutlined />}
            onClick={() => handleCalculate(record)}
            loading={calculatingBill === record._id}
            disabled={!record.electricityKwh && record.electricityKwh !== 0}
          >
            Tính
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handlePublishSingle(record)}
            loading={publishing}
            disabled={!record.electricityKwh && record.electricityKwh !== 0}
          >
            Phát hành
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedBills,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedBills(selectedRowKeys as string[]);
    },
  };


  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <FileTextOutlined style={{ color: "#fa8c16", fontSize: 28 }} /> Hóa đơn nháp
            </Title>
          </Col>
        </Row>

        {/* Alert */}
        <Alert
          type="info"
          style={{ marginBottom: 24 }}
          action={
            <Button
              type="primary"
              size="small"
              onClick={handleCreateDraftBills}
              loading={loading}
            >
              🚀 Tạo draft bill ngay
            </Button>
          }
        />

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Tổng hóa đơn nháp"
                value={draftBills.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Đã chọn"
                value={selectedBills.length}
                prefix={<CheckOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  disabled={selectedBills.length === 0}
                  block
                >
                  Xem trước
                </Button>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={handlePublishBatch}
                  loading={publishing}
                  disabled={selectedBills.length === 0}
                  block
                  style={{ background: "#52c41a", borderColor: "#52c41a" }}
                >
                  Phát hành đã chọn
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Table<DraftBillWithElectricity>
          columns={columns}
          dataSource={draftBills}
          rowKey={(r) => r._id}
          loading={loading}
          rowSelection={rowSelection}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          size="middle"
        />
      </div>

      {/* Vehicle Management Modal */}
      <Modal
        title={
          <Space>
            <CarOutlined />
            Quản lý xe
          </Space>
        }
        open={vehicleModalVisible}
        onCancel={() => setVehicleModalVisible(false)}
        onOk={saveVehicles}
        okText="Lưu"
        cancelText="Hủy"
        width={500}
      >
        {currentBillId && (
          <div>
            <Alert
              message={`Tối đa ${draftBills.find(b => b._id === currentBillId)?.occupantCount || 1} xe (theo số người ở)`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            {/* Add new vehicle */}
            <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Text strong>Thêm xe mới</Text>
              <Row gutter={8} style={{ marginTop: 8 }}>
                <Col span={8}>
                  <Select
                    value={newVehicleType}
                    onChange={setNewVehicleType}
                    style={{ width: '100%' }}
                  >
                    <Option value="motorbike">🏍️ Xe máy</Option>
                    <Option value="electric_bike">⚡ Xe điện (x2)</Option>
                    <Option value="bicycle">🚲 Xe đạp</Option>
                  </Select>
                </Col>
                <Col span={10}>
                  <Input
                    placeholder={newVehicleType === 'bicycle' ? 'Không cần biển số' : 'Biển số (bắt buộc)'}
                    value={newVehiclePlate}
                    onChange={(e) => setNewVehiclePlate(e.target.value)}
                    disabled={newVehicleType === 'bicycle'}
                  />
                </Col>
                <Col span={6}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={addVehicle}
                    block
                  >
                    Thêm
                  </Button>
                </Col>
              </Row>
              {newVehicleType === 'electric_bike' && (
                <Text type="warning" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                  ⚠️ Xe điện tính phí gấp đôi xe máy/xe đạp
                </Text>
              )}
            </div>
            
            {/* Vehicle list */}
            <List
              header={<Text strong>Danh sách xe ({tempVehicles.length})</Text>}
              bordered
              dataSource={tempVehicles}
              locale={{ emptyText: 'Chưa có xe nào' }}
              renderItem={(vehicle, index) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      key="delete"
                      title="Xóa xe này?"
                      onConfirm={() => removeVehicle(index)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                  ]}
                >
                  <Space>
                    <span style={{ fontSize: 20 }}>
                      {vehicle.type === 'motorbike' && '🏍️'}
                      {vehicle.type === 'electric_bike' && '⚡'}
                      {vehicle.type === 'bicycle' && '🚲'}
                    </span>
                    <div>
                      <div>{vehicleTypeLabels[vehicle.type]}</div>
                      {vehicle.licensePlate && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Biển số: {vehicle.licensePlate}
                        </Text>
                      )}
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>


      {/* Calculation Result Modal */}
      <Modal
        title="Chi tiết tính toán chi phí"
        open={calculationVisible}
        onCancel={() => setCalculationVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCalculationVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {calculationResult && (
          <div>
            <Alert
              message="Kết quả tính toán"
              description="Đây là chi tiết các khoản phí dựa trên số điện và số người đã nhập."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Descriptions title="Chi tiết từng khoản" column={1} bordered>
              {calculationResult.breakdown.map((item, index) => {
                const typeNames: Record<string, string> = {
                  rent: "Tiền phòng",
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
                      {item.vehicles && item.vehicles.length > 0 && (
                        <div>
                          <Text>Chi tiết xe:</Text>
                          {item.vehicles.map((v, i) => (
                            <div key={i} style={{ marginLeft: 16, fontSize: 12 }}>
                              {v.type === 'motorbike' && '🏍️ Xe máy'}
                              {v.type === 'electric_bike' && '⚡ Xe điện'}
                              {v.type === 'bicycle' && '🚲 Xe đạp'}
                              : {v.count} xe × {v.rate.toLocaleString("vi-VN")} ₫ = {v.total.toLocaleString("vi-VN")} ₫
                              {v.plates && v.plates.length > 0 && (
                                <span style={{ color: '#666' }}> ({v.plates.join(', ')})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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
                <Text type="secondary">Tổng cộng:</Text>
                <Text strong style={{ fontSize: 24, color: "#52c41a" }}>
                  {calculationResult.total.toLocaleString("vi-VN")} ₫
                </Text>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Xem trước hóa đơn"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="publish"
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={() => {
              setPreviewVisible(false);
              handlePublishBatch();
            }}
            loading={publishing}
          >
            Xác nhận phát hành
          </Button>,
        ]}
        width={700}
      >
        {previewData && (
          <div>
            <Alert
              message={`Sẽ phát hành ${previewData.count} hóa đơn`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              dataSource={previewData.bills}
              rowKey="_id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Phòng",
                  dataIndex: "contractId",
                  render: (contractId: string | Contract) => {
                    const { roomNumber } = getContractInfo(contractId);
                    return roomNumber;
                  },
                },
                {
                  title: "Số điện",
                  dataIndex: "electricityKwh",
                  render: (v: number) => `${v} kWh`,
                },
                {
                  title: "Xe",
                  dataIndex: "vehicles",
                  render: (vehicles: Vehicle[]) => {
                    if (!vehicles || vehicles.length === 0) return "0 xe";
                    return `${vehicles.length} xe`;
                  },
                },
                {
                  title: "Tạm tính",
                  dataIndex: "amountDue",
                  align: "right",
                  render: (v: number) => v.toLocaleString("vi-VN") + " ₫",
                },
              ]}
            />
            <div style={{ marginTop: 16, textAlign: "right", fontSize: 16, fontWeight: 600 }}>
              Tổng tạm tính: {previewData.totalAmount.toLocaleString("vi-VN")} ₫
            </div>
            <Alert
              message="Lưu ý"
              description="Số tiền trên chỉ là tạm tính. Số tiền chính xác sẽ được tính lại khi phát hành (bao gồm tiền điện theo bậc thang và phí xe theo loại)."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DraftBills;
