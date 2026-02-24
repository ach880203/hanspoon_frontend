import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MyPageDropdown from './MyPageDropdown';
import './Header.css';

function Header() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const isAdmin = user?.role?.includes('ROLE_ADMIN');

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            한스푼
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">홈</Link>
            <Link to="/notice" className="nav-link">공지사항</Link>
            <Link to="/faq" className="nav-link">자주 묻는 질문</Link>
            <Link to="/payment" className="nav-link">결제</Link>
          </nav>

          <div className="header-actions">
            <div className="utility-icons">
              <button className="icon-btn search-btn" aria-label="검색">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
              <Link to="/cart" className="icon-btn cart-btn" aria-label="장바구니">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </Link>
            </div>

            <div className="auth-buttons">
              {isAuthenticated ? (
                <>
                  <MyPageDropdown />
                  {isAdmin && (
                    <Link to="/admin" className="btn btn-secondary ms-2 admin-badge">
                      관리자
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-secondary">
                    로그인
                  </Link>
                  <Link to="/signup" className="btn btn-primary">
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
