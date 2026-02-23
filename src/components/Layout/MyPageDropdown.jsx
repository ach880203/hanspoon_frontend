import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mypageApi } from '../../api/mypage';
import './MyPageDropdown.css';

const MyPageDropdown = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [summary, setSummary] = useState(null);
    const [couponCount, setCouponCount] = useState(null); // null = 로딩중
    const [statsLoading, setStatsLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            setStatsLoading(true);
            try {
                // summary와 쿠폰 목록을 병렬 호출
                const [summaryRes, couponRes] = await Promise.allSettled([
                    mypageApi.getSummary(),
                    mypageApi.getMyCoupons(),
                ]);

                // 포인트/기본정보 처리
                if (summaryRes.status === 'fulfilled' && summaryRes.value?.success) {
                    setSummary(summaryRes.value.data);
                }

                // 사용 가능한 쿠폰 수 처리
                if (couponRes.status === 'fulfilled' && couponRes.value?.success) {
                    const coupons = couponRes.value.data ?? [];
                    setCouponCount(coupons.filter(c => c.usable).length);
                } else {
                    setCouponCount(0);
                }
            } catch (error) {
                console.error('Failed to fetch mypage stats:', error);
                setCouponCount(0);
            } finally {
                setStatsLoading(false);
            }
        };

        if (isOpen) {
            fetchStats();
        }
    }, [user, isOpen]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    const toggleDropdown = () => setIsOpen(!isOpen);

    const menuItems = [
        { label: '주문/배송 조회', to: '/mypage/orders' },
        { label: '클래스 예약', to: '/mypage/reservations' },
        { label: '결제 내역', to: '/mypage/payments' },
        { label: '나의 리뷰', to: '/mypage/reviews' },
        { label: '문의 내역', to: '/mypage/inquiries' },
        { label: '관심 목록', to: '/mypage/wishlist' },
        { label: '정보 수정', to: '/mypage/profile' },
    ];

    return (
        <div className="mypage-dropdown-container" ref={dropdownRef}>
            <button className="mypage-trigger" onClick={toggleDropdown}>
                <span className="user-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </span>
                <span className="trigger-text">마이페이지</span>
            </button>

            {isOpen && (
                <div className="mypage-dropdown-menu">
                    <div className="dropdown-header">
                        <div className="user-profile">
                            <div className="profile-img">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <div className="user-info">
                                <div className="user-name">{user?.userName || '사용자'}{summary?.userId ? `${summary.userId}` : ''}</div>
                                <div className="user-handle">{summary?.email || user?.email}</div>
                            </div>
                        </div>
                    </div>

                    <div className="dropdown-stats">
                        <Link to="/mypage/points" className="stat-item" onClick={() => setIsOpen(false)}>
                            <div className="stat-icon p-icon">P</div>
                            <div className="stat-label">스푼 포인트</div>
                            <div className="stat-value">
                                {statsLoading
                                    ? '...'
                                    : (summary?.spoonBalance ?? 0).toLocaleString()}
                            </div>
                        </Link>
                        <div className="stat-divider"></div>
                        <Link to="/classes/oneday/coupons" className="stat-item" onClick={() => setIsOpen(false)}>
                            <div className="stat-icon c-icon">%</div>
                            <div className="stat-label">쿠폰</div>
                            <div className="stat-value">
                                {statsLoading
                                    ? '...'
                                    : couponCount ?? 0}
                            </div>
                        </Link>
                    </div>

                    <ul className="dropdown-links">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <Link to={item.to} onClick={() => setIsOpen(false)}>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="dropdown-footer">
                        <button className="logout-btn" onClick={handleLogout}>
                            로그아웃
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPageDropdown;
