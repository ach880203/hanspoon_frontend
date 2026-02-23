import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import { getBackendBaseUrl } from '../../utils/backendUrl';
import './Auth.css';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
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

        // 비밀번호 확인
        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 비밀번호 길이 확인
        if (formData.password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        setLoading(true);

        try {
            const registerData = {
                email: formData.email,
                password: formData.password,
                passwordConfirm: formData.confirmPassword,
                userName: formData.name
            };
            const result = await authApi.register(registerData);

            if (result.success) {
                alert('회원가입이 완료되었습니다! 로그인해주세요.');
                navigate('/login');
            } else {
                setError(result.message || '회원가입에 실패했습니다.');
            }
        } catch (err) {
            setError(err.message || '회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthRegister = (provider) => {
        const backendUrl = getBackendBaseUrl('http://localhost:8080');
        window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-container">
                    <div className="auth-card">
                        <h1 className="auth-title">회원가입</h1>
                        <p className="auth-subtitle">한스푼과 함께 요리를 시작하세요</p>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">이름</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="홍길동"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">이메일</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="example@email.com"
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
                                    placeholder="최소 6자 이상"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">비밀번호 확인</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="비밀번호를 다시 입력하세요"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={loading}
                            >
                                {loading ? '가입 중...' : '회원가입'}
                            </button>
                        </form>

                        <div className="divider">
                            <span>또는</span>
                        </div>

                        <div className="oauth-buttons">
                            <button
                                onClick={() => handleOAuthRegister('google')}
                                className="btn-oauth btn-google"
                            >
                                <span className="oauth-icon">G</span>
                                Google로 가입
                            </button>
                            <button
                                onClick={() => handleOAuthRegister('kakao')}
                                className="btn-oauth btn-kakao"
                            >
                                <span className="oauth-icon">K</span>
                                Kakao로 가입
                            </button>
                        </div>

                        <div className="auth-footer">
                            <p>
                                이미 계정이 있으신가요?{' '}
                                <Link to="/login" className="auth-link">
                                    로그인
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
