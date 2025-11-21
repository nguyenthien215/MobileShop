# Hệ thống Quản lý Tài khoản Admin

## Tổng quan

Hệ thống cho phép mỗi tài khoản admin quản lý thông tin cá nhân của mình bao gồm:
- Avatar (ảnh đại diện)
- Họ và tên
- Email (chỉ xem, không thể sửa)
- Đổi mật khẩu

**Đặc điểm:**
- ✅ Mỗi admin có thông tin riêng được lưu trong database
- ✅ Avatar và tên hiển thị trên header admin và header trang chủ
- ✅ Thông tin được đồng bộ giữa trang admin và trang chủ
- ✅ Admin không hiển thị menu "Thông tin tài khoản" ở trang chủ (chỉ có nút "Trang Admin")
- ✅ User thường không thấy trang admin, chỉ có "Thông tin tài khoản" và "Đơn hàng của tôi"

## Cấu trúc File

### Frontend

#### 1. `/client/src/pages/admin/Settings.tsx`
**Mục đích:** Trang quản lý tài khoản admin (thay thế Settings.tsx cũ dùng localStorage)

**Tính năng:**
- Upload avatar (max 5MB, hỗ trợ JPEG, PNG, GIF, WEBP)
- Cập nhật họ và tên
- Hiển thị email (read-only)
- Đổi mật khẩu với validation
- Show/hide password toggles
- Toast notifications

**API calls:**
```typescript
// Load thông tin
const response = await userApi.getProfile();

// Upload avatar
const formData = new FormData();
formData.append('avatar', avatarFile);
await userApi.uploadAvatar(formData);

// Cập nhật tên
await userApi.updateProfile({ name });

// Đổi mật khẩu
await userApi.changePassword({ currentPassword, newPassword });
```

**State Management:**
- Sử dụng `useAuthStore` để lấy user info và update
- Sau khi cập nhật: `setAuth(updatedUser, token)` + `window.location.reload()`
- Reload để đồng bộ header

#### 2. `/client/src/components/admin/AdminTopBar.tsx`
**Thay đổi:**
- ❌ Xóa localStorage logic (`adminNickname`, `adminAvatar`)
- ✅ Hiển thị `user.avatar` và `user.name` từ `useAuthStore`
- ✅ Menu "Thông tin tài khoản" thay vì "Cài đặt"

**Trước:**
```tsx
<span>Admin({nickname || 'admin'})</span>
<img src={avatar} /> // từ localStorage
```

**Sau:**
```tsx
<span>{user.name}</span>
<img src={`http://localhost:5000${user.avatar}`} />
```

#### 3. `/client/src/components/admin/AdminSidebar.tsx`
**Thay đổi:**
- Icon: `FaCog` → `FaUserCog`
- Label: "Cài đặt" → "Thông tin tài khoản"

#### 4. `/client/src/components/Header.tsx`
**Logic phân quyền menu:**
```tsx
{user.role === 'admin' && (
    <Link to="/admin/dashboard">Trang Admin</Link>
)}
{user.role !== 'admin' && (
    <>
        <Link to="/account-settings">Thông tin tài khoản</Link>
        <Link to="/orders">Đơn hàng của tôi</Link>
    </>
)}
<button onClick={handleLogout}>Đăng xuất</button>
```

**Hiển thị avatar:**
```tsx
{user.avatar ? (
    <img src={`http://localhost:5000${user.avatar}`} />
) : (
    <FaUserCircle />
)}
```

### Backend

**Endpoints đã có sẵn:**
```javascript
// GET /api/user/profile
// Lấy thông tin user hiện tại

// PUT /api/user/profile
// Body: { name: string }
// Cập nhật tên

// POST /api/user/upload-avatar
// FormData: avatar (file)
// Upload và lưu avatar

// PUT /api/user/change-password
// Body: { currentPassword: string, newPassword: string }
// Đổi mật khẩu với validation
```

**Middleware:**
- `jwt.middleware.js`: Xác thực token
- `isAdmin.middleware.js`: Kiểm tra role === 'admin'

## Quy trình hoạt động

### 1. Admin đăng nhập
```
1. POST /api/auth/login
2. Response: { user: { id, name, email, role: 'admin', avatar }, token }
3. Frontend: setAuth(user, token)
4. localStorage: user + token được lưu
5. Navigate: /admin/dashboard
```

### 2. Hiển thị thông tin trên Header
**AdminTopBar (trang admin):**
```tsx
const { user } = useAuthStore();
// user.name → "Nguyễn Văn A"
// user.avatar → "/uploads/avatars/abc123.jpg"
```

**Header (trang chủ):**
```tsx
const { user } = useAuthStore();
// Nếu admin: chỉ hiển thị "Trang Admin" + "Đăng xuất"
// Avatar và tên vẫn hiển thị giống nhau
```

### 3. Cập nhật thông tin
**Tại `/admin/settings`:**

#### Upload Avatar:
```
1. User chọn file → preview local
2. Submit form
3. POST /api/user/upload-avatar với FormData
4. Backend lưu file vào /uploads/avatars/
5. Backend cập nhật user.avatar trong DB
6. Response: { avatar: '/uploads/avatars/newfile.jpg' }
7. Frontend: setAuth({ ...user, avatar: newAvatar }, token)
8. window.location.reload() → header cập nhật
```

#### Cập nhật tên:
```
1. User nhập tên mới
2. Submit form
3. PUT /api/user/profile { name: 'Tên mới' }
4. Backend cập nhật user.name trong DB
5. Response: { user: updatedUser }
6. Frontend: setAuth(updatedUser, token)
7. window.location.reload() → header cập nhật
```

#### Đổi mật khẩu:
```
1. User nhập: currentPassword, newPassword, confirmPassword
2. Validate: newPassword === confirmPassword && length >= 6
3. PUT /api/user/change-password
4. Backend: bcrypt.compare(currentPassword, user.passwordHash)
5. Nếu đúng: hash newPassword và lưu
6. Response: { message: 'Đổi mật khẩu thành công' }
7. Frontend: clear password fields, show toast
```

### 4. Đồng bộ giữa trang admin và trang chủ
**Cơ chế:**
- Cả hai đều dùng `useAuthStore` → cùng 1 nguồn dữ liệu
- Data lưu trong `localStorage`:
  ```json
  {
    "user": {
      "id": "uuid",
      "name": "Nguyễn Văn A",
      "email": "admin@example.com",
      "role": "admin",
      "avatar": "/uploads/avatars/abc123.jpg"
    },
    "token": "jwt_token_here"
  }
  ```
- Khi cập nhật: `setAuth(newUser, token)` → ghi vào localStorage
- `window.location.reload()` → tất cả component re-mount với data mới

## Điểm khác biệt so với User thường

| Feature | Admin | User |
|---------|-------|------|
| **Trang quản lý TK** | `/admin/settings` | `/account-settings` |
| **Menu trang chủ** | Trang Admin + Đăng xuất | Thông tin TK + Đơn hàng + Đăng xuất |
| **Avatar/Tên hiển thị** | Có (cả admin & trang chủ) | Có (chỉ trang chủ) |
| **Đổi mật khẩu** | ✅ | ✅ |
| **Upload avatar** | ✅ | ✅ |
| **Xem đơn hàng** | Quản lý tất cả (admin panel) | Chỉ đơn hàng của mình |

## Database Schema

### users table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  avatar VARCHAR(255) NULL,  -- Path: /uploads/avatars/filename.ext
  createdAt DATETIME,
  updatedAt DATETIME
);
```

**Avatar storage:**
- Folder: `server/uploads/avatars/`
- Format: `{timestamp}-{random}-{originalname}`
- Max size: 5MB
- Types: JPEG, PNG, GIF, WEBP

## Testing Checklist

### Admin Account Management
- [ ] Admin login → redirect to `/admin/dashboard`
- [ ] AdminTopBar hiển thị đúng avatar và tên từ database
- [ ] Click menu → "Thông tin tài khoản" (không phải "Cài đặt")
- [ ] Vào `/admin/settings` → load đúng thông tin hiện tại
- [ ] Upload avatar → preview → submit → avatar cập nhật trên header
- [ ] Sửa tên → submit → tên cập nhật trên header
- [ ] Email field disabled, không sửa được
- [ ] Đổi mật khẩu thành công với mật khẩu hiện tại đúng
- [ ] Đổi mật khẩu thất bại với mật khẩu hiện tại sai
- [ ] Validation: mật khẩu mới >= 6 ký tự
- [ ] Validation: mật khẩu mới === xác nhận mật khẩu
- [ ] Toast notifications hiển thị đúng

### Header Sync
- [ ] Avatar admin hiển thị đồng bộ trên AdminTopBar
- [ ] Avatar admin hiển thị đồng bộ trên Header trang chủ
- [ ] Tên admin hiển thị đồng bộ ở cả 2 nơi
- [ ] Sau khi cập nhật avatar/tên, reload page → data vẫn giữ nguyên

### Permission Separation
- [ ] Admin ở trang chủ: chỉ thấy "Trang Admin" + "Đăng xuất"
- [ ] Admin KHÔNG thấy "Thông tin tài khoản" và "Đơn hàng của tôi" ở menu trang chủ
- [ ] User thường: thấy "Thông tin TK" + "Đơn hàng" + "Đăng xuất"
- [ ] User thường KHÔNG thấy "Trang Admin"
- [ ] Admin vẫn có thể vào `/account-settings` nếu gõ URL trực tiếp (không có bug)
- [ ] Nhưng trong UX thông thường, admin dùng `/admin/settings`

### Persistence
- [ ] Đăng xuất → đăng nhập lại → avatar và tên vẫn giữ nguyên
- [ ] Refresh page → avatar và tên không bị mất
- [ ] Đổi trình duyệt/thiết bị → data từ database, không bị mất

## Migration từ localStorage sang Database

**Dữ liệu cũ (localStorage):**
```javascript
localStorage.getItem('adminNickname')
localStorage.getItem('adminAvatar') // base64 string
```

**Dữ liệu mới (database):**
```javascript
user.name // từ users table
user.avatar // path: /uploads/avatars/file.jpg
```

**Hành động:**
- ✅ Xóa tất cả `localStorage.getItem/setItem` cho admin nickname/avatar
- ✅ Thay bằng `useAuthStore().user.name` và `user.avatar`
- ✅ AdminTopBar không còn useEffect load localStorage
- ✅ Settings.tsx không còn `saveProfile`, `resetProfile` với localStorage

## Lưu ý quan trọng

### 1. Avatar URL
**Đúng:**
```tsx
<img src={`http://localhost:5000${user.avatar}`} />
// user.avatar = "/uploads/avatars/file.jpg"
// Full URL = "http://localhost:5000/uploads/avatars/file.jpg"
```

**Sai:**
```tsx
<img src={user.avatar} />
// Sẽ tìm file local, không tìm thấy
```

### 2. Window Reload
**Tại sao cần reload?**
- AuthStore update localStorage
- Nhưng các component khác (Header, AdminTopBar) chưa re-render
- `window.location.reload()` → re-mount tất cả → đọc data mới

**Alternative (không dùng reload):**
- Implement global event listener
- Hoặc dùng Zustand subscriptions
- Nhưng reload đơn giản hơn cho case này

### 3. Token không thay đổi
- Khi update profile, chỉ user object thay đổi
- Token vẫn giữ nguyên
- `setAuth(updatedUser, token)` → user mới, token cũ

### 4. Admin vẫn là User
- Admin có role = 'admin' trong users table
- Vẫn dùng cùng endpoints: `/user/profile`, `/user/upload-avatar`
- Backend không cần thêm admin-specific profile endpoints
- Middleware `jwt` xác thực admin cũng là user

## Troubleshooting

### Avatar không hiển thị
**Nguyên nhân:**
- Path sai: thiếu `http://localhost:5000`
- File không tồn tại trong `/uploads/avatars/`
- CORS issue (nếu frontend khác port)

**Fix:**
```tsx
// Kiểm tra path
console.log('Avatar path:', user.avatar);
console.log('Full URL:', `http://localhost:5000${user.avatar}`);

// Fallback icon
{user.avatar ? (
    <img src={`http://localhost:5000${user.avatar}`} 
         onError={() => console.error('Avatar load failed')} />
) : (
    <FaUserCircle />
)}
```

### Tên không cập nhật trên header
**Nguyên nhân:**
- Quên reload: `window.location.reload()`
- AuthStore không update: kiểm tra `setAuth()`

**Fix:**
```typescript
// Sau khi update
const response = await userApi.updateProfile({ name });
const updatedUser = response.data.user;
if (token) {
    setAuth(updatedUser, token); // Quan trọng!
}
window.location.reload(); // Đồng bộ UI
```

### Menu hiển thị sai
**Kiểm tra:**
```tsx
// Header.tsx
console.log('User role:', user.role);

{user.role === 'admin' && <Link to="/admin/dashboard">Trang Admin</Link>}
{user.role !== 'admin' && <Link to="/account-settings">Thông tin TK</Link>}
```

## Best Practices

1. **Validation avatar trước khi upload:**
   - Kiểm tra kích thước (max 5MB)
   - Kiểm tra định dạng (JPEG, PNG, GIF, WEBP)
   - Preview trước khi submit

2. **Password validation:**
   - Mật khẩu hiện tại phải đúng
   - Mật khẩu mới >= 6 ký tự
   - Xác nhận mật khẩu phải khớp

3. **Error handling:**
   - Hiển thị toast notification rõ ràng
   - Log errors vào console để debug
   - Fallback UI nếu avatar lỗi

4. **Security:**
   - Email không cho phép sửa (prevent account takeover)
   - Mật khẩu hiện tại required để đổi mật khẩu
   - JWT token xác thực mọi request

5. **UX:**
   - Loading states khi đang xử lý
   - Disable buttons khi loading
   - Success feedback sau mỗi action
   - Reload để đồng bộ UI ngay lập tức
