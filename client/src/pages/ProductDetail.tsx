import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuthStore } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    images: string[] | string;
    stock: number;
    Category?: { id: string; name: string; slug?: string };
}

interface Review {
    id: number;
    userId: string;
    productId: string;
    rating: number;
    comment: string;
    adminReply?: string | null;
    createdAt: string;
    User?: { id: string; name: string };
}

const normalizeImages = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(v => v.startsWith('/') ? v : '/' + v);
    if (typeof value === 'string') {
        try {
            const arr = JSON.parse(value);
            return Array.isArray(arr)
                ? arr.map((v: string) => (v.startsWith('/') ? v : '/' + v))
                : [];
        } catch {
            return [];
        }
    }
    return [];
};

const getImageUrl = (path: string) => {
    if (!path) return '/placeholder.png';
    const clean = path.startsWith('/') ? path : '/' + path;
    return `${import.meta.env.VITE_API_URL}${clean}`;
};

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuthStore();
    const { addToast } = useToast();

    const [authWarning, setAuthWarning] = useState('');
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Review-related state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [eligible, setEligible] = useState(false);
    const [myRating, setMyRating] = useState<number>(0);
    const [myComment, setMyComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axiosInstance.get(`/products/${id}`);
                const data = res.data;
                data.images = normalizeImages(data.images);
                setProduct(data);

                // Load reviews
                const rv = await axiosInstance.get(`/reviews/${id}`);
                setReviews(rv.data);

                // Eligibility + existing review
                if (user) {
                    try {
                        const eg = await axiosInstance.get(`/reviews/eligible/${id}`);
                        setEligible(eg.data.eligible);
                        if (eg.data.review) {
                            setMyRating(eg.data.review.rating);
                            setMyComment(eg.data.review.comment || '');
                        }
                    } catch {
                        setEligible(false);
                    }
                } else {
                    setEligible(false);
                }
            } catch (err) {
                console.error('Fetch product error:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id, user]);

    // Auto scroll to review section if query has ?review=1
    useEffect(() => {
        if (window.location.search.includes('review=1')) {
            const el = document.getElementById('review-section');
            if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
        }
    }, []);

    const handleBuyNow = () => {
        if (!product) return;
        if (!user) {
            setAuthWarning('Bạn cần đăng nhập để mua sản phẩm.');
            addToast('Bạn cần đăng nhập để mua sản phẩm.', { type: 'info' });
            return;
        }
        if (product.stock > 0) {
            navigate(`/orders/create/${product.id}`);
        }
    };

    const handleAddCart = async () => {
        if (!product) return;
        if (!user) {
            setAuthWarning('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.');
            addToast('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.', { type: 'info' });
            return;
        }
        if (product.stock === 0) {
            addToast('Sản phẩm đã hết hàng.', { type: 'error' });
            return;
        }
        try {
            await addToCart(product.id, 1);
            setAuthWarning('');
            addToast(`Đã thêm "${product.name}" vào giỏ hàng!`, { type: 'success' });
        } catch {
            addToast('Không thể thêm vào giỏ hàng lúc này.', { type: 'error' });
        }
    };

    const handleSubmitReview = async () => {
        if (!product) return;
        if (!user) {
            addToast('Bạn cần đăng nhập để đánh giá.', { type: 'info' });
            return;
        }
        if (!eligible) {
            addToast('Bạn chưa đủ điều kiện đánh giá sản phẩm này.', { type: 'error' });
            return;
        }
        if (myRating < 1 || myRating > 5) {
            addToast('Chọn số sao từ 1 đến 5.', { type: 'error' });
            return;
        }

        setSubmittingReview(true);
        try {
            await axiosInstance.post('/reviews', {
                productId: product.id,
                rating: myRating,
                comment: myComment
            });
            addToast('Đã gửi đánh giá!', { type: 'success' });
            const rv = await axiosInstance.get(`/reviews/${product.id}`);
            setReviews(rv.data);
        } catch (e: any) {
            addToast(e.response?.data?.message || 'Lỗi khi đánh giá', { type: 'error' });
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading)
        return <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-600">Đang tải...</div>;
    if (!product)
        return <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">Không tìm thấy sản phẩm</div>;

    const images = (product.images as string[]) || [];
    const currentImage = images[selectedImageIndex] || '';

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="flex flex-col gap-4">
                    {/* Main Image */}
                    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-center aspect-[4/3]">
                        <img
                            src={currentImage ? getImageUrl(currentImage) : '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                        />
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition ${index === selectedImageIndex
                                        ? 'border-blue-600'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <img
                                        src={getImageUrl(img)}
                                        alt={`${product.name} - ${index + 1}`}
                                        className="w-full h-full object-contain bg-gray-50"
                                        onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-blue-600 text-2xl font-semibold">
                        {product.price.toLocaleString('vi-VN')} đ
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        {product.description || 'Không có mô tả.'}
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-sm">
                            Danh mục:{' '}
                            {product.Category ? (
                                <Link
                                    to={`/products?category=${product.Category.slug || ''}`}
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    {product.Category.name}
                                </Link>
                            ) : '—'}
                        </span>
                        <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                            disabled={product.stock === 0}
                            onClick={handleBuyNow}
                        >
                            {product.stock === 0 ? 'Hết hàng' : 'Mua ngay'}
                        </button>
                        <button
                            onClick={handleAddCart}
                            disabled={product.stock === 0}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                        >
                            <FaShoppingCart />
                            Thêm vào giỏ
                        </button>
                    </div>

                    {authWarning && !user && (
                        <div className="mt-2 text-sm text-red-600 flex flex-col gap-1">
                            <span>{authWarning}</span>
                            <Link to="/login" className="text-blue-600 hover:underline inline-block">
                                Đăng nhập ngay →
                            </Link>
                        </div>
                    )}

                    <Link to="/" className="text-sm text-gray-600 hover:text-gray-800 mt-4 inline-block">
                        ← Quay về trang chủ
                    </Link>
                </div>
            </div>

            {/* ĐÁNH GIÁ SẢN PHẨM */}
            <div id="review-section" className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Đánh giá sản phẩm</h2>

                {!user && (
                    <div className="text-sm text-gray-600 mb-4">
                        <Link to="/login" className="text-blue-600 underline">Đăng nhập để đánh giá →</Link>
                    </div>
                )}

                {user && !eligible && (
                    <div className="text-sm text-red-600 mb-4">
                        Bạn chỉ có thể đánh giá sau khi đã mua & thanh toán / hoàn tất đơn hàng của sản phẩm này.
                    </div>
                )}

                {user && eligible && (
                    <div className="mb-6 p-4 bg-white rounded shadow flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setMyRating(star)}
                                    className={`text-2xl ${star <= myRating ? 'text-yellow-500' : 'text-gray-300'}`}
                                >★</button>
                            ))}
                            <span className="text-sm text-gray-600 ml-2">
                                {myRating ? `${myRating} sao` : 'Chọn sao'}
                            </span>
                        </div>
                        <textarea
                            rows={3}
                            placeholder="Nhập bình luận (tuỳ chọn)"
                            value={myComment}
                            onChange={e => setMyComment(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm resize-none"
                        />
                        <button
                            onClick={handleSubmitReview}
                            disabled={submittingReview}
                            className="self-start bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded font-semibold disabled:opacity-50"
                        >
                            {submittingReview ? 'Đang gửi...' : (myRating ? 'Cập nhật đánh giá' : 'Gửi đánh giá')}
                        </button>
                    </div>
                )}

                <h3 className="text-xl font-semibold mb-3">Các đánh giá gần đây</h3>
                {reviews.length === 0 ? (
                    <div className="text-sm text-gray-500">Chưa có đánh giá nào.</div>
                ) : (
                    <ul className="space-y-4">
                        {reviews.map(r => (
                            <li key={r.id} className="bg-white p-4 rounded shadow">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold">{r.User?.name || 'Người dùng'}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(r.createdAt).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <span key={s} className={`text-lg ${s <= r.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                                    ))}
                                    <span className="text-sm ml-2">{r.rating} / 5</span>
                                </div>
                                {r.comment && <p className="text-sm text-gray-700 whitespace-pre-line">{r.comment}</p>}

                                {/* Phản hồi của Admin */}
                                {r.adminReply && (
                                    <div className="mt-3 ml-6 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-blue-700">Phản hồi từ Admin</span>
                                        </div>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{r.adminReply}</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}