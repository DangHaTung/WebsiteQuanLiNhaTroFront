import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Skeleton, Card, Alert, Select, Button, Spin } from "antd";
import type { Room } from "../../../types/room";
import RoomCard from "../components/RoomCard";

const { Title, Paragraph } = Typography;
const { Option } = Select;

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorRooms, setErrorRooms] = useState<string | null>(null);

  // Bộ lọc state
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [areaRange, setAreaRange] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");

  useEffect(() => {
    fetch("/db.json")
      .then((res) => res.json())
      .then((data) => {
        const roomData = data.rooms || [];
        setRooms(roomData);
        setFilteredRooms(roomData);
      })
      .catch((err) => {
        console.error("Lỗi khi đọc db.json:", err);
        setErrorRooms("Không tải được danh sách phòng. Vui lòng thử lại sau.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Logic lọc sản phẩm
  useEffect(() => {
    let filtered = rooms;

    // Lọc theo quận
    if (selectedDistrict) {
      filtered = filtered.filter(room => room.district === selectedDistrict);
    }

    // Lọc theo khoảng giá
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(room => {
        const price = parseFloat(room.pricePerMonth as string);
        return price >= min && price <= max;
      });
    }

    // Lọc theo diện tích
    if (areaRange) {
      const [min, max] = areaRange.split('-').map(Number);
      filtered = filtered.filter(room => {
        const area = room.areaM2;
        return area >= min && area <= max;
      });
    }

    // Sắp xếp
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => parseFloat(a.pricePerMonth as string) - parseFloat(b.pricePerMonth as string));
          break;
        case 'price-desc':
          filtered.sort((a, b) => parseFloat(b.pricePerMonth as string) - parseFloat(a.pricePerMonth as string));
          break;
        case 'area-asc':
          filtered.sort((a, b) => a.areaM2 - b.areaM2);
          break;
        case 'area-desc':
          filtered.sort((a, b) => b.areaM2 - a.areaM2);
          break;
      }
    }

    setFilteredRooms(filtered);
  }, [rooms, selectedDistrict, priceRange, areaRange, sortBy]);

  // Lấy danh sách quận unique từ dữ liệu thực tế
  const districts = [...new Set(rooms.map(room => room.district))];

  if (loading)
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16, color: "#6b7280" }}>
            Đang tải danh sách phòng...
          </Title>
        </div>
      </div>
    );

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* HERO SECTION */}
      <div
        style={{
          position: "relative",
          height: 320,
          width: "100%",
          overflow: "hidden",
          background: `url(https://tse1.mm.bing.net/th/id/OIP.PjLbb9MJwZxukEg2tbOKYAHaFj) center/cover no-repeat`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          marginBottom: 48,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1,
          }}
        />
        <div style={{ position: "relative", zIndex: 2, color: "white", padding: "0 24px" }}>
          <Title level={1} style={{ color: "white", marginBottom: 12 }}>
            Danh Sách Phòng Trọ
          </Title>
          <Paragraph style={{ color: "#f3f4f6", fontSize: 16, maxWidth: 640, margin: "0 auto" }}>
            Khám phá các phòng trọ chất lượng với đầy đủ thông tin, hình ảnh chi tiết và giá hợp lý.
          </Paragraph>
        </div>
      </div>

      {/* DANH SÁCH PHÒNG */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Bộ lọc sản phẩm */}
        <style>
          {`
            .ant-select-khuvuc .ant-select-selector {
              font-weight: bold;
            }
            .ant-select-khuvuc .ant-select-selector::placeholder {
              font-weight: bold !important;
              color: #1f2937 !important;
              opacity: 0.8;
            }
          `}
        </style>
        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Khu vực:</span>
            <Select
              placeholder="Chọn khu vực"
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              style={{ width: 150 }}
              allowClear
              className="ant-select-khuvuc"
            >
              {districts.map(district => (
                <Option key={district} value={district}>{district}</Option>
              ))}
            </Select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Giá:</span>
            <Select
              placeholder="Chọn khoảng giá"
              value={priceRange}
              onChange={setPriceRange}
              style={{ width: 150 }}
            >
              <Option value="">Tất cả giá</Option>
              <Option value="0-400">Dưới 400</Option>
              <Option value="400-600">400 - 600</Option>
              <Option value="600-800">600 - 800</Option>
              <Option value="800-1000">800 - 1000</Option>
            </Select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Diện tích:</span>
            <Select
              placeholder="Chọn diện tích"
              value={areaRange}
              onChange={setAreaRange}
              style={{ width: 150 }}
            >
              <Option value="">Tất cả diện tích</Option>
              <Option value="0-25">Dưới 25m²</Option>
              <Option value="25-35">25 - 35m²</Option>
              <Option value="35-50">Trên 35m²</Option>
            </Select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Sắp xếp:</span>
            <Select
              placeholder="Sắp xếp theo"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 150 }}
            >
              <Option value="">Mặc định</Option>
              <Option value="price-asc">Giá tăng dần</Option>
              <Option value="price-desc">Giá giảm dần</Option>
              <Option value="area-asc">Diện tích tăng dần</Option>
              <Option value="area-desc">Diện tích giảm dần</Option>
            </Select>
          </div>

          <Button type="primary" onClick={() => {
            setSelectedDistrict("");
            setPriceRange("");
            setAreaRange("");
            setSortBy("");
          }}>
            Xóa bộ lọc
          </Button>
        </div>

        {errorRooms && (
          <Alert
            style={{ marginBottom: 24, maxWidth: 600, marginInline: "auto" }}
            type="error"
            showIcon
            message={errorRooms}
          />
        )}

        {loading ? (
          <Row gutter={[24, 24]} justify="center">
            {Array.from({ length: 6 }).map((_, i) => (
              <Col xs={24} sm={12} md={12} lg={6} key={`sk-${i}`}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <Skeleton.Image
                    active
                    style={{ width: "100%", height: 200, borderRadius: 8 }}
                  />
                  <Skeleton
                    active
                    paragraph={{ rows: 2 }}
                    title
                    style={{ marginTop: 16 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[24, 24]} justify="center">
            {filteredRooms.map((room) => (
              <Col xs={24} sm={12} md={12} lg={6} key={room._id}>
                <RoomCard room={room} />
              </Col>
            ))}
          </Row>
        )}

        {!loading && filteredRooms.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Title level={4} style={{ color: "#6b7280", marginBottom: 16 }}>
              Không tìm thấy phòng nào
            </Title>
            <Paragraph style={{ color: "#9ca3af" }}>
              Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.
            </Paragraph>
          </div>
        )}
      </section>
    </div>
  );
};

export default Rooms;
