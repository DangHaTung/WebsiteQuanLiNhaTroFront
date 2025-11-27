import React, { useState, useEffect } from "react";
import SEO from "../components/Seo";

const Home = () => {
  // State cho tìm kiếm nhanh
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Giả lập danh sách phòng trọ (vì không import file khác)
  const fakeRooms = [
    { id: 1, title: "Phòng trọ đầy đủ nội thất Quận 7", price: 4500000, area: "25m²", district: "Quận 7" },
    { id: 2, title: "Phòng trọ giá rẻ Bình Thạnh", price: 3000000, area: "20m²", district: "Bình Thạnh" },
    { id: 3, title: "Phòng trọ cao cấp Gò Vấp", price: 6000000, area: "30m²", district: "Gò Vấp" },
    { id: 4, title: "Phòng mới xây Thủ Đức", price: 3800000, area: "22m²", district: "Thủ Đức" },
    { id: 5, title: "Phòng trọ sinh viên Quận 10", price: 2500000, area: "18m²", district: "Quận 10" },
  ];

  // Lọc phòng theo từ khóa và giá
  const filteredRooms = fakeRooms.filter((room) => {
    const matchesSearch =
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice =
      selectedPrice === "all" ||
      (selectedPrice === "under3" && room.price <= 3000000) ||
      (selectedPrice === "3to5" && room.price > 3000000 && room.price <= 5000000) ||
      (selectedPrice === "above5" && room.price > 5000000);

    return matchesSearch && matchesPrice;
  });

  // Hiệu ứng hiện nút scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <SEO
        title="Trang chủ phòng trọ | Client"
        description="Trang tìm phòng trọ nhanh, uy tín dành cho khách hàng."
        keywords="phong tro, thue phong, nha tro, tro360"
      />

      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "10px" }}>
          Tìm Phòng Trọ Nhanh - Uy Tín - Giá Tốt
        </h1>
        <p style={{ textAlign: "center", color: "#7f8c8d", marginBottom: "30px" }}>
          Hơn 500+ phòng trọ đang chờ bạn khám phá!
        </p>

        {/* Thanh tìm kiếm nhanh */}
        <div style={{ marginBottom: "30px", display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
          <input
            type="text"
            placeholder="Nhập quận, khu vực hoặc tiện ích..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "12px 16px",
              width: "320px",
              maxWidth: "100%",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "16px",
            }}
          />

          <select
            value={selectedPrice}
            onChange={(e) => setSelectedPrice(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "16px",
            }}
          >
            <option value="all">Tất cả giá</option>
            <option value="under3">Dưới 3 triệu</option>
            <option value="3to5">3 - 5 triệu</option>
            <option value="above5">Trên 5 triệu</option>
          </select>
        </div>

        {/* Danh sách phòng */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div
                  style={{
                    height: "180px",
                    background: "#f0f0f0",
                    backgroundImage: `linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)`,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: "14px",
                  }}
                >
                  Ảnh phòng trọ (demo)
                </div>
                <div style={{ padding: "16px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#2c3e50" }}>
                    {room.title}
                  </h3>
                  <p style={{ margin: "8px 0", color: "#e74c3c", fontWeight: "bold", fontSize: "20px" }}>
                    {(room.price / 1000000).toFixed(1)} triệu/tháng
                  </p>
                  <p style={{ margin: "4px 0", color: "#7f8c8d" }}>
                    {room.area} • {room.district}
                  </p>
                  <button
                    style={{
                      marginTop: "12px",
                      padding: "10px 16px",
                      background: "#3498db",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      width: "100%",
                      fontWeight: "bold",
                    }}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#999", fontSize: "18px" }}>
              Không tìm thấy phòng trọ phù hợp
            </p>
          )}
        </div>

        {/* Nút scroll to top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              background: "#3498db",
              color: "white",
              border: "none",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              fontSize: "24px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              zIndex: 1000,
            }}
          >
            ↑
          </button>
        )}
      </div>
    </>
  );
};

export default Home;