import { NavLink } from 'react-router-dom';
import {
    FaChartPie, FaUsers, FaBoxOpen, FaTags,
    FaShoppingCart, FaStar, FaMoneyBill, FaUserCog
} from 'react-icons/fa';

const linkBase = 'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold transition';

export default function AdminSidebar() {
    return (
        <aside className="w-64 bg-white dark:bg-[var(--card)] shadow-lg h-full flex flex-col border-r border-gray-200 dark:border-[var(--border)]">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-[var(--border)]">
                <h1 className="text-xl font-bold text-green-700 dark:text-green-400">Admin Panel</h1>
                <p className="text-xs text-gray-500 mt-1">Quản trị hệ thống</p>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
                <NavLink to="/admin/dashboard"
                    className={({ isActive }) => `${linkBase} ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-[var(--text)] hover:bg-green-100 dark:hover:bg-[var(--border)]'}`}>
                    <FaChartPie /> Dashboard
                </NavLink>
                <NavLink to="/admin/users"
                    className={({ isActive }) => `${linkBase} ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-[var(--text)] hover:bg-green-100 dark:hover:bg-[var(--border)]'}`}>
                    <FaUsers /> Quản lý người dùng
                </NavLink>
                <NavLink to="/admin/products"
                    className={({ isActive }) => `${linkBase} ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-[var(--text)] hover:bg-green-100 dark:hover:bg-[var(--border)]'}`}>
                    <FaBoxOpen /> Quản lý sản phẩm
                </NavLink>
                <NavLink to="/admin/categories"
                    className={({ isActive }) => `${linkBase} ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-[var(--text)] hover:bg-green-100 dark:hover:bg-[var(--border)]'}`}>
                    <FaTags /> Quản lý danh mục
                </NavLink>
                <NavLink to="/admin/orders"
                    className={({ isActive }) => `${linkBase} ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-[var(--text)] hover:bg-green-100 dark:hover:bg-[var(--border)]'}`}>
                    <FaShoppingCart /> Quản lý đặt hàng
                </NavLink>
                <NavLink to="/admin/reviews"
                    className={({ isActive }) => `${linkBase} ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-[var(--text)] hover:bg-green-100 dark:hover:bg-[var(--border)]'}`}>
                    <FaStar /> Quản lý đánh giá
                </NavLink>
                <NavLink to="/admin/payments"
                    className={({ isActive }) => `${linkBase} ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-[var(--text)] hover:bg-green-100 dark:hover:bg-[var(--border)]'}`}>
                    <FaMoneyBill /> Quản lý thanh toán
                </NavLink>
                <NavLink to="/admin/settings"
                    className={({ isActive }) => `${linkBase} ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-[var(--text)] hover:bg-green-100 dark:hover:bg-[var(--border)]'}`}>
                    <FaUserCog /> Thông tin tài khoản
                </NavLink>
            </nav>
            <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-[var(--border)]">
                © {new Date().getFullYear()} Mobistore
            </div>
        </aside>
    );
}