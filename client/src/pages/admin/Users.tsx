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

    const load = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/admin/users');
            setRows(res.data);
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
        await load();
    };

    const remove = async (id: string) => {
        if (!confirm('Xóa user này?')) return;
        await axiosInstance.delete(`/admin/users/${id}`);
        await load();
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