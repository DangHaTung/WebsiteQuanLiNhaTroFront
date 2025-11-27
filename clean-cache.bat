@echo off
REM Script xóa cache Vite cho Windows

echo 🧹 Đang xóa cache...

REM Xóa Vite cache
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist ".vite" rmdir /s /q ".vite"

REM Xóa thư mục build
if exist "dist" rmdir /s /q "dist"

REM Xóa cache TypeScript (nếu có)
del /q *.tsbuildinfo 2>nul

echo ✅ Đã xóa cache thành công!
echo 📦 Bây giờ bạn có thể chạy: npm run dev

pause

