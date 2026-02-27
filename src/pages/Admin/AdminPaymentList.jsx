import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import './AdminList.css';

function AdminPaymentList() {
    const [payments, setPayments] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchPayments = async () => {
        try {
            const response = await adminApi.getAllPayments({ page, size: 10 });
            setPayments(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('결제 내역 불러오기 실패:', error);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [page]);

    const handleRefund = async (payId) => {
        if (window.confirm('정말 이 결제를 환불 처리하시겠습니까?')) {
            try {
                await adminApi.cancelPayment(payId);
                alert('환불 처리되었습니다.');
                fetchPayments(); // 목록 새로고침
            } catch (error) {
                console.error('환불 실패:', error);
                alert('환불 처리에 실패했습니다: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PAID': return 'badge-paid';
            case 'CANCELLED': return 'badge-cancelled';
            case 'READY': return 'badge-ready';
            case 'FAILED': return 'badge-failed';
            default: return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PAID': return '결제완료';
            case 'CANCELLED': return '취소됨';
            case 'READY': return '결제대기';
            case 'FAILED': return '결제실패';
            default: return status;
        }
    };

    return (
        <div className="admin-list-container">
            <div className="admin-list-header">
                <h2 className="admin-list-title">결제 관리</h2>
            </div>

            <div className="admin-table-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>결제 ID</th>
                            <th>사용자</th>
                            <th>이메일</th>
                            <th>상품명</th>
                            <th>금액</th>
                            <th>상태</th>
                            <th>결제일</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment) => (
                            <tr key={payment.payId}>
                                <td>{payment.payId}</td>
                                <td><strong>{payment.userName}</strong></td>
                                <td>{payment.email}</td>
                                <td>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                        {payment.orderName || '상품 결제'}
                                    </div>
                                    {payment.paymentItems && payment.paymentItems.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {payment.paymentItems.map((item, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        fontSize: 11,
                                                        background: item.itemType === '상품' ? '#dbeafe' : '#dcfce7',
                                                        color: item.itemType === '상품' ? '#1d4ed8' : '#15803d',
                                                        padding: '2px 6px',
                                                        borderRadius: 4,
                                                    }}
                                                >
                                                    {item.itemType} #{item.productId || item.classId} x{item.quantity}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td>{payment.totalPrice?.toLocaleString()}원</td>
                                <td>
                                    <span className={`admin-badge ${getStatusBadgeClass(payment.status)}`}>
                                        {getStatusText(payment.status)}
                                    </span>
                                </td>
                                <td>{new Date(payment.payDate).toLocaleDateString()}</td>
                                <td>
                                    {payment.status === 'PAID' && (
                                        <button
                                            className="admin-btn-sm admin-btn-refund"
                                            onClick={() => handleRefund(payment.payId)}
                                        >
                                            환불
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="admin-pagination">
                <button
                    className="admin-page-btn"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    &lt;
                </button>
                <span className="admin-page-info">
                    {page + 1} / {totalPages === 0 ? 1 : totalPages}
                </span>
                <button
                    className="admin-page-btn"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                >
                    &gt;
                </button>
            </div>
        </div>
    );
}

export default AdminPaymentList;
