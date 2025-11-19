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

// Helper to normalize image array from database
const normalizeImages = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

// Helper to normalize image URLs
const getImageUrl = (path?: string) => {
    if (!path) return '/placeholder.png';
    const clean = path.startsWith('/') ? path : '/' + path;
    return `${import.meta.env.VITE_API_URL}${clean}`;
};

export default function Products() {
    const [rows, setRows] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Product | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const itemsPerPage = 5;

    // form
    const [name, setName] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [stock, setStock] = useState<number>(0);
    const [brand, setBrand] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const load = async (page = 1) => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                axiosInstance.get('/admin/products', {
                    params: { page, limit: itemsPerPage }
                }),
                axiosInstance.get('/admin/categories', {
                    params: { limit: 100 } // Get all categories for dropdown
                })
            ]);
            const result = prodRes.data;
            const products = result.rows || result.products || result;
            console.log('[Products] Raw data sample:', products[0]);
            // Normalize images for all products
            const normalized = products.map((p: Product) => ({
                ...p,
                images: normalizeImages(p.images)
            }));
            console.log('[Products] Normalized sample:', normalized[0]);
            setRows(normalized);

            // Handle categories - backend now returns { count, rows }
            const categoriesData = catRes.data;
            const categoriesArray = categoriesData.rows || categoriesData;
            setCategories(categoriesArray);

            // Set pagination info
            setTotalProducts(result.count || products.length);
            setTotalPages(Math.ceil((result.count || products.length) / itemsPerPage));
            setCurrentPage(page);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const uploadMulti = async (files: FileList) => {
        try {
            const fd = new FormData();
            Array.from(files).forEach(f => fd.append('images', f));
            console.log('[Upload] Uploading', files.length, 'files');
            // Don't set Content-Type, let browser set it with boundary
            const res = await axiosInstance.post('/upload/products/multiple', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                transformRequest: [(data) => data] // Prevent axios from transforming FormData
            });
            console.log('[Upload] Response:', res.data);
            console.log('[Upload] Image URLs:', res.data.imageUrls);
            setImages(res.data.imageUrls);
        } catch (error: any) {
            console.error('[Upload] Error:', error.response?.data || error.message);
            alert('Upload ảnh thất bại: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetForm = () => {
        setName(''); setPrice(0); setStock(0); setBrand('');
        setCategoryId(''); setImages([]); setEditing(null);
    };

    const submit = async () => {
        if (!name || !price || !categoryId) return;
        const payload = {
            name,
            slug: makeSlug(name),
            price,
            stock,
            brand,
            categoryId,
            images
        };
        console.log('[Submit] Creating product with payload:', payload);
        const res = await axiosInstance.post('/admin/products', payload);
        console.log('[Submit] Product created:', res.data);
        resetForm();
        await load(1); // Load first page after creating new product
    };

    const startEdit = (p: Product) => {
        setEditing(p);
        setName(p.name);
        setPrice(p.price);
        setStock(p.stock);
        setBrand(p.brand || '');
        setCategoryId(p.categoryId);
        setImages(normalizeImages(p.images));
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
        await load(currentPage);
    };

    const remove = async (id: string) => {
        if (!confirm('Xóa sản phẩm?')) return;
        await axiosInstance.delete(`/admin/products/${id}`);
        // If last item on page and not first page, go to previous page
        if (rows.length === 1 && currentPage > 1) {
            await load(currentPage - 1);
        } else {
            await load(currentPage);
        }
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
                        {images.map((img, i) => <img key={i} src={getImageUrl(img)} className="h-16 w-16 object-contain border" alt={`Preview ${i + 1}`} />)}
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
                                const first = (p.images as string[])[0] || '';
                                return (
                                    <tr key={p.id} className="border-t dark:border-gray-600">
                                        <td className="p-2">
                                            {first ? <img src={getImageUrl(first)} className="h-14 w-14 object-contain" alt={p.name} /> : '—'}
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
            {!loading && totalProducts > 0 && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Hiển thị {rows.length} / {totalProducts} sản phẩm (Trang {currentPage}/{totalPages})
                </div>
            )}
        </div>
    );
}