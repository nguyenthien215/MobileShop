import axiosInstance from './axiosConfig';

export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        axiosInstance.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        axiosInstance.post('/auth/login', data),

    logout: () => localStorage.removeItem('token'),
};