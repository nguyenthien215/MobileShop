import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        // Clear cart sau khi thanh toán thành công
        // Hoặc gọi API clear cart
    }, []);

    return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Thanh toán thành công!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                Đơn hàng <span className="font-semibold">#{orderId}</span> đã được thanh toán.
            </p>
            <div className="flex gap-4 justify-center">
                <Link
                    to="/orders"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Xem đơn hàng
                </Link>
                <Link
                    to="/"
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
}