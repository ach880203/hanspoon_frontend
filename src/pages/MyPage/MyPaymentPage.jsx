import { useEffect, useState } from 'react';
import { paymentApi } from '../../api/paymentApi';
import { toErrorMessage } from '../../api/http';
import './MyPaymentPage.css';

const MyPaymentPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPaymentHistory(page);
    }, [page]);

    const fetchPaymentHistory = async (pageIdx) => {
        setLoading(true);
        try {
            const data = await paymentApi.getPaymentHistory({ page: pageIdx, size: 10 });
            if (data) {
                setPayments(data.content || []);
                setTotalPages(data.totalPages || 0);
            }
        } catch (err) {
            // 개발용 디버깅: 전체 에러를 콘솔에 출력
            console.error("getPaymentHistory error:", err);

            // http.toErrorMessage는 err.message를 우선 사용하므로
            // 서버 응답 전체를 화면에 보려면 payload/response 정보를 추가합니다.
            let msg = toErrorMessage(err);
            if (err && err.data) {
                try {
                    msg += ` - 서버응답: ${JSON.stringify(err.data)}`;
                } catch { /* ignore */ }
            } else if (err && err.payload) {
                try {
                    msg += ` - 서버응답: ${JSON.stringify(err.payload)}`;
                } catch { /* ignore */ }
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PAID':
                return <span className="status-badge status-paid">결제완료</span>;
            case 'CANCELLED':
                return <span className="status-badge status-cancelled">결제취소</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    return (
        <div className="my-payment-page">
            <h2 className="page-title">결제 내역</h2>

            <div className="payment-history-list">
                {loading ? (
                    <div className="loading-msg">로딩 중...</div>
                ) : error ? (
                    <div className="error-msg">{error}</div>
                ) : payments.length === 0 ? (
                    <div className="empty-msg">결제 내역이 없습니다.</div>
                ) : (
                    <div className="payment-table-container">
                        <table className="payment-table">
                            <thead>
                                <tr>
                                    <th>결제일시</th>
                                    <th>주문명</th>
                                    <th style={{ textAlign: 'right' }}>결제금액</th>
                                    <th style={{ textAlign: 'center' }}>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.payId}>
                                        <td className="date-col">{new Date(payment.payDate).toLocaleString()}</td>
                                        <td className="order-name-col">{payment.orderName}</td>
                                        <td className="amount-col">{payment.totalPrice.toLocaleString()}원</td>
                                        <td className="status-col">{getStatusLabel(payment.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="pagination">
                        <button disabled={page === 0} onClick={() => handlePageChange(page - 1)}>
                            &lt; 이전
                        </button>
                        <span>{page + 1} / {totalPages}</span>
                        <button disabled={page >= totalPages - 1} onClick={() => handlePageChange(page + 1)}>
                            다음 &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPaymentPage;
