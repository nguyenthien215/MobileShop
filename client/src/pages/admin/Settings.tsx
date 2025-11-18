import { useEffect, useState } from 'react';

export default function Settings() {
    const [nickname, setNickname] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const nick = localStorage.getItem('adminNickname');
        const av = localStorage.getItem('adminAvatar');
        if (nick) setNickname(nick);
        if (av) {
            setAvatar(av);
            setPreview(av);
        }
    }, []);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setPreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const saveProfile = () => {
        if (nickname.trim().length === 0) {
            alert('Biệt danh không được rỗng');
            return;
        }
        if (preview) {
            localStorage.setItem('adminAvatar', preview);
            setAvatar(preview);
        }
        localStorage.setItem('adminNickname', nickname.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const resetProfile = () => {
        localStorage.removeItem('adminAvatar');
        localStorage.removeItem('adminNickname');
        setAvatar(null);
        setPreview(null);
        setNickname('admin');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade">
            <h1 className="text-2xl font-bold">Cài đặt Tài khoản Admin</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Thay đổi ảnh đại diện và biệt danh hiển thị bên cạnh chữ Admin(). Dữ liệu được lưu bằng localStorage — không cần database.
            </p>

            <div className="bg-white dark:bg-[var(--card)] rounded-xl shadow p-6 space-y-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center overflow-hidden shadow-inner">
                        {preview ? (
                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-green-700">A</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="block">
                            <span className="text-sm font-semibold mb-1 block">Chọn ảnh đại diện</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFile}
                                className="text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer"
                            />
                        </label>
                        <button
                            onClick={() => setPreview(null)}
                            disabled={!preview}
                            className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-40"
                        >
                            Xóa ảnh tạm
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-semibold block mb-1">Biệt danh hiển thị</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Thiện"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[var(--border)] bg-white dark:bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Chỉ phần bên trong ngoặc: Admin({nickname || '...'}).
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={saveProfile}
                        className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                    >
                        Lưu thay đổi
                    </button>
                    <button
                        onClick={resetProfile}
                        className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                    >
                        Đặt lại
                    </button>
                    {saved && (
                        <span className="text-sm text-green-600 flex items-center">
                            Đã lưu!
                        </span>
                    )}
                </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
                Ghi chú: Dữ liệu chỉ lưu cục bộ trên trình duyệt này. Muốn đồng bộ đa thiết bị hãy thêm API & bảng cấu hình sau.
            </div>
        </div>
    );
}