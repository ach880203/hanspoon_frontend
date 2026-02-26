import axiosInstance from './axios';

async function unwrap(promise) {
    const res = await promise;
    const body = res.data;

    // ApiResponse 형식을 처리합니다 (success, message, data)
    if (body && typeof body === "object" && "success" in body) {
        if (!body.success) {
            throw new Error(body?.message || "요청 처리 중 오류가 발생했습니다.");
        }
        return body.data;
    }

    return body;
}

/**
 * 결제 API
 */
export const paymentApi = {
    /**
     * 결제 준비 (PortOne)
     * @param {Object} paymentData - { amount, itemName, buyerName, buyerEmail, ... }
     * @returns {Promise<Object>}
     */
    preparePayment: (paymentData) => unwrap(axiosInstance.post('/api/payment/prepare', paymentData)),

    /**
     * 결제 검증
     * @param {Object} verifyData - { impUid, merchantUid }
     * @returns {Promise<Object>}
     */
    verifyPayment: (verifyData) => unwrap(axiosInstance.post('/api/payment/verify', verifyData)),

    /**
     * 결제 내역 조회
     * @param {Object} params - { page, size, ... }
     * @returns {Promise<Object>}
     */
    // 결제 내역 조회: 서버가 `{ success, message, data }` 형태로 반환하되
    // `data`가 null일 수 있으므로 빈 페이지 구조로 안전하게 대체합니다.
    getPaymentHistory: (params) =>
        unwrap(axiosInstance.get('/api/payment/history', { params })).then((data) =>
            data ?? { content: [], totalPages: 0 }
        ),

    /**
     * 결제 상세 조회
     * @param {number|string} payId
     * @returns {Promise<Object>}
     */
    getPaymentDetail: (payId) => unwrap(axiosInstance.get(`/api/payment/${payId}`)),

    /**
     * 포트원 설정 정보 조회
     * @returns {Promise<Object>}
     */
    getPortOneConfig: () => unwrap(axiosInstance.get('/api/payment/config')),

    /**
     * 내 쿠폰 목록 조회
     * @returns {Promise<Array>}
     */
    getMyCoupons: () => unwrap(axiosInstance.get('/api/oneday/coupons/me')),

    /**
     * 내 포인트 잔액 조회
     * @returns {Promise<number>}
     */
    getPointBalance: () => unwrap(axiosInstance.get('/api/mypage/points/balance'))
};
