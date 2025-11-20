import axiosInstance from './axiosConfig';

export const userApi = {
    // Lấy thông tin tài khoản
    getProfile: () => axiosInstance.get('/user/profile'),

    // Cập nhật tên
    updateProfile: (data: { name: string }) =>
        axiosInstance.put('/user/profile', data),

    // Đổi mật khẩu
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        axiosInstance.put('/user/change-password', data),

    // Upload avatar
    uploadAvatar: (formData: FormData) =>
        axiosInstance.post('/user/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
};
