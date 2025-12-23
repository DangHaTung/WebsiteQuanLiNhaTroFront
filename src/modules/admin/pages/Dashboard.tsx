import React, { useEffect, useState, useMemo } from "react";
import { Card, Col, Row, Table, Tag, Progress, Button, message } from "antd";
import { HomeOutlined, UserOutlined, DollarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { adminRoomService } from "../services/room";
import { adminBillService } from "../services/bill";
import "../../../assets/styles/dashboard.css";
import { adminContractService } from "../services/contract";
import { adminTenantService } from "../services/tenant";
import { adminFinalContractService } from "../services/finalContract";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { Bill } from "../../../types/bill";
dayjs.extend(isoWeek);



// Hook animate progress
const useAnimatedProgress = (target: number, duration: number = 1000) => {
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    let start = 0;
    const stepTime = Math.max(1, Math.floor(duration / (target || 1)));
    const timer = setInterval(() => {
      start += 1;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      setPercent(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return percent;
};

const Dashboard: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentRentals, setRecentRentals] = useState<any[]>([]);
  const [, setLoading] = useState(false);

  // Thống kê điện và doanh thu
  const [electricityStats, setElectricityStats] = useState<any[]>([]);
  const [yearlyRevenue, setYearlyRevenue] = useState(0);
  const [monthlyProfit, setMonthlyProfit] = useState(0);
  const [yearlyProfit, setYearlyProfit] = useState(0);
  const [monthlyElectricityCost, setMonthlyElectricityCost] = useState(0);
  const [yearlyElectricityCost, setYearlyElectricityCost] = useState(0);

  // Thống kê hóa đơn chưa thanh toán và hợp đồng sắp hết hạn
  const [unpaidBills, setUnpaidBills] = useState<{ count: number; total: number; overdue: number }>({ count: 0, total: 0, overdue: 0 });
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);

  const resolveTenantName = (c: any, tenantsList: any[]) => {
    if (c.tenant && typeof c.tenant === "object") {
      return c.tenant.fullName || c.tenant.name || "Khách thuê";
    }
    if (c.tenantId && typeof c.tenantId === "object") {
      return c.tenantId.fullName || c.tenantId.name || "Khách thuê";
    }
    if (c.tenantId && typeof c.tenantId === "string") {
      const t = tenantsList.find((x) => x._id === c.tenantId || x.id === c.tenantId);
      return t?.fullName || t?.name || c.tenantId;
    }
    return "Khách thuê";
  };

  const resolveRoomNumber = (c: any, roomsList: any[]) => {
    if (c.room && typeof c.room === "object") {
      return c.room.roomNumber || c.room.name || "N/A";
    }
    if (c.roomId && typeof c.roomId === "object") {
      return c.roomId.roomNumber || c.roomId.name || "N/A";
    }
    if (c.roomId && typeof c.roomId === "string") {
      const r = roomsList.find((x) => x._id === c.roomId || x.id === c.roomId);
      return r?.roomNumber || r?.name || c.roomId;
    }
    return "N/A";
  };

  // Fetch API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Lấy tenants
      const tenantsData = await adminTenantService.getAll({ limit: 50 });

      // Lấy danh sách phòng
      const roomsData = await adminRoomService.getAll();
      setRooms(Array.isArray(roomsData) ? roomsData : []);

      // Lấy danh sách thuê gần đây
      const contracts = await adminContractService.getAll({ limit: 5 });

      const sortedContracts = Array.isArray(contracts)
        ? contracts
          .filter((c) => c.createdAt)
          .sort(
            (a, b) =>
              new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
          )
        : [];

      const mappedRentals = sortedContracts.map((c) => ({
        customerName: resolveTenantName(c, Array.isArray(tenantsData) ? tenantsData : []),
        roomNumber: resolveRoomNumber(c, Array.isArray(roomsData) ? roomsData : []),
        deposit: c.deposit || 0,
        monthlyRent: c.monthlyRent || 0,
        date: c.createdAt ? new Date(c.createdAt) : null,
        status: c.status || "Đã thuê",
      }));

      setRecentRentals(mappedRentals);

      // Lấy hóa đơn để tính doanh thu tuần và thống kê điện
      const billRes: any = await adminBillService.getAll();
      const bills: Bill[] = Array.isArray(billRes) ? billRes : billRes?.data || [];

      if (bills.length > 0) {
        const now = new Date();
        let monthTotal = 0;
        let yearTotal = 0;

        // Thống kê điện: lọc bill MONTHLY, lấy số điện, sắp xếp giảm dần
        const electricityList: { roomNumber: string; electricity: number; amount: number }[] = [];
        
        // Tính chi phí điện/nước/internet/dọn dẹp để tính lợi nhuận
        const ELECTRICITY_PROFIT_MARGIN = 0.05; // 5%
        const WATER_PROFIT_MARGIN = 0; // 0%
        const INTERNET_PROFIT_MARGIN = 0.5; // 50%
        const CLEANING_PROFIT_MARGIN = 1/3; // 33.33%
        
        let monthElectricityRevenue = 0; // Tiền điện thu được
        let monthWaterRevenue = 0; // Tiền nước thu được
        let monthInternetRevenue = 0; // Tiền internet thu được
        let monthCleaningRevenue = 0; // Tiền dọn dẹp thu được
        let yearElectricityRevenue = 0;
        let yearWaterRevenue = 0;
        let yearInternetRevenue = 0;
        let yearCleaningRevenue = 0;

        bills.forEach((bill: Bill) => {
          const dateStr = bill.createdAt || bill.billingDate;
          if (!dateStr) return;

          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return;

          const amount = bill.status === 'PAID' ? (bill.amountPaid ?? 0) : 0;

          // Tính doanh thu tháng này
          const sameMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          if (sameMonth) {
            monthTotal += amount;

            // Tính doanh thu điện/nước/internet/dọn dẹp tháng này (chỉ bill đã thanh toán)
            if (bill.status === 'PAID' && bill.lineItems) {
              bill.lineItems.forEach((item: any) => {
                const itemName = item.item?.toLowerCase() || '';
                if (itemName.includes('điện')) {
                  monthElectricityRevenue += item.lineTotal || 0;
                } else if (itemName.includes('nước')) {
                  monthWaterRevenue += item.lineTotal || 0;
                } else if (itemName.includes('internet') || itemName.includes('mạng')) {
                  monthInternetRevenue += item.lineTotal || 0;
                } else if (itemName.includes('dọn dẹp') || itemName.includes('vệ sinh')) {
                  monthCleaningRevenue += item.lineTotal || 0;
                }
              });
            }
          }

          // Tính doanh thu năm nay
          if (date.getFullYear() === now.getFullYear()) {
            yearTotal += amount;

            // Tính doanh thu điện/nước/internet/dọn dẹp năm nay
            if (bill.status === 'PAID' && bill.lineItems) {
              bill.lineItems.forEach((item: any) => {
                const itemName = item.item?.toLowerCase() || '';
                if (itemName.includes('điện')) {
                  yearElectricityRevenue += item.lineTotal || 0;
                } else if (itemName.includes('nước')) {
                  yearWaterRevenue += item.lineTotal || 0;
                } else if (itemName.includes('internet') || itemName.includes('mạng')) {
                  yearInternetRevenue += item.lineTotal || 0;
                } else if (itemName.includes('dọn dẹp') || itemName.includes('vệ sinh')) {
                  yearCleaningRevenue += item.lineTotal || 0;
                }
              });
            }
          }

          // Thống kê điện: lấy tất cả bill MONTHLY có số điện
          if (bill.billType === 'MONTHLY') {
            // Lấy số điện từ electricityReading hoặc lineItems
            let electricityKwh = bill.electricityReading?.consumption || 0;
            let electricityAmount = 0;

            // Lấy tiền điện từ lineItems
            if (bill.lineItems) {
              const electricityItem = bill.lineItems.find((item: any) => 
                item.item?.toLowerCase().includes('điện')
              );
              if (electricityItem) {
                electricityAmount = electricityItem.lineTotal || 0;
                if (!electricityKwh) electricityKwh = electricityItem.quantity || 0;
              }
            }

            // Lấy roomNumber từ contractId.roomId
            const contract = bill.contractId as any;
            const roomNumber = contract?.roomId?.roomNumber || 'N/A';

            if (electricityKwh > 0) {
              electricityList.push({ roomNumber, electricity: electricityKwh, amount: electricityAmount });
            }
          }
        });

        // Sắp xếp theo số điện giảm dần, lấy top 10
        const electricityArray = electricityList
          .sort((a, b) => b.electricity - a.electricity)
          .slice(0, 10);

        // Tính chi phí gốc (cost) từ doanh thu (revenue)
        const monthElectricityCost = monthElectricityRevenue / (1 + ELECTRICITY_PROFIT_MARGIN);
        const monthWaterCost = monthWaterRevenue / (1 + WATER_PROFIT_MARGIN);
        const monthInternetCost = monthInternetRevenue / (1 + INTERNET_PROFIT_MARGIN);
        const monthCleaningCost = monthCleaningRevenue / (1 + CLEANING_PROFIT_MARGIN);
        
        const yearElectricityCost = yearElectricityRevenue / (1 + ELECTRICITY_PROFIT_MARGIN);
        const yearWaterCost = yearWaterRevenue / (1 + WATER_PROFIT_MARGIN);
        const yearInternetCost = yearInternetRevenue / (1 + INTERNET_PROFIT_MARGIN);
        const yearCleaningCost = yearCleaningRevenue / (1 + CLEANING_PROFIT_MARGIN);

        // Tính lợi nhuận = Doanh thu - Tất cả chi phí gốc
        const monthProfit = monthTotal - monthElectricityCost - monthWaterCost - monthInternetCost - monthCleaningCost;
        const yearProfit = yearTotal - yearElectricityCost - yearWaterCost - yearInternetCost - yearCleaningCost;

        setElectricityStats(electricityArray);
        setYearlyRevenue(yearTotal);
        setTotalRevenue(monthTotal);
        setMonthlyProfit(monthProfit);
        setYearlyProfit(yearProfit);
        
        // Lưu chi phí điện để hiển thị
        setMonthlyElectricityCost(monthElectricityCost);
        setYearlyElectricityCost(yearElectricityCost);

        // (Không hiển thị riêng chi phí internet/dọn dẹp trên UI ở phiên bản hiện tại)

        // Thống kê hóa đơn chưa thanh toán
        const unpaidBillsList = bills.filter((b: Bill) => 
          b.status === 'UNPAID' || b.status === 'PARTIALLY_PAID'
        );
        const unpaidTotal = unpaidBillsList.reduce((sum: number, b: Bill) => {
          const amountDue = b.amountDue ?? 0;
          const amountPaid = b.amountPaid ?? 0;
          return sum + (amountDue - amountPaid);
        }, 0);
        
        // Đếm hóa đơn quá hạn (dueDate < now)
        const currentDate = new Date();
        const overdueBills = unpaidBillsList.filter((b: Bill) => {
          if (!b.dueDate) return false;
          return new Date(b.dueDate) < currentDate;
        }).length;

        setUnpaidBills({
          count: unpaidBillsList.length,
          total: unpaidTotal,
          overdue: overdueBills,
        });
      }

      // Lấy hợp đồng sắp hết hạn (30 ngày)
      const expiringData = await adminFinalContractService.getExpiringSoon(30);
      setExpiringContracts(Array.isArray(expiringData) ? expiringData : []);

    } catch (error) {
      console.error(error);
      message.error("Không thể tải dữ liệu Dashboard!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Stats
  const totalRooms = rooms.length;
  const occupiedCount = useMemo(
    () => rooms.filter((r) => r.status === "OCCUPIED").length,
    [rooms]
  );
  const availableCount = useMemo(
    () => rooms.filter((r) => r.status === "AVAILABLE").length,
    [rooms]
  );

  const stats = [
    { title: "Tổng phòng", value: totalRooms, icon: <HomeOutlined />, color: "#1677ff" },
    { title: "Phòng đang thuê", value: occupiedCount, icon: <UserOutlined />, color: "#52c41a" },
    { title: "Phòng còn trống", value: availableCount, icon: <ClockCircleOutlined />, color: "#faad14" },
    { title: "Doanh thu tháng này", value: totalRevenue, icon: <DollarOutlined />, color: "#eb2f96", prefix: "₫" },
  ];

  const electricityColumns = [
    { 
      title: "Phòng", 
      dataIndex: "roomNumber", 
      key: "roomNumber",
      render: (text: string) => <b>{text}</b>
    },
    { 
      title: "Điện tiêu thụ (kWh)", 
      dataIndex: "electricity", 
      key: "electricity",
      render: (val: number) => <span style={{ color: "#fa8c16", fontWeight: 600 }}>{val.toLocaleString()}</span>
    },
    { 
      title: "Tiền điện (₫)", 
      dataIndex: "amount", 
      key: "amount",
      render: (val: number) => <span style={{ color: "#1890ff" }}>{val.toLocaleString()}</span>
    },
  ];

  const occupiedPercent = useAnimatedProgress(
    totalRooms ? Math.round((occupiedCount / totalRooms) * 100) : 0,
    1200
  );
  const emptyPercent = useAnimatedProgress(
    totalRooms ? Math.round((availableCount / totalRooms) * 100) : 0,
    1200
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Đã thuê":
        return "green";
      case "Đặt cọc":
        return "orange";
      default:
        return "default";
    }
  };

  

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard Phòng Trọ</h2>

      {/* Stats cards */}
      <Row gutter={[24, 24]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} md={6} key={stat.title}>
            <Card
              hoverable
              className="hover-glow-card"
              style={{
                borderRadius: 16,
                boxShadow: `0 8px 24px ${stat.color}44`,
                cursor: "pointer",
                transition: "all 0.3s",
                background: `linear-gradient(135deg, ${stat.color}55, ${stat.color}22)`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="stat-icon" style={{ background: stat.color }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>
                    {stat.prefix || ""}
                    {stat.value.toLocaleString()}
                  </div>
                  <div style={{ color: "#888" }}>{stat.title}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Progress + chart */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Tình trạng phòng" className="hover-glow-card">
            <Progress
              style={{ marginBottom: 8 }}
              percent={occupiedPercent}
              success={{ percent: occupiedPercent }}
              strokeColor="#52c41a"
              format={(p) => `${p}% đang thuê`}
              status="active"
            />
            <Progress
              percent={emptyPercent}
              strokeColor="#faad14"
              format={(p) => `${p}% còn trống`}
              status="active"
            />
          </Card>

          {/* Hóa đơn chưa thanh toán */}
          <Card
            title="Hóa đơn chưa thanh toán"
            className="hover-glow-card"
            style={{ marginTop: 24 }}
            extra={
              <Button 
                type="link" 
                onClick={() => window.location.href = '/admin/bills'}
              >
                Xem tất cả
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div style={{ 
                  padding: 16, 
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)", 
                  borderRadius: 12,
                  color: "white",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 12, marginBottom: 4, opacity: 0.9 }}>Số hóa đơn</div>
                  <div style={{ fontSize: 28, fontWeight: "bold" }}>
                    {unpaidBills.count}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ 
                  padding: 16, 
                  background: "linear-gradient(135deg, #ffa502 0%, #ff6348 100%)", 
                  borderRadius: 12,
                  color: "white",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 12, marginBottom: 4, opacity: 0.9 }}>Quá hạn</div>
                  <div style={{ fontSize: 28, fontWeight: "bold" }}>
                    {unpaidBills.overdue}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ 
                  padding: 16, 
                  background: "linear-gradient(135deg, #ff4757 0%, #c23616 100%)", 
                  borderRadius: 12,
                  color: "white",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 12, marginBottom: 4, opacity: 0.9 }}>Tổng tiền</div>
                  <div style={{ fontSize: 20, fontWeight: "bold" }}>
                    {(unpaidBills.total / 1000000).toFixed(1)}M
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Hợp đồng sắp hết hạn */}
          <Card
            title="Hợp đồng sắp hết hạn (30 ngày)"
            className="hover-glow-card"
            style={{ marginTop: 24 }}
            extra={
              <Button 
                type="link"
                onClick={() => window.location.href = '/admin/final-contracts'}
              >
                Xem tất cả
              </Button>
            }
          >
            {expiringContracts.length > 0 ? (
              <>
                <div style={{ 
                  padding: 16, 
                  background: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)", 
                  borderRadius: 12,
                  color: "white",
                  textAlign: "center",
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: 14, marginBottom: 4, opacity: 0.9 }}>Số hợp đồng cần gia hạn</div>
                  <div style={{ fontSize: 32, fontWeight: "bold" }}>
                    {expiringContracts.length}
                  </div>
                </div>
                <Table
                  size="small"
                  pagination={false}
                  columns={[
                    { 
                      title: "Phòng", 
                      dataIndex: ["roomId", "roomNumber"], 
                      key: "room",
                      render: (text: string) => <b>{text}</b>
                    },
                    { 
                      title: "Khách thuê", 
                      dataIndex: ["tenantId", "fullName"], 
                      key: "tenant" 
                    },
                    { 
                      title: "Hết hạn", 
                      dataIndex: "endDate", 
                      key: "endDate",
                      render: (date: string) => {
                        const daysLeft = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <Tag color={daysLeft <= 7 ? "red" : daysLeft <= 15 ? "orange" : "gold"}>
                            {daysLeft} ngày
                          </Tag>
                        );
                      }
                    },
                  ]}
                  dataSource={expiringContracts.slice(0, 5).map((c, i) => ({ ...c, key: i }))}
                  scroll={{ y: 200 }}
                />
              </>
            ) : (
              <p style={{ color: "#999", textAlign: "center", margin: 0 }}>
                Không có hợp đồng nào sắp hết hạn
              </p>
            )}
          </Card>

          <Card
            title="Danh sách thuê phòng gần đây"
            className="hover-glow-card"
            style={{ marginTop: 24 }}
            extra={<Button type="link">Xem tất cả</Button>}
          >
            {recentRentals && recentRentals.length > 0 ? (
              <Table
                size="small"
                pagination={false}
                columns={[
                  { title: "Khách thuê", dataIndex: "customerName", key: "customerName" },
                  { title: "Phòng", dataIndex: "roomNumber", key: "roomNumber" },
                  {
                    title: "Tiền cọc",
                    dataIndex: "deposit",
                    key: "deposit",
                    render: (v: number) =>
                      v ? v.toLocaleString("vi-VN") + "₫" : "—",
                  },
                  {
                    title: "Giá thuê",
                    dataIndex: "monthlyRent",
                    key: "monthlyRent",
                    render: (v: number) =>
                      v ? v.toLocaleString("vi-VN") + "₫" : "—",
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    key: "status",
                    render: (status: string) => (
                      <Tag color={getStatusColor(status)}>{status}</Tag>
                    ),
                  },
                ]}
                dataSource={recentRentals.map((r, i) => ({ ...r, key: i }))}
              />
            ) : (
              <p style={{ color: "#999", textAlign: "center", margin: 0 }}>
                Không có dữ liệu gần đây
              </p>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="Thống kê doanh thu & lợi nhuận"
            className="hover-glow-card"
            style={{ marginBottom: 24 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ 
                  padding: 20, 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                  borderRadius: 12,
                  color: "white",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Doanh thu tháng này</div>
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>
                    {totalRevenue.toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ 
                  padding: 20, 
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", 
                  borderRadius: 12,
                  color: "white",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Lợi nhuận tháng này</div>
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>
                    {monthlyProfit.toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ 
                  padding: 20, 
                  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", 
                  borderRadius: 12,
                  color: "white",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Doanh thu năm nay</div>
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>
                    {yearlyRevenue.toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ 
                  padding: 20, 
                  background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", 
                  borderRadius: 12,
                  color: "white",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Lợi nhuận năm nay</div>
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>
                    {yearlyProfit.toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          <Card
            title="Chi phí điện lực (95% tiền điện thu được)"
            className="hover-glow-card"
            style={{ marginBottom: 24 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ 
                  padding: 20, 
                  background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", 
                  borderRadius: 12,
                  color: "white",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Chi trả điện lực tháng này</div>
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>
                    {monthlyElectricityCost.toLocaleString("vi-VN")} ₫
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
                    (95% của tiền điện thu được)
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ 
                  padding: 20, 
                  background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", 
                  borderRadius: 12,
                  color: "white",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Chi trả điện lực năm nay</div>
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>
                    {yearlyElectricityCost.toLocaleString("vi-VN")} ₫
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
                    (95% của tiền điện thu được)
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          

          <Card
            title="Top 10 phòng tiêu thụ điện nhiều nhất (Tháng trước)"
            className="hover-glow-card"
          >
            {electricityStats.length > 0 ? (
              <Table
                size="small"
                pagination={false}
                columns={electricityColumns}
                dataSource={electricityStats.map((item, idx) => ({ ...item, key: idx }))}
                scroll={{ y: 300 }}
              />
            ) : (
              <p style={{ color: "#999", textAlign: "center", margin: 0 }}>
                Chưa có dữ liệu điện tháng trước
              </p>
            )}
          </Card>
        </Col>
      </Row>


    </div>
  );
};

export default Dashboard;
