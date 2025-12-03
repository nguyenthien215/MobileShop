import { useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        // Clear cart sau khi thanh toán thành công
        localStorage.removeItem('cart');
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
            <div className="w-full max-w-md text-center">
                {/* Success Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                        <svg
                            className="w-14 h-14 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    Thanh toán thành công!
                </h1>

                {/* Description */}
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    Đơn hàng của bạn đã được tạo thành công.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                    Cảm ơn bạn đã mua hàng tại Mobile City
                </p>

                {/* Order ID */}
                {orderId && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Mã đơn hàng</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            #{orderId}
                        </p>
                    </div>
                )}

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
                    >
                        Về trang chủ
                    </button>
                    <button
                        onClick={() => navigate('/orders')}
                        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
                    >
                        Xem đơn hàng của tôi
                    </button>
                </div>

                {/* Info */}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
                    Email xác nhận đã được gửi đến hộp thư của bạn
                </p>
            </div>
        </div>
    );
}