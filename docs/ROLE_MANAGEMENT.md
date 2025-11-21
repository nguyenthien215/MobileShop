# Hệ thống Phân quyền Admin/User

## Tổng quan

Hệ thống sử dụng 2 loại role:
- **user**: Người dùng thường (mặc định khi đăng ký)
- **admin**: Quản trị viên (được cấp bởi admin khác)

## Cách hoạt động

### 1. Đăng ký mới
- Tất cả tài khoản đăng ký mới đều có role `user`
- Được định nghĩa trong model: `role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' }`

### 2. Cấp quyền Admin
**Chỉ admin hiện tại mới có thể cấp quyền:**
1. Đăng nhập với tài khoản admin
2. Vào trang "Quản lý người dùng"
3. Click nút "Sửa" trên user cần cấp quyền
4. Chọn "⭐ Admin - Quản trị viên" trong dropdown Phân quyền
5. Click "💾 Lưu thay đổi"

**User được cấp quyền cần:**
- Đăng xuất khỏi tài khoản hiện tại
- Đăng nhập lại
- Sau đó sẽ thấy menu "Admin" và có thể truy cập trang admin

### 3. Thu hồi quyền Admin
**Quy trình tương tự:**
1. Admin vào "Quản lý người dùng"
2. Sửa user và chọn "👤 User - Người dùng thường"
3. Lưu thay đổi
4. User bị thu hồi quyền cần đăng nhập lại để cập nhật

## Kiến trúc bảo mật

### Backend Protection
```javascript
// Middleware isAdmin.middleware.js
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') return next();
    return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
}

// Tất cả routes admin đều được bảo vệ:
router.get('/admin/users', jwt, isAdmin, adminController.getAllUsers);
router.put('/admin/users/:id', jwt, isAdmin, adminController.updateUser);
// ...
```

### Frontend Protection
```typescript
// RequireAuth.tsx
export function RequireAdmin({ children }: { children: JSX.Element }) {
    const { user } = useAuthStore();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;
    return children;
}

// Sử dụng trong routes:
<Route path="/admin/*" element={<RequireAdmin><AdminLayout /></RequireAdmin>} />
```

### JWT Token
- Token được mã hóa với role của user
- Khi đăng nhập, role được lưu vào:
  - JWT token (backend validate)
  - localStorage (frontend display)
- Khi role thay đổi trong database:
  - Token cũ vẫn valid cho đến khi hết hạn
  - User phải đăng nhập lại để nhận token mới với role mới

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  avatar VARCHAR(255),
  createdAt DATETIME,
  updatedAt DATETIME
);
```

## API Endpoints

### Cập nhật User (Admin only)
```
PUT /api/admin/users/:id
Authorization: Bearer {admin_token}
Body: {
  "name": "string",
  "role": "user" | "admin"
}
```

**Response Success:**
```json
{
  "message": "Cập nhật user thành công",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "admin",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Response Error:**
```json
{
  "message": "Role không hợp lệ"
}
// hoặc
{
  "message": "Bạn không có quyền truy cập"
}
```

## UX Flow

### Cấp quyền Admin
1. Admin click "Sửa" trên user
2. Form hiển thị với các field:
   - Tên hiển thị (editable)
   - Email (disabled)
   - Phân quyền (dropdown)
3. Khi chọn role khác role hiện tại:
   - Hiển thị warning box màu vàng
   - "⚠️ Sau khi lưu, user này sẽ có quyền truy cập trang Admin. User cần đăng nhập lại để cập nhật quyền."
4. Click "💾 Lưu thay đổi"
5. Toast notification:
   - Success: "Đã cấp quyền admin thành công! User cần đăng nhập lại để truy cập trang admin."
   - Error: "Cập nhật thất bại!"

### User nhận quyền Admin
1. Nhận thông báo (qua email/chat - tuỳ implementation)
2. Đăng xuất khỏi tài khoản hiện tại
3. Đăng nhập lại
4. Menu "Admin" xuất hiện trong Header
5. Click vào để truy cập Admin Dashboard

## Testing Checklist

- [ ] User mới đăng ký có role `user`
- [ ] User thường không thể truy cập `/admin/*` routes
- [ ] User thường không thấy menu "Admin" trong Header
- [ ] Admin có thể thay đổi role của user khác
- [ ] Sau khi được cấp quyền admin, user phải đăng nhập lại
- [ ] Token cũ không cho phép truy cập admin endpoints
- [ ] Token mới (sau login) cho phép truy cập admin endpoints
- [ ] Backend validate role ở mọi admin endpoint
- [ ] Frontend validate role trước khi render admin UI

## Lưu ý quan trọng

⚠️ **User PHẢI đăng nhập lại** sau khi role thay đổi vì:
- JWT token cũ chứa role cũ
- Token không tự động cập nhật
- Backend validate role từ token, không query database mỗi request
- Đây là thiết kế bảo mật chuẩn của JWT

💡 **Best Practices:**
- Admin nên thông báo trước cho user về việc cấp/thu hồi quyền
- Có thể implement "force logout" bằng cách blacklist token cũ
- Có thể thêm token expiry ngắn (15-30 phút) để role tự động refresh
