import axiosInstance from './axiosConfig';

export const productApi = {
    getAll: (params?: { search?: string; category?: string; page?: number; limit?: number }) =>
        axiosInstance.get('/products', { params }),

    getById: (id: string) => axiosInstance.get(`/products/${id}`),

    getCategories: () => axiosInstance.get('/categories'),
};