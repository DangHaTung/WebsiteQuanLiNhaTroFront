import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Spin, Typography, Carousel, Button, Select, InputNumber, Card } from "antd";
import type { Room } from "../../../types/room";
import RoomCard from "../components/RoomCard";
import dbData from "../../../../db.json";
import banner1 from "../../../assets/images/banner1.png";
import banner2 from "../../../assets/images/banner2.png";
import banner3 from "../../../assets/images/banner3.png";

const { Title } = Typography;
const { Option } = Select;

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter states
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 50]);

  useEffect(() => {
    if (dbData && dbData.rooms) {
      const roomsData: Room[] = dbData.rooms.map((room: any) => ({
        _id: room._id,
        roomNumber: room.roomNumber,
        type: room.type as "SINGLE" | "DOUBLE" | "STUDIO" | "VIP",
        pricePerMonth: Number(room.pricePerMonth),
        areaM2: room.areaM2,
        floor: room.floor,
        district: room.district,
        status: room.status as "OCCUPIED" | "AVAILABLE" | "MAINTENANCE",
        image: room.image,
        images: room.images,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      }));

      setRooms(roomsData);
    } else {
      console.error("Không tìm thấy dữ liệu phòng trong db.json");
    }
    setLoading(false);
  }, []);

  // Filter logic
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Filter by district
      if (selectedDistrict && room.district !== selectedDistrict) {
        return false;
      }

      // Filter by price range
      if (room.pricePerMonth < priceRange[0] || room.pricePerMonth > priceRange[1]) {
        return false;
      }

      // Filter by room type
      if (selectedRoomType && room.type !== selectedRoomType) {
        return false;
      }

      // Filter by area range
      if (room.areaM2 < areaRange[0] || room.areaM2 > areaRange[1]) {
        return false;
      }

      return true;
    });
  }, [rooms, selectedDistrict, priceRange, selectedRoomType, areaRange]);

  // Get unique districts for filter options
  const districts = useMemo(() => {
    return [...new Set(rooms.map(room => room.district))].filter(Boolean);
  }, [rooms]);

  // Get unique room types for filter options
  const roomTypes = useMemo(() => {
    return [...new Set(rooms.map(room => room.type))].filter(Boolean);
  }, [rooms]);

  // Reset filters function
  const resetFilters = () => {
    setSelectedDistrict("");
    setPriceRange([0, 1000]);
    setSelectedRoomType("");
    setAreaRange([0, 50]);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải danh sách phòng..." />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Banner đầu trang */}
      <div className="full-width-banner">
        <Carousel autoplay dots effect="fade">
          {[banner1, banner2, banner3].map((img, idx) => (
            <div key={idx}>
              <div
                className="banner-slide"
                style={{
                  background: `url(${img}) center/cover no-repeat`,
                }}
              >
                <div className="banner-overlay">
                  <div className="banner-text animate-fadeUp">
                    <h1>
                      {idx === 0 && "Khám phá phòng trọ chất lượng cao"}
                      {idx === 1 && "Tìm phòng phù hợp với ngân sách của bạn"}
                      {idx === 2 && "Đặt phòng nhanh chóng và dễ dàng"}
                    </h1>
                    <p>
                      Khám phá danh sách phòng trọ đa dạng với đầy đủ tiện nghi và vị trí thuận lợi.
                    </p>
                    <Button type="primary" size="large" className="banner-btn">
                      Xem phòng ngay
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

<section className="section section-bg">
        <Title level={2} className="section-title" style={{ textAlign: "center" }}>
          DANH SÁCH PHÒNG TRỌ
        </Title>
        <p style={{ textAlign: "center", color: "#555", marginBottom: 24 }}>
          Khám phá các phòng trọ phù hợp với nhu cầu, vị trí và ngân sách của bạn
        </p>

     {/*Lọc phòng trọ*/}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔍</span>
              <span>Lọc phòng trọ</span>
            </div>
          }
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          headStyle={{
            borderBottom: "2px solid #f0f0f0",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "nowrap",
              overflowX: "auto",
              paddingBottom: 12,
            }}
          >
            {/* Khu vực */}
            <div
              style={{
                padding: 16,
                background: "#fafafa",
                borderRadius: 8,
                minWidth: 200,
                flexShrink: 0,
              }}
            >
              <label
                style={{
                  fontWeight: 500,
                  color: "#333",
                  marginBottom: 8,
                  display: "block",
                }}
              >
                📍 Khu vực
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn khu vực"
                value={selectedDistrict}
                onChange={setSelectedDistrict}
                allowClear
                size="middle"
              >
                {districts.map((district) => (
                  <Option key={district} value={district}>
                    {district}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Khoảng giá */}
            <div
              style={{
                padding: 16,
                background: "#fafafa",
                borderRadius: 8,
                minWidth: 220,
                flexShrink: 0,
              }}
            >
              <label
                style={{
                  fontWeight: 500,
                  color: "#333",
                  marginBottom: 8,
                  display: "block",
                }}
              >
                💰 Khoảng giá (VNĐ/tháng)
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn khoảng giá"
                value={`${priceRange[0]}-${priceRange[1]}`}
                onChange={(value) => {
                  if (value) {
                    const [min, max] = value.split("-").map(Number);
                    setPriceRange([min, max]);
                  }
                }}
                allowClear
                size="middle"
              >
                <Option value="0-400">Dưới 400k</Option>
                <Option value="400-500">400k - 500k</Option>
                <Option value="500-600">500k - 600k</Option>
                <Option value="600-700">600k - 700k</Option>
                <Option value="700-800">700k - 800k</Option>
                <Option value="800-1000">800k - 1 triệu</Option>
                <Option value="0-1000">Tất cả</Option>
              </Select>
            </div>

            {/* Loại phòng */}
            <div
              style={{
                padding: 16,
                background: "#fafafa",
                borderRadius: 8,
                minWidth: 180,
                flexShrink: 0,
              }}
            >
              <label
                style={{
                  fontWeight: 500,
                  color: "#333",
                  marginBottom: 8,
                  display: "block",
                }}
              >
                🏠 Loại phòng
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn loại phòng"
                value={selectedRoomType}
                onChange={setSelectedRoomType}
                allowClear
                size="middle"
              >
                {roomTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Diện tích */}
            <div
              style={{
                padding: 16,
                background: "#fafafa",
                borderRadius: 8,
                minWidth: 200,
                flexShrink: 0,
              }}
            >
              <label
                style={{
                  fontWeight: 500,
                  color: "#333",
                  marginBottom: 8,
                  display: "block",
                }}
              >
                📐 Diện tích (m²)
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn khoảng diện tích"
                value={`${areaRange[0]}-${areaRange[1]}`}
                onChange={(value) => {
                  if (value) {
                    const [min, max] = value.split("-").map(Number);
                    setAreaRange([min, max]);
                  }
                }}
                allowClear
                size="middle"
              >
                <Option value="0-20">Dưới 20m²</Option>
                <Option value="20-25">20 - 25m²</Option>
                <Option value="25-30">25 - 30m²</Option>
                <Option value="30-35">30 - 35m²</Option>
                <Option value="35-40">35 - 40m²</Option>
                <Option value="40-50">40 - 50m²</Option>
                <Option value="0-50">Tất cả</Option>
              </Select>
            </div>

            {/* Nút reset */}
            <div style={{ flexShrink: 0 }}>
              <Button
                onClick={resetFilters}
                type="default"
                size="middle"
                style={{
                  borderRadius: 6,
                  padding: "8px 24px",
                  background: "#fff",
                  fontWeight: 500,
                }}
              >
                🔄 Xóa bộ lọc
              </Button>
            </div>
          </div>
        </Card>

      {/* DANH SÁCH PHÒNG */}

        <Row gutter={[24, 24]} justify="center">
          {filteredRooms.slice(0, 6).map((room) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={room._id}>
              <RoomCard room={room} />
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
};

export default Rooms;
