#!/bin/bash

# Script xóa cache Vite và các file build

echo "🧹 Đang xóa cache..."

# Xóa Vite cache
rm -rf node_modules/.vite
rm -rf .vite

# Xóa thư mục build
rm -rf dist

# Xóa cache TypeScript (nếu có)
rm -rf *.tsbuildinfo

echo "✅ Đã xóa cache thành công!"
echo "📦 Bây giờ bạn có thể chạy: npm run dev"

