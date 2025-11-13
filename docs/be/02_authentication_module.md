### 🔐 2. Authentication Module

- [ ] Cài đặt `bcrypt`, `jsonwebtoken`, `express-validator`.
- [ ] Tạo model `User`:
  - id (UUID, PK)
  - name (STRING)
  - email (STRING, unique)
  - passwordHash (STRING)
  - role (ENUM: user/admin)
  - createdAt / updatedAt
- [ ] Tạo routes `/api/auth/register` và `/api/auth/login`.
- [ ] Validate email hợp lệ, mật khẩu ≥ 6 ký tự.
- [ ] Hash mật khẩu khi đăng ký.
- [ ] Trả JWT token khi đăng nhập thành công.
- [ ] Tạo middleware `jwt()` để kiểm tra token.
- [ ] Middleware `isAdmin` kiểm tra role.
