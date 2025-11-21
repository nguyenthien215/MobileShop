import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaShoppingCart,
    FaSearch,
    FaBars,
    FaTimes,
    FaMobileAlt,
    FaLaptop,
    FaHeadphones,
    FaHome,
    FaMoon,
    FaSun,
    FaUserCircle
} from 'react-icons/fa';
import { useAuthStore } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { count } = useCart();
    const { theme, toggleTheme } = useTheme();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate(`/products?search=${searchQuery}`);
    };

    // Đóng menu khi click ra ngoài
    useEffect(() => {
        if (!userMenuOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [userMenuOpen]);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    return (
        <header className="shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 font-bold text-2xl text-white hover:text-gray-200 transition flex-shrink-0"
                    >
                        <div className="bg-white text-green-800 p-2 rounded-lg">
                            <FaShoppingCart size={24} />
                        </div>
                        <span className="hidden sm:inline">Mobistore</span>
                    </Link>

                    {/* Search Desktop */}
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
                                className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-r-lg transition flex items-center justify-center cursor-pointer"
                            >
                                <FaSearch size={18} className="text-gray-800" />
                            </button>
                        </div>
                    </form>

                    {/* Right Icons */}
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
                        <Link
                            to="/cart"
                            className="relative text-white hover:text-yellow-300 transition p-2 rounded-lg hover:bg-green-700"
                        >
                            <FaShoppingCart size={24} />
                            {count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-6 h-6 flex items-center justify-center font-bold px-1">
                                    {count}
                                </span>
                            )}
                        </Link>

                        {/* User Dropdown (Click) */}
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setUserMenuOpen(o => !o)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-700 hover:bg-green-900 transition text-white"
                                    aria-haspopup="true"
                                    aria-expanded={userMenuOpen}
                                >
                                    {user.avatar ? (
                                        <img
                                            src={`http://localhost:5000${user.avatar}`}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full object-cover border-2 border-white"
                                        />
                                    ) : (
                                        <FaUserCircle size={32} className="text-white" />
                                    )}
                                    <span className="text-sm font-semibold">Xin chào {user.name}!</span>
                                </button>
                                {userMenuOpen && (
                                    <div
                                        className="absolute top-full right-0 mt-2 bg-white dark:bg-[var(--card)] text-gray-800 dark:text-[var(--text)] rounded-lg shadow-lg z-50 min-w-52 py-2"
                                        role="menu"
                                    >
                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin/dashboard"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[var(--border)] text-sm font-medium"
                                                role="menuitem"
                                            >
                                                Trang Admin
                                            </Link>
                                        )}
                                        {user.role !== 'admin' && (
                                            <>
                                                <Link
                                                    to="/account-settings"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[var(--border)] text-sm"
                                                    role="menuitem"
                                                >
                                                    Thông tin tài khoản
                                                </Link>
                                                <Link
                                                    to="/orders"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[var(--border)] text-sm"
                                                    role="menuitem"
                                                >
                                                    Đơn hàng của tôi
                                                </Link>
                                            </>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[var(--border)] text-red-600 text-sm"
                                            role="menuitem"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
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

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(o => !o)}
                            className="md:hidden p-2 text-white"
                            aria-label="Toggle navigation"
                        >
                            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="md:hidden mt-4">
                    <div className="relative w-full flex">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-l-lg text-gray-800 dark:text-[var(--text)] bg-white dark:bg-[var(--card)] focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-yellow-500 px-3 py-2 rounded-r-lg flex items-center justify-center"
                        >
                            <FaSearch size={18} className="text-gray-800" />
                        </button>
                    </div>
                </form>

                {/* Navigation */}
                <nav
                    className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex md:items-center gap-8 mt-4 md:mt-0 text-white`}
                >
                    <Link
                        to="/"
                        className="flex items-center gap-2 hover:text-yellow-300 transition font-semibold text-sm py-2 md:py-0"
                    >
                        <FaHome size={18} /> Trang chủ
                    </Link>
                    <Link
                        to="/products?category=dien-thoai"
                        className="flex items-center gap-2 hover:text-yellow-300 transition font-semibold text-sm py-2 md:py-0"
                    >
                        <FaMobileAlt size={18} /> Điện thoại
                    </Link>
                    <Link
                        to="/products?category=laptop"
                        className="flex items-center gap-2 hover:text-yellow-300 transition font-semibold text-sm py-2 md:py-0"
                    >
                        <FaLaptop size={18} /> Laptop
                    </Link>
                    <Link
                        to="/products?category=phu-kien"
                        className="flex items-center gap-2 hover:text-yellow-300 transition font-semibold text-sm py-2 md:py-0"
                    >
                        <FaHeadphones size={18} /> Phụ kiện
                    </Link>
                </nav>
            </div>
        </header>
    );
}