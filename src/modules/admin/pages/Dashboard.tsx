import React, { useEffect, useState } from "react";
import { Card, Col, Row, Table, Tag, Progress, Tooltip, Avatar, Button } from "antd";
import { HomeOutlined, UserOutlined, DollarOutlined, ClockCircleOutlined, WifiOutlined, FireOutlined } from "@ant-design/icons";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Legend } from "chart.js";
import "../../../assets/styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Legend);

// Helper animate number
const useAnimatedNumber = (target: number, duration: number = 1000) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const stepTime = Math.abs(Math.floor(duration / target));
    const timer = setInterval(() => {
      start += 1;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      setValue(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
};

// Hook animate progress
const useAnimatedProgress = (target: number, duration: number = 1000) => {
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    let start = 0;
    const stepTime = Math.abs(Math.floor(duration / target));
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
  const stats = [
    { title: "Tổng phòng", value: 85, icon: <HomeOutlined />, color: "#1677ff" },
    { title: "Phòng đang thuê", value: 60, icon: <UserOutlined />, color: "#52c41a" },
    { title: "Phòng còn trống", value: 25, icon: <ClockCircleOutlined />, color: "#faad14" },
    { title: "Doanh thu tháng", value: 12450, icon: <DollarOutlined />, color: "#eb2f96", prefix: "$" },
  ];

  const recentRooms = [
    {
      key: 1,
      name: "Phòng 101",
      status: "Đang thuê",
      price: "$250",
      type: "1PN",
      area: "25m²",
      maxPeople: 2,
      img: "https://i.pravatar.cc/60?img=1",
      amenities: ["Wifi", "Máy lạnh"],
    },
    {
      key: 2,
      name: "Phòng 102",
      status: "Trống",
      price: "$200",
      type: "1PN",
      area: "20m²",
      maxPeople: 2,
      img: "https://i.pravatar.cc/60?img=2",
      amenities: ["Wifi"],
    },
    {
      key: 3,
      name: "Phòng 103",
      status: "Đang thuê",
      price: "$300",
      type: "2PN",
      area: "35m²",
      maxPeople: 4,
      img: "https://i.pravatar.cc/60?img=3",
      amenities: ["Wifi", "Máy lạnh", "Bếp"],
    },
    {
      key: 4,
      name: "Phòng 104",
      status: "Trống",
      price: "$220",
      type: "1PN",
      area: "22m²",
      maxPeople: 2,
      img: "https://i.pravatar.cc/60?img=4",
      amenities: ["Bếp"],
    },
    {
      key: 5,
      name: "Phòng 105",
      status: "Trống",
      price: "$280",
      type: "2PN",
      area: "30m²",
      maxPeople: 3,
      img: "https://i.pravatar.cc/60?img=5",
      amenities: ["Wifi", "Máy lạnh"],
    },
  ];

  const recentRentals = [
    { customerName: "Nguyễn Văn A", roomNumber: "101", date: "2025-10-12", status: "Đã thuê" },
    { customerName: "Trần Thị B", roomNumber: "202", date: "2025-10-11", status: "Đặt cọc" },
    { customerName: "Lê Văn C", roomNumber: "305", date: "2025-10-10", status: "Đã thuê" },
    { customerName: "Phạm Thị D", roomNumber: "402", date: "2025-10-09", status: "Đã thuê" },
    { customerName: "Hoàng Văn E", roomNumber: "509", date: "2025-10-08", status: "Đặt cọc" },
  ];

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
        <Tag color={status === "Đang thuê" ? "green" : "orange"} icon={status === "Đang thuê" ? <HomeOutlined /> : <ClockCircleOutlined />}>
          {status}
        </Tag>
      ),
    },
    { title: "Giá", dataIndex: "price", key: "price" },
    { title: "Loại phòng", dataIndex: "type", key: "type" },
    { title: "Diện tích", dataIndex: "area", key: "area" },
    { title: "Số người tối đa", dataIndex: "maxPeople", key: "maxPeople" },
    {
      title: "Tiện ích",
      dataIndex: "amenities",
      key: "amenities",
      render: (amenities: string[]) => (
        <>
          {amenities.map((a) => {
            let icon = null;
            if (a === "Wifi") icon = <WifiOutlined />;
            else if (a === "Máy lạnh") icon = <FireOutlined />;
            else if (a === "Bếp") icon = <HomeOutlined />;
            return (
              <Tag icon={<Tooltip title={a}>{icon}</Tooltip>} color="#108ee9">
                {a}
              </Tag>
            );
          })}
        </>
      ),
    },
  ];

  const revenueData = {
    labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
    datasets: [
      {
        label: "Doanh thu ($)",
        data: [3200, 4500, 2800, 4450],
        borderColor: "#eb2f96",
        backgroundColor: "rgba(235, 47, 150, 0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const revenueOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  // Animate Progress bars
  const occupiedPercent = useAnimatedProgress(Math.round((60 / 85) * 100), 1200);
  const emptyPercent = useAnimatedProgress(Math.round((25 / 85) * 100), 1200);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard Phòng Trọ</h2>

      {/* Stats cards */}
      <Row gutter={[24, 24]}>
        {stats.map((stat) => {
          const animatedValue = useAnimatedNumber(stat.value, 800);
          return (
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
                      {stat.prefix || ""}{animatedValue}
                    </div>
                    <div style={{ color: "#888" }}>{stat.title}</div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Progress + chart */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          {/* Tình trạng phòng */}
          <Card
            title="Tình trạng phòng"
            className="hover-glow-card"
            style={{
              borderRadius: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            <Progress
              style={{ marginBottom: 8 }}
              percent={occupiedPercent}
              success={{ percent: occupiedPercent }}
              strokeColor="#52c41a"
              format={(percent) => `${percent}% đang thuê`}
              status="active"
            />
            <Progress
              percent={emptyPercent}
              strokeColor="#faad14"
              format={(percent) => `${percent}% còn trống`}
              status="active"
            />
          </Card>

          {/* Danh sách thuê phòng gần đây */}
          <Card
            title="Danh sách thuê phòng gần đây"
            className="hover-glow-card"
            style={{
              borderRadius: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              marginTop: 24,
            }}
            extra={<Button type="link">Xem tất cả</Button>}
          >
            {recentRentals && recentRentals.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {recentRentals.slice(0, 5).map((rental, index) => (
                  <li
                    key={index}
                    className="rental-item"
                  >
                    <div>
                      <strong>{rental.customerName}</strong> — Phòng {rental.roomNumber}
                      <div style={{ fontSize: 12, color: "#999" }}>
                        {new Date(rental.date).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <Tag color={getStatusColor(rental.status)}>{rental.status}</Tag>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#999", textAlign: "center", margin: 0 }}>
                Không có dữ liệu gần đây
              </p>
            )}
          </Card>
        </Col>

        {/* Card Doanh thu tuần */}
        <Col xs={24} md={12}>
          <Card
            title="Doanh thu tuần"
            className="hover-glow-card card-chart"
            style={{
              borderRadius: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div style={{ height: 250 }}>
              <Line
                data={revenueData}
                options={{
                  ...revenueOptions,
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: false,
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>


      {/* Recent rooms */}
      <Card
        title="Danh sách phòng mới"
        className="hover-glow-card"
        style={{
          marginTop: 24,
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <Table
          columns={columns}
          dataSource={recentRooms}
          pagination={{ pageSize: 5 }}
          rowClassName={(record) => (record.status === "Trống" ? "table-row-highlight" : "")}
          rowKey="key"
          bordered
        />
      </Card>
    </div>
  );
};

export default Dashboard;
