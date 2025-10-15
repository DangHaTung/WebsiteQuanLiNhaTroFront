import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Spin, Typography, Carousel, Button, Select, Card } from "antd";
import type { Room } from "../../../types/room";
import RoomCard from "../components/RoomCard";
import dbData from "../../../../db.json";
import banner1 from "../../../assets/images/banner1.png";
import banner2 from "../../../assets/images/banner2.png";
import banner3 from "../../../assets/images/banner3.png";

const { Title, Text } = Typography;
const { Option } = Select;

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([1000000, 25000000]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");

  useEffect(() => {
    if (dbData && dbData.rooms) {
      const roomsData: Room[] = dbData.rooms.map((room: any) => ({
        _id: typeof room._id === 'object' ? room._id.$oid : room._id || `room_${Math.random().toString(36).substr(2, 9)}`,
        roomNumber: room.roomNumber,
        type: room.type as "SINGLE" | "DOUBLE" | "DORM",
        pricePerMonth: Number(room.pricePerMonth),
        areaM2: room.areaM2,
        floor: room.floor,
        district: room.district,
        status: room.status as "AVAILABLE" | "OCCUPIED" | "MAINTENANCE",
        image: room.coverImageUrl || room.image || "",
        images: room.images?.map((img: any) => img.url || img) || [],
        createdAt: typeof room.createdAt === 'object' ? room.createdAt.$date : room.createdAt || new Date().toISOString(),
        updatedAt: room.updatedAt || new Date().toISOString(),
        currentContractSummary: room.currentContractSummary ? {
          contractId: room.currentContractSummary.contractId || "",
          tenantName: room.currentContractSummary.tenantName || "",
          startDate: room.currentContractSummary.startDate || "",
          endDate: room.currentContractSummary.endDate || "",
          monthlyRent: typeof room.currentContractSummary.monthlyRent === 'object'
            ? String(room.currentContractSummary.monthlyRent.$numberDecimal || 0)
            : String(room.currentContractSummary.monthlyRent || 0)
        } : undefined
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
      // Filter by price range
      if (room.pricePerMonth < priceRange[0] || room.pricePerMonth > priceRange[1]) {
        return false;
      }

      // Filter by room type
      if (selectedRoomType && room.type !== selectedRoomType) {
        return false;
      }

      return true;
    });
  }, [rooms, priceRange, selectedRoomType]);

  // Get unique room types for filter options
  const roomTypes = useMemo(() => {
    return [...new Set(rooms.map(room => room.type))].filter(Boolean);
  }, [rooms]);

  // Reset filters function
  const resetFilters = () => {
    setPriceRange([1000000, 25000000]);
    setSelectedRoomType("");
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
          Khám phá tất cả các phòng trọ phù hợp với nhu cầu, vị trí và ngân sách của bạn
        </p>
        {/* Lọc phòng trọ */}
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
              flexWrap: "wrap",
              padding: "16px 0",
            }}
          >
            {/* Bộ lọc chính - nằm ngang */}
            <div style={{ display: "flex", gap: 16, flex: 1, alignItems: "flex-end" }}>
              {/* Khoảng giá */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <label
                  style={{
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: 8,
                    display: "block",
                    fontSize: "14px",
                  }}
                >
                  💰 Khoảng giá
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
                  size="large"
                  dropdownStyle={{ minWidth: 200 }}
                >
                  <Option value="1000000-5000000">1 - 5 triệu</Option>
                  <Option value="5000000-7500000">5 - 7.5 triệu</Option>
                  <Option value="7500000-10000000">7.5 - 10 triệu</Option>
                  <Option value="10000000-12500000">10 - 12.5 triệu</Option>
                  <Option value="12500000-15000000">12.5 - 15 triệu</Option>
                  <Option value="15000000-20000000">15 - 20 triệu</Option>
                  <Option value="20000000-25000000">20 - 25 triệu</Option>
                  <Option value="1000000-25000000">Tất cả</Option>
                </Select>
              </div>

              {/* Loại phòng */}
              <div style={{ flex: 1, minWidth: 150 }}>
                <label
                  style={{
                    fontWeight: 500,
                    color: "#333",
                    marginBottom: 8,
                    display: "block",
                    fontSize: "14px",
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
                  size="large"
                  dropdownStyle={{ minWidth: 150 }}
                >
                  {roomTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type === 'SINGLE' ? 'Phòng đơn' :
                       type === 'DOUBLE' ? 'Phòng đôi' :
                       type === 'DORM' ? 'Phòng dorm' : 'Phòng khác'}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Nút reset - nằm bên phải */}
            <div style={{ flexShrink: 0 }}>
              <Button
                onClick={resetFilters}
                type="default"
                size="large"
                style={{
                  borderRadius: 8,
                  padding: "0 24px",
                  background: "#fff",
                  fontWeight: 500,
                  height: "40px",
                  border: "1px solid #d9d9d9",
                }}
              >
                🔄 Xóa bộ lọc
              </Button>
            </div>
          </div>

          {/* Hiển thị số phòng tìm được */}
          
        </Card>

        {/* DANH SÁCH PHÒNG */}

        <Row gutter={[24, 24]} justify="center">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={room._id}>
                <RoomCard room={room} />
              </Col>
            ))
          ) : (
            <Col span={24}>
              <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
                <h3>Không tìm thấy phòng phù hợp</h3>
                <p>Thử điều chỉnh bộ lọc hoặc xem tất cả phòng trọ</p>
                <Button type="primary" onClick={resetFilters} className="btn-animated">
                  Xem tất cả phòng
                </Button>
              </div>
            </Col>
          )}
        </Row>
      </section>
    </div>
  );
};

export default Rooms;
