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
import Orders from './pages/Orders';
import OrdersMulti from './pages/OrdersMulti';
import { RequireAuth, RequireAdmin } from './components/RequireAuth';

export default function App() {
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
        </Route>

        {/* Admin Layout Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<div className="text-2xl font-bold">Admin Dashboard</div>} />
        </Route>
      </Routes>
    </Router>
  );
}