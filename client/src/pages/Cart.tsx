import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';

const getImageUrl = (p: string) => {
    if (!p) return '/placeholder.png';
    const clean = p.startsWith('/') ? p : '/' + p;
    return `${import.meta.env.VITE_API_URL}${clean}`;
};

export default function Cart() {
    const { items, total, updateQuantity, removeItem, toggleSelect, selectedItems } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (selectedItems.length === 0) return;
        // chuyển sang trang multi checkout
        navigate('/orders/checkout');
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <FaShoppingCart /> Giỏ hàng của bạn
            </h1>

            {items.length === 0 ? (
                <div className="text-center text-gray-600 py-20">
                    Giỏ hàng trống. <Link to="/" className="text-blue-600 underline">Mua sắm ngay</Link>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {items.map(it => {
                            const first = Array.isArray(it.Product.images) ? it.Product.images[0] : '';
                            const lineTotal = it.quantity * it.Product.price;
                            return (
                                <div key={it.id} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow">
                                    <div className="flex items-center gap-4 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={!!it.selected}
                                            onChange={() => toggleSelect(it.id)}
                                            className="scale-125 cursor-pointer"
                                        />
                                        <div className="w-28 h-28 bg-gray-100 flex items-center justify-center rounded">
                                            <img
                                                src={first ? getImageUrl(first) : '/placeholder.png'}
                                                alt={it.Product.name}
                                                className="w-full h-full object-contain"
                                                onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 flex-1">
                                            <Link to={`/products/${it.Product.id}`} className="font-semibold hover:text-blue-600">
                                                {it.Product.name}
                                            </Link>
                                            <span className="text-blue-600 font-bold">
                                                {it.Product.price.toLocaleString('vi-VN')} đ
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(it.id, it.quantity - 1)}
                                                    disabled={it.quantity <= 1}
                                                    className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                                ><FaMinus /></button>
                                                <span className="min-w-[32px] text-center font-semibold">{it.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(it.id, it.quantity + 1)}
                                                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                                                ><FaPlus /></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:flex-col md:items-end md:gap-3">
                                        <span className="font-bold text-green-700">
                                            {lineTotal.toLocaleString('vi-VN')} đ
                                        </span>
                                        <button
                                            onClick={() => removeItem(it.id)}
                                            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                                        >
                                            <FaTrash /> Xóa
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tổng cộng */}
                    <div className="mt-8 bg-white p-6 rounded-lg shadow flex flex-col gap-4">
                        <div className="flex justify-between text-lg">
                            <span className="font-semibold">Tổng cộng:</span>
                            <span className="font-bold text-blue-600">{total.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={selectedItems.length === 0}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                        >
                            Mua ngay ({selectedItems.length})
                        </button>
                        <span className="text-xs text-gray-500">
                            Chỉ những sản phẩm được tích mới được thanh toán.
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}