import React, { useState, useEffect } from "react";
import SEO from "../components/Seo";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(true);

  const fakeRooms = [
    { id: 1, title: "Phòng trọ full nội thất Quận 7", price: 4800000, area: "26m²", district: "Quận 7" },
    { id: 2, title: "Phòng giá rẻ Bình Thạnh", price: 2900000, area: "20m²", district: "Bình Thạnh" },
    { id: 3, title: "Phòng cao cấp Gò Vấp", price: 6500000, area: "32m²", district: "Gò Vấp" },
    { id: 4, title: "Phòng mới Thủ Đức", price: 3700000, area: "23m²", district: "Thủ Đức" },
    { id: 5, title: "Phòng sinh viên Quận 10", price: 2400000, area: "18m²", district: "Quận 10" },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 700);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const filteredRooms = fakeRooms.filter(room => {
    const matchSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        room.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice = selectedPrice === "all" ||
                       (selectedPrice === "under3" && room.price < 3000000) ||
                       (selectedPrice === "3to5" && room.price >= 3000000 && room.price <= 5000000) ||
                       (selectedPrice === "above5" && room.price > 5000000);
    return matchSearch && matchPrice;
  });

  return (
    <>
      <SEO
        title="Tro360 - Tìm phòng trọ nhanh nhất TP.HCM"
        description="Tìm phòng trọ giá rẻ, uy tín tại TP.HCM chỉ trong vài giây."
        keywords="phong tro, thue phong, nha tro, tro360"
      />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", textAlign: "center", padding: "70px 20px" }}>
        <h1 style={{ fontSize: "42px", margin: "0 0 10px" }}>Tìm Phòng Trọ Dễ Dàng</h1>
        <p style={{ fontSize: "20px" }}>Hơn 500 phòng trọ đang chờ bạn!</p>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
        {/* Bộ lọc */}
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 8px 25px rgba(0,0,0,0.1)", margin: "-50px 0 40px", position: "relative" }}>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="text"
              placeholder="Nhập quận hoặc tiện ích..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "12px 16px", width: "300px", maxWidth: "100%", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
            />
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
            >
              <option value="all">Tất cả giá</option>
              <option value="under3">Dưới 3 triệu</option>
              <option value="3to5">3 - 5 triệu</option>
              <option value="above5">Trên 5 triệu</option>
            </select>
          </div>
          <p style={{ textAlign: "center", margin: "15px 0 0", color: "#555" }}>
            Tìm thấy <strong>{filteredRooms.length}</strong> phòng
          </p>
        </div>

        {/* Danh sách phòng */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: "320px", background: "#f0f0f0", borderRadius: "12px", animation: "pulse 1.5s infinite" }}></div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" }}>
            {filteredRooms.map(room => (
              <div
                key={room.id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                  transition: "0.3s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ height: "180px", background: "linear-gradient(45deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px", fontWeight: "bold" }}>
                  TRO360
                </div>
                <div style={{ padding: "16px" }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "#333" }}>{room.title}</h3>
                  <p style={{ margin: "8px 0", fontSize: "22px", color: "#e74c3c", fontWeight: "bold" }}>
                    {(room.price / 1000000).toFixed(1)} triệu/tháng
                  </p>
                  <p style={{ margin: "0", color: "#666" }}>{room.area} • {room.district}</p>
                  <button style={{ marginTop: "14px", width: "100%", padding: "10px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Không tìm thấy */}
        {!loading && filteredRooms.length === 0 && (
          <p style={{ textAlign: "center", fontSize: "20px", color: "#999", padding: "60px 0" }}>
            Không tìm thấy phòng trọ phù hợp 😔
          </p>
        )}
      </div>

      {/* Nút lên đầu trang */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            width: "50px",
            height: "50px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "50%",
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
          }}
        >
          ↑
        </button>
      )}

      {/* Hiệu ứng loading - KHÔNG LỖI */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Home;