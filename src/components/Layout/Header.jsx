import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isAuthenticated = !!user;
    const isAdmin = user?.role?.includes('ROLE_ADMIN');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        HanSpoon
                    </Link>

                    <nav className="nav">
                        <Link to="/" className="nav-link">홈</Link>
                        <Link to="/notice" className="nav-link">공지사항</Link>
                        <Link to="/faq" className="nav-link">FAQ</Link>
                        <Link to="/payment" className="nav-link">결제</Link>
                    </nav>

                    <div className="auth-buttons">
                        {isAuthenticated ? (
                            <>
                                <button onClick={handleLogout} className="btn btn-outline">
                                    로그아웃
                                </button>
                                {isAdmin && (
                                    <Link to="/admin" className="btn btn-secondary ms-2">
                                        관리자
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary">
                                    로그인
                                </Link>
                                <Link to="/register" className="btn btn-primary">
                                    회원가입
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
