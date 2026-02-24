import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import { getBackendBaseUrl } from '../../utils/backendUrl';
import './Auth.css';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authApi.login(formData);

            if (result.success) {
                alert('로그인 성공!');
                navigate('/');
                window.location.reload();
            } else {
                setError(result.message || '로그인에 실패했습니다.');
            }
        } catch (err) {
            setError(err.message || '로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = (provider) => {
        const backendUrl = getBackendBaseUrl('http://localhost:8080');
        window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-container">
                    <div className="auth-card">
                        <h1 className="auth-title">로그인</h1>
                        <p className="auth-subtitle">한스푼에 오신 것을 환영합니다.</p>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">이메일</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="이메일 주소를 입력해 주세요"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">비밀번호</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="비밀번호를 입력해 주세요"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={loading}
                            >
                                {loading ? '로그인 중...' : '로그인'}
                            </button>
                        </form>

                        <div className="divider">
                            <span>또는</span>
                        </div>

                        <div className="oauth-buttons">
                            <button
                                onClick={() => handleOAuthLogin('google')}
                                className="btn-oauth btn-google"
                            >
                                <span className="oauth-icon">구</span>
                                구글로 로그인
                            </button>
                            <button
                                onClick={() => handleOAuthLogin('kakao')}
                                className="btn-oauth btn-kakao"
                            >
                                <span className="oauth-icon">카</span>
                                카카오로 로그인
                            </button>
                        </div>

                        <div className="auth-footer">
                            <p>
                                계정이 없으신가요?{' '}
                                <Link to="/register" className="auth-link">
                                    회원가입
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
