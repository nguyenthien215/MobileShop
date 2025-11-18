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

    const load = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/admin/reviews');
            setRows(res.data);
        } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const remove = async (id: number) => {
        if (!confirm('Xóa review này?')) return;
        await axiosInstance.delete(`/admin/reviews/${id}`);
        await load();
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
        </div>
    );
}