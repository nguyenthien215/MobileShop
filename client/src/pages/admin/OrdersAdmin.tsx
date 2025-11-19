import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';

interface OrderItem { id: number; quantity: number; total: number; Product?: { name: string }; }
interface Order {
    id: number;
    orderNumber: string;
    userId: string;
    totalAmount: number;
    status: string;
    payment?: { method: string; status: string; amount: number };
    paymentMethod: string;
    items: OrderItem[];
    createdAt: string;
}

const statusOptions = ['pending', 'shipped', 'completed', 'cancelled'];

export default function OrdersAdmin() {
    const [rows, setRows] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const itemsPerPage = 5;

    const load = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/admin/orders', {
                params: { page, limit: itemsPerPage }
            });
            const result = res.data;
            const orders = result.rows || result;

            console.log('[OrdersAdmin] Result:', result);
            console.log('[OrdersAdmin] Count:', result.count);
            console.log('[OrdersAdmin] Orders length:', orders.length);

            setRows(orders);

            // Set pagination info - use count from backend if available
            const total = typeof result.count === 'number' ? result.count : orders.length;
            setTotalOrders(total);
            const pages = total > 0 ? Math.ceil(total / itemsPerPage) : 1;
            setTotalPages(pages);
            setCurrentPage(page);

            console.log('[OrdersAdmin] Total orders:', total);
            console.log('[OrdersAdmin] Total pages:', pages);
        } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const updateStatus = async (id: number, status: string) => {
        await axiosInstance.put(`/admin/orders/${id}/status`, { status });
        await load(currentPage);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Quản lý đặt hàng</h1>
            {loading ? <div>Đang tải...</div> : (
                <div className="overflow-x-auto bg-white dark:bg-[var(--card)] rounded shadow">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="p-2">Mã đơn</th>
                                <th className="p-2">Tổng</th>
                                <th className="p-2">Thanh toán</th>
                                <th className="p-2">Trạng thái</th>
                                <th className="p-2">Sản phẩm</th>
                                <th className="p-2">Ngày</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(o => (
                                <tr key={o.id} className="border-t dark:border-gray-600 align-top">
                                    <td className="p-2">{o.orderNumber}</td>
                                    <td className="p-2">{o.totalAmount.toLocaleString('vi-VN')} đ</td>
                                    <td className="p-2 text-xs">
                                        {o.paymentMethod} {o.payment ? `(${o.payment.status})` : ''}
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={o.status}
                                            onChange={e => updateStatus(o.id, e.target.value)}
                                            className="px-2 py-1 border rounded dark:bg-[var(--card)]"
                                        >
                                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <ul className="space-y-1">
                                            {o.items.map(it => (
                                                <li key={it.id}>
                                                    {it.Product?.name} x {it.quantity} = {it.total.toLocaleString('vi-VN')} đ
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="p-2">{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
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
            {!loading && totalOrders > 0 && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Hiển thị {rows.length} / {totalOrders} đơn hàng (Trang {currentPage}/{totalPages})
                </div>
            )}
        </div>
    );
}