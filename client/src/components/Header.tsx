import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useAuthStore } from '../contexts/AuthContext';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${searchQuery}`);
        }
    };

    return (
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4">
                {/* Top Row - Logo & Search */}
                <div className="flex items-center justify-between gap-6 mb-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-2xl hover:text-blue-200 transition">
                        <div className="bg-white text-blue-600 p-2 rounded-lg">
                            <FaShoppingCart size={24} />
                        </div>
                        <span>ElectroShop</span>
                    </Link>

                    {/* Search Bar - Hidden on mobile */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 rounded-l-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <button
                                type="submit"
                                className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-r-lg transition flex items-center gap-2"
                            >
                                <FaSearch size={18} />
                            </button>
                        </div>
                    </form>

                    {/* Right Icons */}
                    <div className="flex items-center gap-4">
                        {/* Cart Icon */}
                        <Link
                            to="/cart"
                            className="relative hover:text-blue-200 transition p-2 rounded-lg hover:bg-blue-700"
                        >
                            <FaShoppingCart size={24} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                0
                            </span>
                        </Link>

                        {/* User Menu */}
                        {user ? (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-900 transition cursor-pointer group">
                                <FaUser size={18} />
                                <span className="hidden sm:inline text-sm">{user.name}</span>
                                {/* Dropdown */}
                                <div className="absolute top-full right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100 rounded-t-lg">
                                        Đơn hàng của tôi
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-100">
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/');
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg text-red-600"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link
                                    to="/login"
                                    className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition text-sm font-semibold"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-3 py-2 bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 rounded-lg transition text-sm font-semibold"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2"
                        >
                            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="md:hidden mb-4">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-l-lg text-gray-800 focus:outline-none"
                        />
                        <button type="submit" className="bg-yellow-500 px-3 py-2 rounded-r-lg">
                            <FaSearch size={18} />
                        </button>
                    </div>
                </form>

                {/* Navigation Menu */}
                <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex md:items-center gap-8 mt-4 md:mt-0`}>
                    <Link to="/" className="block md:inline hover:text-blue-200 transition font-semibold">
                        Trang chủ
                    </Link>
                    <Link to="/products?category=dien-thoai" className="block md:inline hover:text-blue-200 transition font-semibold">
                        📱 Điện thoại
                    </Link>
                    <Link to="/products?category=laptop" className="block md:inline hover:text-blue-200 transition font-semibold">
                        💻 Laptop
                    </Link>
                    <Link to="/products?category=phu-kien" className="block md:inline hover:text-blue-200 transition font-semibold">
                        🎧 Phụ kiện
                    </Link>
                </nav>
            </div>
        </header>
    );
}