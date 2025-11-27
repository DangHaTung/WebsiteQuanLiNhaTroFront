import { useEffect } from "react"; // commit: import useEffect từ React để chạy side-effect

interface SEOProps { // commit: định nghĩa interface props cho SEO
  title?: string;      // commit: title của trang
  description?: string; // commit: meta description
  keywords?: string;    // commit: meta keywords
}

const SEO = ({ title, description, keywords }: SEOProps) => { // commit: tạo component SEO nhận props title, description, keywords
  useEffect(() => { // commit: useEffect để cập nhật title/meta khi render
    // Title
    if (title) document.title = title; // commit: cập nhật document.title nếu props title tồn tại

    // Meta description
    if (description) { // commit: kiểm tra props description
      let descTag = document.querySelector('meta[name="description"]'); // commit: tìm meta description hiện có
      if (!descTag) { // commit: nếu không tồn tại, tạo mới meta description
        descTag = document.createElement("meta"); // commit: tạo thẻ meta
        descTag.setAttribute("name", "description"); // commit: gán thuộc tính name="description"
        document.head.appendChild(descTag); // commit: thêm thẻ meta vào head
      }
      descTag.setAttribute("content", description); // commit: cập nhật nội dung description
    }

    // Meta keywords
    if (keywords) { // commit: kiểm tra props keywords
      let keyTag = document.querySelector('meta[name="keywords"]'); // commit: tìm meta keywords hiện có
      if (!keyTag) { // commit: nếu chưa có, tạo mới
        keyTag = document.createElement("meta"); // commit: tạo thẻ meta
        keyTag.setAttribute("name", "keywords"); // commit: gán thuộc tính name="keywords"
        document.head.appendChild(keyTag); // commit: thêm vào head
      }
      keyTag.setAttribute("content", keywords); // commit: cập nhật nội dung keywords
    }
  }, [title, description, keywords]); // commit: chạy lại effect khi title, description hoặc keywords thay đổi

  return null; // commit: không render UI, chỉ cập nhật head
};

export default SEO; // commit: export component SEO để sử dụng ở các page
