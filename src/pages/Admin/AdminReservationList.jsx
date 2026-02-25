import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";

/**
 * 관리자용 전체 예약 관리 컴포넌트
 * - 모든 예약 목록 조회 및 상태별 필터
 * - 취소 요청 승인/거절 처리
 * - 카드 클릭으로 예약 상세 정보 펼침/접기
 */
export const AdminReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState(null);
  const [openReservationId, setOpenReservationId] = useState(null);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReservations(statusFilter);
      setReservations(res.data || []);
    } catch (e) {
      setError(e?.message ?? "예약 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [statusFilter]);

  useEffect(() => {
    setOpenReservationId(null);
  }, [statusFilter]);

  const handleCancelRequestAction = async (reservationId, action) => {
    setError("");
    setMessage("");
    setProcessingId(reservationId);

    try {
      if (action === "approve") {
        await adminApi.approveCancelRequest(reservationId);
        setMessage(`예약 #${reservationId} 취소가 승인되었습니다.`);
      } else {
        await adminApi.rejectCancelRequest(reservationId);
        setMessage(`예약 #${reservationId} 취소 요청이 거절되었습니다.`);
      }
      await loadReservations();
    } catch (e) {
      setError(e?.message ?? "처리 중 오류가 발생했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const fmtDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("ko-KR");
  };

  const fmtPrice = (value) => {
    if (value == null) return "-";
    return Number(value).toLocaleString("ko-KR") + "원";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return <span style={{ ...badgeStyle, background: "#dbeafe", color: "#1e40af" }}>결제 완료</span>;
      case "HOLD":
        return <span style={{ ...badgeStyle, background: "#f3f4f6", color: "#374151" }}>예약 대기</span>;
      case "CANCEL_REQUESTED":
        return <span style={{ ...badgeStyle, background: "#fef3c7", color: "#92400e" }}>취소 요청</span>;
      case "CANCELED":
        return <span style={{ ...badgeStyle, background: "#fee2e2", color: "#991b1b" }}>취소됨</span>;
      case "COMPLETED":
        return <span style={{ ...badgeStyle, background: "#dcfce7", color: "#166534" }}>이용 완료</span>;
      default:
        return <span style={{ ...badgeStyle, background: "#f3f4f6", color: "#6b7280" }}>{status}</span>;
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>예약 관리</h2>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 10,
        }}
      >
        {[
          { key: "ALL", label: "전체" },
          { key: "PAID", label: "결제 완료" },
          { key: "CANCEL_REQUESTED", label: "취소 요청" },
          { key: "CANCELED", label: "취소됨" },
          { key: "COMPLETED", label: "이용 완료" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              background: statusFilter === tab.key ? "#2563eb" : "transparent",
              color: statusFilter === tab.key ? "white" : "#6b7280",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div style={errorBox}>{error}</div>}
      {message && <div style={okBox}>{message}</div>}

      {loading ? (
        <p style={{ color: "#6b7280" }}>로딩 중...</p>
      ) : reservations.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          <p style={{ fontSize: 16 }}>해당 상태의 예약이 없습니다.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {reservations.map((res) => {
            const opened = openReservationId === res.reservationId;
            const statusCode = res.statusCode || res.status;
            return (
              <article
                key={res.reservationId}
                style={{ ...cardStyle, ...(opened ? cardOpenStyle : null) }}
                role="button"
                tabIndex={0}
                onClick={() =>
                  setOpenReservationId((prev) => (prev === res.reservationId ? null : res.reservationId))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpenReservationId((prev) => (prev === res.reservationId ? null : res.reservationId));
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>#{res.reservationId}</span>
                      {getStatusBadge(statusCode)}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{res.classTitle}</h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{fmtPrice(res.price)}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{fmtDate(res.createdAt)}</p>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    fontSize: 14,
                    color: "#4b5563",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, marginRight: 6 }}>신청자</span>
                    {res.userName} ({res.userEmail})
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, marginRight: 6 }}>수업일</span>
                    {fmtDate(res.sessionStart)}
                  </div>
                </div>

                {opened ? (
                  <div style={detailBoxStyle}>
                    <div style={detailGridStyle}>
                      <div>
                        <span style={detailLabelStyle}>예약 ID</span>
                        <span style={detailValueStyle}>#{res.reservationId}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>클래스 ID</span>
                        <span style={detailValueStyle}>{res.classId ?? "-"}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>예약자 이름</span>
                        <span style={detailValueStyle}>{res.userName || "-"}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>예약자 연락처</span>
                        <span style={detailValueStyle}>{res.userPhone || "-"}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>예약자 로그인 아이디</span>
                        <span style={detailValueStyle}>{res.userEmail || "-"}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>사용자 ID</span>
                        <span style={detailValueStyle}>{res.userId ?? "-"}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>세션 ID</span>
                        <span style={detailValueStyle}>{res.sessionId ?? "-"}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>생성 시각</span>
                        <span style={detailValueStyle}>{fmtDate(res.createdAt)}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>변경 시각</span>
                        <span style={detailValueStyle}>{fmtDate(res.updatedAt)}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>예약 홀딩 만료 시간</span>
                        <span style={detailValueStyle}>{fmtDate(res.holdExpiredAt)}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>결제 시각</span>
                        <span style={detailValueStyle}>{fmtDate(res.paidAt)}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>결제 완료 여부</span>
                        <span style={detailValueStyle}>{res.paymentCompleted ? "완료" : "미완료"}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>쿠폰 발급 완료 여부</span>
                        <span style={detailValueStyle}>{res.couponIssued ? "완료" : "미발급"}</span>
                      </div>
                      <div>
                        <span style={detailLabelStyle}>취소 시각</span>
                        <span style={detailValueStyle}>{fmtDate(res.canceledAt)}</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {statusCode === "CANCEL_REQUESTED" && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: "#fef3c7",
                      borderRadius: 8,
                      border: "1px solid #fbbf24",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>취소 요청 사유</span>
                    <p style={{ margin: "4px 0 0", color: "#78350f", fontSize: 14 }}>
                      {res.cancelReason || "(사유 없음)"}
                    </p>
                    <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                      <button
                        style={btnReject}
                        disabled={processingId === res.reservationId}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelRequestAction(res.reservationId, "reject");
                        }}
                      >
                        거절
                      </button>
                      <button
                        style={btnApprove}
                        disabled={processingId === res.reservationId}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelRequestAction(res.reservationId, "approve");
                        }}
                      >
                        승인 (취소 확정)
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 16,
  background: "#fff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  cursor: "pointer",
};

const cardOpenStyle = {
  borderColor: "#93c5fd",
  boxShadow: "0 0 0 3px rgba(147, 197, 253, 0.2)",
};

const detailBoxStyle = {
  marginTop: 12,
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  background: "#f8fafc",
  padding: 12,
};

const detailGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 10,
};

const detailLabelStyle = {
  display: "block",
  fontSize: 12,
  color: "#64748b",
  marginBottom: 2,
};

const detailValueStyle = {
  display: "block",
  fontSize: 14,
  color: "#0f172a",
  fontWeight: 600,
};

const badgeStyle = {
  padding: "2px 8px",
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 600,
};

const btnApprove = {
  height: 32,
  padding: "0 12px",
  borderRadius: 8,
  border: "none",
  background: "#eea2a4",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 13,
};

const btnReject = {
  height: 32,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#374151",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 13,
};

const errorBox = {
  border: "1px solid #fecaca",
  background: "#fff1f2",
  color: "#991b1b",
  borderRadius: 10,
  padding: 10,
  marginBottom: 12,
};

const okBox = {
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#166534",
  borderRadius: 10,
  padding: 10,
  marginBottom: 12,
};
