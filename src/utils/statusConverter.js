/**
 * 상태값(Enum)을 한글로 변환하는 유틸리티
 */

// 회원 상태 변환
export const translateUserStatus = (status) => {
    switch (status) {
        case 'ACTIVE': return '정상';
        case 'SUSPENDED': return '정지';
        case 'DELETED': return '탈퇴';
        default: return status || '-';
    }
};

// 결제 상태 변환
export const translatePaymentStatus = (status) => {
    switch (status) {
        case 'PENDING': return '결제대기';
        case 'PAID': return '결제완료';
        case 'CANCELLED': return '결제취소';
        case 'FAILED': return '결제실패';
        case 'REFUNDED': return '환불완료';
        case 'READY': return '결제준비';
        default: return status || '-';
    }
};

// 주문 상태 변환
export const translateOrderStatus = (status) => {
    switch (status) {
        case 'CREATED': return '주문생성';
        case 'PAID': return '결제완료';
        case 'SHIPPED': return '배송중';
        case 'DELIVERED': return '배송완료';
        case 'CONFIRMED': return '구매확정';
        case 'CANCELED': return '주문취소';
        case 'REFUNDED': return '환불완료';
        default: return status || '-';
    }
};

// 예약 상태 변환
export const translateReservationStatus = (status) => {
    switch (status) {
        case 'HOLD': return '예약대기';
        case 'PAID': return '예약확정';
        case 'CANCELED': return '예약취소';
        case 'EXPIRED': return '기간만료';
        case 'COMPLETED': return '이용완료';
        default: return status || '-';
    }
};
