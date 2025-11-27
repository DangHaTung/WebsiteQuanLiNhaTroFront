import SEO from "../components/Seo";
import { useState, useEffect } from "react";

const Homeseo = () => {
  // Dữ liệu phòng trọ giả (có thêm field mới: isNew, isVip)
  const [rooms] = useState([
    { id: 1, title: "Phòng trọ full nội thất Q.7", price: "4.5 triệu", area: "25m²", location: "Quận 7, TP.HCM", image: "https://picsum.photos/400/300?random=1", isNew: true, isVip: true },
    { id: 2, title: "Cho thuê phòng đẹp Gò Vấp", price: "3.8 triệu", area: "20m²", location: "Gò Vấp, TP.HCM", image: "https://picsum.photos/400/300?random=2", isNew: false, isVip: true },
    { id: 3, title: "Phòng trọ sinh viên Bình Thạnh", price: "2.9 triệu", area: "18m²", location: "Bình Thạnh", image: "https://picsum.photos/400/300?random=3", isNew: true, isVip: false },
    { id: 4, title: "Nhà trọ cao cấp Thủ Đức", price: "5.2 triệu", area: "30m²", location: "Thủ Đức", image: "https://picsum.photos/400/300?random=4", isNew: false, isVip: true },
    { id: 5, title: "Phòng mới xây Tân Bình", price: "4 triệu", area: "22m²", location: "Tân Bình", image: "https://picsum.photos/400/300?random=5", isNew: true, isVip: false },
    { id: 6, title: "Phòng trọ gần ĐH Quốc Gia", price: "3.2 triệu", area: "20m²", location: "Thủ Đức", image: "https://picsum.photos/400/300?random=6", isNew: false, isVip: false },
  ]);

  // State tìm kiếm + lọc
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all"); // all, under3, 3to5, over5
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null); // Xem chi tiết (modal)
  const [favorites, setFavorites] = useState<number[]>([]); // Yêu thích (lưu localStorage)

  // Load yêu thích từ localStorage khi mở trang
  useEffect(() => {
    const saved = localStorage.getItem("favoriteRooms");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Lưu yêu thích khi thay đổi
  useEffect(() => {
    localStorage.setItem("favoriteRooms", JSON.stringify(favorites));
  }, [favorites]);

  // Toggle yêu thích
  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Lọc phòng theo giá
  const getPriceNumber = (price: string) => parseFloat(price.replace(/[^\d.]/g, ""));
  
  const filteredRooms = rooms
    .filter(room => {
      const matchesSearch = room.title.toLowerCase().includes(search.toLowerCase()) ||
                           room.location.toLowerCase().includes(search.toLowerCase());
      
      let matchesPrice = true;
      const priceNum = getPriceNumber(room.price);
      if (priceFilter === "under3") matchesPrice = priceNum < 3;
      if (priceFilter === "3to5") matchesPrice = priceNum >= 3 && priceNum <= 5;
      if (priceFilter === "over5") matchesPrice = priceNum > 5;

      return matchesSearch && matchesPrice;
    });

  return (
    <>
      <SEO
        title="Thuê Phòng Trọ Giá Rẻ Toàn Quốc - Tro360"
        description="Tìm phòng trọ nhanh, chính chủ, giá rẻ tại TP.HCM, Hà Nội, Đà Nẵng. Hơn 10.000 tin mới mỗi ngày!"
        keywords="phòng trọ, thuê phòng, nhà trọ giá rẻ, phòng trọ sinh viên, tro360, phongtro123"
      />

      {/* Hero + Search */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Tìm Phòng Trọ Dễ Như Ăn Kẹo</h1>
          <p className="text-xl mb-8">Hơn 10.000+ tin đăng mới • Chính chủ • Không trung gian</p>
          <input
            type="text"
            placeholder="Nhập quận, khu vực, tên đường..."
            className="w-full max-w-2xl px-6 py-4 rounded-full text-black text-lg outline-none shadow-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Bộ lọc giá nhanh */}
      <div className="bg-gray-100 py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-3 items-center">
          <span className="font-semibold">Lọc theo giá:</span>
          <button onClick={() => setPriceFilter("all")} className={`px-5 py-2 rounded-full ${priceFilter === "all" ? "bg-blue-600 text-white" : "bg-white"}`}>Tất cả</button>
          <button onClick={() => setPriceFilter("under3")} className={`px-5 py-2 rounded-full ${priceFilter === "under3" ? "bg-blue-600 text-white" : "bg-white"}`}>Dưới 3 triệu</button>
          <button onClick={() => setPriceFilter("3to5")} className={`px-5 py-2 rounded-full ${priceFilter === "3to5" ? "bg-blue-600 text-white" : "bg-white"}`}>3 - 5 triệu</button>
          <button onClick={() => setPriceFilter("over5")} className={`px-5 py-2 rounded-full ${priceFilter === "over5" ? "bg-blue-600 text-white" : "bg-white"}`}>Trên 5 triệu</button>
          <span className="ml-auto text-gray-600">{filteredRooms.length} phòng phù hợp</span>
        </div>
      </div>

      {/* Danh sách phòng */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          {search ? `Tìm thấy cho "${search}"` : "Phòng trọ nổi bật nhất"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 ${room.isVip ? "ring-4 ring-yellow-400 ring-opacity-50" : ""}`}
            >
              <div className="relative">
                <img src={room.image} alt={room.title} className="w-full h-56 object-cover" />
                {room.isNew && (
                  <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">MỚI</span>
                )}
                {room.isVip && (
                  <span className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">VIP</span>
                )}
                <button
                  onClick={() => toggleFavorite(room.id)}
                  className="absolute top-3 right-12 bg-white bg-opacity-80 p-2 rounded-full"
                >
                  {favorites.includes(room.id) ? "❤️" : "♡"}
                </button>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 line-clamp-2 text-gray-800">{room.title}</h3>
                <p className="text-red-600 font-bold text-3xl mb-3">{room.price}/tháng</p>
                <div className="flex justify-between text-gray-600 text-sm mb-4">
                  <span className="flex items-center"><span className="mr-1">Diện tích</span> {room.area}</span>
                  <span className="flex items-center"><span className="mr-1">Vị trí</span> {room.location}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRoom(room.id)}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Xem chi tiết
                  </button>
                  <button className="px-4 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                    Gọi ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal xem chi tiết */}
        {selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoom(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const room = rooms.find(r => r.id === selectedRoom);
                return room ? (
                  <>
                    <img src={room.image} alt={room.title} className="w-full h-96 object-cover rounded-t-2xl" />
                    <div className="p-8">
                      <h2 className="text-3xl font-bold mb-4">{room.title}</h2>
                      <p className="text-4xl font-bold text-red-600 mb-4">{room.price}/tháng</p>
                      <div className="grid grid-cols-2 gap-4 text-lg mb-6">
                        <div><strong>Diện tích:</strong> {room.area}</div>
                        <div><strong>Vị trí:</strong> {room.location}</div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        Phòng trọ đầy đủ nội thất, sạch sẽ, an ninh tốt. Gần chợ, siêu thị, trường học. 
                        Chủ nhà thân thiện, hỗ trợ 24/7. Có chỗ để xe miễn phí.
                      </p>
                      <div className="flex gap-4 mt-8">
                        <button className="flex-1 bg-green-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-green-700">
                          Gọi chủ nhà: 090xxxxxxx
                        </button>
                        <button onClick={() => setSelectedRoom(null)} className="px-8 bg-gray-300 rounded-xl font-bold">
                          Đóng
                        </button>
                      </div>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {filteredRooms.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">Không tìm thấy phòng nào</p>
            <p className="text-xl text-gray-600">Thử thay đổi từ khóa hoặc bộ lọc nhé!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Homeseo;