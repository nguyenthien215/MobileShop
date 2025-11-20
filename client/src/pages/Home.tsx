import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaBox, FaTruck, FaHeadset, FaCreditCard, FaPercent } from 'react-icons/fa';
import Banner from '../components/Banner';
import ChatBox from '../components/ChatBox';
import MarqueePromo from '../components/MarqueePromo';
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

const IMAGE_CLASS =
    'w-full h-full object-contain transition-transform duration-300 group-hover:scale-105';

export default function Home() {
    const [featured, setFeatured] = useState<Product[]>([]);
    const [phones, setPhones] = useState<Product[]>([]);
    const [laptops, setLaptops] = useState<Product[]>([]);
    const [accessories, setAccessories] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [bestSellers, setBestSellers] = useState<Product[]>([]);
    const [reviewProducts, setReviewProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingBestSellers, setLoadingBestSellers] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // Fetch categories + featured
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

    // Fetch best sellers products
    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const response = await axiosInstance.get('/products');
                const allProducts = response.data.rows || [];

                console.log('All products:', allProducts.map((p: any) => p.name));

                // Tìm 2 sản phẩm theo tên (iPhone 16 Pro Max 1TB và MacBook Air 13" M4)
                const iphone = allProducts.find((p: any) => {
                    const name = p.name.toLowerCase();
                    return (name.includes('iphone') && name.includes('16') &&
                        name.includes('pro max') && name.includes('1tb'));
                });

                const macbook = allProducts.find((p: any) => {
                    const name = p.name.toLowerCase();
                    return (name.includes('macbook') && name.includes('air') &&
                        name.includes('m4') && name.includes('13'));
                });

                const sellers: Product[] = [];
                if (iphone) {
                    console.log('iPhone found:', iphone.name);
                    sellers.push({ ...iphone, images: normalizeImages(iphone.images) });
                } else {
                    console.log('iPhone NOT found');
                }

                if (macbook) {
                    console.log('MacBook found:', macbook.name);
                    sellers.push({ ...macbook, images: normalizeImages(macbook.images) });
                } else {
                    console.log('MacBook NOT found');
                }

                console.log('Best sellers final:', sellers.map(s => s.name));
                setBestSellers(sellers);
            } catch (err) {
                console.error('Fetch best sellers error:', err);
            } finally {
                setLoadingBestSellers(false);
            }
        };
        fetchBestSellers();
    }, []);

    // Auto change banner every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBannerIndex(prev => (prev === 0 ? 1 : 0));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Fetch review products (iPhone 16 Pro Max 1TB và iPhone 14 Pro Max 1TB)
    useEffect(() => {
        const fetchReviewProducts = async () => {
            try {
                const response = await axiosInstance.get('/products');
                const allProducts = response.data.rows || [];

                const iphone16 = allProducts.find((p: any) => {
                    const name = p.name.toLowerCase();
                    return (name.includes('iphone') && name.includes('16') &&
                        name.includes('pro max') && name.includes('1tb'));
                });

                const iphone14 = allProducts.find((p: any) => {
                    const name = p.name.toLowerCase();
                    return (name.includes('iphone') && name.includes('14') &&
                        name.includes('pro max') && name.includes('1tb'));
                });

                const reviews: Product[] = [];
                if (iphone16) reviews.push({ ...iphone16, images: normalizeImages(iphone16.images) });
                if (iphone14) reviews.push({ ...iphone14, images: normalizeImages(iphone14.images) });

                setReviewProducts(reviews);
            } catch (err) {
                console.error('Fetch review products error:', err);
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviewProducts();
    }, []);

    // Fetch group products
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
        <section className="max-w-7xl mx-auto px-8 lg:px-16 py-10">
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
                                    <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center p-2">
                                        <img
                                            src={first ? getImageUrl(first) : '/placeholder.png'}
                                            alt={p.name}
                                            className={IMAGE_CLASS}
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
                                    <Link
                                        to={`/products/${p.id}`}
                                        className="font-semibold line-clamp-2 text-gray-800 hover:text-blue-600"
                                    >
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
            {/* Marquee Promo - Dòng chữ chạy */}
            <MarqueePromo />

            {/* Banner */}
            <div className="max-w-7xl mx-auto px-4 py-6 w-full">
                <Banner autoPlay interval={5000} />
            </div>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
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

            {/* Danh mục sản phẩm (đưa lên trước Featured) */}
            <section className="max-w-7xl mx-auto px-8 lg:px-16 py-10">
                <h2 className="text-3xl font-bold mb-8 text-center">Danh mục sản phẩm</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            to={`/products?category=${cat.slug}`}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition transform hover:scale-105 overflow-hidden group"
                        >
                            <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center p-2">
                                <img
                                    src={cat.image ? getImageUrl(cat.image) : '/placeholder.png'}
                                    alt={cat.name}
                                    className="w-full h-full object-contain group-hover:scale-105 transition"
                                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                            </div>
                            <div className="p-4 text-center">
                                <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition">
                                    {cat.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Sản phẩm bán chạy nhất */}
            <section className="max-w-7xl mx-auto px-8 lg:px-16 py-10">
                <h2 className="text-3xl font-bold mb-8 text-center">Sản phẩm bán chạy nhất</h2>
                {loadingBestSellers ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Đang tải sản phẩm...</p>
                    </div>
                ) : bestSellers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có sản phẩm bán chạy</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 2 Sản phẩm bên trái */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bestSellers.map(product => {
                                const firstImg = product.images?.[0] || '';
                                return (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
                                    >
                                        <Link to={`/products/${product.id}`} className="block">
                                            <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center p-4">
                                                <img
                                                    src={firstImg ? getImageUrl(firstImg) : '/placeholder.png'}
                                                    alt={product.name}
                                                    className={IMAGE_CLASS}
                                                    onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                                                />
                                                {product.stock === 0 && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <span className="text-white font-bold">Hết hàng</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="p-4">
                                            <Link
                                                to={`/products/${product.id}`}
                                                className="font-bold text-lg text-gray-800 hover:text-blue-600 line-clamp-2 mb-3 block"
                                            >
                                                {product.name}
                                            </Link>
                                            <div className="flex items-center gap-1 mb-3">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={i < (product.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-2xl font-bold" style={{ color: '#2563eb' }}>
                                                    {product.price.toLocaleString('vi-VN')} đ
                                                </span>
                                                <Link
                                                    to={`/products/${product.id}`}
                                                    className="text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                                                    style={{ backgroundColor: '#00a63e' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#008f35'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00a63e'}
                                                >
                                                    <FaShoppingCart />
                                                    Mua ngay
                                                </Link>
                                            </div>

                                            {/* Thông tin trả góp */}
                                            <div className="border-2 border-dashed border-blue-400 rounded-lg p-3 bg-white dark:bg-gray-800">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <FaCreditCard className="text-blue-600 text-sm mt-0.5 shrink-0" />
                                                    <p className="text-xs font-bold text-blue-900 dark:text-blue-100 leading-relaxed">
                                                        Hỗ trợ Trả Góp 0% qua Thẻ Tín Dụng
                                                    </p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <FaPercent className="text-green-600 text-sm mt-0.5 shrink-0" />
                                                    <p className="text-xs font-bold text-black dark:text-white leading-relaxed line-clamp-2">
                                                        Trả trước từ <span className="font-extrabold text-red-700">0%</span> giá trị máy, thời hạn từ <span className="font-extrabold text-red-700">6-8 tháng</span> (Click mua trả góp ngay)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Banner dọc bên phải - Auto change */}
                        <div className="lg:col-span-1">
                            <div className="relative h-full min-h-[500px] rounded-lg overflow-hidden shadow-lg">
                                <img
                                    src={currentBannerIndex === 0
                                        ? '/src/assets/img/banchay1.webp'
                                        : '/src/assets/img/banchay2.webp'
                                    }
                                    alt={`Banner ${currentBannerIndex + 1}`}
                                    className="w-full h-full object-cover transition-opacity duration-500"
                                    onError={(e) => {
                                        e.currentTarget.src = '/placeholder.png';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Featured Products (ảnh thu nhỏ, không crop) */}
            <section className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
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
                                    <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center p-2">
                                        <img
                                            src={firstImg ? getImageUrl(firstImg) : '/placeholder.png'}
                                            alt={product.name}
                                            className={IMAGE_CLASS}
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

            {/* Gallery Banner Section - 3 ảnh bố cục */}
            <section className="max-w-7xl mx-auto px-8 lg:px-16 py-10">
                <div className="grid grid-cols-1 gap-4">
                    {/* Ảnh ngang trên - bocuc2 */}
                    <div className="w-full h-[250px] lg:h-[350px] overflow-hidden rounded-lg shadow-lg">
                        <img
                            src="/src/assets/img/bocuc2.webp"
                            alt="Banner 2"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                e.currentTarget.src = '/placeholder.png';
                            }}
                        />
                    </div>

                    {/* 2 ảnh dọc dưới - bocuc3 và bocuc4 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-[250px] lg:h-[350px] overflow-hidden rounded-lg shadow-lg">
                            <img
                                src="/src/assets/img/bocuc3.webp"
                                alt="Banner 3"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder.png';
                                }}
                            />
                        </div>
                        <div className="h-[250px] lg:h-[350px] overflow-hidden rounded-lg shadow-lg">
                            <img
                                src="/src/assets/img/bocuc4.webp"
                                alt="Banner 4"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder.png';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Nhóm theo loại */}
            {renderProductGrid('Điện thoại', phones)}
            {renderProductGrid('Laptop', laptops)}
            {renderProductGrid('Phụ kiện', accessories)}

            {/* Reviews Section - Video với sản phẩm */}
            <section className="max-w-7xl mx-auto px-4 py-10">
                <h2 className="text-3xl font-bold mb-8 text-center">Reviews</h2>
                {loadingReviews ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Video 1 + iPhone 16 Pro Max */}
                        <div className="flex flex-col gap-4">
                            {/* Video 1 */}
                            <div className="w-full rounded-lg overflow-hidden shadow-lg bg-black">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-[300px] lg:h-[400px] object-cover"
                                >
                                    <source src="/src/assets/img/video1.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            {/* Sản phẩm iPhone 16 Pro Max */}
                            {reviewProducts[0] && (
                                <Link
                                    to={`/products/${reviewProducts[0].id}`}
                                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden block"
                                >
                                    <div className="p-3">
                                        <div className="flex gap-3 mb-3">
                                            {/* Ảnh sản phẩm */}
                                            <div className="w-24 h-24 shrink-0">
                                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                    <img
                                                        src={reviewProducts[0].images?.[0] ? getImageUrl(reviewProducts[0].images[0]) : '/placeholder.png'}
                                                        alt={reviewProducts[0].name}
                                                        className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                                                        onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Thông tin sản phẩm */}
                                            <div className="flex-1 flex flex-col">
                                                <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-2">
                                                    {reviewProducts[0].name}
                                                </h3>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            className={i < (reviewProducts[0].rating || 5) ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Thông tin trả góp - ở giữa */}
                                        <div className="border-2 border-dashed border-blue-400 rounded-lg p-2 mb-3 bg-blue-50 dark:bg-gray-800">
                                            <div className="flex items-start gap-2 mb-1">
                                                <FaCreditCard className="text-blue-600 text-xs mt-0.5 shrink-0" />
                                                <p className="text-xs font-bold text-blue-900 dark:text-blue-100 leading-relaxed">
                                                    Hỗ trợ Trả Góp 0% qua Thẻ Tín Dụng
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <FaPercent className="text-green-600 text-xs mt-0.5 shrink-0" />
                                                <p className="text-xs font-bold text-black dark:text-white leading-relaxed line-clamp-2">
                                                    Trả trước từ <span className="font-extrabold text-red-700">0%</span> giá trị máy, thời hạn từ <span className="font-extrabold text-red-700">6-8 tháng</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Giá và nút */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold" style={{ color: '#2563eb' }}>
                                                {reviewProducts[0].price.toLocaleString('vi-VN')} đ
                                            </span>
                                            <span className="text-xs bg-red-600 text-white px-3 py-1.5 rounded font-semibold">
                                                Xem ngay
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </div>

                        {/* Video 2 + iPhone 14 Pro Max */}
                        <div className="flex flex-col gap-4">
                            {/* Video 2 */}
                            <div className="w-full rounded-lg overflow-hidden shadow-lg bg-black">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-[300px] lg:h-[400px] object-cover"
                                >
                                    <source src="/src/assets/img/video2.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            {/* Sản phẩm iPhone 14 Pro Max */}
                            {reviewProducts[1] && (
                                <Link
                                    to={`/products/${reviewProducts[1].id}`}
                                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden block"
                                >
                                    <div className="p-3">
                                        <div className="flex gap-3 mb-3">
                                            {/* Ảnh sản phẩm */}
                                            <div className="w-24 h-24 shrink-0">
                                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                    <img
                                                        src={reviewProducts[1].images?.[0] ? getImageUrl(reviewProducts[1].images[0]) : '/placeholder.png'}
                                                        alt={reviewProducts[1].name}
                                                        className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                                                        onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Thông tin sản phẩm */}
                                            <div className="flex-1 flex flex-col">
                                                <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-2">
                                                    {reviewProducts[1].name}
                                                </h3>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            className={i < (reviewProducts[1].rating || 5) ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Thông tin trả góp - ở giữa */}
                                        <div className="border-2 border-dashed border-blue-400 rounded-lg p-2 mb-3 bg-blue-50 dark:bg-gray-800">
                                            <div className="flex items-start gap-2 mb-1">
                                                <FaCreditCard className="text-blue-600 text-xs mt-0.5 shrink-0" />
                                                <p className="text-xs font-bold text-blue-900 dark:text-blue-100 leading-relaxed">
                                                    Hỗ trợ Trả Góp 0% qua Thẻ Tín Dụng
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <FaPercent className="text-green-600 text-xs mt-0.5 shrink-0" />
                                                <p className="text-xs font-bold text-black dark:text-white leading-relaxed line-clamp-2">
                                                    Trả trước từ <span className="font-extrabold text-red-700">0%</span> giá trị máy, thời hạn từ <span className="font-extrabold text-red-700">6-8 tháng</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Giá và nút */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold" style={{ color: '#2563eb' }}>
                                                {reviewProducts[1].price.toLocaleString('vi-VN')} đ
                                            </span>
                                            <span className="text-xs bg-red-600 text-white px-3 py-1.5 rounded font-semibold">
                                                Xem ngay
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* Chat Support Box */}
            <ChatBox />
        </div>
    );
}