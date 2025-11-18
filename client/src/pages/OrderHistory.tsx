import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { Link } from 'react-router-dom';

interface Order {
    id: number;
    orderNumber: string;
    totalAmount: number;
    status: string;
    paymentMethod: string; // thêm để kiểm tra
    payment?: { method: string; status: string; amount: number };
    items: {
        id: string;
        quantity: number;
        total: number;
        Product?: { id: string; name: string };
    }[];
    createdAt: string;
}

export default function OrderHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axiosInstance.get('/orders/my-orders');
                setOrders(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="px-4 py-10 text-center text-gray-600">Đang tải...</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6">Lịch sử đơn hàng</h1>
            {orders.length === 0 ? (
                <div className="text-gray-500 text-center py-10">Chưa có đơn hàng nào.</div>
            ) : (
                <div className="space-y-6">
                    {orders.map(o => (
                        <div key={o.id} className="bg-white rounded-lg shadow p-5">
                            <div className="flex flex-wrap justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-lg">{o.orderNumber}</h2>
                                    <p className="text-sm text-gray-600">
                                        Ngày: {new Date(o.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-600">
                                        {o.totalAmount.toLocaleString('vi-VN')} đ
                                    </p>
                                    <p className="text-xs">
                                        Thanh toán: {o.paymentMethod} {o.payment ? `(${o.payment.status})` : ''}
                                    </p>
                                    <p className="text-xs">
                                        Trạng thái: <span className="font-medium">{o.status}</span>
                                    </p>
                                </div>
                            </div>
                            <ul className="mt-4 text-sm list-disc list-inside space-y-1">
                                {o.items.map(it => {
                                    const canReview = (
                                        // Ngân hàng đã trả: có payment.status = paid
                                        (o.paymentMethod === 'bank' && o.payment?.status === 'paid') ||
                                        // Ngân hàng cũ fallback chưa có payment vẫn cho
                                        (o.paymentMethod === 'bank' && !o.payment) ||
                                        // COD chỉ khi hoàn tất
                                        (o.paymentMethod === 'COD' && o.status === 'completed')
                                    );
                                    return (
                                        <li key={it.id} className="flex items-center justify-between gap-2">
                                            <span>
                                                {it.Product?.name} x {it.quantity} = {it.total.toLocaleString('vi-VN')} đ
                                            </span>
                                            {canReview && it.Product?.id && (
                                                <Link
                                                    to={`/products/${it.Product.id}?review=1`}
                                                    className="text-xs px-2 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
                                                >
                                                    Đánh giá
                                                </Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            <Link to="/" className="inline-block mt-6 text-sm text-gray-600 hover:text-gray-800 underline">
                ← Về trang chủ
            </Link>
        </div>
    );
}