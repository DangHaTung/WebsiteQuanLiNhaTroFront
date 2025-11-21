import React, { useEffect, useState } from "react";
import { Button, Card, InputNumber, message, Space, Table, Tag, Typography, Row, Col, Statistic, Modal, Alert, Descriptions, Divider } from "antd";
import { FileTextOutlined, ThunderboltOutlined, CheckOutlined, EyeOutlined, CalculatorOutlined } from "@ant-design/icons";
import { roomFeeService, type FeeCalculation } from "../services/roomFee";
import type { ColumnsType } from "antd/es/table";
import type { Bill } from "../../../types/bill";
import type { Contract } from "../../../types/contract";
import dayjs from "dayjs";
import { adminBillService } from "../services/bill";

const { Title, Text } = Typography;

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

interface DraftBillWithElectricity extends Bill {
  electricityKwh?: number;
  occupantCount?: number;
  vehicleCount?: number;
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

  useEffect(() => {
    loadDraftBills();
  }, []);

  const loadDraftBills = async () => {
    try {
      setLoading(true);
      const data = await adminBillService.getDrafts({ limit: 100 });
      
      // Load rooms để lấy số người ở (giống như quản lý phòng)
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("admin_token");
      
      // Lấy tất cả rooms với số người ở (gọi nhiều lần nếu cần, limit max = 100)
      let allRooms: any[] = [];
      let page = 1;
      const limit = 100; // Max limit theo validation
      let hasMore = true;

      while (hasMore) {
        try {
          const roomsResponse = await fetch(`${apiUrl}/api/rooms?page=${page}&limit=${limit}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          
          if (!roomsResponse.ok) {
            const errorData = await roomsResponse.json().catch(() => ({}));
            console.error("Failed to load rooms:", roomsResponse.status, errorData);
            message.error(`Lỗi khi tải danh sách phòng: ${errorData.message || roomsResponse.statusText}`);
            break;
          }
          
          const roomsData = await roomsResponse.json();
          if (!roomsData.success) {
            console.error("Rooms API returned error:", roomsData);
            break;
          }
          
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
      
      // Tạo map roomId -> occupantCount (theo đúng logic quản lý phòng)
      // Normalize roomId về string để so sánh chính xác
      const roomOccupantMap = new Map<string, number>();
      rooms.forEach((room: any) => {
        if (room.occupantCount !== undefined && room._id) {
          const roomIdStr = String(room._id);
          roomOccupantMap.set(roomIdStr, room.occupantCount);
        }
      });
      
      console.log("Room occupant map:", Array.from(roomOccupantMap.entries()));
      console.log("Total rooms:", rooms.length);
      
      // Initialize với electricityKwh = 0 và lấy số người ở từ room (theo contract ACTIVE của phòng)
      const billsWithElectricity = data.map(bill => {
        // Lấy roomId từ contract của bill
        const contract = bill.contractId as Contract;
        let roomId: string | undefined;
        
        if (contract) {
          // contract.roomId có thể là object (đã populate) hoặc string (chưa populate)
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
        
        // Lấy số người ở từ room (theo đúng logic quản lý phòng)
        const occupantCount = roomId ? (roomOccupantMap.get(roomId) ?? 1) : 1;
        
        console.log(`Bill ${bill._id?.substring(0, 8)}: roomId=${roomId}, occupantCount=${occupantCount}, mapHasRoom=${roomId ? roomOccupantMap.has(roomId) : false}, contract=`, contract ? { hasRoomId: !!contract.roomId, roomIdType: typeof contract.roomId } : 'no contract');
        
        return {
        ...bill,
        electricityKwh: 0,
          occupantCount,
          vehicleCount: 0, // Mặc định 0 xe, user sẽ nhập
        };
      });
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

  // Hàm auto-calculate (không hiển thị modal)
  const autoCalculate = async (bill: DraftBillWithElectricity, electricityKwh: number, occupantCount: number, vehicleCount: number = 0) => {
    try {
      const contract = bill.contractId as Contract;
      if (!contract?.roomId) return;

      const roomId = typeof contract.roomId === 'string' ? contract.roomId : contract.roomId._id;
      if (!roomId) return;
      
      // Debug: Log vehicleCount trước khi tính (dùng vehicleCount từ parameter, không lấy từ state)
      console.log(`[DraftBills] autoCalculate: vehicleCount=${vehicleCount}, electricityKwh=${electricityKwh}, occupantCount=${occupantCount}`);
      
      const result = await roomFeeService.calculateFees(roomId, electricityKwh, occupantCount, vehicleCount);
      
      console.log(`[DraftBills] autoCalculate result:`, result);
      console.log(`[DraftBills] autoCalculate breakdown:`, result.breakdown);

      // Update bill với calculated amount
      setDraftBills(prev =>
        prev.map(b =>
          b._id === bill._id 
            ? { 
                ...b, 
                amountDue: result.total,
                calculatedBreakdown: result.breakdown 
              } 
            : b
        )
      );
    } catch (error) {
      console.error("Auto-calculate error:", error);
    }
  };

  const handleElectricityChange = async (billId: string, value: number | null) => {
    const electricityKwh = value || 0;
    
    console.log(`[DraftBills] handleElectricityChange: billId=${billId}, electricityKwh=${electricityKwh}`);
    
    // Update state và lấy bill mới nhất
    let updatedBill: DraftBillWithElectricity | undefined;
    setDraftBills(prev => {
      const updated = prev.map(bill => {
        if (bill._id === billId) {
          const newBill = { ...bill, electricityKwh };
          updatedBill = newBill;
          return newBill;
        }
        return bill;
      });
      return updated;
    });
    
    // Auto-calculate luôn (kể cả khi electricityKwh = 0) để tính lại tổng tiền
    if (updatedBill) {
      console.log(`[DraftBills] handleElectricityChange: Calling autoCalculate with electricityKwh=${electricityKwh}, vehicleCount=${updatedBill.vehicleCount || 0}`);
      await autoCalculate(updatedBill, electricityKwh, updatedBill.occupantCount || 1, updatedBill.vehicleCount || 0);
    }
  };

  const handleOccupantChange = async (billId: string, value: number | null) => {
    const occupantCount = value || 1;
    
    // Update state và lấy bill mới nhất
    let updatedBill: DraftBillWithElectricity | undefined;
    setDraftBills(prev => {
      const updated = prev.map(bill => {
        if (bill._id === billId) {
          const newBill = { ...bill, occupantCount };
          updatedBill = newBill;
          return newBill;
        }
        return bill;
      });
      return updated;
    });
    
    // Auto-calculate nếu đã có số điện (dùng bill mới nhất)
    if (updatedBill && updatedBill.electricityKwh && updatedBill.electricityKwh > 0) {
      await autoCalculate(updatedBill, updatedBill.electricityKwh, occupantCount, updatedBill.vehicleCount || 0);
    }
  };

  const handleVehicleChange = async (billId: string, value: number | null) => {
    const vehicleCount = value || 0;
    
    console.log(`[DraftBills] handleVehicleChange: billId=${billId}, vehicleCount=${vehicleCount}`);
    
    // Update state và lấy bill mới nhất từ state
    let updatedBill: DraftBillWithElectricity | undefined;
    setDraftBills(prev => {
      const updated = prev.map(bill => {
        if (bill._id === billId) {
          const newBill = { ...bill, vehicleCount };
          updatedBill = newBill;
          console.log(`[DraftBills] handleVehicleChange: Updated bill, vehicleCount=${newBill.vehicleCount}, electricityKwh=${newBill.electricityKwh}`);
          return newBill;
        }
        return bill;
      });
      return updated;
    });
    
    // Auto-calculate nếu đã có số điện (truyền vehicleCount trực tiếp từ parameter)
    if (updatedBill && updatedBill.electricityKwh !== undefined && updatedBill.electricityKwh > 0) {
      console.log(`[DraftBills] handleVehicleChange: Calling autoCalculate with vehicleCount=${vehicleCount}`);
      // Truyền vehicleCount trực tiếp từ parameter, không lấy từ state
      await autoCalculate(updatedBill, updatedBill.electricityKwh, updatedBill.occupantCount || 1, vehicleCount);
    } else {
      console.log(`[DraftBills] handleVehicleChange: Skipping autoCalculate - electricityKwh=${updatedBill?.electricityKwh}`);
    }
  };

  const handleCalculate = async (bill: DraftBillWithElectricity) => {
    // Lấy bill mới nhất từ state để đảm bảo có vehicleCount mới nhất
    // Sử dụng functional update để đảm bảo lấy state mới nhất
    let currentBill: DraftBillWithElectricity | undefined;
    setDraftBills(prev => {
      currentBill = prev.find(b => b._id === bill._id) || bill;
      return prev; // Không thay đổi state, chỉ lấy giá trị
    });
    
    // Fallback nếu không tìm thấy trong state
    if (!currentBill) {
      currentBill = bill;
    }
    
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
      
      // Debug: Log vehicleCount trước khi tính
      const vehicleCountToSend = currentBill.vehicleCount ?? 0;
      const electricityKwhToSend = currentBill.electricityKwh ?? 0;
      const occupantCountToSend = currentBill.occupantCount ?? 1;
      
      console.log(`[DraftBills] handleCalculate: vehicleCount=${currentBill.vehicleCount}, vehicleCountToSend=${vehicleCountToSend}, electricityKwh=${electricityKwhToSend}, occupantCount=${occupantCountToSend}`);
      console.log(`[DraftBills] handleCalculate: currentBill object:`, {
        _id: currentBill._id,
        vehicleCount: currentBill.vehicleCount,
        electricityKwh: currentBill.electricityKwh,
        occupantCount: currentBill.occupantCount,
      });
      console.log(`[DraftBills] handleCalculate: Calling API with:`, {
        roomId,
        kwh: electricityKwhToSend,
        occupantCount: occupantCountToSend,
        vehicleCount: vehicleCountToSend,
      });
      
      const result = await roomFeeService.calculateFees(
        roomId, 
        electricityKwhToSend, 
        occupantCountToSend, 
        vehicleCountToSend
      );
      
      console.log(`[DraftBills] handleCalculate result:`, result);
      console.log(`[DraftBills] handleCalculate breakdown:`, result.breakdown);
      
      // Tìm parking trong breakdown để debug
      const parkingItem = result.breakdown.find(item => item.type === 'parking');
      if (parkingItem) {
        console.log(`[DraftBills] handleCalculate: Parking item found:`, parkingItem);
      } else {
        console.log(`[DraftBills] handleCalculate: Parking item NOT found in breakdown`);
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
    if (!bill.electricityKwh && bill.electricityKwh !== 0) {
      message.warning("Vui lòng nhập số điện");
      return;
    }

    try {
      setPublishing(true);
      await adminBillService.publishDraft(bill._id, {
        electricityKwh: bill.electricityKwh,
        occupantCount: bill.occupantCount || 1,
        vehicleCount: bill.vehicleCount || 0,
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
    const billsToPublish = draftBills.filter(bill => selectedBills.includes(bill._id));
    
    if (billsToPublish.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 hóa đơn");
      return;
    }

    // Kiểm tra tất cả đã nhập số điện chưa
    const missingElectricity = billsToPublish.filter(bill => bill.electricityKwh === undefined || bill.electricityKwh === null);
    if (missingElectricity.length > 0) {
      message.warning("Vui lòng nhập số điện cho tất cả hóa đơn đã chọn");
      return;
    }

    try {
      setPublishing(true);
      const payload = billsToPublish.map(bill => ({
        billId: bill._id,
        electricityKwh: bill.electricityKwh!,
        occupantCount: bill.occupantCount || 1,
        vehicleCount: bill.vehicleCount || 0,
      }));

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
      // Tính tạm (chưa chính xác, cần call API để tính đúng)
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
      render: (_: any, record: DraftBillWithElectricity) => (
        <InputNumber
          min={0}
          value={record.electricityKwh}
          onChange={(value) => handleElectricityChange(record._id, value)}
          placeholder="Nhập số điện"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Số người",
      key: "occupant",
      width: 120,
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
      title: "Số xe",
      key: "vehicle",
      width: 120,
      render: (_: any, record: DraftBillWithElectricity) => {
        const isInvalid = (record.vehicleCount || 0) > (record.occupantCount || 1);
        return (
          <InputNumber
            min={0}
            max={record.occupantCount || 1}
            value={record.vehicleCount}
            onChange={(value) => handleVehicleChange(record._id, value)}
            placeholder="Nhập số xe"
            style={{ width: "100%" }}
            status={isInvalid ? "error" : undefined}
          />
        );
      },
    },
    {
      title: "Tiền phòng (₫)",
      key: "monthlyRent",
      align: "right",
      width: 150,
      render: (_: any, record: DraftBillWithElectricity) => {
        // Lấy tiền thuê phòng từ contract, không phải từ amountDue (tổng)
        const contract = record.contractId as Contract;
        if (!contract) {
          return "0";
        }
        // Sử dụng helper function dec để xử lý Decimal128
        // Ưu tiên lấy từ pricingSnapshot nếu có (đã được format)
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
          //message="Hướng dẫn"
          //description="Hóa đơn nháp được tạo tự động vào ngày 5 hàng tháng. Vui lòng nhập số điện tiêu thụ cho từng phòng và phát hành để tenant có thể thanh toán."
          type="info"
          //showIcon
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
              description="Số tiền trên chỉ là tạm tính. Số tiền chính xác sẽ được tính lại khi phát hành (bao gồm tiền điện theo bậc thang)."
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
