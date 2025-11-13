### 🛒 5. Cart Module

- [ ] Tạo migration `05_create_cart_items_table.js`.
- [ ] Model `CartItem`:
  - id (PK)
  - userId (FK → users.id)
  - productId (FK → products.id)
  - quantity (INT)
  - createdAt / updatedAt
- [ ] Tạo routes:
  - GET `/api/cart` → xem giỏ hàng
  - POST `/api/cart` → thêm sản phẩm
  - PUT `/api/cart/:id` → cập nhật số lượng
  - DELETE `/api/cart/:id` → xóa sản phẩm
