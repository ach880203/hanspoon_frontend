import axiosInstance from './axios';

export const mypageApi = {
    // 대시보드 요약 정보
    getSummary: async () => {
        const response = await axiosInstance.get('/api/mypage/summary');
        // ApiResponse 구조 { status, message, data } 처리
        return response.data;
    },

    // 포인트 이력
    getPointHistories: async (params) => {
        const response = await axiosInstance.get('/api/mypage/points', { params });
        return response.data; // ApiResponse<PageResponse<PointHistoryDto>>
    },

    // 내 쿠폰 목록 (usable 쿠폰 수 표시용)
    getMyCoupons: async () => {
        const response = await axiosInstance.get('/api/oneday/coupons/me');
        return response.data; // ApiResponse<List<ClassUserCouponResponse>>
    },
};

