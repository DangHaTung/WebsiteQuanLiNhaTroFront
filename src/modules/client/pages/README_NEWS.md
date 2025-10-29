# Chức năng Tin tức & Mẹo thuê trọ

## Tổng quan
Chức năng "Tin tức & Mẹo thuê trọ" được thiết kế để cung cấp thông tin hữu ích, mẹo vặt và hướng dẫn cho người dùng trong việc thuê phòng trọ.

## Cấu trúc file

### 1. Trang chính
- **`News.tsx`** - Trang danh sách tin tức với tìm kiếm và lọc
- **`NewsDetail.tsx`** - Trang chi tiết bài viết

### 2. Component
- **`NewsCard.tsx`** - Component hiển thị thẻ tin tức

### 3. Styling
- **`news.css`** - CSS cho trang tin tức
- **`about.css`** - CSS cho trang giới thiệu
- **`contact.css`** - CSS cho trang liên hệ

## Tính năng chính

### Trang Tin tức (`/news`)
- ✅ Hiển thị danh sách tin tức dạng grid
- ✅ Tìm kiếm theo tiêu đề, nội dung và tags
- ✅ Lọc theo danh mục (Tin tức, Mẹo thuê trọ, Hướng dẫn, Thông báo)
- ✅ Phân trang
- ✅ Responsive design
- ✅ Loading states và empty states

### Trang Chi tiết (`/news/:id`)
- ✅ Hiển thị nội dung bài viết đầy đủ
- ✅ Thông tin tác giả và ngày đăng
- ✅ Tags và danh mục
- ✅ Đánh giá bài viết
- ✅ Chia sẻ bài viết
- ✅ Bài viết liên quan
- ✅ Breadcrumb navigation

### Trang Giới thiệu (`/about`)
- ✅ Thông tin công ty
- ✅ Thống kê và số liệu
- ✅ Sứ mệnh và giá trị
- ✅ Timeline phát triển
- ✅ Giới thiệu đội ngũ
- ✅ Call-to-action

### Trang Liên hệ (`/contact`)
- ✅ Form liên hệ với validation
- ✅ Thông tin liên hệ
- ✅ FAQ thường gặp
- ✅ Bản đồ vị trí
- ✅ Hỗ trợ trực tiếp

## Danh mục tin tức

1. **Tin tức** (`news`) - Cập nhật thông tin mới nhất
2. **Mẹo thuê trọ** (`tips`) - Lời khuyên và mẹo vặt hữu ích
3. **Hướng dẫn** (`guide`) - Hướng dẫn chi tiết các quy trình
4. **Thông báo** (`announcement`) - Thông báo chính thức từ hệ thống

## Mock Data

Hiện tại sử dụng mock data với 6 bài viết mẫu bao gồm:
- Xu hướng thuê phòng trọ 2024
- 10 mẹo tiết kiệm chi phí
- Hướng dẫn quy trình thuê phòng
- Cập nhật chính sách bảo hiểm
- Cách trang trí phòng trọ nhỏ
- Kinh nghiệm chọn phòng cho sinh viên

## Responsive Design

- **Desktop**: 3 cột grid layout
- **Tablet**: 2 cột grid layout  
- **Mobile**: 1 cột layout
- Tối ưu cho tất cả kích thước màn hình

## Tích hợp với Backend

Để tích hợp với backend thực tế, cần:

1. **API Endpoints**:
   - `GET /api/news` - Lấy danh sách tin tức
   - `GET /api/news/:id` - Lấy chi tiết tin tức
   - `POST /api/news/contact` - Gửi form liên hệ

2. **Data Structure**:
   ```typescript
   interface NewsItem {
     id: number;
     title: string;
     content: string;
     excerpt: string;
     category: 'news' | 'tips' | 'guide' | 'announcement';
     author: string;
     publishDate: string;
     readTime: string;
     views: number;
     likes: number;
     image: string;
     tags: string[];
   }
   ```

## Cải tiến trong tương lai

- [ ] Tích hợp với CMS để quản lý nội dung
- [ ] Hệ thống comment và đánh giá
- [ ] Tìm kiếm nâng cao với filters
- [ ] Newsletter subscription
- [ ] Social sharing
- [ ] SEO optimization
- [ ] Analytics tracking

## Cách sử dụng

1. Truy cập `/news` để xem danh sách tin tức
2. Sử dụng thanh tìm kiếm để tìm bài viết cụ thể
3. Lọc theo danh mục để xem loại nội dung mong muốn
4. Click vào bài viết để xem chi tiết
5. Sử dụng breadcrumb để điều hướng
6. Đánh giá và chia sẻ bài viết hữu ích

## Lưu ý

- Tất cả hình ảnh sử dụng Unsplash placeholder
- Mock data được lưu trữ trong component
- Cần thay thế bằng API calls thực tế
- CSS sử dụng custom classes, không phụ thuộc vào Ant Design mặc định

