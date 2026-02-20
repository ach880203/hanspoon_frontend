import axiosInstance from './axios';
import { saveAuth, clearAuth, loadAuth, getAccessToken } from '../utils/authStorage';

/**
 * 인증 관련 API
 */
export const authApi = {
    /**
     * 로그인
     * @param {Object} credentials - { email, password }
     * @returns {Promise<Object>} { success, data: { token, user }, message }
     */
    login: async (credentials) => {
        try {
            const response = await axiosInstance.post('/api/auth/login', credentials);

            console.log('[AuthApi] Login response:', response.data);
            if (response.data.data?.accessToken) {
                console.log('[AuthApi] Token found, saving to storage');
                saveAuth({
                    accessToken: response.data.data.accessToken,
                    tokenType: response.data.data.tokenType || 'Bearer',
                    userId: response.data.data.userId,
                    email: response.data.data.email,
                    userName: response.data.data.userName,
                    role: response.data.data.role
                });
            } else {
                console.error('[AuthApi] Token NOT found in response data');
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * 회원가입
     * @param {Object} userData - { email, password, name, ... }
     * @returns {Promise<Object>}
     */
    register: async (userData) => {
        try {
            const response = await axiosInstance.post('/api/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * 로그아웃
     */
    logout: () => {
        clearAuth();
        // 필요시 서버에 로그아웃 요청
        // await axiosInstance.post('/api/auth/logout');
    },

    /**
     * 현재 사용자 정보 조회
     * @returns {Promise<Object>}
     */
    getCurrentUser: async () => {
        try {
            const response = await axiosInstance.get('/api/auth/me');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * 토큰 유효성 검증
     * @returns {boolean}
     */
    isAuthenticated: () => {
        return !!getAccessToken();
    },

    /**
     * 관리자 여부 확인
     * @returns {boolean}
     */
    isAdmin: () => {
        const auth = loadAuth();
        return auth?.role && auth.role.includes('ROLE_ADMIN');
    },

    /**
     * 아이디 찾기
     * @param {Object} data - { userName, phone }
     * @returns {Promise<Object>}
     */
    findId: async (data) => {
        try {
            const response = await axiosInstance.post('/api/auth/find-email', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * 비밀번호 재설정 (찾기)
     * @param {Object} data - { email, userName, phone }
     * @returns {Promise<Object>}
     */
    resetPassword: async (data) => {
        try {
            const response = await axiosInstance.post('/api/auth/reset-password', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
