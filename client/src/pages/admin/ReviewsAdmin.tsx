import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';

interface Review {
    id: number;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    adminReply?: string | null;
    createdAt: string;
    User?: { name: string; email: string };
    Product?: { name: string };
}

export default function ReviewsAdmin() {
    const [rows, setRows] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingId, setReplyingId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState<{ [key: number]: string }>({});

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

            // Initialize reply text with existing admin replies
            const initialReplies: { [key: number]: string } = {};
            reviews.forEach((review: Review) => {
                if (review.adminReply) {
                    initialReplies[review.id] = review.adminReply;
                } else {
                    initialReplies[review.id] = 'Cảm ơn bạn đã mua hàng!';
                }
            });
            setReplyText(initialReplies);

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

    const handleReply = async (reviewId: number) => {
        try {
            const reply = replyText[reviewId] || '';
            await axiosInstance.put(`/admin/reviews/${reviewId}/reply`, {
                adminReply: reply
            });

            // Update local state
            setRows(prev => prev.map(r =>
                r.id === reviewId ? { ...r, adminReply: reply } : r
            ));

            setReplyingId(null);
            alert('Phản hồi đánh giá thành công!');
        } catch (error) {
            console.error('Error replying to review:', error);
            alert('Không thể phản hồi đánh giá');
        }
    };

    const toggleReplyForm = (reviewId: number) => {
        if (replyingId === reviewId) {
            setReplyingId(null);
        } else {
            setReplyingId(reviewId);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
            {loading ? <div>Đang tải...</div> : (
                <div className="overflow-x-auto bg-white dark:bg-[var(--card)] rounded shadow">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-500">
                                <th className="p-2">Sản phẩm</th>
                                <th className="p-2">Người dùng</th>
                                <th className="p-2">Rating</th>
                                <th className="p-2">Comment</th>
                                <th className="p-2">Phản hồi Admin</th>
                                <th className="p-2">Ngày</th>
                                <th className="p-2">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <>
                                    <tr key={r.id} className="border-t dark:border-gray-600">
                                        <td className="p-2">{r.Product?.name || r.productId}</td>
                                        <td className="p-2">{r.User?.name} ({r.User?.email})</td>
                                        <td className="p-2">
                                            <span className="font-semibold text-yellow-600">{r.rating}★</span>
                                        </td>
                                        <td className="p-2 max-w-xs whitespace-pre-wrap">{r.comment || '—'}</td>
                                        <td className="p-2 max-w-xs">
                                            {r.adminReply ? (
                                                <div className="bg-blue-50 dark:bg-blue-500 p-2 rounded text-xs">
                                                    {r.adminReply}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Chưa phản hồi</span>
                                            )}
                                        </td>
                                        <td className="p-2">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="p-2">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => toggleReplyForm(r.id)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                                >
                                                    {replyingId === r.id ? 'Đóng' : 'Phản hồi'}
                                                </button>
                                                <button
                                                    onClick={() => remove(r.id)}
                                                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {replyingId === r.id && (
                                        <tr className="bg-gray-50 dark:bg-gray-500">
                                            <td colSpan={7} className="p-4">
                                                <div className="max-w-2xl">
                                                    <label className="block text-sm font-semibold mb-2">
                                                        Phản hồi đánh giá của {r.User?.name}:
                                                    </label>
                                                    <textarea
                                                        value={replyText[r.id] || ''}
                                                        onChange={(e) => setReplyText(prev => ({
                                                            ...prev,
                                                            [r.id]: e.target.value
                                                        }))}
                                                        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-300 text-sm"
                                                        rows={3}
                                                        placeholder="Nhập phản hồi của bạn..."
                                                    />
                                                    <div className="mt-2 flex gap-2">
                                                        <button
                                                            onClick={() => handleReply(r.id)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                                        >
                                                            Gửi phản hồi
                                                        </button>
                                                        <button
                                                            onClick={() => setReplyingId(null)}
                                                            className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
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