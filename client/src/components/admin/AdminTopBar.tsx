import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaSun, FaMoon, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminTopBar() {
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [nickname, setNickname] = useState<string>('admin');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Load từ localStorage
    useEffect(() => {
        const storedNick = localStorage.getItem('adminNickname');
        const storedAvatar = localStorage.getItem('adminAvatar');
        if (storedNick) setNickname(storedNick);
        if (storedAvatar) setAvatar(storedAvatar);
    }, []);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    const doLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/login');
    };

    return (
        <div className="h-16 px-6 flex items-center justify-between bg-white dark:bg-[var(--card)] border-b border-gray-200 dark:border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-green-700 dark:text-green-400">Bảng Điều Khiển</h2>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
                >
                    <FaHome size={14} /> Trang chủ
                </Link>
            </div>

            <div className="flex items-center gap-4" ref={menuRef}>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition cursor-pointer"
                    title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                >
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>

                {user && (
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white transition"
                        >
                            {/* Avatar nhỏ */}
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-green-200 flex items-center justify-center text-green-800 text-sm font-bold shadow-inner">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = ''; }}
                                    />
                                ) : (
                                    (nickname?.[0] || 'A').toUpperCase()
                                )}
                            </div>
                            <span className="text-sm font-semibold">
                                Admin({nickname || 'admin'})
                            </span>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[var(--card)] rounded-lg shadow-lg border border-gray-200 dark:border-[var(--border)] animate-fade">
                                <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[var(--border)]">
                                    {user.email}
                                </div>
                                <Link
                                    to="/admin/settings"
                                    onClick={() => setMenuOpen(false)}
                                    className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[var(--border)] transition"
                                >
                                    Cài đặt
                                </Link>
                                <button
                                    onClick={doLogout}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                                >
                                    <FaSignOutAlt size={14} /> Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}