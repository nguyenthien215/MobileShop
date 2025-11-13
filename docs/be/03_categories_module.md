### 📂 3. Categories Module

- [ ] Tạo migration `03_create_categories_table.js`.
- [ ] Model `Category`:
  - id (UUID, PK)
  - name (STRING)
  - slug (STRING, unique)
  - createdAt / updatedAt
- [ ] Tạo routes CRUD cho Category:
  - GET `/api/categories`
  - POST `/api/categories` (admin)
  - PUT `/api/categories/:id` (admin)
  - DELETE `/api/categories/:id` (admin)
- [ ] Validate dữ liệu input khi thêm/sửa category.
