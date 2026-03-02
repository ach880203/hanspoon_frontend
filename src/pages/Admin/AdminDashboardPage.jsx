import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import './AdminDashboardPage.css';
import SalesTrendSection from './components/SalesTrendSection';

const DASHBOARD_CACHE_KEY_PREFIX = 'adminDashboardSummary';

function buildTodayCacheKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${DASHBOARD_CACHE_KEY_PREFIX}:${year}-${month}-${day}`;
}

function readDashboardCache() {
    try {
        const raw = window.localStorage.getItem(buildTodayCacheKey());
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

function writeDashboardCache(summary) {
    try {
        window.localStorage.setItem(buildTodayCacheKey(), JSON.stringify(summary));
    } catch {
        // localStorage를 사용할 수 없는 환경에서는 캐시를 건너뜁니다.
    }
}

const AdminDashboardPage = ({ onTabChange }) => {
    const [summary, setSummary] = useState(() => readDashboardCache());
    const [loading, setLoading] = useState(() => !readDashboardCache());

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const response = await adminApi.getDashboardSummary();
            // ApiResponse { data: AdminDashboardSummaryDto }
            if (response && response.data) {
                setSummary(response.data);
                writeDashboardCache(response.data);
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
                    onTabChange={onTabChange}
                />
                <DashboardCard
                    title="미처리 환불"
                    value={`${orders.refundRequested}건`}
                    isAlert={orders.refundRequested > 0}
                    meta="즉시 처리가 필요합니다"
                    tabKey="payments"
                    onTabChange={onTabChange}
                />
                <DashboardCard
                    title="배송 준비"
                    value={`${orders.paymentCompleted}건`}
                    meta={`배송중 ${orders.shipping}건`}
                    tabKey="market"
                    onTabChange={onTabChange}
                />
                <DashboardCard
                    title="오늘 클래스 예약"
                    value={`${reservations.todayCount}건`}
                    meta={`취소/환불 대기 ${reservations.pendingCancel}건 / 전체 취소 ${reservations.totalCanceled}건`}
                    tabKey="reservations"
                    onTabChange={onTabChange}
                />
            </div>

            {/* 매출 추이 그래프 세션 */}
            <SalesTrendSection />

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

const DashboardCard = ({ title, value, meta, isAlert, tabKey, onTabChange }) => (
    <div
        className="dashboard-card"
        style={{
            borderLeft: isAlert ? '4px solid #ef4444' : '4px solid #3b82f6',
            cursor: tabKey && onTabChange ? 'pointer' : 'default',
        }}
        onClick={() => tabKey && onTabChange && onTabChange(tabKey)}
    >
        <div>
            <div className="card-title">{title}</div>
            <div className="card-value" style={{ color: isAlert ? '#ef4444' : '#0f172a' }}>{value}</div>
        </div>
        <div className={`card-meta ${isAlert ? 'alert' : ''}`}>{meta}</div>
        {tabKey && onTabChange && <div style={{ marginTop: 8, fontSize: 12, color: '#3b82f6' }}>바로가기 →</div>}
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
