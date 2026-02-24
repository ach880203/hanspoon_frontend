import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const response = await adminApi.getDashboardSummary();
            // ApiResponse { data: AdminDashboardSummaryDto }
            if (response && response.data) {
                setSummary(response.data);
            }
        } catch (error) {
            console.error('대시보드 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-5">불러오는 중...</div>;
    if (!summary) return <div className="p-5">데이터를 불러올 수 없습니다.</div>;

    const { sales, orders, reservations, cs } = summary;

    return (
        <div className="admin-dashboard-container">
            <div className="dashboard-header">
                <h2>관리자 대시보드</h2>
                <p className="text-muted">오늘의 운영 현황을 한눈에 확인하세요.</p>
            </div>

            {/* 주요 지표 4개 */}
            <div className="dashboard-grid">
                <DashboardCard
                    title="오늘 매출"
                    value={`${sales.todaySales.toLocaleString()}원`}
                    meta={`어제 ${sales.yesterdaySales.toLocaleString()}원`}
                />
                <DashboardCard
                    title="미처리 환불"
                    value={`${orders.refundRequested}건`}
                    isAlert={orders.refundRequested > 0}
                    meta="즉시 처리가 필요합니다"
                />
                <DashboardCard
                    title="배송 준비"
                    value={`${orders.paymentCompleted}건`}
                    meta={`배송중 ${orders.shipping}건`}
                />
                <DashboardCard
                    title="오늘 클래스 예약"
                    value={`${reservations.todayCount}건`}
                    meta={`취소/환불 대기 ${reservations.pendingCancel}건 / 전체 취소 ${reservations.totalCanceled}건`}
                />
            </div>

            <div className="status-grid">
                {/* 주문 처리 현황 */}
                <div className="status-section">
                    <h3 className="section-title">주문 관리</h3>
                    <div className="status-list">
                        <StatusItem label="결제 완료 (배송준비)" count={orders.paymentCompleted} isWarn={orders.paymentCompleted > 5} />
                        <StatusItem label="상품 준비중" count={orders.preparing} isActive />
                        <StatusItem label="배송중" count={orders.shipping} />
                        <StatusItem label="환불 요청" count={orders.refundRequested} isWarn={orders.refundRequested > 0} />
                    </div>
                </div>

                {/* 고객 문의 및 회원 현황 */}
                <div className="status-section">
                    <h3 className="section-title">고객 지원 및 회원</h3>
                    <div className="status-list">
                        <StatusItem label="미답변 문의" count={cs.unreadInquiries} isWarn={cs.unreadInquiries > 0} />
                        <StatusItem label="오늘 신규 가입" count={cs.newUsersToday} isActive />
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardCard = ({ title, value, meta, isAlert }) => (
    <div className="dashboard-card" style={{ borderLeft: isAlert ? '4px solid #ef4444' : '4px solid #3b82f6' }}>
        <div>
            <div className="card-title">{title}</div>
            <div className="card-value" style={{ color: isAlert ? '#ef4444' : '#0f172a' }}>{value}</div>
        </div>
        <div className={`card-meta ${isAlert ? 'alert' : ''}`}>{meta}</div>
    </div>
);

const StatusItem = ({ label, count, isActive, isWarn }) => (
    <div className="status-item">
        <span className="status-label">{label}</span>
        <span className={`status-count ${isActive ? 'active' : ''} ${isWarn ? 'warn' : ''}`}>
            {count}건
        </span>
    </div>
);

export default AdminDashboardPage;
