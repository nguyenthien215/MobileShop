### 📦 4. Products Module

- [ ] Tạo migration `04_create_products_table.js`.
- [ ] Model `Product`:
  - id (UUID, PK)
  - name, slug, description
  - price (FLOAT)
  - stock (INT)
  - images (JSON)
  - specs (JSON)
  - brand (STRING)
  - categoryId (FK → categories.id)
  - createdAt / updatedAt
- [ ] Tạo routes CRUD cho Product:
  - GET `/api/products`
  - POST `/api/products` (admin)
  - PUT `/api/products/:id` (admin)
  - DELETE `/api/products/:id` (admin)
- [ ] Tích hợp relation với Category.
