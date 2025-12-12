# 🏠 Tro360 - Frontend

Giao diện người dùng cho hệ thống quản lý nhà trọ thông minh Tro360, được xây dựng với React, TypeScript và Ant Design.

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Tính năng chi tiết](#tính-năng-chi-tiết)
- [Screenshots](#screenshots)

## 🎯 Giới thiệu

Tro360 Frontend là ứng dụng web Single Page Application (SPA) cung cấp giao diện trực quan và thân thiện cho cả người thuê trọ (Tenant) và quản trị viên (Admin) để quản lý nhà trọ một cách hiệu quả.

## ✨ Tính năng

### 👤 Dành cho Người thuê (Tenant)

#### 🏠 Tìm kiếm & Thuê phòng
- Xem danh sách phòng trống
- Lọc phòng theo giá, diện tích, tiện ích
- Xem chi tiết phòng với hình ảnh
- Đăng ký thuê phòng online

#### 📝 Quản lý Hợp đồng
- Xem hợp đồng hiện tại
- Lịch sử hợp đồng
- Yêu cầu gia hạn hợp đồng
- Yêu cầu trả phòng

#### 💰 Quản lý Hóa đơn
- Xem danh sách hóa đơn
- Chi tiết hóa đơn (điện, nước, wifi, etc.)
- Lịch sử thanh toán
- Thanh toán online (VNPay, ZaloPay)

#### 💬 Chat với Chủ trọ
- Chat realtime với admin
- Lịch sử tin nhắn
- Thông báo tin nhắn mới

#### 📋 Khiếu nại
- Gửi khiếu nại
- Theo dõi trạng thái xử lý
- Lịch sử khiếu nại

#### 🔔 Thông báo
- Thông báo hóa đơn mới
- Thông báo nhắc nhở thanh toán
- Thông báo hợp đồng sắp hết hạn
- Thông báo tin nhắn mới

### 👨‍💼 Dành cho Quản trị viên (Admin)

#### 📊 Dashboard
- Tổng quan doanh thu
- Thống kê phòng trống/đã thuê
- Biểu đồ doanh thu theo tháng
- Thống kê hóa đơn chưa thanh toán

#### 🏢 Quản lý Phòng
- CRUD phòng trọ
- Upload hình ảnh phòng
- Quản lý trạng thái phòng
- Quản lý tiện ích phòng

#### 📝 Quản lý Hợp đồng
- Danh sách hợp đồng
- Tạo hợp đồng mới
- Gia hạn hợp đồng
- Chấm dứt hợp đồng
- Xem chi tiết hợp đồng

#### 💰 Quản lý Hóa đơn
- Danh sách hóa đơn
- Tạo hóa đơn nháp
- Xuất bản hóa đơn
- Tạo hóa đơn tháng tự động
- Quản lý chi phí tiện ích

#### 💳 Quản lý Thanh toán
- Xác nhận thanh toán tiền mặt
- Lịch sử giao dịch
- Báo cáo doanh thu

#### 👥 Quản lý Người dùng
- Danh sách users
- Khóa/mở khóa tài khoản
- Phân quyền (Admin, Staff, Tenant)
- Xem lịch sử hoạt động

#### 💬 Chat với Tenant
- Chat realtime với tất cả tenant
- Quản lý tin nhắn
- Thông báo tin nhắn mới

#### 📋 Quản lý Khiếu nại
- Danh sách khiếu nại
- Cập nhật trạng thái xử lý
- Trả lời khiếu nại

#### 📜 Logs
- Xem log hoạt động hệ thống
- Lọc log theo loại, user, thời gian
- Export log

## 🛠 Công nghệ sử dụng

- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **UI Library:** Ant Design (antd)
- **Routing:** React Router v6
- **State Management:** React Hooks (useState, useEffect, useContext)
- **HTTP Client:** Fetch API
- **Realtime:** Socket.IO Client
- **Charts:** Recharts / Chart.js
- **Date Handling:** Day.js
- **Icons:** Ant Design Icons
- **Styling:** CSS Modules + Ant Design

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- npm hoặc yarn

### Các bước cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd WebsiteQuanLiNhaTroFront
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` (xem mục [Cấu hình](#cấu-hình))

## ⚙️ Cấu hình

Tạo file `.env` trong thư mục root với nội dung:

```env
# API URL
VITE_API_URL=http://localhost:3000

# Socket.IO URL (thường giống API URL)
VITE_SOCKET_URL=http://localhost:3000

# App Name
VITE_APP_NAME=Tro360

# Environment
VITE_ENV=development
```

## 🚀 Chạy ứng dụng

### Development mode
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Lint code
```bash
npm run lint
```

## 📁 Cấu trúc thư mục

```
WebsiteQuanLiNhaTroFront/
├── public/                 # Static files
│   ├── images/            # Images
│   └── favicon.ico        # Favicon
├── src/
│   ├── assets/            # Assets (styles, images)
│   │   └── styles/        # Global styles
│   ├── components/        # Shared components
│   │   ├── NotificationBell.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/          # React contexts
│   │   └── SocketContext.tsx
│   ├── layouts/           # Layout components
│   │   ├── admin/         # Admin layout
│   │   └── client/        # Client layout
│   ├── modules/           # Feature modules
│   │   ├── admin/         # Admin features
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   └── client/        # Client features
│   │       ├── components/
│   │       ├── pages/
│   │       └── services/
│   ├── routes/            # Route definitions
│   │   ├── AdminRoutes.tsx
│   │   └── ClientRoutes.tsx
│   ├── services/          # Shared services
│   │   └── message.ts
│   ├── types/             # TypeScript types
│   │   ├── bill.ts
│   │   ├── contract.ts
│   │   ├── message.ts
│   │   └── ...
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main App component
│   ├── main.tsx           # Entry point
│   └── vite-env.d.ts      # Vite types
├── .env                   # Environment variables
├── .gitignore            # Git ignore
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
└── README.md             # This file
```

## 🎨 Tính năng chi tiết

### 1. Authentication & Authorization

#### Đăng nhập/Đăng ký
- Form đăng nhập với validation
- Đăng ký tài khoản mới
- Lưu JWT token vào localStorage
- Auto-redirect dựa trên role

#### Protected Routes
- Client routes: Chỉ cho TENANT
- Admin routes: Chỉ cho ADMIN/STAFF
- Auto-redirect nếu chưa đăng nhập

### 2. Realtime Features

#### Socket.IO Integration
- Kết nối Socket.IO khi đăng nhập
- Auto-reconnect khi mất kết nối
- Join room theo userId

#### Realtime Notifications
- Thông báo popup khi có tin mới
- Badge đếm số thông báo chưa đọc
- Auto-refresh danh sách

#### Realtime Chat
- Tin nhắn hiển thị ngay lập tức
- Typing indicator (optional)
- Auto-scroll to bottom

### 3. Payment Integration

#### VNPay
- Tạo link thanh toán
- Redirect đến VNPay
- Xử lý return URL
- Hiển thị kết quả thanh toán

#### ZaloPay
- Tạo link thanh toán
- Redirect đến ZaloPay
- Xử lý callback
- Hiển thị kết quả thanh toán

### 4. UI/UX Features

#### Responsive Design
- Mobile-friendly
- Tablet-friendly
- Desktop-optimized

#### Loading States
- Skeleton loading
- Spinner loading
- Progress bar

#### Error Handling
- Toast notifications
- Error boundaries
- Retry mechanisms

#### Form Validation
- Real-time validation
- Error messages
- Success feedback

### 5. Data Visualization

#### Charts
- Biểu đồ doanh thu
- Biểu đồ phòng trống/đã thuê
- Biểu đồ hóa đơn

#### Tables
- Sortable columns
- Filterable data
- Pagination
- Export to Excel/PDF

## 📸 Screenshots

### Client Interface

#### Trang chủ
![Home Page](./screenshots/home.png)

#### Danh sách phòng
![Rooms List](./screenshots/rooms.png)

#### Chi tiết hóa đơn
![Invoice Detail](./screenshots/invoice.png)

#### Chat
![Chat](./screenshots/chat.png)

### Admin Interface

#### Dashboard
![Dashboard](./screenshots/dashboard.png)

#### Quản lý phòng
![Rooms Management](./screenshots/admin-rooms.png)

#### Quản lý hóa đơn
![Bills Management](./screenshots/admin-bills.png)

#### Quản lý người dùng
![Users Management](./screenshots/admin-users.png)

## 🔧 Scripts

```bash
# Development
npm run dev              # Chạy dev server với hot reload

# Build
npm run build           # Build production

# Preview
npm run preview         # Preview production build

# Lint
npm run lint            # Lint code với ESLint

# Type check
npm run type-check      # Check TypeScript types

# Clean cache
./clean-cache.sh        # Clean Vite cache (Mac/Linux)
./clean-cache.bat       # Clean Vite cache (Windows)
```

## 🐛 Debug & Troubleshooting

### Lỗi kết nối API
```typescript
// Kiểm tra VITE_API_URL trong .env
console.log(import.meta.env.VITE_API_URL);

// Kiểm tra backend có đang chạy không
curl http://localhost:3000/api/health
```

### Lỗi Socket.IO không kết nối
```typescript
// Kiểm tra VITE_SOCKET_URL
console.log(import.meta.env.VITE_SOCKET_URL);

// Kiểm tra Socket.IO server
// Xem console log: "Socket.IO connected"
```

### Lỗi CORS
- Đảm bảo backend đã enable CORS
- Kiểm tra origin trong CORS config

### Cache issues
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Hoặc dùng script
./clean-cache.sh  # Mac/Linux
./clean-cache.bat # Windows
```

## 🎯 Best Practices

### Code Organization
- Tách component nhỏ, tái sử dụng
- Sử dụng TypeScript types
- Tách business logic vào services
- Sử dụng custom hooks

### Performance
- Lazy loading routes
- Memoization với useMemo/useCallback
- Optimize images
- Code splitting

### Security
- Không lưu sensitive data trong localStorage
- Validate input
- Sanitize HTML
- HTTPS trong production

## 🤝 Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - *Initial work*

## 🙏 Acknowledgments

- React team
- Ant Design team
- Vite team
- Socket.IO team

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [Issues](https://github.com/your-repo/issues)
2. Tạo issue mới nếu chưa có
3. Liên hệ: your-email@example.com

---

**Ngày cập nhật:** 12/12/2025

**Version:** 1.0.0

**Status:** ✅ Production Ready

**Live Demo:** [https://tro360.com](https://tro360.com) *(nếu có)*
