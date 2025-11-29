
import Seoroomdetail from "../components/Seoroomdetail"; // import SEO

interface Room {
  title: string;
  description: string;
  price: number;
  currency?: string;
  area: string;
  image: string;
}

const roomData: Room = {
  title: "Phòng trọ full nội thất Q.7",
  description: "Phòng trọ đầy đủ nội thất, có máy lạnh, tủ quần áo, gần chợ và siêu thị.",
  price: 3500000,
  currency: "VND",
  area: "25m²",
  image: "https://placehold.co/600x400",
};

export default function RoomDetail() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* SEO */}
      <Seoroomdetail
        title={roomData.title}
        description={roomData.description}
        image={roomData.image}
      />

      {/* Hình ảnh */}
      <img
        src={roomData.image}
        alt={roomData.title}
        className="w-full h-80 object-cover rounded-md mb-4"
      />

      {/* Thông tin phòng */}
      <h1 className="text-2xl font-bold mb-2">{roomData.title}</h1>
      <p className="text-gray-600 mb-2">
        Diện tích: {roomData.area} | Giá: {roomData.price.toLocaleString()} {roomData.currency}
      </p>
      <p className="mb-4">{roomData.description}</p>

      {/* Button liên hệ */}
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Liên hệ ngay
      </button>
    </div>
  );
}
