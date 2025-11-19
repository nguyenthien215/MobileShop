import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';

interface Review {
    id: number;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
    User?: { name: string; email: string };
    Product?: { name: string };
}

export default function ReviewsAdmin() {
    const [rows, setRows] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const itemsPerPage = 5;

    const load = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/admin/reviews', {
                params: { page, limit: itemsPerPage }
            });
            const result = res.data;
            const reviews = result.rows || result;
            setRows(reviews);

            // Set pagination info
            const total = typeof result.count === 'number' ? result.count : reviews.length;
            setTotalReviews(total);
            const pages = total > 0 ? Math.ceil(total / itemsPerPage) : 1;
            setTotalPages(pages);
            setCurrentPage(page);
        } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const remove = async (id: number) => {
        if (!confirm('Xóa review này?')) return;
        await axiosInstance.delete(`/admin/reviews/${id}`);
        // If last item on page and not first page, go to previous page
        if (rows.length === 1 && currentPage > 1) {
            await load(currentPage - 1);
        } else {
            await load(currentPage);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
            {loading ? <div>Đang tải...</div> : (
                <div className="overflow-x-auto bg-white dark:bg-[var(--card)] rounded shadow">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="p-2">Sản phẩm</th>
                                <th className="p-2">Người dùng</th>
                                <th className="p-2">Rating</th>
                                <th className="p-2">Comment</th>
                                <th className="p-2">Ngày</th>
                                <th className="p-2">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r.id} className="border-t dark:border-gray-600">
                                    <td className="p-2">{r.Product?.name || r.productId}</td>
                                    <td className="p-2">{r.User?.name} ({r.User?.email})</td>
                                    <td className="p-2">
                                        <span className="font-semibold text-yellow-600">{r.rating}★</span>
                                    </td>
                                    <td className="p-2 max-w-xs whitespace-pre-wrap">{r.comment || '—'}</td>
                                    <td className="p-2">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-2">
                                        <button onClick={() => remove(r.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Xóa</button>
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
            {!loading && totalReviews > 0 && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Hiển thị {rows.length} / {totalReviews} đánh giá (Trang {currentPage}/{totalPages})
                </div>
            )}
        </div>
    );
}