import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './MyPageLayout.css';

const MyPageLayout = () => {
    const { user } = useAuth();
    const location = useLocation();

    // 사이드바 메뉴 항목 정의
    const menus = [
        { path: '/mypage/orders', label: '주문/배송' },
        { path: '/mypage/reservations', label: '클래스 예약' },
        { path: '/mypage/payments', label: '결제 내역' },
        { path: '/mypage/reviews', label: '나의 리뷰' }, // 경로 확인 필요 (App.jsx 참고)
        { path: '/mypage/inquiries', label: '문의 내역' },
        { path: '/mypage/wishlist', label: '관심 목록' },
        { path: '/mypage/profile', label: '정보 수정' },
    ];

    return (
        <div className="mypage-container">
            {/* Left Sidebar */}
            <aside className="mypage-sidebar">
                <div className="mypage-profile-summary">
                    <div className="profile-img">
                        {/* 임시 프로필 이미지 */}
                        <span style={{ fontSize: '32px' }}>👤</span>
                    </div>
                    <div className="profile-info">
                        <strong className="profile-name">{user?.userName || '사용자'}님</strong>
                        <span className="profile-email">{user?.email}</span>
                    </div>
                </div>

                <nav className="mypage-nav">
                    <ul>
                        {menus.map((menu) => (
                            <li key={menu.path}>
                                <NavLink
                                    to={menu.path}
                                    end={menu.exact}
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    {menu.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="mypage-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MyPageLayout;
