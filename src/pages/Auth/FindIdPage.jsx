import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { formatPhoneNumber } from '../../utils/format';
import './Auth.css';

const FindIdPage = () => {
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [foundEmail, setFoundEmail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setFoundEmail(null);

        try {
            const result = await authApi.findId({ userName, phone });
            if (result.success) {
                setFoundEmail(result.data);
            } else {
                setError(result.message || '아이디를 찾을 수 없습니다.');
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
                <h1 className="auth-title">Find ID</h1>
                <p className="auth-subtitle">가입 시 등록한 이름과 휴대폰 번호를 입력해 주세요.</p>

                {!foundEmail ? (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>이름</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="이름을 입력하세요"
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

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? '찾는 중...' : '아이디 찾기'}
                        </button>
                    </form>
                ) : (
                    <div className="find-result">
                        <div className="result-box">
                            <p>회원님의 아이디는 아래와 같습니다.</p>
                            <div className="found-value">{foundEmail}</div>
                        </div>
                        <Link to="/login" className="auth-button">로그인하기</Link>
                    </div>
                )}

                <div className="auth-links">
                    <Link to="/login">로그인으로 돌아가기</Link>
                    <span className="divider">|</span>
                    <Link to="/find-password">비밀번호 찾기</Link>
                </div>
            </div>
        </div>
    );
};

export default FindIdPage;
