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

    const load = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/admin/payments');
            setRows(res.data);
        } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const updateStatus = async (id: number, status: string) => {
        await axiosInstance.put(`/admin/payments/${id}/status`, { status });
        await load();
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
        </div>
    );
}