import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";

/**
 * 관리자용 취소 요청 관리 컴포넌트
 * - 취소 요청(CANCEL_REQUESTED) 상태의 예약 목록 표시
 * - 관리자가 승인/거절 가능
 */
export const AdminCancelRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [processingId, setProcessingId] = useState(null);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getCancelRequests();
            setRequests(res.data || []);
        } catch (e) {
            setError(e?.message ?? "취소 요청 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleAction = async (reservationId, action) => {
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
            await loadRequests();
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

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>
                취소 요청 관리
                {requests.length > 0 && (
                    <span style={{ marginLeft: 8, padding: "2px 10px", borderRadius: 20, background: "#fef2f2", color: "#991b1b", fontSize: 14, fontWeight: 600 }}>
                        {requests.length}건
                    </span>
                )}
            </h2>

            {error && <div style={errorBox}>{error}</div>}
            {message && <div style={okBox}>{message}</div>}

            {loading ? (
                <p style={{ color: "#6b7280" }}>로딩 중...</p>
            ) : requests.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                    <p style={{ fontSize: 18, fontWeight: 600 }}>처리할 취소 요청이 없습니다.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 12 }}>
                    {requests.map((req) => (
                        <div key={req.reservationId} style={cardStyle}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <Field label="예약 번호" value={`#${req.reservationId}`} />
                                <Field label="요청자" value={`${req.userName} (${req.userEmail})`} />
                                <Field label="클래스" value={req.classTitle} />
                                <Field label="세션 ID" value={`#${req.sessionId}`} />
                                <Field label="결제 금액" value={fmtPrice(req.price)} />
                                <Field label="결제 시각" value={fmtDate(req.paidAt)} />
                                <Field label="취소 요청 시각" value={fmtDate(req.cancelRequestedAt)} />
                            </div>

                            <div style={{ marginTop: 10, padding: 10, background: "#fef3c7", borderRadius: 8, border: "1px solid #fbbf24" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>취소 사유</span>
                                <p style={{ margin: "4px 0 0", color: "#78350f", whiteSpace: "pre-wrap" }}>
                                    {req.cancelReason || "(사유 없음)"}
                                </p>
                            </div>

                            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                                <button
                                    style={btnReject}
                                    disabled={processingId === req.reservationId}
                                    onClick={() => handleAction(req.reservationId, "reject")}
                                >
                                    거절
                                </button>
                                <button
                                    style={btnApprove}
                                    disabled={processingId === req.reservationId}
                                    onClick={() => handleAction(req.reservationId, "approve")}
                                >
                                    승인 (취소 확정)
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function Field({ label, value }) {
    return (
        <div style={{ display: "grid", gap: 2 }}>
            <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>{label}</span>
            <span style={{ fontSize: 14 }}>{value || "-"}</span>
        </div>
    );
}

const cardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const btnApprove = {
    height: 38,
    padding: "0 16px",
    borderRadius: 10,
    border: "1px solid #991b1b",
    background: "#991b1b",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
};

const btnReject = {
    height: 38,
    padding: "0 16px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "white",
    color: "#111827",
    fontWeight: 700,
    cursor: "pointer",
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
