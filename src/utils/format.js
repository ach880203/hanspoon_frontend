/**
 * 전화번호 자동 하이픈 생성 유틸리티
 * @param {string} value - 입력된 전화번호 문자열
 * @returns {string} 하이픈이 포함된 전화번호
 */
export const formatPhoneNumber = (value) => {
    if (!value) return "";

    // 숫자만 추출
    const nums = value.replace(/[^\d]/g, "");

    // 11자리 초과 방지
    const cleanNums = nums.slice(0, 11);

    if (cleanNums.length <= 3) {
        return cleanNums;
    } else if (cleanNums.length <= 7) {
        return `${cleanNums.slice(0, 3)}-${cleanNums.slice(3)}`;
    } else {
        return `${cleanNums.slice(0, 3)}-${cleanNums.slice(3, 7)}-${cleanNums.slice(7)}`;
    }
};
