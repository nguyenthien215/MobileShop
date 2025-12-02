import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

export default function PaymentDemo() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);
    const [processing, setProcessing] = useState(false);

    const orderCode = searchParams.get('orderCode');
    const amount = searchParams.get('amount');
    const description = searchParams.get('description');

    useEffect(() => {
        // Countdown tự động
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            // Tự động thanh toán sau 5 giây
            handlePayment('success');
        }
    }, [countdown]);

    const handlePayment = async (status: 'success' | 'failed') => {
        if (processing) return;
        setProcessing(true);

        try {
            await axiosInstance.post('/payos/demo-callback', {
                orderCode,
                status
            });

            if (status === 'success') {
                navigate('/orders?payment=success');
            } else {
                navigate('/orders?payment=failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Có lỗi xảy ra khi xử lý thanh toán');
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-4">
                        <span className="text-4xl">💳</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">PayOS Demo</h1>
                    <p className="text-sm text-gray-500 mt-1">Trang thanh toán giả lập</p>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-lg p-5 mb-6">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Mã đơn hàng:</span>
                            <span className="font-semibold">{orderCode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Mô tả:</span>
                            <span className="font-medium text-sm text-right max-w-[200px]">{description}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                            <span className="text-gray-700 font-semibold">Số tiền:</span>
                            <span className="text-2xl font-bold text-red-600">
                                {parseInt(amount || '0').toLocaleString('vi-VN')} đ
                            </span>
                        </div>
                    </div>
                </div>

                {/* Countdown */}
                {!processing && countdown > 0 && (
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                            <span className="text-3xl font-bold text-green-600">{countdown}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Tự động thanh toán thành công sau {countdown} giây...
                        </p>
                    </div>
                )}

                {processing && (
                    <div className="text-center mb-6">
                        <div className="inline-block animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
                        <p className="text-sm text-gray-600">Đang xử lý thanh toán...</p>
                    </div>
                )}

                {/* Action Buttons */}
                {!processing && (
                    <div className="space-y-3">
                        <button
                            onClick={() => handlePayment('success')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                        >
                            ✓ Thanh toán thành công
                        </button>
                        <button
                            onClick={() => handlePayment('failed')}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
                        >
                            ✗ Thanh toán thất bại
                        </button>
                        <button
                            onClick={() => navigate('/orders')}
                            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 rounded-lg transition"
                        >
                            Hủy
                        </button>
                    </div>
                )}

                {/* Note */}
                <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-xs text-gray-600">
                        <strong>Lưu ý:</strong> Đây là trang thanh toán giả lập để demo chức năng.
                        Trong thực tế sẽ tích hợp PayOS thật.
                    </p>
                </div>
            </div>
        </div>
    );
}
