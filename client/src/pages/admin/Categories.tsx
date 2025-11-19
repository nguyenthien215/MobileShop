import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { makeSlug } from './_helpers';

interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string;
    createdAt: string;
}

// Helper to normalize image URLs
const getImageUrl = (path?: string) => {
    if (!path) return '/placeholder.png';
    const clean = path.startsWith('/') ? path : '/' + path;
    return `${import.meta.env.VITE_API_URL}${clean}`;
};

type FormMode = 'create' | 'edit';

export default function Categories() {
    const [rows, setRows] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<FormMode>('create');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCategories, setTotalCategories] = useState(0);
    const itemsPerPage = 5;

    // Form state
    const [formId, setFormId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [image, setImage] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState('');
    const [saving, setSaving] = useState(false);

    const load = async (page = 1) => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await axiosInstance.get('/admin/categories', {
                params: { page, limit: itemsPerPage }
            });
            const result = res.data;
            const categories = result.rows || result;
            setRows(categories);

            // Set pagination info
            const total = typeof result.count === 'number' ? result.count : categories.length;
            setTotalCategories(total);
            const pages = total > 0 ? Math.ceil(total / itemsPerPage) : 1;
            setTotalPages(pages);
            setCurrentPage(page);
        } catch (e: any) {
            setErrorMsg(e.response?.data?.message || 'Lỗi tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setFormId(null);
        setName('');
        setImage('');
        setMode('create');
        setErrorMsg('');
    };

    const uploadImage = async (file: File) => {
        setErrorMsg('');
        try {
            const fd = new FormData();
            fd.append('image', file);
            // Override content-type
            const res = await axiosInstance.post('/upload/products', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImage(res.data.imageUrl);
        } catch (e: any) {
            setErrorMsg(e.response?.data?.message || 'Upload ảnh thất bại');
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            setErrorMsg('Tên danh mục không được rỗng');
            return;
        }
        setSaving(true);
        setErrorMsg('');
        try {
            const payload = { name, slug: makeSlug(name), image };
            await axiosInstance.post('/admin/categories', payload);
            resetForm();
            await load(1);
        } catch (e: any) {
            setErrorMsg(e.response?.data?.message || 'Tạo danh mục thất bại');
        } finally {
            setSaving(false);
        }
    };

    const beginEdit = (cat: Category) => {
        setMode('edit');
        setFormId(cat.id);
        setName(cat.name);
        setImage(cat.image || '');
        setErrorMsg('');
    };

    const handleUpdate = async () => {
        if (formId == null) {
            setErrorMsg('Thiếu ID danh mục để cập nhật');
            return;
        }
        if (!name.trim()) {
            setErrorMsg('Tên danh mục không được rỗng');
            return;
        }
        setSaving(true);
        setErrorMsg('');
        try {
            const payload = { name, slug: makeSlug(name), image };
            console.log('[UPDATE] id=', formId, 'payload=', payload);
            await axiosInstance.put(`/admin/categories/${formId}`, payload);
            resetForm();
            await load(currentPage);
        } catch (e: any) {
            setErrorMsg(e.response?.data?.message || 'Cập nhật danh mục thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa danh mục này?')) return;
        setErrorMsg('');
        try {
            await axiosInstance.delete(`/admin/categories/${id}`);
            // Nếu đang sửa chính danh mục đó thì reset form
            if (formId === id) resetForm();
            // If last item on page and not first page, go to previous page
            if (rows.length === 1 && currentPage > 1) {
                await load(currentPage - 1);
            } else {
                await load(currentPage);
            }
        } catch (e: any) {
            setErrorMsg(e.response?.data?.message || 'Xóa danh mục thất bại');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Quản lý danh mục sản phẩm</h1>

            <div className="bg-white dark:bg-[var(--card)] p-5 rounded shadow space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">
                        {mode === 'create' ? 'Thêm danh mục' : `Sửa danh mục #${formId}`}
                    </h2>
                    {mode === 'edit' && (
                        <button
                            onClick={resetForm}
                            className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                            + Thêm mới
                        </button>
                    )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold">Tên danh mục</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ví dụ: iPad"
                            className="px-3 py-2 border rounded w-full dark:bg-[var(--card)]"
                        />
                        <div className="text-xs text-gray-500">
                            Slug sẽ được tự tạo: <span className="font-mono">{name ? makeSlug(name) : '(trống)'}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold">Ảnh danh mục</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => e.target.files && uploadImage(e.target.files[0])}
                            className="text-sm"
                        />
                        {image && (
                            <div className="relative w-24 h-24 border rounded flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                                <img src={getImageUrl(image)} alt="preview" className="max-w-full max-h-full object-contain" />
                                <button
                                    type="button"
                                    onClick={() => setImage('')}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6"
                                    title="Xóa ảnh"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {errorMsg && (
                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded">
                        {errorMsg}
                    </div>
                )}

                <div className="flex gap-3">
                    {mode === 'create' ? (
                        <button
                            disabled={saving}
                            onClick={handleCreate}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                        >
                            {saving ? 'Đang thêm...' : 'Thêm'}
                        </button>
                    ) : (
                        <>
                            <button
                                disabled={saving}
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                            >
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded"
                            >
                                Hủy
                            </button>
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div>Đang tải...</div>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-[var(--card)] rounded shadow">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="p-3">ID</th>
                                <th className="p-3">Ảnh</th>
                                <th className="p-3">Tên</th>
                                <th className="p-3">Slug</th>
                                <th className="p-3">Ngày tạo</th>
                                <th className="p-3">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(c => (
                                <tr key={c.id} className="border-t dark:border-gray-600">
                                    <td className="p-3 text-xs">{c.id}</td>
                                    <td className="p-3">
                                        {c.image
                                            ? <img src={getImageUrl(c.image)} className="h-12 w-12 object-contain" alt={c.name} />
                                            : <span className="text-xs text-gray-400">—</span>}
                                    </td>
                                    <td className="p-3">{c.name}</td>
                                    <td className="p-3 text-xs font-mono">{c.slug}</td>
                                    <td className="p-3 text-xs">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => beginEdit(c)}
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-gray-500">
                                        Chưa có danh mục
                                    </td>
                                </tr>
                            )}
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
            {!loading && totalCategories > 0 && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Hiển thị {rows.length} / {totalCategories} danh mục (Trang {currentPage}/{totalPages})
                </div>
            )}
        </div>
    );
}