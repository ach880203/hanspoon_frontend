import axiosInstance from './axios';

export const userApi = {
    // 회원정보 수정
    updateProfile: async (data) => {
        // data: { userName, phone, address, currentPassword, newPassword, newPasswordConfirm }
        const response = await axiosInstance.patch('/api/users/me', data);
        return response.data; // ApiResponse<User>
    },
};
