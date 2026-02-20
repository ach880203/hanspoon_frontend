import axiosInstance from './axios';

export const mypageApi = {
    // 대시보드 요약 정보
    getSummary: async () => {
        const response = await axiosInstance.get('/api/mypage/summary');
        // ApiResponse 구조 { status, message, data } 처리
        return response.data;
    },

    // 포인트 이력 (추후 구현)
    getPointHistories: async (params) => {
        const response = await axiosInstance.get('/api/mypage/points', { params });
        return response.data; // ApiResponse<PageResponse<PointHistoryDto>>
    },
};
