import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaCamera,
    FaSave,
    FaEye,
    FaEyeSlash,
    FaUserCircle
} from 'react-icons/fa';
import { userApi } from '../../api/userApi';
import { useAuthStore } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function Settings() {
    const navigate = useNavigate();
    const { user, setAuth, token } = useAuthStore();
    const { addToast } = useToast();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await userApi.getProfile();
                const userData = response.data.user;
                setName(userData.name);
                setEmail(userData.email);
                setAvatar(userData.avatar);
            } catch (error) {
                console.error('Error loading profile:', error);
                addToast('Không thể tải thông tin tài khoản', { type: 'error' });
            }
        };

        fetchProfile();
    }, [user, navigate, addToast]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Kiểm tra kích thước file (5MB)
            if (file.size > 5 * 1024 * 1024) {
                addToast('Kích thước ảnh không được vượt quá 5MB', { type: 'error' });
                return;
            }

            // Kiểm tra định dạng file
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                addToast('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)', { type: 'error' });
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload avatar nếu có
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                const avatarResponse = await userApi.uploadAvatar(formData);
                setAvatar(avatarResponse.data.avatar);
                setAvatarPreview(null);
                setAvatarFile(null);
            }

            // Cập nhật tên
            const response = await userApi.updateProfile({ name });
            const updatedUser = response.data.user;

            // Cập nhật auth store
            if (token) {
                setAuth(updatedUser, token);
            }

            addToast('Cập nhật thông tin tài khoản thành công!', { type: 'success' });

            // Reload để cập nhật avatar và tên trên header
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
            const err = error as { response?: { data?: { message?: string } } };
            addToast(err.response?.data?.message || 'Không thể cập nhật thông tin', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            addToast('Mật khẩu mới không khớp', { type: 'error' });
            return;
        }

        if (newPassword.length < 6) {
            addToast('Mật khẩu mới phải có ít nhất 6 ký tự', { type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await userApi.changePassword({ currentPassword, newPassword });
            addToast('Đổi mật khẩu thành công!', { type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            const err = error as { response?: { data?: { message?: string } } };
            addToast(err.response?.data?.message || 'Không thể đổi mật khẩu', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUrl = () => {
        if (avatarPreview) return avatarPreview;
        if (avatar) return `http://localhost:5000${avatar}`;
        return null;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Thông tin tài khoản Admin</h1>

            {/* Thông tin cá nhân */}
            <div className="bg-white dark:bg-[var(--card)] rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    Thông tin cá nhân
                </h2>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative mb-4">
                            {getAvatarUrl() ? (
                                <img
                                    src={getAvatarUrl()!}
                                    alt="Avatar"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-blue-500 shadow-lg">
                                    <FaUserCircle size={80} className="text-white" />
                                </div>
                            )}
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition"
                            >
                                <FaCamera size={20} />
                            </label>
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kích thước tối đa: 5MB. Định dạng: JPEG, PNG, GIF, WEBP
                        </p>
                    </div>

                    {/* Họ và tên */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            <FaUser className="inline mr-2 text-blue-600" />
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-200 text-gray-900"
                            required
                        />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            <FaEnvelope className="inline mr-2 text-blue-600" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg bg-gray-100 dark:bg-gray-300 text-gray-900 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Email không thể thay đổi
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <FaSave size={20} />
                        {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                    </button>
                </form>
            </div>

            {/* Đổi mật khẩu */}
            <div className="bg-white dark:bg-[var(--card)] rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <FaLock className="text-red-600" />
                    Đổi mật khẩu
                </h2>

                <form onSubmit={handleChangePassword} className="space-y-6">
                    {/* Mật khẩu hiện tại */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Mật khẩu hiện tại
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-200 text-gray-900 pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showCurrentPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Mật khẩu mới */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-200 text-gray-900 pr-12"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Xác nhận mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-200 text-gray-900 pr-12"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <FaLock size={20} />
                        {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
}