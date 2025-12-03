import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { makeSlug } from './_helpers';

interface Category { id: number; name: string; slug: string; }
interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
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
    const [price, setPrice] = useState<number | ''>('');
    const [stock, setStock] = useState<number | ''>('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');
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

            // Thêm ảnh mới vào mảng hiện có thay vì thay thế
            setImages(prev => [...prev, ...res.data.imageUrls]);
        } catch (error: any) {
            console.error('[Upload] Error:', error.response?.data || error.message);
            alert('Upload ảnh thất bại: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetForm = () => {
        setName(''); setPrice(''); setStock(''); setBrand(''); setDescription('');
        setCategoryId(''); setImages([]); setEditing(null);
    };

    const submit = async () => {
        if (!name || !price || !categoryId) return alert('Vui lòng điền đầy đủ: Tên, Giá, Danh mục');
        const payload = {
            name,
            slug: makeSlug(name),
            description,
            price: Number(price),
            stock: Number(stock) || 0,
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
        setDescription(p.description || '');
        setCategoryId(p.categoryId);
        setImages(normalizeImages(p.images));
    };

    const submitEdit = async () => {
        if (!editing) return;
        if (!name || !price || !categoryId) return alert('Vui lòng điền đầy đủ: Tên, Giá, Danh mục');
        await axiosInstance.put(`/admin/products/${editing.id}`, {
            name,
            slug: makeSlug(name),
            description,
            price: Number(price),
            stock: Number(stock) || 0,
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
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên sản phẩm" className="px-3 py-2 border rounded dark:bg-[var(--card)]" />
                    <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Giá (VNĐ)"
                        className="px-3 py-2 border rounded dark:bg-[var(--card)]"
                    />
                    <input
                        type="number"
                        value={stock}
                        onChange={e => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Tồn kho (số lượng)"
                        className="px-3 py-2 border rounded dark:bg-[var(--card)]"
                    />
                    <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Thương hiệu" className="px-3 py-2 border rounded dark:bg-[var(--card)]" />
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="px-3 py-2 border rounded dark:bg-[var(--card)]">
                        <option value="">--Chọn danh mục--</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Mô tả sản phẩm"
                        rows={3}
                        className="px-3 py-2 border rounded dark:bg-[var(--card)] resize-none"
                    />
                </div>

                {/* Upload Images Section */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Ảnh sản phẩm (tối đa 5 ảnh)
                    </label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => e.target.files && uploadMulti(e.target.files)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500">
                        • Ảnh đầu tiên sẽ hiển thị làm ảnh chính<br />
                        • Click vào sản phẩm để xem tất cả ảnh<br />
                        • Có thể chọn 1 hoặc nhiều ảnh cùng lúc
                    </p>
                </div>

                {images.length > 0 && (
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Xem trước ({images.length} ảnh) - Kéo thả để sắp xếp
                        </label>
                        <div className="flex gap-3 flex-wrap">
                            {images.map((img, i) => (
                                <div key={i} className="relative group">
                                    <img
                                        src={getImageUrl(img)}
                                        className="h-24 w-24 object-cover border-2 border-gray-300 rounded cursor-move"
                                        alt={`Preview ${i + 1}`}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('text/plain', i.toString());
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                            if (fromIndex !== i) {
                                                const newImages = [...images];
                                                const [movedImage] = newImages.splice(fromIndex, 1);
                                                newImages.splice(i, 0, movedImage);
                                                setImages(newImages);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                                        title="Xóa ảnh này"
                                    >
                                        ×
                                    </button>
                                    {i === 0 ? (
                                        <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs py-0.5 text-center font-semibold">
                                            Ảnh chính
                                        </span>
                                    ) : (
                                        <span className="absolute bottom-0 left-0 right-0 bg-gray-600 text-white text-xs py-0.5 text-center">
                                            Ảnh phụ {i}
                                        </span>
                                    )}
                                    {i > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newImages = [...images];
                                                const [movedImage] = newImages.splice(i, 1);
                                                newImages.unshift(movedImage);
                                                setImages(newImages);
                                            }}
                                            className="absolute top-0 left-0 bg-green-600 text-white rounded px-2 py-0.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition hover:bg-green-700"
                                            title="Đặt làm ảnh chính"
                                        >
                                            ⭐
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 italic">
                            💡 Kéo thả ảnh để sắp xếp lại hoặc click ⭐ để đặt làm ảnh chính
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    {editing ? (
                        <>
                            <button onClick={submitEdit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Lưu thay đổi</button>
                            <button onClick={resetForm} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400">Hủy</button>
                        </>
                    ) : (
                        <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Thêm sản phẩm</button>
                    )}
                </div>
            </div>

            {loading ? <div>Đang tải...</div> : (
                <div className="overflow-x-auto bg-white dark:bg-[var(--card)] rounded shadow">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-500">
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
                                const productImages = (p.images as string[]) || [];
                                return (
                                    <tr key={p.id} className="border-t dark:border-gray-600">
                                        <td className="p-2">
                                            {productImages.length > 0 ? (
                                                <div className="flex gap-1">
                                                    <img
                                                        src={getImageUrl(productImages[0])}
                                                        className="h-14 w-14 object-cover rounded border-2 border-blue-500"
                                                        alt={p.name}
                                                        title="Ảnh chính"
                                                    />
                                                    {productImages.length > 1 && (
                                                        <div className="flex flex-col gap-1">
                                                            {productImages.slice(1, 3).map((img, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={getImageUrl(img)}
                                                                    className="h-6 w-6 object-cover rounded border"
                                                                    alt={`${p.name} ${idx + 2}`}
                                                                />
                                                            ))}
                                                            {productImages.length > 3 && (
                                                                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded border flex items-center justify-center text-xs font-bold">
                                                                    +{productImages.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">
                                                    No img
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-2">{p.name}</td>
                                        <td className="p-2">{p.price.toLocaleString('vi-VN')} đ</td>
                                        <td className="p-2">{p.stock}</td>
                                        <td className="p-2">{p.Category?.name || '—'}</td>
                                        <td className="p-2">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="p-2 flex gap-2">
                                            <button onClick={() => startEdit(p)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Sửa</button>
                                            <button onClick={() => remove(p.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Xóa</button>
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