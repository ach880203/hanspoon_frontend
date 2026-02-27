import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http, toErrorMessage } from "../../api/http";
import "./MyClassPage.css";

const CANCEL_REASON_OPTIONS = [
  "단순 변심",
  "일정 변경/개인 사정",
  "결제 실수",
  "클래스 정보와 상이",
  "강사/운영 이슈",
  "기타",
];
const CANCEL_DETAIL_MAX_LENGTH = 200;

const STATUS_TABS = [
  { key: "ALL", label: "전체" },
  { key: "UPCOMING", label: "수강 예정" },
  { key: "COMPLETED", label: "수강 완료" },
  { key: "CANCELED", label: "취소/환불" },
];

const normalizeReservationStatus = (statusValue) => {
  const value = String(statusValue || "").trim();

  // 백엔드 응답이 "코드값(PAID)" 또는 "한글 설명(예약 확정)" 둘 다 올 수 있어
  // UI 조건 분기 전에 코드값으로 정규화합니다.
  if (value === "PAID" || value === "예약 확정") return "PAID";
  if (value === "COMPLETED" || value === "수강 완료") return "COMPLETED";
  if (value === "CANCELED" || value === "취소 완료" || value === "예약 취소") return "CANCELED";
  if (value === "CANCEL_REQUESTED" || value === "취소 요청") return "CANCEL_REQUESTED";
  if (value === "HOLD" || value === "예약 대기") return "HOLD";
  if (value === "EXPIRED" || value === "기간 만료") return "EXPIRED";
  return value;
};

const MyClassPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cancel Modal
  const [cancelModal, setCancelModal] = useState({ open: false, reservationId: null });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelDetail, setCancelDetail] = useState("");
  const [actioningId, setActioningId] = useState(null);

  // Filters
  const [status, setStatus] = useState("ALL"); // ALL, UPCOMING, COMPLETED, CANCELED

  // Helper to map UI status to Backend status
  const getBackendStatus = (uiStatus) => {
    if (uiStatus === "ALL") return null;
    if (uiStatus === "UPCOMING") return "PAID";
    if (uiStatus === "COMPLETED") return "COMPLETED";
    if (uiStatus === "CANCELED") return "CANCELED";
    return null;
  };

  const toStatusLabel = (statusValue) => {
    const normalized = normalizeReservationStatus(statusValue);
    if (normalized === "PAID") return "예약 확정";
    if (normalized === "COMPLETED") return "수강 완료";
    if (normalized === "CANCELED") return "취소 완료";
    if (normalized === "CANCEL_REQUESTED") return "취소 요청";
    if (normalized === "HOLD") return "예약 대기";
    if (normalized === "EXPIRED") return "기간 만료";
    return statusValue || "-";
  };

  const resolvedCancelReason = useMemo(() => {
    const selectedReason = cancelReason.trim();
    const detailText = cancelDetail.trim();
    if (!selectedReason) return "";
    if (selectedReason === "기타") return detailText;
    if (!detailText) return selectedReason;
    return `${selectedReason} / 상세: ${detailText}`;
  }, [cancelReason, cancelDetail]);

  const openCancelModal = (reservationId) => {
    setCancelModal({ open: true, reservationId });
    setCancelReason("");
    setCancelDetail("");
  };

  const closeCancelModal = () => {
    setCancelModal({ open: false, reservationId: null });
    setCancelReason("");
    setCancelDetail("");
  };

  const loadReservations = async (nextPage) => {
    setLoading(true);
    setError("");
    try {
      const backendStatus = getBackendStatus(status);
      const params = new URLSearchParams({ page: nextPage, size: 10 });
      if (backendStatus) params.append("status", backendStatus);

      // Note: Controller returns ApiResponse<Page<...>>
      const res = await http.get(`/api/oneday/reservations?${params.toString()}`);
      if (res.data && res.data.data) {
        setData(res.data.data);
      } else {
        setData(res.data);
      }
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const submitCancelRequest = async () => {
    if (!cancelReason) {
      alert("취소 사유를 선택해 주세요.");
      return;
    }

    if (cancelReason === "기타" && !cancelDetail.trim()) {
      alert("취소 사유를 입력해 주세요.");
      return;
    }

    setActioningId(cancelModal.reservationId);
    try {
      await http.post(`/api/oneday/reservations/${cancelModal.reservationId}/cancel`, {
        cancelReason: resolvedCancelReason,
      });

      alert("취소 요청이 접수되었습니다.");
      closeCancelModal();
      loadReservations(page);
    } catch (e) {
      alert(toErrorMessage(e) || "취소 요청 처리에 실패했습니다.");
    } finally {
      setActioningId(null);
    }
  };

  useEffect(() => {
    setPage(0);
    loadReservations(0);
  }, [status]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadReservations(newPage);
  };

  const goToClassDetail = (reservation) => {
    if (!reservation?.classId) return;
    navigate(`/classes/oneday/classes/${reservation.classId}`, {
      state: { fromReservationId: reservation.reservationId },
    });
  };

  const goToReservationDetail = (reservation) => {
    if (!reservation?.reservationId) return;
    navigate(`/classes/oneday/reservations?selectedId=${reservation.reservationId}`);
  };

  const content = Array.isArray(data?.content) ? data.content : [];

  return (
    <div className="my-class-page">
      <h2 className="page-title">클래스 예약 내역</h2>

      <div className="class-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${status === tab.key ? "active" : ""}`}
            onClick={() => setStatus(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="class-cancel-guide">
        취소 요청은 <b>수강 예정</b> 탭에서만 가능합니다. 클래스 시작 시각이 지나면 환불이 불가합니다.
      </p>

      {loading && <div className="loading-msg">로딩 중...</div>}
      {error && <div className="error-msg">{error}</div>}

      {data && (
        <>
          {content.length === 0 ? (
            <div className="empty-msg">예약 내역이 없습니다.</div>
          ) : (
            <div className="reservation-list">
              {content.map((reservation) => {
                const normalizedStatus = normalizeReservationStatus(reservation.status);
                return (
                <div key={reservation.reservationId} className="reservation-item">
                  <div className="res-header">
                    <span className="res-date">
                      {new Date(reservation.startAt).toLocaleDateString("ko-KR")}{" "}
                      {new Date(reservation.startAt).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className={`res-status status-${normalizedStatus}`}>
                      {toStatusLabel(reservation.status)}
                    </span>
                  </div>

                  <div className="res-body">
                    <div className="res-info">
                      <h3 className="res-title">{reservation.classTitle}</h3>
                      <p className="res-meta">
                        인원: {reservation.count}명 / 시간대: {reservation.slot}
                      </p>
                      <p className="res-price">
                        {Number(reservation.price || 0).toLocaleString("ko-KR")}원
                      </p>
                    </div>

                    <div className="res-actions">
                      <button className="btn-action" onClick={() => goToReservationDetail(reservation)}>
                        예약 상세
                      </button>
                      <button className="btn-action" onClick={() => goToClassDetail(reservation)}>
                        클래스 상세
                      </button>

                      {status === "UPCOMING" && normalizedStatus === "PAID" ? (
                        <button
                          className="btn-action btn-action-danger"
                          onClick={() => openCancelModal(reservation.reservationId)}
                        >
                          취소 요청
                        </button>
                      ) : null}
                      {normalizedStatus === "COMPLETED" ? (
                        <button className="btn-action" onClick={() => goToClassDetail(reservation)}>
                          리뷰 작성
                        </button>
                      ) : null}
                      {normalizedStatus === "CANCEL_REQUESTED" ? (
                        <button className="btn-action" disabled>
                          취소 대기중
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}

          {data.totalPages > 1 ? (
            <div className="pagination">
              <button disabled={page <= 0} onClick={() => handlePageChange(page - 1)}>
                이전
              </button>
              <span className="page-info">
                {data.number + 1} / {data.totalPages}
              </span>
              <button disabled={page >= data.totalPages - 1} onClick={() => handlePageChange(page + 1)}>
                다음
              </button>
            </div>
          ) : null}
        </>
      )}

      {/* Cancel Modal */}
      {cancelModal.open ? (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>취소 요청</h3>
            <p className="modal-desc">
              관리자 확인 후 취소가 처리됩니다.
              <br />
              취소 사유를 선택해 주세요.
            </p>

            <select className="modal-select" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
              <option value="">사유를 선택해 주세요</option>
              {CANCEL_REASON_OPTIONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            <textarea
              className="modal-input"
              placeholder={
                cancelReason === "기타"
                  ? "기타 취소 사유를 자세히 입력해 주세요."
                  : "추가로 전달할 내용을 입력해 주세요. (선택)"
              }
              value={cancelDetail}
              maxLength={CANCEL_DETAIL_MAX_LENGTH}
              onChange={(e) => setCancelDetail(e.target.value)}
              style={{ marginTop: "10px" }}
            />
            <p className="modal-count">
              {cancelDetail.length}/{CANCEL_DETAIL_MAX_LENGTH}자
            </p>

            <div className="modal-actions">
              <button className="btn-close" onClick={closeCancelModal}>
                닫기
              </button>
              <button
                className="btn-confirm"
                onClick={submitCancelRequest}
                disabled={actioningId !== null || !resolvedCancelReason}
              >
                {actioningId ? "처리중..." : "요청하기"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MyClassPage;
