import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { FaStar } from 'react-icons/fa';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    images: string[] | string;
    stock: number;
    Category?: { id: string; name: string; slug: string };
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

export default function ProductList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categorySlug = searchParams.get('category') || '';
    const priceFilter = searchParams.get('price');
    const searchQuery = searchParams.get('search')?.trim() || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const priceRange = useMemo(() => {
        switch (priceFilter) {
            case 'low':
                return { min: 0, max: 500000 };
            case 'mid':
                return { min: 500000, max: 1000000 };
            case 'high':
                return { min: 1000000 };
            default:
                return {};
        }
    }, [priceFilter]);

    useEffect(() => {
        const shouldFetch = !!categorySlug || !!searchQuery;
        if (!shouldFetch) {
            setProducts([]);
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params: any = { limit: 40 };
                if (categorySlug) params.categorySlug = categorySlug;
                if (searchQuery) params.search = searchQuery;
                if (priceRange.min !== undefined) params.priceMin = priceRange.min;
                if (priceRange.max !== undefined) params.priceMax = priceRange.max;

                const res = await axiosInstance.get('/products', { params });
                const rows = (res.data.rows || []).map((p: any) => ({
                    ...p,
                    images: normalizeImages(p.images)
                }));
                setProducts(rows);
            } catch (err) {
                console.error('Fetch products error:', err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [categorySlug, searchQuery, priceRange]);

    const handleFilterClick = (value: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set('price', value);
        else newParams.delete('price');
        setSearchParams(newParams);
    };

    const title = searchQuery
        ? `Kết quả cho "${searchQuery}"`
        : (products[0]?.Category?.name || (categorySlug ? 'Danh mục' : 'Danh sách sản phẩm'));

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6">{title}</h1>

            {(categorySlug || searchQuery) && (
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <span className="font-semibold text-gray-700">Lọc theo giá:</span>
                    <button
                        onClick={() => handleFilterClick(null)}
                        className={`px-4 py-2 rounded-md text-sm font-medium border ${!priceFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => handleFilterClick('low')}
                        className={`px-4 py-2 rounded-md text-sm font-medium border ${priceFilter === 'low' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        &lt; 500.000đ
                    </button>
                    <button
                        onClick={() => handleFilterClick('mid')}
                        className={`px-4 py-2 rounded-md text-sm font-medium border ${priceFilter === 'mid' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        500.000đ – 1.000.000đ
                    </button>
                    <button
                        onClick={() => handleFilterClick('high')}
                        className={`px-4 py-2 rounded-md text-sm font-medium border ${priceFilter === 'high' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        &gt; 1.000.000đ
                    </button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 text-gray-600">Đang tải sản phẩm...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-gray-500">Không có sản phẩm phù hợp</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(p => {
                        const first = (p.images as string[])[0] || '';
                        return (
                            <Link
                                key={p.id}
                                to={`/products/${p.id}`}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition group overflow-hidden flex flex-col"
                            >
                                <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center p-2">
                                    <img
                                        src={first ? getImageUrl(first) : '/placeholder.png'}
                                        alt={p.name}
                                        className="w-full h-full object-contain group-hover:scale-105 transition"
                                        onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                                    />
                                    {p.stock === 0 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">Hết hàng</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col gap-3 flex-1">
                                    <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition">
                                        {p.name}
                                    </h3>
                                    {p.description && (
                                        <p className="text-sm text-gray-600 line-clamp-1">
                                            {p.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <FaStar key={i} className={i < 4 ? 'text-yellow-400' : 'text-gray-300'} />
                                        ))}
                                    </div>
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-lg font-bold text-blue-600">
                                            {p.price.toLocaleString('vi-VN')} đ
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {p.Category?.name || ''}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}