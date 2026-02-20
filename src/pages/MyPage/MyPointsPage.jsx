import React, { useEffect, useState } from 'react';
import { http, toErrorMessage } from '../../api/http';
import { useAuth } from '../../contexts/AuthContext';
import './MyPointsPage.css';

const MyPointsPage = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);

    // 포인트 요약 정보 (UserContext 또는 별도 API로 가져옴)
    // 여기서는 UserContext의 spoonBalance 사용

    useEffect(() => {
        fetchPoints(page);
    }, [page]);

    const fetchPoints = async (pageIdx) => {
        setLoading(true);
        try {
            // PointController: GET /api/mypage/points?page=...
            const response = await http.get(`/api/mypage/points?page=${pageIdx}&size=10`);
            // 응답 구조: ApiResponse { data: PageResponse { content, totalPages, ... } }
            if (response.data && response.data.data) {
                const pageData = response.data.data;
                setHistory(pageData.content);
                setTotalPages(pageData.totalPages);
            }
        } catch (err) {
            setError(toErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const translateType = (type) => {
        switch (type) {
            case 'EARN_PURCHASE': return '구매 적립';
            case 'EARN_EVENT': return '이벤트 적립';
            case 'USE_PURCHASE': return '상품 구매 사용';
            case 'USE_CLASS': return '클래스 예약 사용';
            case 'REFUND': return '환불원복';
            case 'EXPIRE': return '유효기간 만료';
            default: return type;
        }
    };

    return (
        <div className="my-points-page">
            <h2 className="page-title">내 포인트 (스푼)</h2>

            <div className="point-summary-card">
                <div className="point-label">보유 스푼</div>
                <div className="point-value">{user?.spoonBalance?.toLocaleString() || 0} 스푼</div>
            </div>

            <div className="point-history-list">
                <h3>적립/사용 내역</h3>
                {loading ? (
                    <div className="loading-msg">로딩 중...</div>
                ) : error ? (
                    <div className="error-msg">{error}</div>
                ) : history.length === 0 ? (
                    <div className="empty-msg">포인트 내역이 없습니다.</div>
                ) : (
                    <table className="point-table">
                        <thead>
                            <tr>
                                <th>일시</th>
                                <th>구분</th>
                                <th>내용</th>
                                <th>변동</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(item => (
                                <tr key={item.pointHistoryId}>
                                    <td className="date-col">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="type-col">{translateType(item.type)}</td>
                                    <td className="desc-col">{item.description}</td>
                                    <td className={`amount-col ${item.amount > 0 ? 'plus' : 'minus'}`}>
                                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {totalPages > 1 && (
                    <div className="pagination">
                        <button disabled={page === 0} onClick={() => handlePageChange(page - 1)}>&lt;</button>
                        <span>{page + 1} / {totalPages}</span>
                        <button disabled={page >= totalPages - 1} onClick={() => handlePageChange(page + 1)}>&gt;</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPointsPage;
