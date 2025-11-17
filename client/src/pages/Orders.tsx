import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { useAuthStore } from '../contexts/AuthContext';

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    images: string[] | string;
}

const normalizeImages = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const arr = JSON.parse(value);
            return Array.isArray(arr) ? arr : [];
        } catch { return []; }
    }
    return [];
};

const getImageUrl = (path: string) => {
    if (!path) return '/placeholder.png';
    const clean = path.startsWith('/') ? path : '/' + path;
    return `${import.meta.env.VITE_API_URL}${clean}`;
};

export default function Orders() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bank'>('COD');
    const [bankName, setBankName] = useState('');
    const [cardHolderName, setCardHolderName] = useState(user?.name || '');
    const [accountNumber, setAccountNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axiosInstance.get(`/products/${productId}`);
                const data = res.data;
                data.images = normalizeImages(data.images);
                setProduct(data);
            } catch (err: any) {
                console.error(err);
                setErrorMsg('Không tải được sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        if (productId) load();
    }, [productId]);

    const handleQuantity = (delta: number) => {
        setQuantity(q => {
            const next = q + delta;
            if (next < 1) return 1;
            if (product && next > product.stock) return product.stock;
            return next;
        });
    };

    const handleSubmit = async () => {
        if (!product) return;
        if (!phone.trim() || !address.trim()) {
            setErrorMsg('Vui lòng nhập số điện thoại và địa chỉ.');
            return;
        }
        if (paymentMethod === 'bank' && (!bankName || !cardHolderName || !accountNumber)) {
            setErrorMsg('Vui lòng nhập đầy đủ thông tin thanh toán ngân hàng.');
            return;
        }
        setErrorMsg('');
        setSubmitting(true);
        try {
            const payload: any = {
                productId: product.id,
                quantity,
                phone,
                address,
                paymentMethod
            };
            if (paymentMethod === 'bank') {
                payload.bankName = bankName;
                payload.cardHolderName = cardHolderName;
                payload.accountNumber = accountNumber;
            }
            const res = await axiosInstance.post('/orders/quick', payload);
            if (res.data.success) {
                setSuccess(true);
            } else {
                setErrorMsg(res.data.message || 'Có lỗi xảy ra');
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Lỗi server');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-600">Đang tải...</div>;
    if (!product) return <div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-500">Không tìm thấy sản phẩm</div>;

    const firstImg = (product.images as string[])[0];

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6">Đặt hàng</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Thông tin sản phẩm */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="aspect-[4/3] flex items-center justify-center mb-4 bg-gray-100">
                        <img
                            src={firstImg ? getImageUrl(firstImg) : '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                        />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                    <p className="text-blue-600 font-bold text-lg mb-4">
                        {product.price.toLocaleString('vi-VN')} đ
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Số lượng:</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleQuantity(-1)}
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                disabled={quantity <= 1}
                            >-</button>
                            <span className="min-w-[32px] text-center font-semibold">{quantity}</span>
                            <button
                                onClick={() => handleQuantity(1)}
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                disabled={product.stock === quantity}
                            >+</button>
                        </div>
                        <span className="text-xs text-gray-500">Còn lại: {product.stock}</span>
                    </div>
                    <div className="mt-4 text-sm">
                        Thành tiền:{' '}
                        <span className="font-bold text-green-700">
                            {(product.price * quantity).toLocaleString('vi-VN')} đ
                        </span>
                    </div>
                </div>

                {/* Form đặt hàng */}
                <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Tên</label>
                        <input
                            type="text"
                            value={user?.name || ''}
                            disabled
                            className="px-3 py-2 border rounded bg-gray-100 text-gray-700"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Số điện thoại</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="px-3 py-2 border rounded"
                            placeholder="Nhập số điện thoại"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Địa chỉ nhận hàng</label>
                        <textarea
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className="px-3 py-2 border rounded resize-none"
                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                            rows={3}
                        />
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="mt-2">
                        <h4 className="text-sm font-semibold mb-2">Phương thức thanh toán</h4>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                />
                                <span>Thanh toán khi nhận hàng (COD)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={paymentMethod === 'bank'}
                                    onChange={() => setPaymentMethod('bank')}
                                />
                                <span>Thanh toán bằng thẻ ngân hàng</span>
                            </label>
                        </div>
                    </div>

                    {paymentMethod === 'bank' && (
                        <div className="border rounded p-4 bg-gray-50 flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Ngân hàng</label>
                                <select
                                    value={bankName}
                                    onChange={e => setBankName(e.target.value)}
                                    className="px-3 py-2 border rounded"
                                >
                                    <option value="">-- Chọn ngân hàng --</option>
                                    <option value="Vietcombank">Vietcombank</option>
                                    <option value="Techcombank">Techcombank</option>
                                    <option value="ACB">ACB</option>
                                    <option value="MB">MB Bank</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Tên chủ thẻ</label>
                                <input
                                    type="text"
                                    value={cardHolderName}
                                    onChange={e => setCardHolderName(e.target.value)}
                                    className="px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Số tài khoản</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={e => setAccountNumber(e.target.value)}
                                    className="px-3 py-2 border rounded"
                                    placeholder="Nhập số tài khoản"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                (Giả lập: Chọn ngân hàng và nhập số tài khoản để đánh dấu đã thanh toán)
                            </p>
                        </div>
                    )}

                    {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="mt-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition disabled:opacity-60"
                    >
                        {submitting ? 'Đang xử lý...' : 'Thanh toán'}
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-gray-600 hover:text-gray-800 underline mt-2 self-start"
                    >
                        ← Quay lại
                    </button>
                </div>
            </div>

            {success && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center animate-scale-in">
                        <div className="text-green-600 text-5xl font-bold mb-4">✓</div>
                        <h2 className="text-2xl font-bold mb-2">Thanh toán thành công!</h2>
                        <p className="text-gray-600 mb-6">
                            Đơn hàng của bạn đã được tạo. Cảm ơn bạn đã mua sắm.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate('/')}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                            >
                                Về trang chủ
                            </button>
                            <button
                                onClick={() => navigate('/orders')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                            >
                                Xem đơn hàng của tôi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}