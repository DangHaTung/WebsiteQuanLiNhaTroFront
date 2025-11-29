import { useState } from "react";
import "./Sitemap.css";

const Sitemap = () => {
  const [search, setSearch] = useState("");

  const links = [
    { title: "Trang chủ", url: "/" },
    { title: "Danh sách phòng trọ", url: "/phongtro" },
    { title: "Tin tức", url: "/tintuc" },
    { title: "Liên hệ", url: "/lienhe" },
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
          <li>Không tìm thấy link phù hợp 😔</li>
        )}
      </ul>
    </div>
  );
};

export default Sitemap;
