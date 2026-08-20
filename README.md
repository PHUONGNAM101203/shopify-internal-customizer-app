# 🛍️ Shopify Internal Custom Product App (Next.js 14+ & Theme App Extension)

Hệ thống Shopify App nội bộ tùy chỉnh sản phẩm (Product Customizer) xây dựng theo kiến trúc hiện đại **Shopify Online Store 2.0 (Theme App Extension + App Proxy + Embedded Next.js App)** không sử dụng `<iframe>` trên Storefront.

---

## 🏗️ Cấu Trúc Dự Án

```
├── extensions/
│   └── product-customizer-block/    # Theme App Extension (App Block Liquid + CSS + JS bundle)
│       ├── blocks/customizer.liquid # App Block Mount Point trên Product Page
│       ├── assets/                  # customizer-bundle.js, customizer.css
│       └── shopify.extension.toml   # Cấu hình Extension
├── prisma/
│   └── schema.prisma                # Database Models (Shop, ProductConfig, CustomDesign)
├── scripts/
│   └── bundle-extension.mjs         # Build Storefront React Customizer sang single JS bundle
├── src/
│   ├── app/                         # Next.js App Router (Admin Dashboard & API Routes)
│   │   ├── admin/                   # Giao diện Quản trị Nội bộ (Polaris/Tailwind)
│   │   │   ├── products/            # Cấu hình quy tắc in ấn, màu sắc, font chữ
│   │   │   └── orders/              # Hàng chờ sản xuất & tải file in ấn
│   │   ├── api/
│   │   │   ├── proxy/               # Shopify App Proxy API (Xác thực HMAC SHA256)
│   │   │   ├── webhooks/            # Shopify Webhooks (orders/create, app/uninstalled)
│   │   │   └── auth/                # Shopify OAuth flow
│   ├── lib/                         # DB Client, HMAC verifier, Shopify API SDK
│   └── storefront-customizer/       # React Source Code chạy trực tiếp trên Storefront DOM
└── shopify.app.toml                 # Cấu hình Shopify CLI & App Proxy
```

---

## ⚡ Hướng Dẫn Cài Đặt & Chạy Môi Trường Local

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Khởi tạo Database (SQLite cho local dev):
```bash
npm run prisma:generate
npm run prisma:push
```

### 3. Build React Bundle cho Theme Extension:
```bash
npm run bundle:extension
```

### 4. Chạy App Next.js:
```bash
npm run dev
```
Truy cập: `http://localhost:3000` hoặc Bảng Quản trị tại `http://localhost:3000/admin`.

---

## 🚀 Kết Nối Với Shopify Store (Shopify CLI)

### 1. Đăng nhập Shopify CLI:
```bash
npm run shopify:dev
```
Shopify CLI sẽ tự động:
1. Tạo đường hầm Cloudflare/ngrok Tunnel kết nối Next.js với Shopify.
2. Tự động cập nhật URL App Proxy và Webhooks trong Shopify Partner Dashboard.
3. Đồng bộ Theme App Extension vào Theme của Development Store.

### 2. Bật App Block trên Trang Sản Phẩm:
1. Mở **Shopify Admin** &rarr; **Online Store** &rarr; **Themes** &rarr; bấm **Customize**.
2. Ở dropdown trên cùng, chọn trang **Products** &rarr; **Default product**.
3. Tại cột bên trái (Product Information), bấm **Add block** &rarr; chọn **Apps** &rarr; chọn **Custom Product Designer**.
4. Kéo thả block đến vị trí mong muốn (ngay trên hoặc dưới nút *Add to cart*), sau đó bấm **Save**.

---

## 📦 Triển Khai Lên Production (Không Cần Chờ Duyệt App Store)

Vì đây là App Nội bộ (Internal / Custom App):
1. **Deploy Next.js Backend** lên Vercel, Render, Railway hoặc VPS.
2. Cập nhật URL production trong file `shopify.app.toml`.
3. Chạy lệnh deploy extension lên Shopify:
   ```bash
   npm run shopify:deploy
   ```
4. Trong **Shopify Partners Dashboard**, tại app của bạn:
   - Chọn mục **Distribution** &rarr; Chọn **Custom Distribution**.
   - Nhập domain store của công ty bạn (`your-company.myshopify.com`).
   - Sao chép **Install Link** và dán vào trình duyệt để cài đặt trực tiếp vào Store.
