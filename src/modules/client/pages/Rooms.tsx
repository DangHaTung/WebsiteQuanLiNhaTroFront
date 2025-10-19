import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Typography, Button, Select, Card, Slider, message, Skeleton } from "antd";
import { DollarOutlined, HomeOutlined, PushpinOutlined, SyncOutlined } from "@ant-design/icons";
import RoomCard from "../components/RoomCard";
import { getAllRooms } from "../services/room";
import type { Room } from "../../../types/room";

const { Title, Text } = Typography;
const { Option } = Select;

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [selectedRoomStatus, setSelectedRoomStatus] = useState<string>("");

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getAllRooms();
        setRooms(data);

        if (data.length > 0) {
          const prices = data.map((r) => r.pricePerMonth);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setMinPrice(min);
          setMaxPrice(max);
          setPriceRange([min, max]);
        }
      } catch (error) {
        console.error("Lỗi khi tải phòng:", error);
        message.error("Không thể tải danh sách phòng!");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const inPriceRange =
        room.pricePerMonth >= priceRange[0] && room.pricePerMonth <= priceRange[1];
      const matchType = selectedRoomType ? room.type === selectedRoomType : true;
      const matchStatus = selectedRoomStatus ? room.status === selectedRoomStatus : true;
      return inPriceRange && matchType && matchStatus;
    });
  }, [rooms, priceRange, selectedRoomType, selectedRoomStatus]);

  const roomTypes = useMemo(() => {
    return [...new Set(rooms.map((r) => r.type))].filter(Boolean);
  }, [rooms]);

  const resetFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedRoomType("");
    setSelectedRoomStatus("");
  };

  if (loading) {
    return (
      <Row gutter={[24, 24]} justify="center" style={{ padding: "40px 0" }}>
        {Array(8).fill(0).map((_, i) => (
          <Col xs={24} sm={12} md={8} lg={6} key={i}>
            <Card hoverable style={{ borderRadius: 16 }}>
              <Skeleton.Image style={{ width: "100%", height: 160 }} active />
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <div style={{ padding: "24px 24px 60px", backgroundColor: "#f6f9ffff", }}>
      {/* Header */}
      <section style={{ textAlign: "center", marginBottom: 32 }}>
        <Title level={2} className="section-title" style={{ textAlign: "center" }}>
          DANH SÁCH PHÒNG TRỌ
        </Title>
      </section>

      {/* Filter Card */}
      <Card
        style={{
          marginBottom: 32,
          borderRadius: 16,
          boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
          transition: "all 0.3s",
        }}
        hoverable
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "flex-end",
          }}
        >
          {/* Price Slider */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              <DollarOutlined style={{ marginRight: 4, color: "#1677ff" }} />
              Khoảng giá
            </label>
            <Slider
              range
              min={minPrice}
              max={maxPrice}
              value={priceRange}
              tooltip={{ formatter: (value) => `${value} VND` }}
              onChange={(value) => setPriceRange(value as [number, number])}
            />
          </div>

          {/* Room Type */}
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              <HomeOutlined style={{ marginRight: 4, color: "#1677ff" }} />
              Loại phòng
            </label>
            <Select
              style={{ width: "100%", borderColor: "#1677ff" }}
              placeholder="Chọn loại phòng"
              value={selectedRoomType || undefined}
              onChange={setSelectedRoomType}
              allowClear
              size="large"
            >
              {roomTypes.map((type) => (
                <Option key={type} value={type}>
                  {type === "SINGLE"
                    ? "Phòng đơn"
                    : type === "DOUBLE"
                      ? "Phòng đôi"
                      : type === "DORM"
                        ? "Phòng dorm"
                        : "Phòng khác"}
                </Option>
              ))}
            </Select>
          </div>

          {/* Room Status */}
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              <PushpinOutlined style={{ marginRight: 4, color: "#1677ff" }} />
              Trạng thái
            </label>
            <Select
              style={{ width: "100%", borderColor: "#1677ff" }}
              placeholder="Chọn trạng thái"
              value={selectedRoomStatus || undefined}
              onChange={setSelectedRoomStatus}
              allowClear
              size="large"
            >
              <Option value="AVAILABLE">Còn trống</Option>
              <Option value="OCCUPIED">Đang thuê</Option>
              <Option value="MAINTENANCE">Bảo trì</Option>
            </Select>
          </div>

          {/* Reset Button */}
          <div style={{ flexShrink: 0 }}>
            <Button
              type="primary"
              size="large"
              className="btn-animated"
              onClick={resetFilters}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <SyncOutlined spin={hovered} />
            </Button>

          </div>
        </div>
      </Card>

      {/* Room List */}
      <Row gutter={[24, 24]} justify="center">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room, index) => (
            <Col
              xs={24} sm={12} md={8} lg={6}
              key={room._id}
              style={{
                opacity: 0,
                transform: "translateY(20px)",
                animation: `fadeInUp 0.5s forwards ${index * 0.1}s`
              }}
            >
              <RoomCard room={room} />
            </Col>
          ))
        ) : (
          <Col span={24}>
            <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
              <Title level={4}>Không tìm thấy phòng phù hợp</Title>
              <Text>Thử điều chỉnh bộ lọc hoặc xem tất cả phòng trọ</Text>
              <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={resetFilters}>
                  Xem tất cả phòng
                </Button>
              </div>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Rooms;