import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api';
import {
    translateUserStatus,
    translateOrderStatus,
    translateReservationStatus,
    translatePaymentStatus
} from '../../utils/statusConverter';

function AdminUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState({ orders: [], reservations: [], payments: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchUserDetail(), fetchUserHistory()]);
        } catch (error) {
            console.error('데이터 통합 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetail = async () => {
        try {
            const response = await adminApi.getUserDetail(id);
            if (response && response.data) {
                setUser(response.data);
            } else {
                console.error('회원 상세 데이터가 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('회원 상세 정보 조회 실패:', error);
        }
    };

    const fetchUserHistory = async () => {
        try {
            const apiResponse = await adminApi.getUserHistory(id);

            let payload = null;
            if (apiResponse && apiResponse.data) {
                payload = apiResponse.data;
            } else if (apiResponse && apiResponse.orders) {
                payload = apiResponse;
            }

            if (payload) {
                setHistory({
                    orders: payload.orders || [],
                    reservations: payload.reservations || [],
                    payments: payload.payments || []
                });
            }
        } catch (error) {
            console.error('회원 활동 이력 조회 실패:', error);
        }
    };

    const statusLabelMap = {
        ACTIVE: '활성',
        SUSPENDED: '정지',
        DELETED: '탈퇴'
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!window.confirm(`계정 상태를 '${statusLabelMap[newStatus] || newStatus}'로 변경하시겠습니까?`)) return;

        try {
            await adminApi.updateUserStatus(id, newStatus);
            alert('상태가 변경되었습니다.');
            fetchUserDetail();
        } catch (error) {
            console.error('상태 변경 실패:', error);
            alert('상태 변경에 실패했습니다.');
        }
    };

    if (loading) return <div className="container mt-5"><p>불러오는 중...</p></div>;
    if (!user) return <div className="container mt-5"><p>사용자를 찾을 수 없습니다.</p></div>;

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>회원 상세 관리</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>목록으로</button>
            </div>

            <div className="row">
                <div className="col-md-4">
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-primary text-white">기본 정보</div>
                        <div className="card-body">
                            <p className="mb-2"><strong>번호:</strong> {user.userId}</p>
                            <p className="mb-2"><strong>이름:</strong> {user.userName}</p>
                            <p className="mb-2"><strong>이메일:</strong> {user.email}</p>
                            <p className="mb-2"><strong>연락처:</strong> {user.phone || '-'}</p>
                            <p className="mb-2"><strong>가입일:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</p>
                            <p className="mb-2"><strong>최근 로그인:</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}</p>
                            <p className="mb-0">
                                <strong>상태:</strong>
                                <span className={`ms-2 badge ${user.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                                    {translateUserStatus(user.status || (user.isDeleted ? 'DELETED' : 'ACTIVE'))}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-header bg-dark text-white">계정 관리</div>
                        <div className="card-body d-grid gap-2">
                            {user.status !== 'ACTIVE' && (
                                <button className="btn btn-success" onClick={() => handleStatusUpdate('ACTIVE')}>정상 상태로 복구</button>
                            )}
                            {user.status !== 'SUSPENDED' && (
                                <button className="btn btn-warning" onClick={() => handleStatusUpdate('SUSPENDED')}>계정 정지 처리</button>
                            )}
                            {user.status !== 'DELETED' && (
                                <button className="btn btn-danger" onClick={() => handleStatusUpdate('DELETED')}>계정 탈퇴 처리</button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-light">
                            <ul className="nav nav-tabs card-header-tabs">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('orders')}
                                    >
                                        주문 내역 ({history?.orders?.length || 0})
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'reservations' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('reservations')}
                                    >
                                        클래스 예약 ({history?.reservations?.length || 0})
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('payments')}
                                    >
                                        결제/환불 ({history?.payments?.length || 0})
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div className="card-body overflow-auto" style={{ maxHeight: '600px' }}>
                            {activeTab === 'orders' && (
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>번호</th>
                                                <th>주문일</th>
                                                <th>금액</th>
                                                <th>상태</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history?.orders?.length > 0 ? history.orders.map(order => (
                                                <tr key={order.id}>
                                                    <td>{order.id}</td>
                                                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                                                    <td>{order.totalPrice?.toLocaleString() || 0}원</td>
                                                    <td>{translateOrderStatus(order.status)}</td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="text-center p-4 text-muted">주문 내역이 없습니다.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'reservations' && (
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>번호</th>
                                                <th>클래스 세션</th>
                                                <th>예약일</th>
                                                <th>상태</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history?.reservations?.length > 0 ? history.reservations.map(res => (
                                                <tr key={res.id}>
                                                    <td>{res.id}</td>
                                                    <td>세션 #{res.sessionId || '-'}</td>
                                                    <td>{res.paidAt ? new Date(res.paidAt).toLocaleDateString() : (res.createdAt ? new Date(res.createdAt).toLocaleDateString() : '-')}</td>
                                                    <td>{translateReservationStatus(res.status)}</td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="text-center p-4 text-muted">예약 내역이 없습니다.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'payments' && (
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>번호</th>
                                                <th>상품명</th>
                                                <th>결제일</th>
                                                <th>금액</th>
                                                <th>상태</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history?.payments?.length > 0 ? history.payments.map(pay => (
                                                <tr key={pay.payId}>
                                                    <td>{pay.payId}</td>
                                                    <td>{pay.orderName || '결제 내역'}</td>
                                                    <td>{pay.payDate ? new Date(pay.payDate).toLocaleDateString() : '-'}</td>
                                                    <td>{pay.totalPrice?.toLocaleString() || 0}원</td>
                                                    <td>{translatePaymentStatus(pay.status)}</td>
                                                </tr>
                                            )) : <tr><td colSpan="5" className="text-center p-4 text-muted">결제 내역이 없습니다.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminUserDetail;
