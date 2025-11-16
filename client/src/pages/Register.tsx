// client/src/pages/Register.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); setMsg(null);
        if (form.password !== form.confirm) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        setLoading(true);
        try {
            const res = await authApi.register({ name: form.name, email: form.email, password: form.password });
            setMsg(res.data.message || 'Đăng ký thành công!');
            // Chuyển sau 1.5s
            setTimeout(() => navigate('/login'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Tạo tài khoản</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold">Tên hiển thị</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                            placeholder="Nhập tên..."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                            placeholder="≥ 6 ký tự"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            name="confirm"
                            value={form.confirm}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                            placeholder="Nhập lại mật khẩu"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                {msg && <div className="mt-4 text-green-600 text-center text-sm">{msg}</div>}
                {error && <div className="mt-4 text-red-600 text-center text-sm">{error}</div>}

                <div className="mt-6 text-center text-sm">
                    Đã có tài khoản? <Link to="/login" className="text-green-700 font-semibold hover:underline">Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
}