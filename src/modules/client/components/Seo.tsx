import { useEffect } from "react";

// Định nghĩa kiểu dữ liệu cho props của component SEO
interface SEOProps {
  title?: string;       // Tiêu đề trang (hiển thị trên tab trình duyệt)
  description?: string; // Mô tả trang (dùng cho Google, Facebook...)
  keywords?: string;    // Từ khóa SEO (cũ nhưng một số web vẫn dùng)
}

// Component SEO - giúp tối ưu thẻ <title>, <meta description>, <meta keywords>
const SEO = ({ title, description, keywords }: SEOProps) => {
  useEffect(() => {
    // Cập nhật tiêu đề trang (thẻ <title>)
    if (title) {
      document.title = title; // Thay đổi trực tiếp title của trang
      // Bonus: Cập nhật cả title cho og:title (Facebook, Zalo...)
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", title);
    }

    // Cập nhật thẻ meta description
    if (description) {
      let descTag = document.querySelector('meta[name="description"]');
      // Nếu chưa có thẻ meta description thì tạo mới
      if (!descTag) {
        descTag = document.createElement("meta");
        descTag.setAttribute("name", "description");
        document.head.appendChild(descTag); // Thêm vào <head>
      }
      // Gán nội dung mô tả
      descTag.setAttribute("content", description);

      // Đồng bộ với og:description (dùng khi share link)
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", description);
    }

    // Cập nhật thẻ meta keywords (dù Google bỏ nhưng vẫn để cho chắc)
    if (keywords) {
      let keyTag = document.querySelector('meta[name="keywords"]');
      // Nếu chưa có thì tạo mới
      if (!keyTag) {
        keyTag = document.createElement("meta");
        keyTag.setAttribute("name", "keywords");
        document.head.appendChild(keyTag);
      }
      // Gán danh sách từ khóa
      keyTag.setAttribute("content", keywords);
    }
  }, [title, description, keywords]); // Chỉ chạy lại khi 1 trong 3 props thay đổi

  // Component này không render gì ra giao diện cả
  // Chỉ dùng để thay đổi thẻ <head> nên return null
  return null;
};

export default SEO;