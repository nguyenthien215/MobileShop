import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { makeSlug } from './_helpers';

interface Category {
    id: number;
    name: string;
    slug: string;
    image?: string;
    createdAt: string;
}

export default function Categories() {
    const [rows, setRows] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [image, setImage] = useState<string>('');
    const [editing, setEditing] = useState<Category | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/admin/categories');
            setRows(res.data);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);

    const uploadImage = async (file: File) => {
        const fd = new FormData();
        fd.append('image', file);
        const res = await axiosInstance.post('/upload/products', fd);
        setImage(res.data.imageUrl);
    };

    const submit = async () => {
        if (!name.trim()) return;
        const body = { name, slug: makeSlug(name), image };
        await axiosInstance.post('/admin/categories', body);
        setName(''); setImage('');
        await load();
    };

    const startEdit = (c: Category) => {
        setEditing(c);
        setName(c.name);
        setImage(c.image || '');
    };

    const submitEdit = async () => {
        if (!editing) return;
        await axiosInstance.put(`/admin/categories/${editing.id}`, {
            name,
            slug: makeSlug(name),
            image
        });
        setEditing(null); setName(''); setImage('');
        await load();
    };

    const remove = async (id: number) => {
        if (!confirm('Xóa danh mục này?')) return;
        await axiosInstance.delete(`/admin/categories/${id}`);
        await load();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Quản lý danh mục sản phẩm</h1>

            <div className="bg-white dark:bg-[var(--card)] p-4 rounded shadow space-y-3">
                <h2 className="font-semibold">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Tên danh mục"
                    className="px-3 py-2 border rounded w-full dark:bg-[var(--card)]"
                />
                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        onChange={e => e.target.files && uploadImage(e.target.files[0])}
                        className="text-sm"
                        accept="image/*"
                    />
                    {image && <img src={image} alt="preview" className="h-20 object-contain" />}
                </div>
                <div className="flex gap-3">
                    {editing ? (
                        <>
                            <button onClick={submitEdit} className="px-4 py-2 bg-green-600 text-white rounded">Lưu</button>
                            <button onClick={() => { setEditing(null); setName(''); setImage(''); }} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded">Hủy</button>
                        </>
                    ) : (
                        <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Thêm</button>
                    )}
                </div>
            </div>

            {loading ? <div>Đang tải...</div> : (
                <div className="overflow-x-auto bg-white dark:bg-[var(--card)] rounded shadow">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="p-3">Ảnh</th>
                                <th className="p-3">Tên</th>
                                <th className="p-3">Slug</th>
                                <th className="p-3">Ngày</th>
                                <th className="p-3">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(c => (
                                <tr key={c.id} className="border-t dark:border-gray-600">
                                    <td className="p-3">
                                        {c.image ? <img src={c.image} className="h-12 w-12 object-contain" /> : <span className="text-xs text-gray-400">—</span>}
                                    </td>
                                    <td className="p-3">{c.name}</td>
                                    <td className="p-3 text-xs">{c.slug}</td>
                                    <td className="p-3 text-xs">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-3 flex gap-2">
                                        <button onClick={() => startEdit(c)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Sửa</button>
                                        <button onClick={() => remove(c.id)} className="px-3 py-1 text-xs bg-red-600 text-white rounded">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}