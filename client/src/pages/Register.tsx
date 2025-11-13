import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Register() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center py-12">
                <div className="text-2xl font-bold">Trang đăng ký</div>
            </main>
            <Footer />
        </div>
    );
}