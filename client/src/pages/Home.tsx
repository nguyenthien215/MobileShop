import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaBox, FaTruck, FaHeadset } from 'react-icons/fa';
import Banner from '../components/Banner';
import axiosInstance from '../api/axiosConfig';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    rating?: number;
    stock: number;
    Category?: { id: string; name: string; slug?: string };
}

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
}

// Chuẩn hóa ảnh
const getImageUrl = (path: string) => {
    if (!path) return '/placeholder.png';
    const clean = path.startsWith('/') ? path : '/' + path;
    return `${import.meta.env.VITE_API_URL}${clean}`;
};

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

export default function Home() {
    const [featured, setFeatured] = useState<Product[]>([]);
    const [phones, setPhones] = useState<Product[]>([]);
    const [laptops, setLaptops] = useState<Product[]>([]);
    const [accessories, setAccessories] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(true);

    // Lấy dữ liệu chung (feature + categories)
    useEffect(() => {
        const fetchBase = async () => {
            try {
                const [categoriesRes, productsRes] = await Promise.all([
                    axiosInstance.get('/categories'),
                    axiosInstance.get('/products?limit=8')
                ]);

                setCategories(categoriesRes.data);

                const normalizedFeatured: Product[] = (productsRes.data.rows || []).map((p: any) => ({
                    ...p,
                    images: normalizeImages(p.images)
                }));
                setFeatured(normalizedFeatured);
            } catch (err) {
                console.error('Fetch base error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBase();
    }, []);

    // Sau khi có categories → lấy từng nhóm
    useEffect(() => {
        if (!categories.length) return;

        const phoneCat = categories.find(c => c.name === 'Điện thoại');
        const laptopCat = categories.find(c => c.name === 'Laptop');
        const accessoryCat = categories.find(c => c.name === 'Phụ kiện');

        const fetchGroups = async () => {
            try {
                const requests: Promise<any>[] = [];
                if (phoneCat) requests.push(axiosInstance.get(`/products?category=${phoneCat.id}&limit=4`));
                if (laptopCat) requests.push(axiosInstance.get(`/products?category=${laptopCat.id}&limit=4`));
                if (accessoryCat) requests.push(axiosInstance.get(`/products?category=${accessoryCat.id}&limit=4`));

                const responses = await Promise.all(requests);

                let idx = 0;
                if (phoneCat) {
                    const data = responses[idx++].data.rows || [];
                    setPhones(data.map((p: any) => ({ ...p, images: normalizeImages(p.images) })));
                }
                if (laptopCat) {
                    const data = responses[idx++].data.rows || [];
                    setLaptops(data.map((p: any) => ({ ...p, images: normalizeImages(p.images) })));
                }
                if (accessoryCat) {
                    const data = responses[idx++].data.rows || [];
                    setAccessories(data.map((p: any) => ({ ...p, images: normalizeImages(p.images) })));
                }
            } catch (err) {
                console.error('Fetch group error:', err);
            } finally {
                setLoadingGroups(false);
            }
        };

        fetchGroups();
    }, [categories]);

    const renderProductGrid = (title: string, items: Product[]) => (
        <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{title}</h2>
                {items.length > 0 && (
                    <Link
                        to={`/products?category=${items[0].Category?.id || ''}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                        Xem tất cả →
                    </Link>
                )}
            </div>
            {loadingGroups ? (
                <div className="text-center py-8 text-gray-600">Đang tải {title.toLowerCase()}...</div>
            ) : items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Chưa có sản phẩm</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map(p => {
                        const first = p.images?.[0] || '';
                        return (
                            <div
                                key={p.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
                            >
                                <Link to={`/products/${p.id}`} className="block">
                                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                                        <img
                                            src={first ? getImageUrl(first) : '/placeholder.png'}
                                            alt={p.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition"
                                            onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                                        />
                                        {p.stock === 0 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white font-bold">Hết hàng</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="p-4 flex flex-col gap-3">
                                    <Link to={`/products/${p.id}`} className="font-semibold line-clamp-2 text-gray-800 hover:text-blue-600">
                                        {p.name}
                                    </Link>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <FaStar key={i} className={i < (p.rating || 4) ? 'text-yellow-400' : 'text-gray-300'} />
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-blue-600">
                                            {p.price.toLocaleString('vi-VN')} đ
                                        </span>
                                        <Link
                                            to={`/products/${p.id}`}
                                            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-md font-semibold transition"
                                        >
                                            Mua ngay
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Banner */}
            <div className="max-w-7xl mx-auto px-4 py-6 w-full">
                <Banner autoPlay interval={5000} />
            </div>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center">
                    <FaBox className="text-4xl text-blue-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Sản phẩm chất lượng</h3>
                    <p className="text-gray-600">Cam kết 100% hàng chính hãng</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center">
                    <FaTruck className="text-4xl text-green-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Giao hàng nhanh</h3>
                    <p className="text-gray-600">Miễn phí vận chuyển từ 500k</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center">
                    <FaHeadset className="text-4xl text-purple-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Hỗ trợ 24/7</h3>
                    <p className="text-gray-600">Tư vấn miễn phí từ chuyên gia</p>
                </div>
            </section>

            {/* Featured Products */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold mb-8 text-center">Sản phẩm nổi bật</h2>
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Đang tải sản phẩm...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featured.map(product => {
                            const firstImg = product.images?.[0] || '';
                            return (
                                <Link
                                    key={product.id}
                                    to={`/products/${product.id}`}
                                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
                                >
                                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                                        <img
                                            src={firstImg ? getImageUrl(firstImg) : '/placeholder.png'}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition"
                                            onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                                        />
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <span className="text-white font-bold">Hết hàng</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-800 line-clamp-2 mb-2">{product.name}</h3>
                                        <div className="flex items-center gap-1 mb-3">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <FaStar
                                                    key={i}
                                                    className={i < (product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-blue-600">
                                                {product.price.toLocaleString('vi-VN')} đ
                                            </span>
                                            <Link
                                                to={`/products/${product.id}`}
                                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                                            >
                                                <FaShoppingCart size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Nhóm theo loại */}
            {renderProductGrid('Điện thoại', phones)}
            {renderProductGrid('Laptop', laptops)}
            {renderProductGrid('Phụ kiện', accessories)}
        </div>
    );
}