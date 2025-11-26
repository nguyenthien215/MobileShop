# 01 - Setup Frontend

## Mục tiêu
Khởi tạo project React + TypeScript với các công cụ và thư viện cần thiết cho trang web bán điện thoại.

---

## Task 1: Khởi tạo Project

### 1.1. Tạo project React với Vite
```bash
npm create vite@latest client -- --template react-ts
cd client
```

**Output mong đợi:**
- Folder `client/` được tạo
- File `package.json`, `tsconfig.json`, `vite.config.ts` có sẵn

### 1.2. Cài đặt dependencies cơ bản
```bash
npm install
```

**Verify:**
```bash
npm run dev
```
- Server dev chạy tại `http://localhost:5173`
- Trang React mặc định hiển thị

---

## Task 2: Cài đặt Dependencies

### 2.1. Routing
```bash
npm install react-router-dom
```

**Mục đích:** Điều hướng giữa các trang (Home, Products, Cart, Login...)

### 2.2. HTTP Client
```bash
npm install axios
```

**Mục đích:** Gọi API từ backend

### 2.3. State Management
```bash
npm install zustand
```

**Mục đích:** Quản lý state toàn cục (Auth, Cart, Theme)

### 2.4. Icons
```bash
npm install react-icons
```

**Mục đích:** Icons cho UI (FaShoppingCart, FaUser, FaStar...)

### 2.5. Form Validation (optional)
```bash
npm install react-hook-form
```

**Mục đích:** Validate form đăng ký, đăng nhập

---

## Task 3: Cấu hình TailwindCSS

### 3.1. Cài đặt TailwindCSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Output:**
- File `tailwind.config.js`
- File `postcss.config.js`

### 3.2. Cấu hình tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Chú ý:** `darkMode: 'class'` để hỗ trợ Dark Mode

### 3.3. Thêm Tailwind directives vào CSS
**File:** `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS variables cho dark mode */
:root {
  --bg: #ffffff;
  --text: #000000;
  --card: #f3f4f6;
  --border: #e5e7eb;
}

.dark {
  --bg: #1f2937;
  --text: #f9fafb;
  --card: #374151;
  --border: #4b5563;
}
```

### 3.4. Verify TailwindCSS
**File:** `src/App.tsx`
```tsx
function App() {
  return (
    <div className="min-h-screen bg-blue-500 text-white">
      <h1 className="text-4xl font-bold text-center pt-10">
        TailwindCSS Works!
      </h1>
    </div>
  );
}
```

**Test:** Chạy `npm run dev` → Nền xanh, chữ trắng hiển thị

---

## Task 4: Tạo Cấu trúc Thư mục

### 4.1. Cấu trúc thư mục chuẩn
```
src/
├── api/                    # Axios config & API calls
│   ├── axiosConfig.ts
│   ├── authApi.ts
│   ├── productApi.ts
│   ├── cartApi.ts
│   ├── orderApi.ts
│   └── userApi.ts
├── assets/                 # Hình ảnh, fonts
│   └── img/
├── components/             # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── admin/
│       ├── AdminSidebar.tsx
│       └── AdminTopBar.tsx
├── contexts/               # Context API / Zustand stores
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
├── hooks/                  # Custom hooks
│   └── useDebounce.ts
├── layouts/                # Layout wrappers
│   ├── MainLayout.tsx
│   └── AdminLayout.tsx
├── pages/                  # Route pages
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Orders.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── AccountSettings.tsx
│   └── admin/
│       ├── Dashboard.tsx
│       ├── Users.tsx
│       ├── Products.tsx
│       ├── Categories.tsx
│       ├── Orders.tsx
│       ├── Reviews.tsx
│       ├── Payments.tsx
│       └── Settings.tsx
├── utils/                  # Helper functions
│   ├── formatPrice.ts
│   └── getImageUrl.ts
├── App.tsx                 # Main App component
├── main.tsx                # Entry point
└── index.css               # Global styles
```

### 4.2. Tạo thư mục bằng lệnh
**PowerShell:**
```powershell
mkdir src\api, src\assets\img, src\components\admin, src\contexts, src\hooks, src\layouts, src\pages\admin, src\utils
```

---

## Task 5: Cấu hình Environment Variables

### 5.1. Tạo file .env
**File:** `.env` (root của client/)
```env
VITE_API_URL=http://localhost:5000
```

**Chú ý:** Vite yêu cầu prefix `VITE_` cho env variables

### 5.2. Sử dụng trong code
```typescript
const API_URL = import.meta.env.VITE_API_URL;
console.log('API URL:', API_URL); // http://localhost:5000
```

---

## Task 6: Setup Axios Config

### 6.1. Tạo file axiosConfig.ts
**File:** `src/api/axiosConfig.ts`
```typescript
import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Tự động thêm token vào header
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
```

**Chức năng:**
- Base URL: `http://localhost:5000/api`
- Tự động thêm JWT token vào mọi request
- Reusable cho tất cả API calls

---

## Task 7: Setup React Router

### 7.1. Cấu hình routes cơ bản
**File:** `src/App.tsx`
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 7.2. Tạo placeholder pages
**File:** `src/pages/Home.tsx`
```typescript
export default function Home() {
  return <div className="p-8">Home Page</div>;
}
```

**File:** `src/pages/Login.tsx`
```typescript
export default function Login() {
  return <div className="p-8">Login Page</div>;
}
```

**File:** `src/pages/Register.tsx`
```typescript
export default function Register() {
  return <div className="p-8">Register Page</div>;
}
```

---

## Task 8: Verify Setup

### 8.1. Checklist
- [ ] `npm run dev` chạy không lỗi
- [ ] TailwindCSS hoạt động (test với bg-blue-500)
- [ ] Navigate giữa `/`, `/login`, `/register` thành công
- [ ] Console không có error
- [ ] TypeScript không báo lỗi type

### 8.2. Test routing
- Vào `http://localhost:5173/` → Home Page
- Vào `http://localhost:5173/login` → Login Page
- Vào `http://localhost:5173/register` → Register Page

---

## Kết quả mong đợi

✅ **Đã hoàn thành:**
1. Project React + TypeScript với Vite
2. TailwindCSS + Dark Mode support
3. React Router với 3 routes cơ bản
4. Axios instance với token interceptor
5. Cấu trúc thư mục chuẩn
6. Environment variables

✅ **Sẵn sàng cho:**
- Xây dựng components (Header, Footer...)
- Tích hợp API backend
- Implement authentication
- Xây dựng trang Home, Products, Cart...

---

## Next Steps

Chuyển sang:
- **02_home.md** - Xây dựng trang chủ với Header, Banner, Product Listing
- **06_login_register_logout.md** - Implement authentication flow
