import React, { useState } from "react";
import Seoroomdetail from "../components/Seoroomdetail"; // SEO

interface Room {
  title: string;
  description: string;
  price: number;
  currency?: string;
  area: string;
  images: string[];
  amenities?: string[];
}

const roomData: Room = {
  title: "Phòng trọ full nội thất Q.7",
  description:
    "Phòng trọ đầy đủ nội thất: máy lạnh, tủ quần áo, bàn ghế, gần chợ và siêu thị. An ninh tốt, khu dân cư yên tĩnh.",
  price: 3500000,
  currency: "VND",
  area: "25m²",
  images: [
    "https://placehold.co/600x400",
    "https://placehold.co/600x400/ff7f7f",
    "https://placehold.co/600x400/7fbfff",
  ],
  amenities: ["Máy lạnh", "Tủ quần áo", "Bàn ghế", "Wifi miễn phí"],
};

export default function RoomDetail() {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % roomData.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? roomData.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* SEO */}
      <Seoroomdetail
        title={roomData.title}
        description={roomData.description}
        image={roomData.images[0]}
      />

      {/* Slider ảnh */}
      <div className="relative mb-4">
        <img
          src={roomData.images[currentImage]}
          alt={roomData.title}
          className="w-full h-80 object-cover rounded-md"
        />
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100"
        >
          ◀
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100"
        >
          ▶
        </button>
      </div>

      {/* Thông tin phòng */}
      <h1 className="text-3xl font-bold mb-2">{roomData.title}</h1>
      <p className="text-gray-600 mb-2">
        Diện tích: {roomData.area} | Giá:{" "}
        {roomData.price.toLocaleString()} {roomData.currency}
      </p>

      {/* Tiện ích */}
      {roomData.amenities && (
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Tiện ích:</h2>
          <ul className="list-disc list-inside text-gray-700">
            {roomData.amenities.map((amenity, index) => (
              <li key={index}>{amenity}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mô tả */}
      <p className="mb-6">{roomData.description}</p>

      {/* Button liên hệ */}
      <button className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-600 transition">
        Liên hệ ngay
      </button>
    </div>
  );
}
