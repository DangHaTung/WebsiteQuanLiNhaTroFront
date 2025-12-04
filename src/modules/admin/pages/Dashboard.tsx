import React, { useEffect, useState, useMemo } from "react";
import { Card, Col, Row, Table, Tag, Progress, Avatar, Button, message } from "antd";
import { HomeOutlined, UserOutlined, DollarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { adminRoomService } from "../services/room";
import { adminBillService } from "../services/bill";
import "../../../assets/styles/dashboard.css";
import { adminContractService } from "../services/contract";
import { adminTenantService } from "../services/tenant";

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
  const [loading, setLoading] = useState(false);

  // Thống kê điện và doanh thu
  const [electricityStats, setElectricityStats] = useState<any[]>([]);
  const [yearlyRevenue, setYearlyRevenue] = useState(0);
  const [lastMonthRevenue, setLastMonthRevenue] = useState(0);

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
        const weeklyTotals = [0, 0, 0, 0];
        let monthTotal = 0;
        let yearTotal = 0;
        let lastMonthTotal = 0;

        // Tính tháng trước
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Thống kê điện: lọc bill MONTHLY, lấy số điện, sắp xếp giảm dần
        const electricityList: { roomNumber: string; electricity: number; amount: number }[] = [];

        bills.forEach((bill: Bill) => {
          const dateStr = bill.createdAt || bill.billingDate;
          if (!dateStr) return;

          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return;

          const amount = bill.status === 'PAID' ? (bill.amountPaid ?? 0) : 0;

          // Tính doanh thu tháng này
          const sameMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          if (sameMonth) {
            const weekIndex = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
            weeklyTotals[weekIndex] += amount;
            monthTotal += amount;
          }

          // Tính doanh thu năm nay
          if (date.getFullYear() === now.getFullYear()) {
            yearTotal += amount;
          }

          // Tính doanh thu tháng trước
          const isLastMonth = date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
          if (isLastMonth) {
            lastMonthTotal += amount;
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

        setElectricityStats(electricityArray);
        setYearlyRevenue(yearTotal);
        setLastMonthRevenue(lastMonthTotal);
        setTotalRevenue(monthTotal);
      }
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

  const recentRooms = useMemo(() => {
    const sortedRooms = [...rooms].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sortedRooms.slice(0, 5).map((r, idx) => ({
      key: r._id || idx,
      name: r.roomNumber,
      status: r.status === "OCCUPIED" ? "Đang thuê" : "Trống",
      price: (r.pricePerMonth || 0).toLocaleString() + "₫",
      type: r.type,
      area: r.areaM2 + " m²",
      maxPeople: r.maxPeople || 2,
      img: r.images?.[0] || "",
      amenities: r.amenities || [],
    }));
  }, [rooms]);

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

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "img",
      key: "img",
      render: (img: string) => <Avatar shape="square" size={60} src={img} />,
    },
    { title: "Tên phòng", dataIndex: "name", key: "name" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Đang thuê" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    { title: "Giá", dataIndex: "price", key: "price" },
    { title: "Loại phòng", dataIndex: "type", key: "type" },
    { title: "Diện tích", dataIndex: "area", key: "area" },
  ];

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
            title="Thống kê doanh thu"
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
                  <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Doanh thu tháng trước</div>
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>
                    {lastMonthRevenue.toLocaleString("vi-VN")} ₫
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
                  <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Doanh thu năm nay</div>
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>
                    {yearlyRevenue.toLocaleString("vi-VN")} ₫
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

      {/* Danh sách phòng mới */}
      <Card
        title="Danh sách phòng mới"
        className="hover-glow-card"
        style={{ marginTop: 24, overflow: "hidden" }}
      >
        <Table
          columns={columns}
          dataSource={recentRooms}
          pagination={{ pageSize: 5 }}
          rowClassName={(record) =>
            record.status === "Trống" ? "table-row-highlight" : ""
          }
          rowKey="key"
          loading={loading}
          bordered
        />
      </Card>
    </div>
  );
};

export default Dashboard;
