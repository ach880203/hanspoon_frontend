import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mypageApi } from '../../api/mypage';
import './DashboardPage.css';

const DashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await mypageApi.getSummary();
                // ApiResponse { status, message, data }
                if (response && response.data) {
                    setSummary(response.data);
                }
            } catch (error) {
                console.error("대시보드 초기화 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) return <div className="dashboard-loading">로딩 중...</div>;

    if (!summary) return <div className="dashboard-error">데이터를 불러올 수 없습니다.</div>;

    return (
        <div className="dashboard-container">
            <h2 className="page-title">반가워요, {summary.userName}님!</h2>

            <div className="dashboard-stats">
                <div className="stat-card point">
                    <div className="label">내 스푼</div>
                    <div className="value">{summary.spoonBalance.toLocaleString()}</div>
                    <Link to="/mypage/points" className="link">내역 보기 &gt;</Link>
                </div>
                <div className="stat-card order">
                    <div className="label">진행 중인 주문</div>
                    <div className="value">{summary.activeOrderCount} <span className="unit">건</span></div>
                    <Link to="/mypage/orders" className="link">주문 배송 조회 &gt;</Link>
                </div>
                <div className="stat-card class">
                    <div className="label">참여 예정 클래스</div>
                    <div className="value">{summary.upcomingClassCount} <span className="unit">개</span></div>
                    <Link to="/mypage/reservations" className="link">예약 확인 &gt;</Link>
                </div>
                <div className="stat-card coupon">
                    <div className="label">읽지 않은 알림</div>
                    <div className="value">{summary.unreadNotificationCount || 0} <span className="unit">건</span></div>
                    {/* 알림 페이지는 추후 구현 */}
                    <span className="link">알림함 확인 &gt;</span>
                </div>
            </div>

            {/* 최근 주문 등 추가 섹션 (Placeholder) */}
            <div className="recent-section">
                <h3>최근 주문 내역</h3>
                <div className="empty-placeholder">
                    최근 주문 내역 컴포넌트가 여기에 들어갑니다.
                    <br />
                    <Link to="/mypage/orders" className="btn-outline">전체 주문 보기</Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
