import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { formatPhoneNumber } from '../../utils/format';
import './Auth.css';

const FindPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [tempPassword, setTempPassword] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setTempPassword(null);

        try {
            const result = await authApi.resetPassword({ email, userName, phone });
            if (result.success) {
                setTempPassword(result.data);
            } else {
                setError(result.message || '입력한 정보가 일치하지 않습니다.');
            }
        } catch (err) {
            setError(err.response?.data?.message || '정보를 확인하는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">비밀번호 재설정</h1>
                <p className="auth-subtitle">가입 정보를 입력하면 임시 비밀번호를 발급해 드립니다.</p>

                {!tempPassword ? (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>이메일 주소</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일 주소를 입력해 주세요"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>이름</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="이름을 입력해 주세요"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>휴대폰 번호</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                                placeholder="예: 010-1234-5678"
                                required
                            />
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? '확인 중...' : '임시 비밀번호 발급'}
                        </button>
                    </form>
                ) : (
                    <div className="find-result">
                        <div className="result-box">
                            <p>임시 비밀번호가 발급되었습니다.</p>
                            <div className="found-value">{tempPassword}</div>
                            <p className="hint">로그인 후 반드시 비밀번호를 변경해 주세요.</p>
                        </div>
                        <Link to="/login" className="auth-button">로그인하기</Link>
                    </div>
                )}

                <div className="auth-links">
                    <Link to="/login">로그인으로 돌아가기</Link>
                    <span className="divider">|</span>
                    <Link to="/find-id">아이디 찾기</Link>
                </div>
            </div>
        </div>
    );
};

export default FindPasswordPage;
