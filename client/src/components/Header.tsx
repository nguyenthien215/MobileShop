import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes, FaMobileAlt, FaLaptop, FaHeadphones, FaHome, FaMoon, FaSun } from 'react-icons/fa';
import { useAuthStore } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext'; // <== NEW

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { count } = useCart();
    const { theme, toggleTheme } = useTheme(); // <== NEW

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${searchQuery}`);
        }
    };

    return (
        <header className="shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-white hover:text-gray-200 transition flex-shrink-0">
                        <div className="bg-white text-green-800 p-2 rounded-lg">
                            <FaShoppingCart size={24} />
                        </div>
                        <span className="hidden sm:inline">Mobistore</span>
                    </Link>

                    {/* Search desktop */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
                        <div className="relative w-full flex">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 rounded-l-lg text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white dark:bg-[var(--card)] dark:text-[var(--text)]"
                            />
                            <button
                                type="submit"
                                className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-r-lg transition flex items-center justify-center whitespace-nowrap cursor-pointer"
                            >
                                <FaSearch size={18} className="text-gray-800" />
                            </button>
                        </div>
                    </form>

                    {/* Right icons */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="p-2 rounded-lg bg-green-700 hover:bg-green-800 text-white transition"
                            title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                        >
                            {theme === 'dark' ? <FaSun size={20} /> : <FaMoon size={20} />}
                        </button>

                        {/* Cart */}
                        <Link to="/cart" className="relative text-white hover:text-yellow-300 transition p-2 rounded-lg hover:bg-green-700">
                            <FaShoppingCart size={24} />
                            {count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-6 h-6 flex items-center justify-center font-bold px-1">
                                    {count}
                                </span>
                            )}
                        </Link>

                        {/* User menu */}
                        {user ? (
                            <div className="relative group">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-700 hover:bg-green-900 transition cursor-pointer text-white">
                                    <span className="text-sm font-semibold">Xin chào {user.name}!</span>
                                </div>
                                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-[var(--card)] text-gray-800 dark:text-[var(--text)] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-52">
                                    {user.role === 'admin' && (
                                        <Link to="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[var(--border)] text-sm font-medium">
                                            Trang Admin
                                        </Link>
                                    )}
                                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[var(--border)] text-sm">
                                        Đơn hàng của tôi
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/');
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[var(--border)] text-red-600 text-sm"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link
                                    to="/login"
                                    className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition text-sm font-semibold text-gray-900 whitespace-nowrap"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-3 py-2 bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-800 rounded-lg transition text-sm font-semibold whitespace-nowrap"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-white"
                        >
                            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile search */}
                <form onSubmit={handleSearch} className="md:hidden mt-4">
                    <div className="relative w-full flex">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-l-lg text-gray-800 dark:text-[var(--text)] bg-white dark:bg-[var(--card)] focus:outline-none"
                        />
                        <button type="submit" className="bg-yellow-500 px-3 py-2 rounded-r-lg flex items-center justify-center">
                            <FaSearch size={18} className="text-gray-800" />
                        </button>
                    </div>
                </form>

                {/* Nav */}
                <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex md:items-center gap-8 mt-4 md:mt-0 text-white`}>
                    <Link to="/" className="flex items-center gap-2 hover:text-yellow-300 transition font-semibold text-sm py-2 md:py-0">
                        <FaHome size={18} /> Trang chủ
                    </Link>
                    <Link to="/products?category=dien-thoai" className="flex items-center gap-2 hover:text-yellow-300 transition font-semibold text-sm py-2 md:py-0">
                        <FaMobileAlt size={18} /> Điện thoại
                    </Link>
                    <Link to="/products?category=laptop" className="flex items-center gap-2 hover:text-yellow-300 transition font-semibold text-sm py-2 md:py-0">
                        <FaLaptop size={18} /> Laptop
                    </Link>
                    <Link to="/products?category=phu-kien" className="flex items-center gap-2 hover:text-yellow-300 transition font-semibold text-sm py-2 md:py-0">
                        <FaHeadphones size={18} /> Phụ kiện
                    </Link>
                </nav>
            </div>
        </header>
    );
}