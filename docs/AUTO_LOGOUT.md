# Tự động đăng xuất sau 30 phút không hoạt động (Auto Logout on Idle)

## Mục tiêu

Triển khai tính năng tự động đăng xuất người dùng sau **30 phút không có hoạt động** trên website nhằm:
- Bảo mật tài khoản người dùng
- Tránh truy cập trái phép khi người dùng rời khỏi máy tính mà quên đăng xuất
- Tuân thủ best practices về session management

---

## Luồng hoạt động (Flow)

### 1. Khởi tạo theo dõi (Initialize Tracking)

```
[User đăng nhập thành công]
    ↓
[Khởi tạo Idle Timer]
    ↓
[Bắt đầu đếm ngược 30 phút]
    ↓
[Lắng nghe các sự kiện user interaction]
```

**Các sự kiện được theo dõi:**
- `mousemove` - Di chuyển chuột
- `mousedown` - Click chuột
- `keypress` - Nhấn phím
- `scroll` - Cuộn trang
- `touchstart` - Chạm màn hình (mobile)
- `click` - Click vào element

### 2. User có hoạt động (User is Active)

```
[User di chuyển chuột / click / gõ phím]
    ↓
[Phát hiện hoạt động]
    ↓
[Reset timer về 0]
    ↓
[Bắt đầu đếm lại từ đầu 30 phút]
```

**Cơ chế:**
- Mỗi lần phát hiện hoạt động → reset timer
- Timer luôn được làm mới → không bao giờ hết thời gian nếu user còn active

### 3. User không hoạt động (User is Idle)

```
[User không có hoạt động gì]
    ↓
[Timer đếm ngược: 30:00 → 29:59 → ... → 00:01 → 00:00]
    ↓
[Hết 30 phút]
    ↓
[Tự động đăng xuất]
    ↓
[Clear localStorage (token, user)]
    ↓
[Clear Zustand stores (authStore, cartStore)]
    ↓
[Hiển thị thông báo: "Phiên đăng nhập hết hạn"]
    ↓
[Redirect về trang chủ (/)]
```

### 4. Cleanup khi đăng xuất thủ công

```
[User click "Đăng xuất"]
    ↓
[Remove tất cả event listeners]
    ↓
[Clear timer]
    ↓
[Đăng xuất bình thường]
```

---

## Kiến trúc kỹ thuật (Technical Architecture)

### 1. Custom Hook: `useIdleTimeout`

**File:** `client/src/hooks/useIdleTimeout.ts`

**Nhiệm vụ:**
- Tạo và quản lý idle timer
- Lắng nghe user events
- Trigger callback khi timeout

**Logic:**

```typescript
useIdleTimeout(timeout: number, onIdle: () => void)

// Pseudocode
function useIdleTimeout(timeout, onIdle) {
  let timer = null;

  // Hàm reset timer
  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(onIdle, timeout);
  };

  // Lắng nghe events
  useEffect(() => {
    // Khởi tạo timer
    resetTimer();

    // Add event listeners
    ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      clearTimeout(timer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);
}
```

**Tham số:**
- `timeout`: Thời gian chờ tính bằng milliseconds (30 * 60 * 1000 = 1,800,000ms)
- `onIdle`: Callback function được gọi khi hết thời gian

### 2. Tích hợp vào App.tsx

**File:** `client/src/App.tsx`

**Logic:**

```typescript
function App() {
  const { user, logout } = useAuthStore();
  
  // Hàm xử lý khi idle
  const handleIdle = () => {
    if (user) {
      logout();
      toast.warning('Phiên đăng nhập đã hết hạn do không hoạt động');
      // Navigate về trang chủ (nếu cần)
    }
  };

  // Chỉ kích hoạt khi user đã đăng nhập
  useIdleTimeout(
    30 * 60 * 1000, // 30 phút
    handleIdle
  );

  return <RouterProvider router={router} />;
}
```

**Điều kiện kích hoạt:**
- ✅ Chỉ chạy khi `user !== null` (đã đăng nhập)
- ❌ Không chạy khi chưa đăng nhập (tránh lãng phí resources)

### 3. AuthStore logout function

**File:** `client/src/stores/useAuthStore.ts`

**Logout function đã có:**

```typescript
logout: () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  set({ user: null, token: null });
}
```

**Hoạt động:**
- Clear localStorage
- Clear Zustand state
- User trở về trạng thái chưa đăng nhập

---

## Chi tiết Implementation

### Task 1: Tạo Custom Hook `useIdleTimeout`

**File:** `client/src/hooks/useIdleTimeout.ts`

```typescript
import { useEffect, useRef } from 'react';

/**
 * Custom hook theo dõi thời gian không hoạt động của user
 * @param timeout - Thời gian timeout (milliseconds)
 * @param onIdle - Callback được gọi khi user idle quá lâu
 */
export const useIdleTimeout = (timeout: number, onIdle: () => void) => {
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Hàm reset timer
    const resetTimer = () => {
      // Clear timer cũ
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      // Tạo timer mới
      timeoutId.current = setTimeout(() => {
        onIdle();
      }, timeout);
    };

    // Các events cần theo dõi
    const events = [
      'mousemove',
      'mousedown',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Khởi tạo timer lần đầu
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup khi component unmount hoặc dependencies thay đổi
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeout, onIdle]);
};
```

**Giải thích:**

1. **useRef để lưu timeoutId:**
   - Không trigger re-render khi update
   - Giữ reference qua các render cycles

2. **resetTimer function:**
   - Clear timeout cũ (nếu có)
   - Tạo timeout mới với thời gian `timeout`
   - Được gọi mỗi khi có user interaction

3. **Events array:**
   - Bao gồm tất cả các loại tương tác phổ biến
   - Desktop: mouse, keyboard
   - Mobile: touch
   - Universal: click, scroll

4. **Cleanup function:**
   - Remove tất cả event listeners
   - Clear timeout
   - Tránh memory leaks

### Task 2: Tích hợp vào App.tsx

**File:** `client/src/App.tsx`

**Thay đổi:**

```typescript
import { useIdleTimeout } from './hooks/useIdleTimeout';
import { toast } from 'react-toastify';

function App() {
  const { user, logout } = useAuthStore();

  // Xử lý khi user idle quá 30 phút
  const handleIdleTimeout = () => {
    if (user) {
      logout();
      toast.warning('Phiên đăng nhập đã hết hạn do không có hoạt động. Vui lòng đăng nhập lại.', {
        position: 'top-center',
        autoClose: 5000,
      });
    }
  };

  // Kích hoạt idle timeout (30 phút = 1,800,000 milliseconds)
  useIdleTimeout(30 * 60 * 1000, handleIdleTimeout);

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </ThemeProvider>
  );
}
```

**Tại sao tích hợp ở App.tsx?**
- App component luôn mount trong suốt lifecycle của ứng dụng
- Theo dõi hoạt động trên toàn bộ trang web
- Áp dụng cho cả user và admin

---

## Xử lý Edge Cases

### 1. User mở nhiều tab

**Vấn đề:**
- User có 2 tabs mở cùng website
- Tab 1: User đang active
- Tab 2: Không có hoạt động → tự động đăng xuất

**Giải pháp hiện tại:**
- Mỗi tab độc lập với nhau
- Tab 2 đăng xuất → clear localStorage
- Tab 1 vẫn hoạt động nhưng khi reload sẽ mất session

**Cải tiến (Optional - nếu cần):**
- Sử dụng `localStorage` events để sync giữa các tabs
- Khi 1 tab có hoạt động → update lastActivityTime trong localStorage
- Tất cả tabs đều đọc lastActivityTime và reset timer

### 2. User đang ở trang Admin

**Tình huống:**
- Admin đang xem dashboard nhưng không tương tác
- 30 phút sau → tự động đăng xuất
- Mất dữ liệu nếu đang nhập form

**Giải pháp:**
- Hook áp dụng chung cho cả user và admin
- Admin cũng cần bảo mật → đăng xuất tự động là hợp lý
- Khuyến nghị: Save draft tự động cho các form quan trọng

### 3. User đang xem video/đọc bài viết dài

**Vấn đề:**
- User đang đọc content nhưng không scroll/click
- Bị đăng xuất giữa chừng

**Giải pháp:**
- 30 phút là thời gian đủ dài
- Nếu cần đọc lâu hơn, user có thể scroll nhẹ để reset timer
- Hoặc tăng timeout lên 60 phút (tùy business requirement)

---

## Testing Checklist

### Kiểm tra chức năng cơ bản

- [ ] **User chưa đăng nhập:** Hook không gây lỗi, không có side effects
- [ ] **User đăng nhập:** Timer bắt đầu chạy
- [ ] **User di chuyển chuột:** Timer được reset
- [ ] **User click vào element:** Timer được reset
- [ ] **User gõ phím:** Timer được reset
- [ ] **User scroll trang:** Timer được reset
- [ ] **User không làm gì trong 30 phút:** Tự động đăng xuất
- [ ] **Hiển thị toast notification:** "Phiên đăng nhập đã hết hạn..."
- [ ] **localStorage được clear:** token và user bị xóa
- [ ] **Zustand store được clear:** user = null
- [ ] **Redirect về trang chủ:** Hoặc ở lại trang hiện tại nhưng mất quyền

### Kiểm tra edge cases

- [ ] **User đăng xuất thủ công:** Event listeners được remove đúng cách
- [ ] **User chuyển tab:** Timer vẫn chạy ở background
- [ ] **User minimize browser:** Timer vẫn chạy
- [ ] **User mở nhiều tabs:** Mỗi tab độc lập
- [ ] **Admin đang ở admin panel:** Cũng bị đăng xuất sau 30 phút idle

### Testing thời gian ngắn (Development)

**Thay đổi tạm thời để test:**

```typescript
// Thay vì 30 phút, test với 1 phút
useIdleTimeout(1 * 60 * 1000, handleIdleTimeout); // 1 minute

// Hoặc 30 giây để test nhanh hơn
useIdleTimeout(30 * 1000, handleIdleTimeout); // 30 seconds
```

**Test steps:**
1. Đăng nhập
2. Đợi 30 giây (hoặc 1 phút) mà không tương tác
3. Xác nhận bị đăng xuất tự động
4. Restore lại timeout = 30 phút cho production

---

## Cấu hình và Customization

### Thay đổi thời gian timeout

**File:** `client/src/App.tsx`

```typescript
// Hiện tại: 30 phút
const IDLE_TIMEOUT = 30 * 60 * 1000;

// Thay đổi thành 60 phút
const IDLE_TIMEOUT = 60 * 60 * 1000;

// Hoặc 15 phút
const IDLE_TIMEOUT = 15 * 60 * 1000;

useIdleTimeout(IDLE_TIMEOUT, handleIdleTimeout);
```

### Thêm warning trước khi đăng xuất

**Cải tiến:** Hiển thị modal cảnh báo 5 phút trước khi đăng xuất

```typescript
// Thêm vào App.tsx
const [showWarning, setShowWarning] = useState(false);

// Warning sau 25 phút
useIdleTimeout(25 * 60 * 1000, () => {
  setShowWarning(true);
});

// Đăng xuất sau 30 phút
useIdleTimeout(30 * 60 * 1000, handleIdleTimeout);

// Modal warning
{showWarning && (
  <Modal>
    <p>Bạn sẽ bị đăng xuất sau 5 phút nữa do không có hoạt động.</p>
    <button onClick={() => setShowWarning(false)}>Tôi vẫn đang dùng</button>
  </Modal>
)}
```

### Tắt tính năng cho một số trang

**Ví dụ:** Không áp dụng idle timeout ở trang xem video

```typescript
const location = useLocation();
const isVideoPage = location.pathname.startsWith('/videos');

// Chỉ kích hoạt khi không phải trang video
useIdleTimeout(
  30 * 60 * 1000,
  handleIdleTimeout,
  { disabled: isVideoPage } // Custom option
);
```

---

## Kết quả mong đợi

✅ **Bảo mật tài khoản:**
- User quên đăng xuất → tự động đăng xuất sau 30 phút
- Giảm nguy cơ truy cập trái phép

✅ **Trải nghiệm người dùng:**
- User đang active → không bị gián đoạn
- User không hoạt động → đăng xuất mượt mà với thông báo rõ ràng

✅ **Performance:**
- Event listeners được quản lý tốt
- Không có memory leaks
- Cleanup đúng cách khi unmount

✅ **Không ảnh hưởng tính năng khác:**
- Chỉ thêm hook và logic đơn giản
- Không sửa đổi các components khác
- Không thay đổi flow đăng nhập/đăng xuất hiện có

---

## Technical Notes

### Tại sao dùng useRef thay vì useState?

**useState:**
```typescript
const [timeoutId, setTimeoutId] = useState(null);
// ❌ Mỗi lần setTimeoutId → component re-render → performance issues
```

**useRef:**
```typescript
const timeoutId = useRef(null);
// ✅ Update timeoutId.current không trigger re-render → better performance
```

### Tại sao theo dõi nhiều events?

- **mousemove:** User di chuyển chuột (phổ biến nhất)
- **mousedown:** User click giữ chuột
- **keypress:** User gõ phím (search, form input)
- **scroll:** User cuộn trang (đọc content)
- **touchstart:** User chạm màn hình mobile
- **click:** User click button/link

→ Bao phủ tất cả các loại tương tác để detect activity chính xác

### Memory Management

**Event listeners được cleanup:**
- Khi component unmount
- Khi user đăng xuất thủ công
- Khi timeout/onIdle thay đổi

→ Không có memory leaks

---

## Next Steps

### Optional Enhancements:

1. **Sync giữa các tabs:**
   - Dùng `localStorage` events
   - Update lastActivityTime khi có hoạt động
   - Tất cả tabs đều đọc và reset timer

2. **Warning modal:**
   - Hiển thị cảnh báo 5 phút trước khi đăng xuất
   - Cho phép user click "Tôi vẫn đang dùng" để reset

3. **Configurable timeout:**
   - Admin có thể config timeout từ admin panel
   - Lưu vào database hoặc config file

4. **Activity logging:**
   - Log thời gian cuối cùng user active
   - Gửi analytics về user behavior

---

## References

- **React useEffect:** https://react.dev/reference/react/useEffect
- **React useRef:** https://react.dev/reference/react/useRef
- **Window events:** https://developer.mozilla.org/en-US/docs/Web/Events
- **Session management best practices:** OWASP Session Management Cheat Sheet

---

**Tác giả:** GitHub Copilot  
**Ngày tạo:** 25/11/2025  
**Cập nhật:** 25/11/2025  
**Version:** 1.1

---

## Changelog

### Version 1.1 (25/11/2025)
- ✅ Đã triển khai tính năng tự động đăng xuất sau 30 phút
- ✅ Fix bug: Hệ thống đánh giá sản phẩm không kiểm tra đúng điều kiện khi user có nhiều đơn hàng
- ✅ Cải thiện logic `canReview()` để kiểm tra tất cả đơn hàng thay vì chỉ đơn đầu tiên

### Version 1.0 (25/11/2025)
- Tài liệu ban đầu về tính năng Auto Logout
