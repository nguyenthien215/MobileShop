import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* About */}
                <div>
                    <h3 className="font-bold text-lg mb-4 text-blue-400">Về ElectroShop</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        ElectroShop là nơi cung cấp các sản phẩm điện tử chất lượng cao với giá cạnh tranh nhất thị trường.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="font-bold text-lg mb-4 text-blue-400">Liên kết nhanh</h3>
                    <ul className="text-gray-300 text-sm space-y-2">
                        <li><a href="/" className="hover:text-blue-400 transition">Trang chủ</a></li>
                        <li><a href="/products" className="hover:text-blue-400 transition">Sản phẩm</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">Về chúng tôi</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">Liên hệ</a></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="font-bold text-lg mb-4 text-blue-400">Liên hệ</h3>
                    <div className="text-gray-300 text-sm space-y-3">
                        <div className="flex items-center gap-2">
                            <FaPhone className="text-blue-400" />
                            <span>1900 1234</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaEnvelope className="text-blue-400" />
                            <span>info@electroshop.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-400" />
                            <span>123 Nguyen Hue, HCMC</span>
                        </div>
                    </div>
                </div>

                {/* Social */}
                <div>
                    <h3 className="font-bold text-lg mb-4 text-blue-400">Theo dõi</h3>
                    <div className="flex gap-4">
                        <a href="#" className="text-2xl hover:text-blue-400 transition"><FaFacebook /></a>
                        <a href="#" className="text-2xl hover:text-blue-400 transition"><FaTwitter /></a>
                        <a href="#" className="text-2xl hover:text-blue-400 transition"><FaInstagram /></a>
                        <a href="#" className="text-2xl hover:text-blue-400 transition"><FaLinkedin /></a>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
                <p>&copy; 2025 ElectroShop. All rights reserved.</p>
            </div>
        </footer>
    );
}