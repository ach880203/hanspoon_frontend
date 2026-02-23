import React, { useEffect, useState } from 'react';
import { http } from '../../api/http';
import { toErrorMessage } from '../../api/http';
import './MyClassPage.css';

const MyClassPage = () => {
    const [page, setPage] = useState(0);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Cancel Modal
    const [cancelModal, setCancelModal] = useState({ open: false, reservationId: null });
    const [cancelReason, setCancelReason] = useState("");
    const [actioningId, setActioningId] = useState(null);

    const openCancelModal = (reservationId) => {
        setCancelModal({ open: true, reservationId });
        setCancelReason("");
    };

    const closeCancelModal = () => {
        setCancelModal({ open: false, reservationId: null });
        setCancelReason("");
    };

    const submitCancelRequest = async () => {
        if (!cancelReason.trim()) {
            alert("취소 사유를 입력해 주세요.");
            return;
        }

        setActioningId(cancelModal.reservationId);
        try {
            await http.post(`/api/oneday/reservations/${cancelModal.reservationId}/cancel`, { cancelReason: cancelReason.trim() });

            alert("취소 요청이 접수되었습니다.");
            closeCancelModal();
            loadReservations(page); // Reload list
        } catch (e) {
            alert(toErrorMessage(e) || "취소 요청 실패");
        } finally {
            setActioningId(null);
        }
    };

    // Filters
    const [status, setStatus] = useState('ALL'); // ALL, UPCOMING, COMPLETED, CANCELED

    // Helper to map UI status to Backend status
    const getBackendStatus = (uiStatus) => {
        if (uiStatus === 'ALL') return null;
        if (uiStatus === 'UPCOMING') return 'PAID'; // Assuming PAID means upcoming/confirmed
        if (uiStatus === 'COMPLETED') return 'COMPLETED'; // Need to check if this status exists
        if (uiStatus === 'CANCELED') return 'CANCELED';
        return null;
    };

    // But ReservationStatus enum might be different. 
    // Let's assume: PENDING_PAYMENT, PAID, CANCELED, REFUNDED. 
    // And "Completed" is not a status but calculated by date?
    // For now, let's just filter by status if possible.
    // Backend `findWithFilters` supports status.

    const loadReservations = async (p) => {
        setLoading(true);
        setError('');
        try {
            const backendStatus = getBackendStatus(status);
            const params = new URLSearchParams({ page: p, size: 10 });
            if (backendStatus) params.append('status', backendStatus);

            // Note: Controller returns ApiResponse<Page<...>>
            const res = await http.get(`/api/oneday/reservations?${params.toString()}`);
            if (res.data && res.data.data) {
                setData(res.data.data); // Page object
            } else {
                setData(res.data); // Maybe just Page object if ApiResponse structure is different
            }
        } catch (e) {
            setError(toErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(0);
        loadReservations(0);    }, [status]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        loadReservations(newPage);
    };

    return (
        <div className="my-class-page">
            <h2 className="page-title">클래스 예약 내역</h2>

            <div className="class-tabs">
                {['ALL', 'UPCOMING', 'CANCELED'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${status === tab ? 'active' : ''}`}
                        onClick={() => setStatus(tab)}
                    >
                        {tab === 'ALL' ? '전체' : tab === 'UPCOMING' ? '수강 예정' : '취소/환불'}
                    </button>
                ))}
            </div>

            {loading && <div className="loading-msg">로딩 중...</div>}
            {error && <div className="error-msg">{error}</div>}

            {data && (
                <>
                    {data.content.length === 0 ? (
                        <div className="empty-msg">예약 내역이 없습니다.</div>
                    ) : (
                        <div className="reservation-list">
                            {data.content.map(r => (
                                <div key={r.reservationId} className="reservation-item">
                                    <div className="res-header">
                                        <span className="res-date">{new Date(r.startAt).toLocaleDateString()} {new Date(r.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className={`res-status status-${r.status}`}>
                                            {r.status === 'CANCEL_REQUESTED' ? '취소 요청' : r.status === 'PAID' ? '예약 확정' : r.status}
                                        </span>
                                    </div>
                                    <div className="res-body">
                                        <div className="res-info">
                                            <h3 className="res-title">{r.classTitle}</h3>
                                            <p className="res-meta">인원: {r.count}명(타임: {r.slot})</p>
                                            <p className="res-price">{r.price.toLocaleString()}원</p>
                                        </div>
                                        <div className="res-actions">
                                            {r.status === 'PAID' && (
                                                <button
                                                    className="btn-action"
                                                    onClick={() => openCancelModal(r.reservationId)}
                                                >
                                                    취소 요청
                                                </button>
                                            )}
                                            {r.status === 'CANCEL_REQUESTED' && (
                                                <button className="btn-action" disabled>취소 대기중</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {data.totalPages > 1 && (
                        <div className="pagination">
                            <button disabled={page <= 0} onClick={() => handlePageChange(page - 1)}>이전</button>
                            <span className="page-info">{data.number + 1} / {data.totalPages}</span>
                            <button disabled={page >= data.totalPages - 1} onClick={() => handlePageChange(page + 1)}>다음</button>
                        </div>
                    )}
                </>
            )}

            {/* Cancel Modal */}
            {cancelModal.open && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>취소 요청</h3>
                        <p className="modal-desc">관리자 확인 후 취소가 완료됩니다.<br />취소 사유를 선택해 주세요.</p>

                                                <select
                            className="modal-select"
                            value={cancelReason === "기타" || ![
                                "단순 변심",
                                "일정 변경/개인 사정",
                                "결제 실수",
                                "클래스 정보와 다름",
                                "사정이 생김"
                            ].includes(cancelReason) && cancelReason !== "" ? "기타" : cancelReason}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === "기타") {
                                    setCancelReason("기타");
                                } else {
                                    setCancelReason(val);
                                }
                            }}
                        >
                            <option value="">사유를 선택하세요</option>
                            <option value="단순 변심">단순 변심</option>
                            <option value="일정 변경/개인 사정">일정 변경/개인 사정</option>
                            <option value="결제 실수">결제 실수</option>
                            <option value="클래스 정보와 다름">클래스 정보와 다름</option>
                            <option value="사정이 생김">사정이 생김</option>
                            <option value="기타">기타 (직접 입력)</option>
                        </select>

                        {(cancelReason === "기타" || (cancelReason && !["단순 변심", "일정 변경/개인 사정", "결제 실수", "클래스 정보와 다름", "사정이 생김"].includes(cancelReason))) && (
                                <textarea
                                    className="modal-input"
                                    placeholder="구체적인 사유를 입력해 주세요."
                                    value={cancelReason === "기타" ? "" : cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    style={{ marginTop: '10px' }}
                                />
                            )}

                        <div className="modal-actions">
                            <button className="btn-close" onClick={closeCancelModal}>닫기</button>
                            <button
                                className="btn-confirm"
                                onClick={submitCancelRequest}
                                disabled={actioningId !== null || !cancelReason || cancelReason === "기타"}
                            >
                                {actioningId ? "처리중..." : "요청하기"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyClassPage;


