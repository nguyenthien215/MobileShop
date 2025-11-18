import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';

interface Stats {
    users: number;
    products: number;
    orders: number;
    revenue: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axiosInstance.get('/admin/stats');
                setStats(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const formatCurrency = (v: number) =>
        v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    return (
        <div className="space-y-8 animate-fade">
            <h1 className="text-2xl font-bold mb-2">Tổng Quan Dashboard</h1>

            {loading && (
                <div className="text-sm text-gray-500">Đang tải thống kê...</div>
            )}

            {!loading && stats && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        <StatCard
                            title="Tổng Người Dùng"
                            value={stats.users}
                            color="from-indigo-500 to-purple-600"
                            icon="👥"
                        />
                        <StatCard
                            title="Tổng Sản Phẩm"
                            value={stats.products}
                            color="from-green-500 to-emerald-600"
                            icon="📦"
                        />
                        <StatCard
                            title="Tổng Đơn Hàng"
                            value={stats.orders}
                            color="from-yellow-500 to-orange-500"
                            icon="🧾"
                        />
                        <StatCard
                            title="Tổng Doanh Thu"
                            value={formatCurrency(stats.revenue)}
                            color="from-pink-500 to-red-600"
                            icon="💰"
                        />
                    </div>

                    {/* Placeholder biểu đồ đơn giản */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[var(--card)] rounded-xl shadow p-6">
                            <h2 className="font-semibold mb-4">Doanh Thu (Minh hoạ)</h2>
                            <div className="flex items-end gap-2 h-40">
                                {[20, 35, 50, 80, 65, 90].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-gradient-to-t from-green-600 to-green-300 rounded-lg animate-grow"
                                        style={{ height: `${h}%` }}
                                        title={`Tháng ${i + 1}`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-3">Biểu đồ ví dụ — sẽ thay bằng dữ liệu thực sau.</p>
                        </div>
                        <div className="bg-white dark:bg-[var(--card)] rounded-xl shadow p-6">
                            <h2 className="font-semibold mb-4">Phân Bổ Sản Phẩm (ví dụ)</h2>
                            <div className="relative w-48 h-48 mx-auto">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 animate-pulse" />
                                <div className="absolute inset-6 rounded-full bg-[var(--bg)] flex items-center justify-center text-sm font-semibold">
                                    Data Demo
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">Sẽ thay bằng chart thật (Pie) sau.</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    color,
    icon
}: {
    title: string;
    value: number | string;
    color: string;
    icon: string;
}) {
    return (
        <div className="relative overflow-hidden bg-white dark:bg-[var(--card)] rounded-xl shadow group p-5 flex flex-col gap-2 border border-transparent hover:border-green-400 transition">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r pointer-events-none transition duration-300 from-green-400 to-green-700" />
            <div className="text-3xl">{icon}</div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {title}
            </h3>
            <span className="text-xl font-bold text-green-700 dark:text-green-400 tracking-wide">
                {value}
            </span>
        </div>
    );
}