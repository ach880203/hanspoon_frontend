import axiosInstance from './axios';

/**
 * 공지사항 API
 */
export const noticeApi = {
    /**
     * 공지사항 목록 조회
     * @param {Object} params - { page, size }
     * @returns {Promise<Object>}
     */
    getNotices: async (params = { page: 0, size: 10 }) => {
        const response = await axiosInstance.get('/api/notice', { params });
        return response.data;
    },

    /**
     * 공지사항 상세 조회
     * @param {number} id - 공지사항 ID
     * @returns {Promise<Object>}
     */
    getNoticeById: async (id) => {
        const response = await axiosInstance.get(`/api/notice/${id}`);
        return response.data;
    }
};

/**
 * FAQ API
 */
export const faqApi = {
    /**
     * FAQ 목록 조회
     * @returns {Promise<Object>}
     */
    getFaqs: async () => {
        const response = await axiosInstance.get('/api/faq');
        return response.data;
    }
};

/**
 * 이벤트 API
 */
export const eventApi = {
    /**
     * 이벤트 목록 조회
     * @param {Object} params - { page, size, activeOnly }
     */
    getEvents: async (params = { page: 0, size: 10, activeOnly: false }) => {
        const response = await axiosInstance.get('/api/events', { params });
        return response.data;
    },

    /**
     * 이벤트 상세 조회
     * @param {number} id - 이벤트 ID
     */
    getEventById: async (id) => {
        const response = await axiosInstance.get(`/api/events/${id}`);
        return response.data;
    }
};

