import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../api/user';
import { formatPhoneNumber } from '../../utils/format';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        userName: '',
        phone: '',
        address: '',
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                userName: user.userName || '',
                phone: user.phone || '',
                address: user.address || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'phone') {
            newValue = formatPhoneNumber(value);
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (formData.newPassword && formData.newPassword !== formData.newPasswordConfirm) {
            setError('새 비밀번호가 일치하지 않습니다.');
            setLoading(false);
            return;
        }

        try {
            const response = await userApi.updateProfile(formData);
            if (response.status === 'success') {
                setMessage('회원 정보가 수정되었습니다.');
                // Update local auth context if needed (though backend response has updated user)
                // Assuming login() or similar can update user state without token change?
                // Probably need a 'refreshUser' in AuthContext, but re-login might be overkill.
                // For now, let's explicitely update if AuthContext supports it, or just rely on next fetch.
                // Actually, login() usually takes (user, token). We can try to re-set it if we have the token stored.
                // But safer to just show success message.

                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    newPasswordConfirm: ''
                }));
            } else {
                setError(response.message || '정보 수정에 실패했습니다.');
            }
        } catch (err) {
            setError(err.response?.data?.message || '서버 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <h2 className="page-title">내 정보 수정</h2>

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-section">
                    <h3>기본 정보</h3>
                    <div className="form-group">
                        <label>이메일</label>
                        <input type="email" value={user?.email || ''} disabled className="readonly-input" />
                    </div>
                    <div className="form-group">
                        <label>이름</label>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            placeholder="이름을 입력하세요"
                        />
                    </div>
                    <div className="form-group">
                        <label>전화번호</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="전화번호를 입력하세요"
                        />
                    </div>
                    <div className="form-group">
                        <label>주소</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="주소를 입력하세요 (상세주소 포함)"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>비밀번호 변경</h3>
                    <p className="section-desc">비밀번호를 변경하려면 아래 정보를 입력하세요. (변경하지 않으려면 비워두세요)</p>

                    <div className="form-group">
                        <label>현재 비밀번호</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="변경 시 필수 입력"
                        />
                    </div>
                    <div className="form-group">
                        <label>새 비밀번호</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="새 비밀번호"
                        />
                    </div>
                    <div className="form-group">
                        <label>새 비밀번호 확인</label>
                        <input
                            type="password"
                            name="newPasswordConfirm"
                            value={formData.newPasswordConfirm}
                            onChange={handleChange}
                            placeholder="새 비밀번호 확인"
                        />
                    </div>
                </div>

                {message && <div className="success-msg">{message}</div>}
                {error && <div className="error-msg">{error}</div>}

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? '저장 중...' : '정보 수정 저장'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;
