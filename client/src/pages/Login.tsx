// client/src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../contexts/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await authApi.login(form);
            const { user, token } = res.data;
            setAuth(user, token);
            if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
            else navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                            placeholder="••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>
                {error && <div className="mt-4 text-red-600 text-center text-sm">{error}</div>}
                <div className="mt-6 text-center text-sm">
                    Chưa có tài khoản? <Link to="/register" className="text-green-700 font-semibold hover:underline">Đăng ký</Link>
                </div>
            </div>
        </div>
    );
}