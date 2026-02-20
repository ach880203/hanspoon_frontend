
import axiosInstance from './axios';

export const adminApi = {
    // Notice
    getNotices: async (params) => {
        const response = await axiosInstance.get('/api/admin/notice/list', { params });
        return response.data;
    },
    getNotice: async (id) => {
        const response = await axiosInstance.get(`/api/admin/notice/${id}`);
        return response.data;
    },
    createNotice: async (data) => {
        const response = await axiosInstance.post('/api/admin/notice', data);
        return response.data;
    },
    updateNotice: async (id, data) => {
        const response = await axiosInstance.put(`/api/admin/notice/${id}`, data);
        return response.data;
    },
    deleteNotice: async (id) => {
        await axiosInstance.delete(`/api/admin/notice/${id}`);
    },

    // FAQ
    getFaqs: async (params) => {
        const response = await axiosInstance.get('/api/admin/faq/list', { params });
        return response.data;
    },
    getFaq: async (id) => {
        const response = await axiosInstance.get(`/api/admin/faq/${id}`);
        return response.data;
    },
    createFaq: async (data) => {
        const response = await axiosInstance.post('/api/admin/faq', data);
        return response.data;
    },
    updateFaq: async (id, data) => {
        const response = await axiosInstance.put(`/api/admin/faq/${id}`, data);
        return response.data;
    },
    deleteFaq: async (id) => {
        await axiosInstance.delete(`/api/admin/faq/${id}`);
    },

    // Users
    getDashboardSummary: async () => {
        const response = await axiosInstance.get('/api/admin/dashboard/summary');
        return response.data;
    },

    getUsers: async (params) => {
        const response = await axiosInstance.get('/api/admin/users/list', { params });
        return response.data;
    },
    getUserDetail: async (userId) => {
        const response = await axiosInstance.get(`/api/admin/users/${userId}`);
        return response.data;
    },
    updateUserStatus: async (userId, status) => {
        const response = await axiosInstance.post(`/api/admin/users/${userId}/status`, null, {
            params: { status }
        });
        return response.data;
    },
    getUserHistory: async (userId) => {
        const response = await axiosInstance.get(`/api/admin/users/${userId}/history`);
        return response.data;
    },

    // Payments
    getAllPayments: async (params) => {
        const response = await axiosInstance.get('/api/admin/payments/list', { params });
        return response.data;
    },
    cancelPayment: async (id) => {
        const response = await axiosInstance.post(`/api/admin/payments/${id}/cancel`);
        return response.data;
    },

    // Reservations - Cancel Requests
    getCancelRequests: async () => {
        const response = await axiosInstance.get('/api/admin/reservations/cancel-requests');
        return response.data;
    },
    getReservations: async (status) => {
        const params = status && status !== 'ALL' ? { status } : {};
        const response = await axiosInstance.get('/api/admin/reservations', { params });
        return response.data;
    },
    approveCancelRequest: async (id) => {
        const response = await axiosInstance.post(`/api/admin/reservations/${id}/approve-cancel`);
        return response.data;
    },
    rejectCancelRequest: async (id) => {
        const response = await axiosInstance.post(`/api/admin/reservations/${id}/reject-cancel`);
        return response.data;
    }
};
