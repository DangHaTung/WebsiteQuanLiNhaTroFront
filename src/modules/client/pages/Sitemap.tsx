import { useState } from "react";
import "./Sitemap.css";

const Sitemap = () => {
  const [search, setSearch] = useState("");

  const links = [
    { title: "Trang chủ", url: "/" },
    { title: "Danh sách phòng trọ Quận 1", url: "/phong-tro/q1" },
    { title: "Danh sách phòng trọ Quận 2", url: "/phong-tro/q2" },
    { title: "Danh sách phòng trọ Quận 3", url: "/phong-tro/q3" },
    { title: "Danh sách phòng trọ Quận 7", url: "/phong-tro/q7" },
    { title: "Danh sách phòng trọ Bình Thạnh", url: "/phong-tro/binh-thanh" },
    { title: "Tin tức mới", url: "/tin-tuc" },
    { title: "Tin tức sự kiện", url: "/tin-tuc/su-kien" },
    { title: "Liên hệ", url: "/lien-he" },
    { title: "Giới thiệu", url: "/gioi-thieu" },
    { title: "Hướng dẫn thuê phòng", url: "/huong-dan" },
    { title: "Câu hỏi thường gặp", url: "/faq" },
    { title: "Chính sách bảo mật", url: "/privacy" },
    { title: "Điều khoản dịch vụ", url: "/terms" },
    { title: "Đăng nhập / Đăng ký", url: "/auth" },
  ];

  // Filter theo search input
  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sitemap-container">
      <h1 className="sitemap-title">Sitemap</h1>

      <div className="sitemap-search">
        <input
          type="text"
          placeholder="Tìm kiếm link..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ul className="sitemap-list">
        {filteredLinks.length > 0 ? (
          filteredLinks.map((link, index) => (
            <li key={index}>
              <a href={link.url}>{link.title}</a>
            </li>
          ))
        ) : (
          <li>Không tìm thấy link phù hợp </li>
        )}
      </ul>
    </div>
  );
};

export default Sitemap;
