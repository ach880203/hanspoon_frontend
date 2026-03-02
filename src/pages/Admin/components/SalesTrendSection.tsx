import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../api/adminApi';
import SalesLineChart from './SalesLineChart';

interface SalesTrendItem {
    date: string;
    sales: number;
}

interface SalesTrendData {
    trend: SalesTrendItem[];
    totalSales: number;
    growthRate: number;
}

const SalesTrendSection: React.FC = () => {
    const navigate = useNavigate();
    const [days, setDays] = useState<number>(7);
    const [data, setData] = useState<SalesTrendData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchTrendData();
    }, [days]);

    const fetchTrendData = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getSalesTrend(days);
            if (response && response.data) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch sales trend:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="status-section" style={{ marginTop: '24px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h3 className="section-title" style={{ margin: 0 }}>최근 매출 추이</h3>
                    {data && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>
                                전일 대비
                            </span>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: data.growthRate >= 0 ? '#ef4444' : '#3b82f6'
                            }}>
                                {data.growthRate >= 0 ? '▲' : '▼'} {Math.abs(data.growthRate)}%
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/sales')}
                        style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#3b82f6',
                            background: 'transparent',
                            border: '1px solid #3b82f6',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        자세히 보기
                    </button>
                    <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                        {[7, 30, 90].map((period) => (
                            <button
                                key={period}
                                onClick={() => setDays(period)}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    backgroundColor: days === period ? '#fff' : 'transparent',
                                    color: days === period ? '#0f172a' : '#64748b',
                                    boxShadow: days === period ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {period}일
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                minHeight: '340px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>차트 데이터 불러오는 중...</div>
                ) : data && data.trend.length > 0 ? (
                    <SalesLineChart data={data.trend} />
                ) : (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>표시할 매출 데이터가 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default SalesTrendSection;
