import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import AccountSettings from './pages/AccountSettings';
import Orders from './pages/Orders';
import OrdersMulti from './pages/OrdersMulti';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import ReviewsAdmin from './pages/admin/ReviewsAdmin';
import PaymentsAdmin from './pages/admin/PaymentsAdmin';
import Settings from './pages/admin/Settings';
import { RequireAuth, RequireAdmin } from './components/RequireAuth';
import { useAuthStore } from './contexts/AuthContext';
import { useIdleTimeout } from './hooks/useIdleTimeout';

export default function App() {
  const { user, logout } = useAuthStore();

  /**
   * Xử lý tự động đăng xuất khi user không hoạt động trong 30 phút
   * Chỉ áp dụng khi user đã đăng nhập
   */
  const handleIdleTimeout = () => {
    if (user) {
      logout();
      // Log thông báo để theo dõi (có thể thêm UI notification nếu cần)
      console.log('Phiên đăng nhập đã hết hạn do không có hoạt động');
    }
  };

  // Kích hoạt idle timeout - 30 phút = 1,800,000 milliseconds
  // Để test nhanh có thể đổi thành: 30 * 1000 (30 giây) hoặc 1 * 60 * 1000 (1 phút)
  useIdleTimeout(30 * 60 * 1000, handleIdleTimeout);

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/create/:productId" element={<Orders />} />
          <Route path="/orders/checkout" element={<OrdersMulti />} />
          <Route path="/account-settings" element={<RequireAuth><AccountSettings /></RequireAuth>} />
        </Route>

        {/* Admin Layout Routes */}
        <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/orders" element={<OrdersAdmin />} />
          <Route path="/admin/reviews" element={<ReviewsAdmin />} />
          <Route path="/admin/payments" element={<PaymentsAdmin />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}