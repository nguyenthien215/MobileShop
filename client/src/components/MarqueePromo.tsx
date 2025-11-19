import { FaTruck, FaCheckCircle, FaRecycle } from 'react-icons/fa';

export default function MarqueePromo() {
    const promos = [
        { icon: <FaTruck className="text-green-600" />, text: 'Giao hàng nhanh - Miễn phí cho đơn từ 300k' },
        { icon: <FaCheckCircle className="text-blue-600" />, text: 'Sản phẩm chính hãng - Xuất VAT đầy đủ' },
        { icon: <FaRecycle className="text-orange-600" />, text: 'Thu cũ giá ngon - Lên đời tiết kiệm' }
    ];

    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="marquee-container">
                <div className="marquee-content">
                    {/* First set */}
                    {promos.map((promo, index) => (
                        <div key={`first-${index}`} className="marquee-item flex items-center gap-2 mx-8">
                            <span className="text-lg">{promo.icon}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                {promo.text}
                            </span>
                        </div>
                    ))}
                    {/* Duplicate set for seamless loop */}
                    {promos.map((promo, index) => (
                        <div key={`second-${index}`} className="marquee-item flex items-center gap-2 mx-8">
                            <span className="text-lg">{promo.icon}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                {promo.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .marquee-container {
                    position: relative;
                    width: 100%;
                    overflow: hidden;
                }

                .marquee-content {
                    display: flex;
                    animation: marquee 40s linear infinite;
                }

                .marquee-item {
                    display: flex;
                    align-items: center;
                }

                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .marquee-content:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
