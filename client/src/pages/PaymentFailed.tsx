import { Link, useSearchParams } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

export default function PaymentFailed() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const code = searchParams.get('code');

    const getErrorMessage = (code: string | null) => {
        const errors: { [key: string]: string } = {
            '07': 'Giao dịch bị nghi ngờ gian lận',
            '09': 'Thẻ chưa đăng ký Internet Banking',
            '10': 'Xác thực thông tin thẻ không đúng quá số lần quy định',
            '11': 'Hết thời gian chờ thanh toán',
            '12': 'Thẻ bị khóa',
            '13': 'Sai mật khẩu OTP',
            '24': 'Giao dịch bị hủy',
            '51': 'Tài khoản không đủ số dư',
            '65': 'Vượt quá hạn mức thanh toán',
            '75': 'Ngân hàng đang bảo trì',
            '79': 'Giao dịch vượt quá số lần cho phép',
        };
        return errors[code || ''] || 'Giao dịch thất bại';
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Thanh toán thất bại!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
                Đơn hàng <span className="font-semibold">#{orderId}</span>
            </p>
            <p className="text-red-600 font-medium mb-8">
                {getErrorMessage(code)}
            </p>
            <div className="flex gap-4 justify-center">
                <Link
                    to={`/payment?orderId=${orderId}`}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Thử lại
                </Link>
                <Link
                    to="/orders"
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    Xem đơn hàng
                </Link>
            </div>
        </div>
    );
}