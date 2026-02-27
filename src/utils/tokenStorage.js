/**
 * JWT 토큰과 사용자 정보를 localStorage에 저장/조회/삭제하는 유틸리티입니다.
 */

const TOKEN_KEY = 'hanspoon_token';
const USER_KEY = 'hanspoon_user';

export const tokenStorage = {
    /**
     * 토큰 저장
     * @param {string} token - JWT 토큰
     */
    setToken: (token) => {
        localStorage.setItem(TOKEN_KEY, token);
    },

    /**
     * 토큰 조회
     * @returns {string|null} JWT 토큰 또는 null
     */
    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * 토큰 삭제 (로그아웃 시 호출)
     */
    removeToken: () => {
        localStorage.removeItem(TOKEN_KEY);
    },

    /**
     * 토큰 존재 여부 확인
     * @returns {boolean}
     */
    hasToken: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    /**
     * 사용자 정보 저장
     * @param {Object} user - 사용자 객체
     */
    setUser: (user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    /**
     * 사용자 정보 조회
     * @returns {Object|null}
     */
    getUser: () => {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * 사용자 정보 삭제
     */
    removeUser: () => {
        localStorage.removeItem(USER_KEY);
    },

    /**
     * 관리자 여부 확인
     * @returns {boolean}
     */
    isAdmin: () => {
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) return false;
        try {
            const user = JSON.parse(userStr);
            // 로그인 응답 role이 문자열 배열 형태("[ROLE_USER, ROLE_ADMIN]")로 올 수 있어 includes로 확인합니다.
            return user.role && user.role.includes('ROLE_ADMIN');
        } catch {
            return false;
        }
    }
};
