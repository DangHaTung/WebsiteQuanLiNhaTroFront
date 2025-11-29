import "./Sitemap.css";

const Sitemap = () => {
  return (
    <div className="sitemap-container">
      <h1 className="sitemap-title">Sitemap</h1>

      <ul className="sitemap-list">
        <li><a href="/">Trang chủ</a></li>
        <li><a href="/phong-tro">Danh sách phòng trọ</a></li>
        <li><a href="/tin-tuc">Tin tức</a></li>
        <li><a href="/lien-he">Liên hệ</a></li>
      </ul>
    </div>
  );
};

export default Sitemap;
