import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaBox, FaTruck, FaHeadset } from 'react-icons/fa';

import axiosInstance from '../api/axiosConfig';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    rating?: number;
    stock: number;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const categoriesRes = await axiosInstance.get('/categories');
                setCategories(categoriesRes.data);

                // Fetch products
                const productsRes = await axiosInstance.get('/products?limit=8');
                setProducts(productsRes.data.rows || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">


            {/* Banner */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-4">Chào mừng đến ElectroShop</h1>
                    <p className="text-xl mb-8 text-blue-100">
                        Khám phá những sản phẩm điện tử chất lượng cao với giá tốt nhất
                    </p>
                    <Link
                        to="/products"
                        className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-lg transition transform hover:scale-105"
                    >
                        Khám Phá Ngay
                    </Link>
                </div>
            </section>

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

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold mb-8 text-center">Danh mục sản phẩm</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/products?category=${cat.slug}`}
                            className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-lg hover:shadow-xl transition transform hover:scale-105 text-center font-bold text-xl"
                        >
                            {cat.name}
                        </Link>
                    ))}
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
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                to={`/products/${product.id}`}
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
                            >
                                <div className="relative h-48 bg-gray-200 overflow-hidden">
                                    <img
                                        src={product.images?.[0] ? `${import.meta.env.VITE_API_URL}${product.images[0]}` : '/placeholder.png'}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition"
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
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition">
                                            <FaShoppingCart size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>


        </div>
    );
}