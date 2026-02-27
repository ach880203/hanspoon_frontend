import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Home.css';
import './WelcomeModal.css';

function Home() {
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (location.state?.showWelcomeModal) {
            setShowModal(true);
            // 상태 초기화 (새로고침 시 다시 뜨지 않게)
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    return (
        <div className="home">
            {showModal && (
                <div className="welcome-modal-overlay">
                    <div className="welcome-modal">
                        <div className="welcome-icon">🥄</div>
                        <h2>가입을 축하드려요!</h2>
                        <p>반가워요! 신규 가입 선물로<br /><strong>3,000 스푼</strong>이 지급되었습니다.</p>
                        <p className="sub-text">지금 바로 원데이 클래스 예약에 사용해 보세요!</p>
                        <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                            반가워요!
                        </button>
                    </div>
                </div>
            )}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            한국의 맛을 배우는 즐거움
                            <br />
                            <span className="highlight">한스푼</span>과 함께하세요
                        </h1>
                        <p className="hero-description">
                            전통 한식부터 현대적인 퓨전 요리까지,
                            <br />
                            최고의 셰프들과 함께하는 원데이 클래스
                        </p>
                        <div className="hero-buttons">
                            <Link to="/register" className="btn btn-primary btn-large">
                                시작하기
                            </Link>
                            <Link to="/notice" className="btn btn-outline btn-large">
                                더 알아보기
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <h2 className="section-title">왜 한스푼인가요?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">👨‍🍳</div>
                            <h3>전문 셰프</h3>
                            <p>경력 10년 이상의 전문 셰프들이 직접 가르쳐드립니다</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🍳</div>
                            <h3>실습 중심</h3>
                            <p>이론보다는 직접 만들어보는 실습 위주의 수업</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💳</div>
                            <h3>간편 결제</h3>
                            <p>카카오페이, 포트원 등 다양한 결제 수단 지원</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>지금 바로 시작하세요!</h2>
                        <p>회원가입하고 첫 수업 10% 할인 받으세요</p>
                        <Link to="/register" className="btn btn-primary btn-large">
                            무료 회원가입
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
