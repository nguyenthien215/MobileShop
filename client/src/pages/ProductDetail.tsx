import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { FaShoppingCart } from 'react-icons/fa';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    images: string[] | string;
    stock: number;
    Category?: { id: string; name: string; slug?: string };
}

const normalizeImages = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(v => v.startsWith('/') ? v : '/' + v);
    if (typeof value === 'string') {
        try {
            const arr = JSON.parse(value);
            return Array.isArray(arr)
                ? arr.map((v: string) => v.startsWith('/') ? v : '/' + v)
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
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { addToast } = useToast();

    const handleAddCart = async () => {
        if (!product) return;
        try {
            await addToCart(product.id, 1);
            addToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
        } catch {
            addToast('Thêm vào giỏ hàng thất bại', { type: 'error' });
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axiosInstance.get(`/products/${id}`);
                const data = res.data;
                data.images = normalizeImages(data.images);
                setProduct(data);
            } catch (err) {
                console.error('Fetch product error:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    if (loading) return <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-600">Đang tải...</div>;
    if (!product) return <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">Không tìm thấy sản phẩm</div>;

    const first = (product.images as string[])[0] || '';
    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-4 flex items-center justify-center aspect-[4/3]">
                    <img
                        src={first ? getImageUrl(first) : '/placeholder.png'}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                    />
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
                            onClick={() => product.stock > 0 && navigate(`/orders/create/${product.id}`)}
                        >
                            {product.stock === 0 ? 'Hết hàng' : 'Mua ngay'}
                        </button>
                        <button
                            onClick={handleAddCart}
                            disabled={product.stock === 0}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                        >
                            <FaShoppingCart /> Thêm vào giỏ
                        </button>
                    </div>
                    <Link to="/" className="text-sm text-gray-600 hover:text-gray-800 mt-4 inline-block">
                        ← Quay về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}