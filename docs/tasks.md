# 🛒 ELECTROSHOP - TASK BREAKDOWN
**Mục tiêu:** Phát triển website bán đồ điện tử (laptop, điện thoại, phụ kiện)
**Stack:**  
- **Frontend:** React + TypeScript + TailwindCSS  + Axios
- **Backend:** Node.js + Express + Sequelize  
- **Database:** MySQL  

---

## 🚀 PHASE 1 – BACKEND DEVELOPMENT

### 🧱 1.1. Setup Project
- [ ] Khởi tạo dự án backend bằng Node.js + Express.
- [ ] Cấu hình `package.json`, `dotenv`, `nodemon`, `sequelize`, `mysql2`.
- [ ] Tạo cấu trúc thư mục:  
src/
├── config/
├── models/
├── controllers/
├── routes/
├── middlewares/
├── utils/
└── app.js

markdown

- [ ] Cấu hình Sequelize + MySQL kết nối qua `.env`.
- [ ] Tạo file `server.js` chạy ứng dụng Express.

---

### 🔐 1.2. Authentication Module
- [ ] Cài đặt `bcrypt`, `jsonwebtoken`, `express-validator`.
- [ ] Tạo model `User`:
id, name, email, passwordHash, role (user/admin), createdAt, updatedAt


- [ ] Tạo routes `/api/auth/register` và `/api/auth/login`.
- [ ] Validate email hợp lệ, mật khẩu ≥ 6 ký tự.
- [ ] Hash mật khẩu khi đăng ký.
- [ ] Trả JWT token khi đăng nhập thành công.
- [ ] Tạo middleware `jwt()` để kiểm tra token.
- [ ] Middleware `isAdmin` kiểm tra role.

---

### 🧩 1.3. Product & Category Module
- [ ] Model `Category`: id, name, slug, createdAt, updatedAt.
- [ ] Model `Product`: id, name, slug, description, price, stock, images(JSON), specs(JSON), categoryId(FK), brand, createdAt, updatedAt.
- [ ] API:
- `GET /api/categories`
- `POST /api/categories` (admin)
- `GET /api/products` (filter, search, pagination)
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

---

### 🛍️ 1.4. Order & Cart Module
- [ ] Model `Order`: id, orderNumber, userId, totalAmount, status, shippingAddress(JSON), paymentMethod, createdAt, updatedAt.
- [ ] Model `OrderItem`: id, orderId, productId, unitPrice, quantity, total.
- [ ] API:
- `POST /api/orders` — tạo đơn hàng (từ giỏ hàng client).
- `GET /api/orders/my-orders` — lấy đơn hàng của user.
- `GET /api/admin/orders` — admin xem tất cả đơn hàng.
- `PUT /api/admin/orders/:id/status` — cập nhật trạng thái đơn hàng.

---

### 🧾 1.5. Customer Management (Admin)
- [ ] API:
- `GET /api/admin/users`
- `GET /api/admin/users/:id/orders`
- `DELETE /api/admin/users/:id`

---

### 🧰 1.6. Utility & Error Handling
- [ ] Middleware xử lý lỗi toàn cục (`errorHandler.js`)
- [ ] Middleware validate input (`express-validator`)
- [ ] Log request bằng `morgan`
- [ ] Helper tạo `orderNumber` tự động: ES-YYYYMMDD-xxxxx

---

## 💅 PHASE 2 – FRONTEND SETUP

### ⚙️ 2.1. Setup React + TypeScript + Tailwind
- [ ] Tạo project React (`Vite` hoặc `CRA`)
- [ ] Cài đặt `axios`, `react-router-dom`, `zustand` (hoặc context API).
- [ ] Cấu hình TailwindCSS.
- [ ] Tạo cấu trúc:
src/
├── components/
├── pages/
├── layouts/
├── contexts/
├── hooks/
├── api/
├── assets/
├── utils/
└── main.tsx



---

### 🧩 2.2. Layout Components
- [ ] `Navbar` — logo, search bar, links (home, products, cart, login).
- [ ] `Footer` — thông tin liên hệ, copyright.
- [ ] `ProductCard` — hiển thị ảnh, tên, giá, nút “Add to Cart”.
- [ ] `PrivateRoute` — bảo vệ route yêu cầu đăng nhập.
- [ ] `AuthContext` — lưu thông tin user và JWT.
- [ ] Responsive layout (Tailwind breakpoints).

---

## 🖥️ PHASE 3 – FRONTEND FEATURES

### 🏠 3.1. Trang User
| Mã | Trang | Công việc |
|----|--------|------------|
| FE-01 | Home | Hiển thị banner, danh mục nổi bật, sản phẩm gợi ý. |
| FE-02 | Product List | Hiển thị sản phẩm, filter theo danh mục, giá, thương hiệu, sort. |
| FE-03 | Product Detail | Hiển thị chi tiết sản phẩm (ảnh, mô tả, thông số, thêm vào giỏ). |
| FE-04 | Cart | Hiển thị sản phẩm trong giỏ, cập nhật số lượng, xóa sản phẩm. |
| FE-05 | Checkout | Form nhập địa chỉ, chọn phương thức thanh toán, gửi đơn hàng lên backend. |
| FE-06 | Register / Login | Form đăng ký, đăng nhập, validate input, lưu JWT. |
| FE-07 | Profile | Hiển thị thông tin cá nhân, danh sách đơn hàng. |
| FE-08 | Order Detail | Hiển thị chi tiết từng đơn hàng. |

---

### 🧑‍💼 3.2. Trang Admin
| Mã | Trang | Công việc |
|----|--------|------------|
| FE-09 | Dashboard | Thống kê tổng quan (sản phẩm, đơn hàng, doanh thu). |
| FE-10 | Product Management | CRUD sản phẩm, upload ảnh. |
| FE-11 | Category Management | CRUD danh mục. |
| FE-12 | Order Management | Xem danh sách đơn hàng, cập nhật trạng thái. |
| FE-13 | User Management | Danh sách user, xem chi tiết và đơn hàng. |

---

### ⚙️ 3.3. API Integration
- [ ] Cấu hình `axios` baseURL.
- [ ] Tạo `useFetch` hook tái sử dụng.
- [ ] Gọi API: `/auth`, `/products`, `/orders`, `/admin`.
- [ ] Hiển thị loading, toast lỗi, xử lý retry khi token hết hạn.

---

## 🎨 PHASE 4 – UI POLISH & RESPONSIVE DESIGN
- [ ] Áp dụng màu chủ đạo, font nhất quán.
- [ ] Responsive toàn bộ UI (mobile-first).
- [ ] Hover, active, transition Tailwind.
- [ ] Xử lý form đẹp, toast thông báo thành công/thất bại.
- [ ] Loading skeleton cho ProductCard, DetailPage.

---

## 🧪 PHASE 5 – TESTING & DEPLOYMENT

### ✅ 5.1. Kiểm thử
- [ ] Test API bằng Postman (register, login, CRUD, checkout).
- [ ] Test frontend flow: đăng nhập → thêm giỏ → đặt hàng → xem lịch sử.
- [ ] Unit test với Jest (nếu có thời gian).

### 🚀 5.2. Deploy
- [ ] Deploy backend lên Render/Railway (MySQL + Node.js).
- [ ] Deploy frontend lên Vercel/Netlify.
- [ ] Cấu hình `.env` production (API_URL, DB_URL, JWT_SECRET).
- [ ] Kết nối domain (nếu có).

---

## 📅 PHASE 6 – DOCUMENTATION
- [ ] Viết `README.md` mô tả project, hướng dẫn cài đặt, chạy project.
- [ ] Cập nhật ERD, API docs (Swagger hoặc Markdown).
- [ ] Ghi changelog theo từng commit hoặc milestone.