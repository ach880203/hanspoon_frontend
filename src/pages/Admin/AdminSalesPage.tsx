import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import SalesLineChart from './components/SalesLineChart';
import SalesPieChart from './components/SalesPieChart';

interface SalesTrendItem {
    date: string;
    sales: number;
}

interface CategoryRatio {
    category: string;
    value: number;
}

interface TopItem {
    name: string;
    sales: number;
    count: number;
}

interface SalesStatistics {
    categoryRatios: CategoryRatio[];
    topItems: TopItem[];
}

const AdminSalesPage: React.FC = () => {
    const [days, setDays] = useState<number>(30);
    const [trendData, setTrendData] = useState<SalesTrendItem[]>([]);
    const [statistics, setStatistics] = useState<SalesStatistics | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchData();
    }, [days]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [trendRes, statsRes] = await Promise.all([
                adminApi.getSalesTrend(days),
                adminApi.getSalesStatistics()
            ]);

            if (trendRes && trendRes.data) {
                setTrendData(trendRes.data.trend);
            }
            if (statsRes && statsRes.data) {
                setStatistics(statsRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch sales data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: 0 }}>매출 상세 분석</h1>
                <p style={{ color: '#64748b', marginTop: '8px' }}>서비스의 매출 추이와 인기 품목을 분석합니다.</p>
            </header>

            {/* 상단 매출 추이 섹션 */}
            <section style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>매출 트렌드</h2>
                    <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                        {[7, 30, 90].map((p) => (
                            <button
                                key={p}
                                onClick={() => setDays(p)}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    backgroundColor: days === p ? '#fff' : 'transparent',
                                    color: days === p ? '#01172a' : '#64748b',
                                    boxShadow: days === p ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none',
                                }}
                            >
                                {p}일
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                    {loading ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>데이터를 불러오고 있습니다...</div>
                    ) : (
                        <SalesLineChart data={trendData} />
                    )}
                </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* 카테고리별 비중 */}
                <section style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '20px' }}>카테고리별 매출 비중</h2>
                    {statistics ? (
                        <SalesPieChart data={statistics.categoryRatios} />
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>데이터가 없습니다.</div>
                    )}
                </section>

                {/* 인기 상품 TOP 5 */}
                <section style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '20px' }}>인기 품목 TOP 5</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {statistics && statistics.topItems.length > 0 ? (
                            statistics.topItems.map((item, index) => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: index === 0 ? '#fef3c7' : '#f1f5f9',
                                        color: index === 0 ? '#d97706' : '#64748b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '14px'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>주문 건수: {item.count}건</div>
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#3b82f6' }}>
                                        {/* sales가 0이면 표시하지 않거나 count만 표시 */}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>데이터가 없습니다.</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminSalesPage;
