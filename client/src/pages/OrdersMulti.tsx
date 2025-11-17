import { useCart } from '../contexts/CartContext';
import { useAuthStore } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const getImageUrl = (p: string) => {
    if (!p) return '/placeholder.png';
    const clean = p.startsWith('/') ? p : '/' + p;
    return `${import.meta.env.VITE_API_URL}${clean}`;
};

export default function OrdersMulti() {
    const { selectedItems, refresh, clearSelection } = useCart();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bank'>('COD');
    const [bankName, setBankName] = useState('');
    const [cardHolderName, setCardHolderName] = useState(user?.name || '');
    const [accountNumber, setAccountNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [confetti, setConfetti] = useState<string[]>([]);

    const total = selectedItems.reduce((s, it) => s + it.quantity * it.Product.price, 0);

    useEffect(() => {
        if (success) {
            // build confetti colors
            const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#00afb9'];
            const pieces = Array.from({ length: 40 }, (_, i) => colors[i % colors.length]);
            setConfetti(pieces);
            const timer = setTimeout(() => setConfetti([]), 2600);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleSubmit = async () => {
        if (!phone || !address) { setErrorMsg('Nhập đủ số điện thoại & địa chỉ'); return; }
        if (paymentMethod === 'bank' && (!bankName || !cardHolderName || !accountNumber)) {
            setErrorMsg('Thiếu thông tin ngân hàng'); return;
        }
        setErrorMsg('');
        setSubmitting(true);
        try {
            const itemsPayload = selectedItems.map(it => ({
                productId: it.Product.id,
                quantity: it.quantity
            }));
            const res = await axiosInstance.post('/orders', {
                items: itemsPayload,
                paymentMethod,
                shippingAddress: { phone, address }
            });
            if (res.status === 201) {
                setSuccess(true);
                clearSelection();
                await refresh();
            }
        } catch (e: any) {
            setErrorMsg(e.response?.data?.message || 'Lỗi server');
        } finally {
            setSubmitting(false);
        }
    };

    if (selectedItems.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <p className="text-gray-600 mb-4">Không có sản phẩm nào được chọn.</p>
                <button onClick={() => navigate('/cart')} className="text-blue-600 underline">Quay lại giỏ hàng</button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6">Thanh toán nhiều sản phẩm</h1>

            <div className="space-y-4 mb-8">
                {selectedItems.map(it => {
                    const first = Array.isArray(it.Product.images) ? it.Product.images[0] : '';
                    return (
                        <div key={it.id} className="flex gap-4 bg-white p-4 rounded shadow">
                            <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded">
                                <img
                                    src={first ? getImageUrl(first) : '/placeholder.png'}
                                    alt={it.Product.name}
                                    className="w-full h-full object-contain"
                                    onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="font-semibold">{it.Product.name}</span>
                                <span className="text-blue-600 font-bold">
                                    {(it.Product.price * it.quantity).toLocaleString('vi-VN')} đ
                                </span>
                                <span className="text-sm text-gray-500">
                                    Giá: {it.Product.price.toLocaleString('vi-VN')} đ x {it.quantity}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white p-6 rounded-lg shadow flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Thông tin giao hàng</h2>
                <input type="text" value={user?.name || ''} disabled className="px-3 py-2 border rounded bg-gray-100" />
                <input
                    type="text"
                    placeholder="Số điện thoại"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="px-3 py-2 border rounded"
                />
                <textarea
                    placeholder="Địa chỉ nhận hàng"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="px-3 py-2 border rounded resize-none"
                    rows={3}
                />
                <div>
                    <h3 className="text-sm font-semibold mb-2">Phương thức thanh toán</h3>
                    <label className="flex items-center gap-2 mb-1">
                        <input type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} /> COD
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="radio" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} /> Ngân hàng
                    </label>
                </div>
                {paymentMethod === 'bank' && (
                    <div className="grid gap-3">
                        <select
                            value={bankName}
                            onChange={e => setBankName(e.target.value)}
                            className="px-3 py-2 border rounded"
                        >
                            <option value="">--Chọn ngân hàng--</option>
                            <option value="Vietcombank">Vietcombank</option>
                            <option value="Techcombank">Techcombank</option>
                            <option value="ACB">ACB</option>
                            <option value="MB">MB Bank</option>
                        </select>
                        <input
                            type="text"
                            value={cardHolderName}
                            onChange={e => setCardHolderName(e.target.value)}
                            className="px-3 py-2 border rounded"
                            placeholder="Tên chủ thẻ"
                        />
                        <input
                            type="text"
                            value={accountNumber}
                            onChange={e => setAccountNumber(e.target.value)}
                            className="px-3 py-2 border rounded"
                            placeholder="Số tài khoản"
                        />
                    </div>
                )}
                <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng thanh toán:</span>
                    <span className="text-green-700">{total.toLocaleString('vi-VN')} đ</span>
                </div>
                {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                    {submitting ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
            </div>

            {success && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="success-overlay bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center relative overflow-hidden">
                        {/* Confetti pieces */}
                        {confetti.map((c, i) => (
                            <div
                                key={i}
                                className="confetti-piece"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    '--c': c,
                                    animationDelay: `${Math.random() * 0.5}s`
                                } as any}
                            />
                        ))}
                        <div className="success-check text-green-600 text-6xl font-bold mb-4">✓</div>
                        <h2 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h2>
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
                                Lịch sử đơn hàng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}