import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

export default function Payment() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [selectedBank, setSelectedBank] = useState('');

    const handleVNPayPayment = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/vnpay/create-payment-url', {
                orderId: orderId,
                amount: Number(amount),
                orderInfo: `Thanh toan don hang ${orderId}`,
                bankCode: selectedBank || undefined
            });

            // Redirect user đến VNPay
            window.location.href = response.data.paymentUrl;

        } catch (error: any) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6">Thanh toán đơn hàng</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mã đơn hàng</p>
                    <p className="text-lg font-semibold">{orderId}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Số tiền thanh toán</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {Number(amount).toLocaleString('vi-VN')} đ
                    </p>
                </div>

                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">Chọn phương thức thanh toán</h2>

                    {/* VNPay - Tất cả ngân hàng */}
                    <button
                        onClick={() => { setSelectedBank(''); handleVNPayPayment(); }}
                        disabled={loading}
                        className="w-full p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition disabled:opacity-50 mb-3"
                    >
                        <div className="flex items-center gap-4">
                            <img src="/vnpay-logo.png" alt="VNPay" className="h-10" />
                            <div className="text-left">
                                <p className="font-semibold">VNPay - Cổng thanh toán</p>
                                <p className="text-sm text-gray-600">Hỗ trợ tất cả ngân hàng</p>
                            </div>
                        </div>
                    </button>

                    {/* Các ngân hàng cụ thể */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { code: 'NCB', name: 'NCB Bank' },
                            { code: 'VIETCOMBANK', name: 'Vietcombank' },
                            { code: 'VIETINBANK', name: 'VietinBank' },
                            { code: 'BIDV', name: 'BIDV' },
                        ].map(bank => (
                            <button
                                key={bank.code}
                                onClick={() => { setSelectedBank(bank.code); handleVNPayPayment(); }}
                                disabled={loading}
                                className="p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 transition disabled:opacity-50"
                            >
                                <p className="font-medium">{bank.name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-4">
                        <p className="text-blue-600">Đang chuyển đến cổng thanh toán...</p>
                    </div>
                )}
            </div>
        </div>
    );
}