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

    const load = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/admin/orders');
            setRows(res.data);
        } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const updateStatus = async (id: number, status: string) => {
        await axiosInstance.put(`/admin/orders/${id}/status`, { status });
        await load();
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
        </div>
    );
}