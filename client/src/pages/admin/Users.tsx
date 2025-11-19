import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function Users() {
    const [rows, setRows] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>('user');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const itemsPerPage = 5;

    const load = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/admin/users', {
                params: { page, limit: itemsPerPage }
            });
            const result = res.data;
            const users = result.rows || result;
            setRows(users);

            // Set pagination info
            const total = typeof result.count === 'number' ? result.count : users.length;
            setTotalUsers(total);
            const pages = total > 0 ? Math.ceil(total / itemsPerPage) : 1;
            setTotalPages(pages);
            setCurrentPage(page);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const startEdit = (u: User) => {
        setEditing(u);
        setName(u.name);
        setRole(u.role as 'admin' | 'user');
    };

    const submitEdit = async () => {
        if (!editing) return;
        await axiosInstance.put(`/admin/users/${editing.id}`, { name, role });
        setEditing(null);
        await load(currentPage);
    };

    const remove = async (id: string) => {
        if (!confirm('Xóa user này?')) return;
        await axiosInstance.delete(`/admin/users/${id}`);
        // If last item on page and not first page, go to previous page
        if (rows.length === 1 && currentPage > 1) {
            await load(currentPage - 1);
        } else {
            await load(currentPage);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
            {loading ? <div>Đang tải...</div> : (
                <div className="overflow-x-auto bg-white dark:bg-[var(--card)] rounded shadow">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                                <th className="p-3">Tên</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Ngày</th>
                                <th className="p-3">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(u => (
                                <tr key={u.id} className="border-t dark:border-gray-600">
                                    <td className="p-3">{u.name}</td>
                                    <td className="p-3">{u.email}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-3">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-3 flex gap-2">
                                        <button onClick={() => startEdit(u)} className="px-3 py-1 text-xs rounded bg-blue-600 text-white">Sửa</button>
                                        <button onClick={() => remove(u.id)} className="px-3 py-1 text-xs rounded bg-red-600 text-white">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => load(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Trang trước
                    </button>

                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => load(page)}
                                className={`px-3 py-2 rounded ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => load(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Trang sau
                    </button>
                </div>
            )}

            {/* Total count */}
            {!loading && totalUsers > 0 && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Hiển thị {rows.length} / {totalUsers} người dùng (Trang {currentPage}/{totalPages})
                </div>
            )}

            {editing && (
                <div className="bg-white dark:bg-[var(--card)] p-4 rounded shadow space-y-4">
                    <h2 className="font-semibold">Sửa User</h2>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="px-3 py-2 border rounded w-full dark:bg-[var(--card)]"
                        placeholder="Tên"
                    />
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value as 'admin' | 'user')}
                        className="px-3 py-2 border rounded w-full dark:bg-[var(--card)]"
                    >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </select>
                    <div className="flex gap-3">
                        <button onClick={submitEdit} className="px-4 py-2 bg-green-600 text-white rounded">Lưu</button>
                        <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded">Hủy</button>
                    </div>
                </div>
            )}
        </div>
    );
}