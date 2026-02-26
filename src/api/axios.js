import axios from 'axios';
import { getAccessToken, clearAuth } from '../utils/authStorage';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error?.config;

    if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') {
      return Promise.reject({
        ...error,
        name: 'AbortError',
        code: 'ERR_CANCELED',
        message: 'Request canceled',
      });
    }

    if (error.response?.status === 401) {
      clearAuth();

      // If a stale token caused 401 on a public endpoint, retry once without auth.
      if (originalRequest && !originalRequest._retryNoAuth) {
        originalRequest._retryNoAuth = true;
        if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
        }
        return axiosInstance(originalRequest);
      }
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      '요청 처리 중 오류가 발생했습니다.';

    return Promise.reject({
      ...error,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
      code: error?.code,
      name: error?.name,
    });
  }
);

export default axiosInstance;
