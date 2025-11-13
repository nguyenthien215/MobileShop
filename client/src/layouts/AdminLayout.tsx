import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AdminLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}