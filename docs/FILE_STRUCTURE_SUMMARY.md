# Summary - Cấu trúc File Markdown hoàn chỉnh

## Files Frontend (docs/fe/)

### ✅ Đã viết lại chi tiết:
1. **01_setup_fe.md** - Setup Project
2. **02_home.md** - Xây dựng Trang chủ
3. **03_orders_payments.md** - Đặt hàng & Thanh toán

### 📝 Cấu trúc chuẩn cho các file còn lại:

#### **04_add_cart.md** - Giỏ hàng
```markdown
# 04 - Shopping Cart (Giỏ hàng)

## Task 1: Tạo Cart Context/Store
- Setup Zustand store hoặc Context API
- State: items[], total, count
- Actions: addItem, removeItem, updateQuantity, clearCart

## Task 2: Add to Cart từ Product Detail
- Button "Thêm vào giỏ hàng"
- Kiểm tra đăng nhập (bắt buộc)
- Validate số lượng vs stock
- Toast notification
- Update cart count badge

## Task 3: Cart Page
- Hiển thị list items
- Tăng/giảm số lượng
- Xóa item
- Tính tổng tiền
- Checkbox chọn items để checkout
- Button "Thanh toán"

## Task 4: API Integration
- GET /cart - Load cart items
- POST /cart - Add item
- PUT /cart/:id - Update quantity
- DELETE /cart/:id - Remove item
```

#### **05_search_products.md** - Tìm kiếm sản phẩm
```markdown
# 05 - Product Search & Filter

## Task 1: Search Bar (đã có ở Header)
- Input với icon search
- Submit → navigate to /products?search=...

## Task 2: Products List Page
- Display products grid
- Load từ API với search query
- Pagination
- Empty state: "Không có sản phẩm phù hợp"

## Task 3: Filter Sidebar
- Filter by category
- Filter by price range
- Filter by rating
- Sort by: giá, tên, mới nhất

## Task 4: API Integration
- GET /products?search=keyword&category=slug&minPrice=0&maxPrice=100000000
```

#### **06_login_register_logout.md** - Authentication
```markdown
# 06 - Authentication Flow

## Task 1: Login Page
- Form: email + password
- Validation
- POST /auth/login
- Save token + user to localStorage
- Redirect: admin → /admin/dashboard, user → /

## Task 2: Register Page
- Form: name, email, password, confirmPassword
- Validation: email unique, password >= 6 chars
- POST /auth/register
- Auto login after register
- Redirect to home

## Task 3: Logout
- Clear localStorage (user, token)
- Clear Zustand stores
- Redirect to home
- Toast: "Đăng xuất thành công"

## Task 4: Protected Routes
- RequireAuth component
- RequireAdmin component
- Redirect to /login nếu chưa đăng nhập
```

#### **07_reviews.md** - Đánh giá sản phẩm
```markdown
# 07 - Product Reviews

## Task 1: View Reviews (Product Detail)
- List reviews của sản phẩm
- Hiển thị: avatar, tên, rating, comment, ngày
- Admin reply (nếu có)
- Pagination

## Task 2: Write Review
- Chỉ user đã mua + nhận hàng + thanh toán
- Form: rating (1-5 stars), comment
- POST /reviews
- Toast notification
- Refresh review list

## Task 3: Edit Review
- Chỉ sửa được review của mình
- PUT /reviews/:id
- Same form như write review

## Task 4: Admin Reply (hiển thị)
- Admin reply từ admin panel
- Hiển thị dưới review
- Style khác biệt (background khác màu)
```

#### **08_dark_light_mode.md** - Chế độ sáng/tối
```markdown
# 08 - Dark/Light Mode

## Task 1: Theme Context (đã có)
- ThemeProvider với useState
- toggleTheme function
- Save to localStorage

## Task 2: Theme Toggle Button (đã có ở Header)
- Icon: FaMoon (light mode), FaSun (dark mode)
- Click → toggle
- Smooth transition

## Task 3: Apply Dark Mode CSS
- Tailwind: dark: prefix
- CSS variables: --bg, --text, --card, --border
- All components support dark mode

## Task 4: Persist Theme
- Load từ localStorage on mount
- Apply class 'dark' to document.documentElement
```

#### **09_admin_page.md** - Trang Admin
```markdown
# 09 - Admin Dashboard & Management

## Task 1: Admin Dashboard
- Stats cards: Users, Products, Orders, Revenue
- Charts (optional): Revenue by month, Orders by status
- Recent orders table

## Task 2: Users Management
- List users với pagination
- Sửa: name, role (user/admin)
- Xóa user
- Warning: "User cần đăng nhập lại sau khi đổi role"

## Task 3: Products Management
- List products
- Add: form với upload multiple images
- Edit: update info + images
- Delete: confirmation dialog

## Task 4: Categories Management
- List categories
- Add/Edit/Delete
- Validation: slug unique

## Task 5: Orders Management
- List orders
- View details: items, customer info
- Update status: pending → shipped → completed
- Delete order

## Task 6: Reviews Management
- List all reviews
- Admin reply
- Delete review

## Task 7: Payments Management
- List payments
- View order info
- Payment method
- Status: paid/unpaid

## Task 8: Admin Settings (Account)
- Upload avatar
- Update name
- Change password
- Display on AdminTopBar & Header
```

---

## Files Backend (docs/be/)

### Cấu trúc chuẩn:

#### **01_setup_project.md**
```markdown
# 01 - Setup Backend Project

## Task 1: Initialize Project
- npm init
- Install: express, sequelize, mysql2, dotenv, nodemon

## Task 2: Project Structure
- Tạo folders: config, models, controllers, routes, middlewares, utils

## Task 3: Configure Sequelize
- config/db.js - MySQL connection
- .env - DATABASE_URL, JWT_SECRET

## Task 4: Create server.js
- Express app setup
- Middleware: cors, json, morgan
- Routes registration
- Error handling
```

#### **02_authentication_module.md**
```markdown
# 02 - Authentication

## Task 1: User Model
- Migration: users table
- Fields: id, name, email, passwordHash, role, avatar

## Task 2: Auth Routes
- POST /auth/register - Register new user
- POST /auth/login - Login + return JWT token

## Task 3: Middleware
- jwt.middleware.js - Verify token, attach req.user
- isAdmin.middleware.js - Check role === 'admin'

## Task 4: Password Hashing
- bcrypt.hash() on register
- bcrypt.compare() on login
```

#### **03_categories_module.md**
```markdown
# 03 - Categories CRUD

## Task 1: Category Model
- Migration: categories table
- Fields: id, name, slug, image

## Task 2: Routes
- GET /categories - List all
- POST /categories - Create (admin)
- PUT /categories/:id - Update (admin)
- DELETE /categories/:id - Delete (admin)

## Task 3: Validation
- Slug unique
- Name required
```

#### **04_products_module.md**
```markdown
# 04 - Products CRUD

## Task 1: Product Model
- Migration: products table
- Fields: id, name, slug, description, price, stock, images (JSON), specs (JSON), categoryId

## Task 2: Routes
- GET /products - List with pagination, search, filter
- GET /products/:slug - Detail
- POST /products - Create (admin)
- PUT /products/:id - Update (admin)
- DELETE /products/:id - Delete (admin)

## Task 3: Upload Images
- Multer middleware
- POST /upload/products/multiple - Max 5 images
- Save to /uploads/products/
- Return array of paths
```

#### **05_cart_module.md**
```markdown
# 05 - Shopping Cart

## Task 1: CartItem Model
- Migration: cart_items table
- Fields: id, userId, productId, quantity

## Task 2: Routes
- GET /cart - Get user's cart items
- POST /cart - Add item
- PUT /cart/:id - Update quantity
- DELETE /cart/:id - Remove item

## Task 3: Business Logic
- Validate: stock >= quantity
- Calculate total on client
```

#### **06_orders_module.md**
```markdown
# 06 - Orders

## Task 1: Order Model
- Migration: orders table
- Fields: id, userId, orderNumber, total, status, shippingAddress (JSON), paymentMethod

## Task 2: OrderItem Model
- Migration: order_items table
- Fields: id, orderId, productId, quantity, price

## Task 3: Routes
- POST /orders - Create order + order items
- GET /orders/my-orders - User's orders
- GET /orders/:id - Order detail
- PUT /orders/:id/status - Update status (admin)
- DELETE /orders/:id - Delete (admin)
```

#### **07_payments_module.md**
```markdown
# 07 - Payments

## Task 1: Payment Model
- Migration: payments table
- Fields: id, orderId, amount, method, status, transactionId

## Task 2: Routes
- POST /payments - Create payment record (auto on order create)
- PUT /payments/:id - Update status (paid/unpaid)
- GET /payments - List all (admin)
```

#### **08_promotions_module.md** (Optional)
```markdown
# 08 - Promotions

## Task 1: Promotion Model
- Migration: promotions + product_promotions tables
- Fields: id, code, discount, validFrom, validUntil

## Task 2: Routes
- GET /promotions - List active promotions
- POST /promotions - Create (admin)
- Apply coupon code at checkout
```

#### **09_reviews_module.md**
```markdown
# 09 - Reviews

## Task 1: Review Model
- Migration: reviews table
- Fields: id, userId, productId, orderId, rating, comment, adminReply

## Task 2: Routes
- GET /products/:slug/reviews - Get product reviews
- POST /reviews - Create review (must have completed order)
- PUT /reviews/:id - Update review (own only)
- DELETE /reviews/:id - Delete (admin)
- PUT /admin/reviews/:id/reply - Admin reply

## Task 3: Validation
- User must have bought + received product
- Rating: 1-5 stars
- Comment required
```

#### **10_seed_data.md**
```markdown
# 10 - Seed Database

## Task 1: Create Seeders
- 01_seed_roles.js (if roles table exists)
- 02_seed_users.js - Admin + test users
- 03_seed_categories.js - Điện thoại, Laptop, Phụ kiện
- 04_seed_products.js - Sample products với images

## Task 2: Run Seeders
- npx sequelize-cli db:seed:all
- Verify data in database
```

#### **11_login_register_logout.md** (duplicate of 02)
```markdown
# 11 - Auth Endpoints (API Docs)

## API Endpoints:

### POST /api/auth/register
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Đăng ký thành công",
  "user": { id, name, email, role },
  "token": "jwt_token"
}
```

### POST /api/auth/login
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Đăng nhập thành công",
  "user": { id, name, email, role, avatar },
  "token": "jwt_token"
}
```
```

---

## Quy tắc viết Markdown chuẩn

### 1. Cấu trúc File
```markdown
# [Số] - [Tên Module]

## Mục tiêu
Brief description

---

## Task 1: [Tên Task]

### 1.1. Sub-task
- Bullet point
- Checklist items

**Code Example:**
```code
```

**Checklist:**
- [ ] Item 1
- [ ] Item 2

---

## Kết quả mong đợi

✅ **Completed:**
- Feature 1
- Feature 2

---

## Testing Checklist

### Category 1
- [ ] Test 1
- [ ] Test 2

---

## Next Steps

- Next module link
```

### 2. Format chuẩn

**Headers:**
- `#` - Title chính (1 lần/file)
- `##` - Task sections
- `###` - Sub-tasks
- `####` - Details (ít dùng)

**Lists:**
- `-` cho unordered lists
- `1.` cho ordered lists
- `- [ ]` cho checklists

**Code blocks:**
```typescript
// Luôn specify language
const example = 'code';
```

**Emphasis:**
- `**bold**` cho keywords
- `*italic*` cho notes
- `` `code` `` cho inline code

**Tables:**
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

**Links:**
- Internal: `[text](./relative-path.md)`
- External: `[text](https://url.com)`

---

## Tool để generate các file còn lại

Tôi có thể generate full content cho từng file nếu bạn cần:

1. **04_add_cart.md** - Chi tiết Cart functionality
2. **05_search_products.md** - Chi tiết Search & Filter
3. **06_login_register_logout.md** - Chi tiết Authentication
4. **07_reviews.md** - Chi tiết Reviews system
5. **08_dark_light_mode.md** - Chi tiết Theme toggle
6. **09_admin_page.md** - Chi tiết Admin panel

Và tất cả các file backend **01-11**.

Bạn có muốn tôi generate full content cho file nào không?