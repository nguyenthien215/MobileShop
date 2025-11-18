import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { makeSlug } from './_helpers';

interface Category { id: number; name: string; slug: string; }
interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    brand?: string;
    images: string[];
    categoryId: string;
    Category?: Category;
    createdAt: string;
}

export default function Products() {
    const [rows, setRows] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Product | null>(null);

    // form
    const [name, setName] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [stock, setStock] = useState<number>(0);
    const [brand, setBrand] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const load = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                axiosInstance.get('/admin/products'),
                axiosInstance.get('/admin/categories')
            ]);
            setRows(prodRes.data.rows || prodRes.data.products || prodRes.data);
            setCategories(catRes.data);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const uploadMulti = async (files: FileList) => {
        const fd = new FormData();
        Array.from(files).forEach(f => fd.append('images', f));
        const res = await axiosInstance.post('/upload/products/multiple', fd);
        setImages(res.data.imageUrls);
    };

    const resetForm = () => {
        setName(''); setPrice(0); setStock(0); setBrand('');
        setCategoryId(''); setImages([]); setEditing(null);
    };

    const submit = async () => {
        if (!name || !price || !categoryId) return;
        await axiosInstance.post('/admin/products', {
            name,
            slug: makeSlug(name),
            price,
            stock,
            brand,
            categoryId,
            images
        });
        resetForm();
        await load();
    };

    const startEdit = (p: Product) => {
        setEditing(p);
        setName(p.name);
        setPrice(p.price);
        setStock(p.stock);
        setBrand(p.brand || '');
        setCategoryId(p.categoryId);
        setImages(Array.isArray(p.images) ? p.images : []);
    };

    const submitEdit = async () => {
        if (!editing) return;
        await axiosInstance.put(`/admin/products/${editing.id}`, {
            name,
            slug: makeSlug(name),
            price,
            stock,
            brand,
            categoryId,
            images
        });
        resetForm();
        await load();
    };

    const remove = async (id: string) => {
        if (!confirm('Xóa sản phẩm?')) return;
        await axiosInstance.delete(`/admin/products/${id}`);
        await load();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>

            <div className="bg-white dark:bg-[var(--card)] p-5 rounded shadow space-y-4">
                <h2 className="font-semibold">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên" className="px-3 py-2 border rounded dark:bg-[var(--card)]" />
                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} placeholder="Giá" className="px-3 py-2 border rounded dark:bg-[var(--card)]" />
                    <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} placeholder="Tồn kho" className="px-3 py-2 border rounded dark:bg-[var(--card)]" />
                    <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Thương hiệu" className="px-3 py-2 border rounded dark:bg-[var(--card)]" />
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="px-3 py-2 border rounded dark:bg-[var(--card)]">
                        <option value="">--Chọn danh mục--</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="file" multiple onChange={e => e.target.files && uploadMulti(e.target.files)} className="text-sm" />
                </div>
                {images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {images.map((img, i) => <img key={i} src={img} className="h-16 w-16 object-contain border" />)}
                    </div>
                )}
                <div className="flex gap-3">
                    {editing ? (
                        <>
                            <button onClick={submitEdit} className="px-4 py-2 bg-green-600 text-white rounded">Lưu</button>
                            <button onClick={resetForm} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded">Hủy</button>
                        </>
                    ) : (
                        <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Thêm</button>
                    )}
                </div>
            </div>

            {loading ? <div>Đang tải...</div> : (
                <div className="overflow-x-auto bg-white dark:bg-[var(--card)] rounded shadow">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="p-2">Ảnh</th>
                                <th className="p-2">Tên</th>
                                <th className="p-2">Giá</th>
                                <th className="p-2">Kho</th>
                                <th className="p-2">Danh mục</th>
                                <th className="p-2">Ngày</th>
                                <th className="p-2">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(p => {
                                const first = Array.isArray(p.images) ? p.images[0] : '';
                                return (
                                    <tr key={p.id} className="border-t dark:border-gray-600">
                                        <td className="p-2">
                                            {first ? <img src={first} className="h-14 w-14 object-contain" /> : '—'}
                                        </td>
                                        <td className="p-2">{p.name}</td>
                                        <td className="p-2">{p.price.toLocaleString('vi-VN')} đ</td>
                                        <td className="p-2">{p.stock}</td>
                                        <td className="p-2">{p.Category?.name || '—'}</td>
                                        <td className="p-2">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="p-2 flex gap-2">
                                            <button onClick={() => startEdit(p)} className="px-2 py-1 bg-blue-600 text-white rounded">Sửa</button>
                                            <button onClick={() => remove(p.id)} className="px-2 py-1 bg-red-600 text-white rounded">Xóa</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}