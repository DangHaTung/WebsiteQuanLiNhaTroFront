import SEO from "../components/Seo";
import { useState } from "react";

const Homeseo = () => {
  // Tự tạo data giả luôn trong file, không cần API
  const [rooms] = useState([
    { id: 1, title: "Phòng trọ full nội thất Q.7", price: "4.5 triệu", area: "25m²", location: "Quận 7, TP.HCM", image: "https://picsum.photos/400/300?random=1" },
    { id: 2, title: "Cho thuê phòng đẹp Gò Vấp", price: "3.8 triệu", area: "20m²", location: "Gò Vấp, TP.HCM", image: "https://picsum.photos/400/300?random=2" },
    { id: 3, title: "Phòng trọ sinh viên Bình Thạnh", price: "2.9 triệu", area: "18m²", location: "Bình Thạnh", image: "https://picsum.photos/400/300?random=3" },
    { id: 4, title: "Nhà trọ cao cấp Thủ Đức", price: "5.2 triệu", area: "30m²", location: "Thủ Đức", image: "https://picsum.photos/400/300?random=4" },
    { id: 5, title: "Phòng mới xây Tân Bình", price: "4 triệu", area: "22m²", location: "Tân Bình", image: "https://picsum.photos/400/300?random=5" },
    { id: 6, title: "Phòng trọ gần ĐH Quốc Gia", price: "3.2 triệu", area: "20m²", location: "Thủ Đức", image: "https://picsum.photos/400/300?random=6" },
  ]);

  const [search, setSearch] = useState("");

  const filteredRooms = rooms.filter(room =>
    room.title.toLowerCase().includes(search.toLowerCase()) ||
    room.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SEO
        title="Thuê Phòng Trọ Giá Rẻ Toàn Quốc - Tro365"
        description="Tìm phòng trọ nhanh, chính chủ, giá rẻ tại TP.HCM, Hà Nội, Đà Nẵng. Cập nhật tin mới mỗi ngày!"
        keywords="phòng trọ, thuê phòng, nhà trọ giá rẻ, phòng trọ sinh viên, tro365, phongtro123"
      />

      {/* Hero + Search */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Tìm Phòng Trọ Dễ Như Ăn Kẹo</h1>
          <p className="text-xl mb-8">Hơn 10.000+ tin đăng mới mỗi ngày</p>
          <input
            type="text"
            placeholder="Nhập quận, khu vực, tên đường..."
            className="w-full max-w-2xl px-6 py-4 rounded-full text-black text-lg outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Danh sách phòng */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">
          {search ? `Kết quả tìm kiếm cho "${search}"` : "Phòng trọ mới nhất"}
          <span className="text-blue-600 ml-3">({filteredRooms.length} phòng)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
              <img src={room.image} alt={room.title} className="w-full h-48 object-cover" />
              <div className="p-5">
                <h3 className="font-bold text-xl mb-2 line-clamp-2">{room.title}</h3>
                <p className="text-red-600 font-bold text-2xl mb-2">{room.price}</p>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>{room.area}</span>
                  <span>{room.location}</span>
                </div>
                <button className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">Không tìm thấy phòng trọ nào phù hợp</p>
            <p className="mt-4">Thử tìm với từ khóa khác nhé!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Homeseo;