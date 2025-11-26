# 02 - Xây dựng Trang chủ (Home Page)

## Mục tiêu
Xây dựng trang chủ hoàn chỉnh với Header, Banner slideshow, và các sections hiển thị sản phẩm từ database.

---

## Task 1: Xây dựng Header Component

### 1.1. Tạo cấu trúc Header
**File:** `src/components/Header.tsx`

**Các thành phần:**
- Logo (trái)
- Search bar (giữa)
- Icons: Dark/Light mode, Cart, User menu (phải)
- Navigation menu (dưới)

### 1.2. Implement Header - Phần 1: Logo & Search

```typescript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaMoon, FaSun } from 'react-icons/fa';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  return (
    <header className="bg-green-700 text-white">
      {/* Top Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            📱 MobiStore
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative flex">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-l-lg text-gray-800"
              />
              <button 
                type="submit"
                className="px-6 bg-yellow-500 rounded-r-lg hover:bg-yellow-600"
              >
                <FaSearch className="text-gray-800" />
              </button>
            </div>
          </form>

          {/* Right Icons - sẽ implement sau */}
        </div>
      </div>
    </header>
  );
}
```

**Checklist Task 1.2:**
- [ ] Logo hiển thị, link về `/`
- [ ] Search bar hiển thị đúng
- [ ] Nhập text và submit → navigate to `/products?search=...`

### 1.3. Implement Header - Phần 2: Theme Toggle

**Update Header.tsx - thêm Theme Context:**

**File:** `src/contexts/ThemeContext.tsx` (tạo mới)
```typescript
import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Load theme từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
```

**Checklist Task 1.3:**
- [ ] Click icon → toggle light/dark mode
- [ ] Reload page → theme được giữ nguyên
- [ ] Nền và text đổi màu smooth với CSS transition

### 1.4. Implement Header - Phần 3: User Menu & Navigation

**Checklist Task 1.4:**
- [ ] Khi chưa đăng nhập: hiển thị nút "Đăng nhập" & "Đăng ký"
- [ ] Khi đã đăng nhập: hiển thị avatar + tên user
- [ ] Click vào user menu → dropdown xuất hiện
- [ ] Admin: thấy "Trang Admin"
- [ ] User: thấy "Thông tin tài khoản" + "Đơn hàng của tôi"

**Navigation Checklist:**
- [ ] 4 menu items hiển thị: Trang chủ, Điện thoại, Laptop, Phụ kiện
- [ ] Click vào → navigate đúng với query `?category=...`

---

## Task 2: Xây dựng Banner Slideshow

### 2.1. Tạo Banner Component
**File:** `src/components/Banner.tsx`

**Tính năng:**
- Hiển thị 3 ảnh banner
- Auto slide mỗi 5 giây
- Dots indicators ở dưới
- Previous/Next buttons

```typescript
import { useState, useEffect } from 'react';

const bannerImages = [
  '/src/assets/img/banner1.jpg',
  '/src/assets/img/banner2.jpg',
  '/src/assets/img/banner3.jpg',
];

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Implementation...
}
```

**Checklist Task 2:**
- [ ] 3 ảnh banner hiển thị
- [ ] Auto slide mỗi 5 giây
- [ ] Click dots → chuyển slide
- [ ] Click nút Previous/Next → chuyển slide
- [ ] Smooth transition animation

---

## Task 3: Xây dựng Product Card Component

### 3.1. Tạo ProductCard Component
**File:** `src/components/ProductCard.tsx`

**Hiển thị:**
- Ảnh sản phẩm (hover → scale + overlay)
- Tên sản phẩm (line-clamp-2)
- Rating stars + số đánh giá
- Giá tiền (format VNĐ)
- Nút "Xem chi tiết" + "Thêm giỏ hàng"

```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  avgRating?: number;
  reviewCount?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  // Implementation...
}
```

**Checklist Task 3:**
- [ ] Card hiển thị đẹp với image, name, price, rating
- [ ] Hover vào image → scale + overlay
- [ ] Price format VNĐ đúng
- [ ] Stars rating hiển thị đúng (1-5 sao)
- [ ] Nút "Xem chi tiết" link đến `/products/:slug`
- [ ] Nút "Thêm giỏ hàng" có icon FaShoppingCart

---

## Task 4: Xây dựng Home Page với Product Sections

### 4.1. Tạo API helper
**File:** `src/api/productApi.ts`

```typescript
export const productApi = {
  getProducts: (params?: { search?: string; category?: string }) => 
    axiosInstance.get('/products', { params }),
    
  getProductBySlug: (slug: string) => 
    axiosInstance.get(`/products/${slug}`),
};
```

### 4.2. Xây dựng Home Page Structure
**File:** `src/pages/Home.tsx`

**Sections:**
1. Banner slideshow
2. Sản phẩm nổi bật (8 sản phẩm)
3. Điện thoại (4 sản phẩm)
4. Laptop (4 sản phẩm)
5. Phụ kiện (4 sản phẩm)

**Data Flow:**
```typescript
useEffect(() => {
  loadProducts();
}, []);

const loadProducts = async () => {
  // 1. Fetch all products từ API
  const response = await productApi.getProducts({ limit: 20 });
  
  // 2. Filter theo category
  setFeaturedProducts(allProducts.slice(0, 8));
  setPhoneProducts(allProducts.filter(p => p.Category?.slug === 'dien-thoai'));
  setLaptopProducts(allProducts.filter(p => p.Category?.slug === 'laptop'));
  setAccessoryProducts(allProducts.filter(p => p.Category?.slug === 'phu-kien'));
};
```

**Checklist Task 4:**
- [ ] Home page load products từ API
- [ ] Loading spinner khi đang fetch
- [ ] 4 sections hiển thị đúng products
- [ ] Grid responsive: 1 col (mobile) → 2 cols (tablet) → 4 cols (desktop)
- [ ] "Xem tất cả" link đúng với category filter
- [ ] Empty state: "Chưa có sản phẩm nào"

---

## Task 5: Integrate Header & Footer vào Layout

### 5.1. Tạo MainLayout
**File:** `src/layouts/MainLayout.tsx`

```typescript
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

### 5.2. Tạo Footer Component
**File:** `src/components/Footer.tsx`

**Nội dung:**
- Column 1: Logo + slogan
- Column 2: Liên kết (Về chúng tôi, Liên hệ, Chính sách)
- Column 3: Thông tin liên hệ (Hotline, Email, Địa chỉ)
- Copyright footer

**Checklist Task 5:**
- [ ] Layout Header-Content-Footer hoạt động
- [ ] Header sticky top (optional)
- [ ] Footer hiển thị đủ 3 columns
- [ ] Responsive: 1 col (mobile) → 3 cols (desktop)

---

## Kết quả mong đợi

✅ **Home Page hoàn chỉnh:**
1. Header với logo, search, theme toggle, cart, user menu, navigation
2. Banner slideshow tự động chuyển ảnh mỗi 5s
3. Section "Sản phẩm nổi bật" - 8 products
4. Section "Điện thoại" - 4 products với filter category
5. Section "Laptop" - 4 products
6. Section "Phụ kiện" - 4 products
7. ProductCard component responsive với hover effects
8. Footer với thông tin liên hệ

✅ **Tính năng:**
- Responsive design (mobile → tablet → desktop)
- Dark/Light mode toggle với localStorage
- Search functionality
- User authentication UI (đăng nhập/đăng ký)
- Admin menu (nếu user.role === 'admin')
- Cart icon với badge số lượng

✅ **Performance:**
- Loading state khi fetch data
- Smooth animations (transitions, hover effects)
- Optimized images
- Lazy loading (optional)

---

## Testing Checklist

### Visual
- [ ] Tất cả components hiển thị đúng layout
- [ ] Dark mode hoạt động toàn trang
- [ ] Responsive ở các breakpoints: 320px, 768px, 1024px, 1440px

### Functionality
- [ ] Search bar submit → navigate với query params
- [ ] Theme toggle → persist sau reload
- [ ] Banner auto-slide + manual controls
- [ ] Product cards link đúng đến product detail
- [ ] User menu dropdown (nếu đã login)
- [ ] Navigation links đúng categories

### API Integration
- [ ] Products load từ backend
- [ ] Filter products theo category
- [ ] Handle loading state
- [ ] Handle error state (nếu API fail)

---

## Next Steps

Chuyển sang:
- **03_orders_payments.md** - Checkout flow & payment integration
- **04_add_cart.md** - Shopping cart functionality
- **05_search_products.md** - Search & filter products
- **06_login_register_logout.md** - Complete authentication