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

    getDashboardSummary: async () => {
        const response = await axiosInstance.get('/api/admin/dashboard/summary');
        return response.data;
    },

    getSalesTrend: async (days = 7) => {
        const response = await axiosInstance.get('/api/admin/dashboard/sales-trend', { params: { days } });
        return response.data;
    },

    getSalesStatistics: async () => {
        const response = await axiosInstance.get('/api/admin/dashboard/sales/statistics');
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
    },

    // Inquiries (Shop Products)
    getProductInquiriesAdmin: async (page = 0, size = 10) => {
        const response = await axiosInstance.get('/api/admin/inquiries', {
            params: { page, size }
        });
        return response.data;
    },
    // OneDay Instructors
    getOneDayInstructors: async () => {
        const response = await axiosInstance.get('/api/admin/oneday/instructors');
        return response.data;
    },
    getInstructorCandidateUsers: async (keyword) => {
        const params = keyword ? { keyword } : {};
        const response = await axiosInstance.get('/api/admin/oneday/instructors/candidate-users', { params });
        return response.data;
    },
    createOneDayInstructor: async (data) => {
        const response = await axiosInstance.post('/api/admin/oneday/instructors', data);
        return response.data;
    },
    updateOneDayInstructor: async (id, data) => {
        const response = await axiosInstance.put(`/api/admin/oneday/instructors/${id}`, data);
        return response.data;
    },
    deleteOneDayInstructor: async (id) => {
        const response = await axiosInstance.delete(`/api/admin/oneday/instructors/${id}`);
        return response.data;
    },

    // Events
    getEvents: async (params) => {
        const response = await axiosInstance.get('/api/admin/events/list', { params });
        return response.data;
    },
    getEvent: async (id) => {
        const response = await axiosInstance.get(`/api/admin/events/${id}`);
        return response.data;
    },
    createEvent: async (data) => {
        const response = await axiosInstance.post('/api/admin/events', data);
        return response.data;
    },
    updateEvent: async (id, data) => {
        const response = await axiosInstance.put(`/api/admin/events/${id}`, data);
        return response.data;
    },
    deleteEvent: async (id) => {
        await axiosInstance.delete(`/api/admin/events/${id}`);
    },

    // Banner
    getBanners: async () => {
        const response = await axiosInstance.get('/api/admin/banners/list');
        return response.data;
    },
    getBanner: async (id) => {
        const response = await axiosInstance.get(`/api/admin/banners/${id}`);
        return response.data;
    },
    createBanner: async (data) => {
        const response = await axiosInstance.post('/api/admin/banners', data);
        return response.data;
    },
    updateBanner: async (id, data) => {
        const response = await axiosInstance.put(`/api/admin/banners/${id}`, data);
        return response.data;
    },
    deleteBanner: async (id) => {
        const response = await axiosInstance.delete(`/api/admin/banners/${id}`);
        return response.data;
    },
    uploadBannerImage: async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        const response = await axiosInstance.post('/api/admin/banners/upload-image', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Orders
    getOrders: async (params) => {
        const response = await axiosInstance.get('/api/admin/orders/list', { params });
        return response.data;
    },
    getOrder: async (orderId) => {
        const response = await axiosInstance.get(`/api/admin/orders/${orderId}`);
        return response.data;
    },
    shipOrder: async (orderId, trackingNumber) => {
        const response = await axiosInstance.post(`/api/admin/orders/${orderId}/ship`, { trackingNumber });
        return response.data;
    },
    deliverOrder: async (orderId) => {
        const response = await axiosInstance.post(`/api/admin/orders/${orderId}/deliver`);
        return response.data;
    },
    confirmOrder: async (orderId) => {
        const response = await axiosInstance.post(`/api/admin/orders/${orderId}/confirm`);
        return response.data;
    }
};
