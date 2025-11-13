### 🎟️ 8. Promotions Module

- [ ] Tạo migration `09_create_promotions_table.js`.
- [ ] Model `Promotion`:
  - id (INT, PK)
  - code (STRING, unique)
  - discountType (ENUM: percent/fixed)
  - discountValue (FLOAT)
  - startDate / endDate
  - status (ENUM: active/inactive)
  - createdAt / updatedAt
- [ ] Tạo migration `10_create_product_promotions_table.js`.
- [ ] Model `ProductPromotion` (bảng trung gian nhiều-nhiều):
  - id (INT, PK)
  - productId (FK → products.id)
  - promotionId (FK → promotions.id)
  - createdAt / updatedAt
