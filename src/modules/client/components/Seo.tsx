import { useEffect } from "react";

/**
 * Interface định nghĩa các props cho component SEO
 * - title: Tiêu đề trang (hiển thị trên tab trình duyệt)
 * - description: Mô tả trang (dùng cho SEO Google, Facebook...)
 * - keywords: Từ khóa tìm kiếm (ít tác dụng với Google hiện nay nhưng vẫn dùng cho một số công cụ)
 */
interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

/**
 * Component SEO - Tự động cập nhật <title> và các thẻ <meta> trong <head>
 * Dùng để tối ưu SEO và chia sẻ mạng xã hội (Open Graph sẽ thêm riêng nếu cần)
 */
const SEO = ({ title, description, keywords }: SEOProps) => {
  useEffect(() => {
    // === 1. Cập nhật tiêu đề trang (document.title) ===
    if (title) {
      document.title = title;
      // Một số trang còn muốn thêm tên thương hiệu phía sau
      // document.title = `${title} | Tro360`;
    }

    // === 2. Cập nhật thẻ meta description ===
    if (description) {
      let descTag = document.querySelector('meta[name="description"]');

      // Nếu chưa tồn tại thẻ meta description thì tạo mới
      if (!descTag) {
        descTag = document.createElement("meta");
        descTag.setAttribute("name", "description");
        document.head.appendChild(descTag);
      }

      // Gán nội dung description
      descTag.setAttribute("content", description);
    }

    // === 3. Cập nhật thẻ meta keywords (tùy chọn) ===
    if (keywords) {
      let keyTag = document.querySelector('meta[name="keywords"]');

      // Nếu chưa có thì tạo mới
      if (!keyTag) {
        keyTag = document.createElement("meta");
        keyTag.setAttribute("name", "keywords");
        document.head.appendChild(keyTag);
      }

      // Gán danh sách từ khóa (các từ cách nhau bằng dấu phẩy)
      keyTag.setAttribute("content", keywords);
    }

    // Cleanup: Khi component unmount hoặc props thay đổi, có thể reset về giá trị mặc định
    // (Tùy dự án, ở đây không bắt buộc vì mỗi trang sẽ gọi SEO riêng)
  }, [title, description, keywords]); // Chỉ chạy lại khi các props này thay đổi

  // Component này không render gì ra UI
  return null;
};

export default SEO;