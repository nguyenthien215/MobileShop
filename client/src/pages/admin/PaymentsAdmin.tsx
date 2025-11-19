import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';

interface Payment {
    id: number;
    orderId: number;
    method: string;
    amount: number;
    status: string;
    Order?: { id: number; orderNumber: string; paymentMethod: string; status: string };
}

export default function PaymentsAdmin() {
    const [rows, setRows] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPayments, setTotalPayments] = useState(0);
    const itemsPerPage = 5;

    const load = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/admin/payments', {
                params: { page, limit: itemsPerPage }
            });
            const result = res.data;
            const payments = result.rows || result;
            setRows(payments);

            // Set pagination info
            const total = typeof result.count === 'number' ? result.count : payments.length;
            setTotalPayments(total);
            const pages = total > 0 ? Math.ceil(total / itemsPerPage) : 1;
            setTotalPages(pages);
            setCurrentPage(page);
        } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const updateStatus = async (id: number, status: string) => {
        await axiosInstance.put(`/admin/payments/${id}/status`, { status });
        await load(currentPage);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Quản lý thanh toán</h1>
            {loading ? <div>Đang tải...</div> : (
                <div className="overflow-x-auto bg-white dark:bg-[var(--card)] rounded shadow">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="p-2">Đơn hàng</th>
                                <th className="p-2">Phương thức</th>
                                <th className="p-2">Số tiền</th>
                                <th className="p-2">Trạng thái</th>
                                <th className="p-2">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(p => (
                                <tr key={p.id} className="border-t dark:border-gray-600">
                                    <td className="p-2">{p.Order?.orderNumber || p.orderId}</td>
                                    <td className="p-2">{p.method}</td>
                                    <td className="p-2">{p.amount.toLocaleString('vi-VN')} đ</td>
                                    <td className="p-2">
                                        <select
                                            value={p.status}
                                            onChange={e => updateStatus(p.id, e.target.value)}
                                            className="px-2 py-1 border rounded dark:bg-[var(--card)]"
                                        >
                                            <option value="paid">paid</option>
                                            <option value="unpaid">unpaid</option>
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        {/* Có thể thêm nút chi tiết sau */}
                                        <span className="text-gray-400">—</span>
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
            {!loading && totalPayments > 0 && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Hiển thị {rows.length} / {totalPayments} thanh toán (Trang {currentPage}/{totalPages})
                </div>
            )}
        </div>
    );
}