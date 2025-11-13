# SRS - ELECTROSHOP (Website Bán Đồ Điện Tử)

**Phiên bản:** 1.0  
**Ngày:** 29/10/2025  
**Prepared by:** [Nguyễn Thiện]  
**Stack:** React + TypeScript + TailwindCSS (Frontend), Node.js + Express + Sequelize (Backend), MySQL (DB)

---

## 1. Giới thiệu

### 1.1 Mục đích
Tài liệu này mô tả các yêu cầu chức năng và phi chức năng cho hệ thống **ElectroShop** — website bán đồ điện tử (laptop, điện thoại, phụ kiện). Mục tiêu: hướng dẫn phát triển, test và triển khai đồ án.

### 1.2 Phạm vi dự án
Hệ thống gồm:
- **User site:** Đăng ký, đăng nhập, tìm kiếm/lọc sản phẩm, xem chi tiết, thêm vào giỏ hàng, checkout.
- **Admin site:** Quản lý sản phẩm, quản lý đơn hàng, quản lý khách hàng, báo cáo.

---

## 2. Mô tả tổng quan

### 2.1 Kiến trúc
- Client (React + TS): giao diện, gọi REST API.
- Server (Node.js/Express + Sequelize): REST API, xác thực JWT, business logic.
- DB: MySQL (bảng `users`, `products`, `categories`, `carts` (nếu server-side), `orders`, `order_items`).

### 2.2 Đối tượng người dùng
- **Customer (User):** mua hàng, quản lý profile, xem đơn.
- **Admin:** quản lý sản phẩm, đơn hàng, khách hàng.
- **Guest:** xem sản phẩm, tìm kiếm, nhưng phải đăng nhập để đặt hàng.

---

## 3. Yêu cầu chức năng (chính)

### 3.1 Authentication
- **Register (POST /api/auth/register)**: email, name, password. Validate email unique. Hash password (bcrypt).
- **Login (POST /api/auth/login)**: trả JWT + user info (role). Token lưu client (localStorage).
- **Role:** `user`, `admin`. Middleware kiểm tra role cho route admin.

### 3.2 Product Catalog
- **Models:** `Product` (id, name, slug, description, price, stock, images[], specs JSON, categoryId, brand, createdAt, updatedAt), `Category` (id, name, slug).
- **API:** 
  - `GET /api/products` — query params: `q`, `category`, `brand`, `minPrice`, `maxPrice`, `page`, `limit`, `sort` (e.g. price_asc).
  - `GET /api/products/:id` — chi tiết sản phẩm.
  - `GET /api/categories` — list danh mục.

### 3.3 Cart & Checkout
- **Cart (Client-side or Server-side):** support lưu tại localStorage cho guest; nếu user đăng nhập có thể đồng bộ server.
- **API:** `POST /api/orders` — tạo order với order_items, địa chỉ giao hàng, payment_method (mock).
- **OrderNumber:** auto-generate (format: ES-YYYYMMDD-xxxxx).

### 3.4 Order Management (Admin)
- **API:** `GET /api/admin/orders` (filter by status, date), `PUT /api/admin/orders/:id/status` — cập nhật trạng thái (Pending, Processing, Completed, Cancelled).
- Detail view with order items, billing/shipping, customer info.

### 3.5 Customer Management (Admin)
- **API:** `GET /api/admin/users` (search by email/name), `GET /api/admin/users/:id/orders`.

---

## 4. Yêu cầu phi chức năng

### 4.1 Hiệu năng
- Tìm kiếm & trang load ≤ 3s.
- Hỗ trợ tối thiểu 100 concurrent users giai đoạn đồ án.

### 4.2 Bảo mật
- HTTPS (deploy), bcrypt hash password.
- JWT expiry: 30 phút (refresh token optional).
- Input validation, chống SQL Injection (Sequelize), tránh XSS (sanitize inputs).

### 4.3 Khả năng sử dụng
- Responsive, tương thích Chrome/Firefox/Edge/Safari.
- Giao diện đơn giản, dễ dùng.

### 4.4 Backup & Recovery
- Sao lưu DB hàng ngày (task deploy/cron).

---

## 5. Models đề xuất (Sequelize)

### users
- id (UUID / int)
- name
- email (unique)
- passwordHash
- role (enum: 'user','admin')
- createdAt, updatedAt

### categories
- id, name, slug, createdAt, updatedAt

### products
- id, name, slug, description, price (decimal), stock (int)
- images (JSON array of urls)
- specs (JSON)
- categoryId (FK)
- brand, createdAt, updatedAt

### orders
- id, orderNumber, userId (nullable for guest), totalAmount, status, shippingAddress (JSON), paymentMethod, createdAt, updatedAt

### order_items
- id, orderId, productId, unitPrice, quantity, total

---

## 6. Use Case (tóm tắt)
- Guest tìm kiếm, xem product.
- User register/login → add to cart → checkout → tạo order.
- Admin login → quản lý products / orders / users / báo cáo.

---

## 7. Acceptance criteria (ví dụ)
- Đăng ký: tạo user mới với email hợp lệ; mật khẩu được hash.
- Thêm sản phẩm: admin có thể CRUD product; product hiển thị đúng UI.
- Checkout: tạo order, trả orderNumber và trang success hiển thị chi tiết.

---

## 8. Phụ lục
- ERD đề xuất (vẽ ngoài): users, products, categories, orders, order_items.
- Tài liệu tham khảo: SRS mẫu, các trang e-commerce tham khảo.
