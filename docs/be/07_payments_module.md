### 💳 7. Payments Module

- [ ] Tạo migration `08_create_payments_table.js`.
- [ ] Model `Payment`:
  - id (INT, PK)
  - orderId (FK → orders.id, unique)
  - method (ENUM: COD, bank, momo, zalopay)
  - amount (FLOAT)
  - status (ENUM: paid, unpaid)
  - createdAt / updatedAt
- [ ] Tạo route thanh toán:
  - POST `/api/payments`
  - GET `/api/payments/:orderId`
