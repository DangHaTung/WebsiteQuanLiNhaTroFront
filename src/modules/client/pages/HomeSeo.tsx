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
    const matchSearch =
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice =
      selectedPrice === "all" ||
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

      {/* HERO */}
      <div className="hero">
        <h1 className="hero-title">Tìm Phòng Trọ Dễ Dàng</h1>
        <p className="hero-sub">Hơn 500 phòng trọ đang chờ bạn!</p>
      </div>

      <div className="container">
        {/* FILTER */}
        <div className="filter-box">
          <div className="filter-row">
            <input
              type="text"
              placeholder="Nhập quận hoặc tiện ích..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />

            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả giá</option>
              <option value="under3">Dưới 3 triệu</option>
              <option value="3to5">3 - 5 triệu</option>
              <option value="above5">Trên 5 triệu</option>
            </select>
          </div>

          <p className="filter-info">
            Tìm thấy <strong>{filteredRooms.length}</strong> phòng
          </p>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton"></div>
            ))}
          </div>
        ) : (
          <div className="grid">
            {filteredRooms.map((room) => (
              <div className="card" key={room.id}>
                <div className="card-img">TRO360</div>
                <div className="card-body">
                  <h3 className="card-title">{room.title}</h3>
                  <p className="card-price">
                    {(room.price / 1000000).toFixed(1)} triệu/tháng
                  </p>
                  <p className="card-area">
                    {room.area} • {room.district}
                  </p>
                  <button className="card-btn">Xem chi tiết</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredRooms.length === 0 && (
          <p className="no-result">Không tìm thấy phòng trọ phù hợp 😔</p>
        )}
      </div>

      {showScrollTop && (
        <button className="scroll-top" onClick={scrollToTop}>
          ↑
        </button>
      )}

      {/* CSS GỘP CHUNG */}
      <style>{`
        .hero {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          text-align: center;
          padding: 70px 20px;
        }
        .hero-title {
          font-size: 42px;
          margin-bottom: 10px;
        }
        .hero-sub {
          font-size: 20px;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .filter-box {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          margin: -50px 0 40px;
          text-align: center;
        }
        .filter-row {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .filter-input, .filter-select {
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 16px;
        }
        .filter-input {
          width: 300px;
          max-width: 100%;
        }
        .filter-info {
          margin-top: 15px;
          color: #555;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 25px;
        }

        .card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          transition: .3s;
        }
        .card:hover {
          transform: translateY(-8px);
        }
        .card-img {
          height: 180px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          font-size: 18px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-body {
          padding: 16px;
        }
        .card-title {
          font-size: 18px;
          margin-bottom: 8px;
        }
        .card-price {
          color: #e74c3c;
          font-size: 22px;
          font-weight: bold;
          margin: 8px 0;
        }
        .card-area {
          color: #666;
        }
        .card-btn {
          margin-top: 14px;
          width: 100%;
          padding: 10px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .skeleton {
          height: 320px;
          background: #f0f0f0;
          border-radius: 12px;
          animation: pulse 1.5s infinite;
        }

        .no-result {
          text-align: center;
          font-size: 20px;
          color: #999;
          padding: 60px 0;
        }

        .scroll-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Home;
