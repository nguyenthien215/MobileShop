import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopBar from '../components/admin/AdminTopBar';

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <AdminSidebar />
            <div className="flex flex-col flex-1">
                <AdminTopBar />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}