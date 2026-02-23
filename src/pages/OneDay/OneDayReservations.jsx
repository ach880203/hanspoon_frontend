import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  cancelOneDayReservation,
  getMyOneDayReservations,
  getMyReservationDetail,} from "../../api/onedayApi";
import { toReservationStatusLabel, toSlotLabel } from "./onedayLabels";
import { OneDayTopTabs } from "./OneDayTopTabs";
import { loadAuth } from "../../utils/authStorage";

const PAGE_SIZE = 10;

function parsePositiveInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}

export const OneDayReservations = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(
    () => ({
      status: searchParams.get("status") || "",
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      page: parsePositiveInt(searchParams.get("page"), 0),
      selectedId: parsePositiveInt(searchParams.get("selectedId"), 0),
    }),
    [searchParams]
  );

  const [items, setItems] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0, number: 0, size: PAGE_SIZE });
  const buildBuyerState = () => {
    // 결제 페이지 입력칸 자동 채움을 위해 로그인 사용자 스냅샷을 state로 전달합니다.
    // phone은 저장 구조가 환경마다 다를 수 있어 후보 키를 함께 확인합니다.
    const auth = loadAuth() || {};
    return {
      buyerName: String(auth.userName || ""),
      buyerEmail: String(auth.email || ""),
      buyerTel: String(auth.phone || auth.userPhone || auth.tel || ""),
    };
  };
  const updateQuery = useCallback(
    (updates, options = { replace: true }) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined || value === 0) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      setSearchParams(next, options);
    },
    [searchParams, setSearchParams]
  );

  const loadDetail = useCallback(async (reservationId) => {
    if (!reservationId) {
      setDetail(null);
      return;
    }

    setDetailLoading(true);
    try {
      const data = await getMyReservationDetail(reservationId);
      setDetail(data);
    } catch (e) {
      setError(e?.message ?? "예약 상세 조회 실패");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const params = { page: query.page, size: PAGE_SIZE };
      if (query.status) params.status = query.status;
      if (query.startDate) params.startDate = query.startDate;
      if (query.endDate) params.endDate = query.endDate;

      const data = await getMyOneDayReservations(params);
      const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];

      setItems(list);
      setPageInfo({
        totalPages: Number(data?.totalPages ?? 0),
        totalElements: Number(data?.totalElements ?? list.length),
        number: Number(data?.number ?? query.page),
        size: Number(data?.size ?? PAGE_SIZE),
      });
      setMessage(`예약 ${Number(data?.totalElements ?? list.length)}건`);

      const serverPage = Number(data?.number ?? query.page);
      if (serverPage !== query.page) {
        updateQuery({ page: serverPage }, { replace: true });
      }

      if (list.length === 0) {
        setDetail(null);
        if (query.selectedId) updateQuery({ selectedId: null }, { replace: true });
        return;
      }

      const hasSelected = list.some((x) => Number(x.reservationId) === Number(query.selectedId));
      const selectedId = hasSelected ? Number(query.selectedId) : Number(list[0].reservationId);
      if (selectedId !== Number(query.selectedId)) {
        updateQuery({ selectedId }, { replace: true });
      } else {
        await loadDetail(selectedId);
      }
    } catch (e) {
      setError(e?.message ?? "예약 목록 조회 실패");
      setItems([]);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [loadDetail, query, updateQuery]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (query.selectedId > 0) {
      loadDetail(query.selectedId);
    }
  }, [query.selectedId, loadDetail]);

  const runAction = async (kind, reservationId) => {
    setError("");
    setMessage("");
    setActioningId(reservationId);

    try {
      if (kind === "pay") {
        if (!detail) return;

        // 결제 전용 화면으로 이동
        navigate("/payment", {
          state: {
            reservationId: Number(reservationId),
            classId: Number(detail.sessionId), // 백엔드 검증을 위해 세션 ID 전달
            itemName: detail.classTitle || "원데이 클래스",
            amount: detail.price,
            ...buildBuyerState(),
          },
        });
        return; // 이동 후 종료
      } else {
        const data = await cancelOneDayReservation(reservationId);
        setMessage(`예약 #${data.id} 취소 완료`);
      }

      await loadList();
      await loadDetail(reservationId);
    } catch (e) {
      setError(e?.message ?? "예약 처리 실패");
    } finally {
      setActioningId(null);
    }
  };

  const status = detail?.status;
  const canPay = status === "HOLD";
  const canCancel = status === "HOLD" || status === "PAID";
  const totalPages = Math.max(pageInfo.totalPages, 1);

  return (
    <div style={{ paddingBottom: 24 }}>
      <OneDayTopTabs />

      <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto", display: "grid", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>내 예약</h1>

        <div style={panel}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
              <select style={input} value={query.status} onChange={(e) => updateQuery({ status: e.target.value, page: 0 })}>
                <option value="">전체 상태</option>
                <option value="HOLD">예약 대기</option>
                <option value="PAID">예약 확정</option>
                <option value="CANCELED">예약 취소</option>
                <option value="EXPIRED">기간 만료</option>
                <option value="COMPLETED">수강 완료</option>
              </select>
              <input style={input} type="date" value={query.startDate} onChange={(e) => updateQuery({ startDate: e.target.value, page: 0 })} />
              <input style={input} type="date" value={query.endDate} onChange={(e) => updateQuery({ endDate: e.target.value, page: 0 })} />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => updateQuery({ page: 0 }, { replace: false })} style={btnPrimary} disabled={loading}>
                {loading ? "조회중..." : "조회"}
              </button>
              <button onClick={() => updateQuery({ page: Math.max(query.page - 1, 0) }, { replace: false })} style={btnGhostButton} disabled={loading || query.page <= 0}>이전</button>
              <button onClick={() => updateQuery({ page: query.page + 1 }, { replace: false })} style={btnGhostButton} disabled={loading || query.page + 1 >= totalPages}>다음</button>
              <span style={{ color: "#6b7280", fontSize: 13, alignSelf: "center" }}>
                총 {pageInfo.totalElements.toLocaleString("ko-KR")}건 · {query.page + 1}/{totalPages} 페이지
              </span>
            </div>
          </div>
        </div>

        {error && <div style={errorBox}>{error}</div>}
        {message && <div style={okBox}>{message}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 420px) 1fr", gap: 12 }}>
          <div style={{ ...panel, minHeight: 360 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>예약 목록</h2>
            {items.length === 0 ? (
              <div style={{ color: "#6b7280" }}>예약이 없습니다.</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {items.map((item) => {
                  const isSelected = Number(query.selectedId) === Number(item.reservationId);
                  return (
                    <button
                      key={item.reservationId}
                      onClick={() => updateQuery({ selectedId: item.reservationId }, { replace: false })}
                      style={{ ...listBtn, borderColor: isSelected ? "#111827" : "#e5e7eb", background: isSelected ? "#f9fafb" : "#fff" }}
                    >
                      <strong>#{item.reservationId} {item.classTitle}</strong>
                      <span style={{ color: "#4b5563", fontSize: 13 }}>
                        {toReservationStatusLabel(item.status)} | {toSlotLabel(item.slot)}
                      </span>
                      <span
                        style={{ color: "#2563eb", fontSize: 12, textDecoration: "underline" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/classes/oneday/classes/${item.classId}`, {
                            state: { fromReservationId: item.reservationId },
                          });
                        }}
                      >
                        클래스 상세 이동
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ ...panel, minHeight: 360 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>예약 상세</h2>
            {detailLoading ? (
              <div>불러오는 중...</div>
            ) : !detail ? (
              <div style={{ color: "#6b7280" }}>예약을 선택하세요.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                <Field label="예약" value={`#${detail.reservationId}`} />
                <Field label="상태" value={toReservationStatusLabel(detail.status)} />
                <Field label="클래스" value={detail.classTitle} />
                <Field label="세션" value={`#${detail.sessionId} / ${toSlotLabel(detail.slot)}`} />
                <Field label="시작" value={fmtDate(detail.startAt)} />
                <Field label="금액" value={`${Number(detail.price ?? 0).toLocaleString("ko-KR")}원`} />
                <Field label="홀드 만료" value={fmtDate(detail.holdExpiredAt)} />
                <Field label="결제 시각" value={fmtDate(detail.paidAt)} />
                <Field label="취소 시각" value={fmtDate(detail.canceledAt)} />

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  <button style={btnPrimary} disabled={actioningId === detail.reservationId || !canPay} onClick={() => runAction("pay", detail.reservationId)}>결제</button>
                  <button style={btnDanger} disabled={actioningId === detail.reservationId || !canCancel} onClick={() => runAction("cancel", detail.reservationId)}>취소</button>
                  <button
                    style={btnGhostButton}
                    onClick={() => navigate(`/classes/oneday/classes/${detail.classId}`, { state: { fromReservationId: detail.reservationId } })}
                  >
                    클래스 상세 이동
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function Field({ label, value }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>{label}</span>
      <span>{value || "-"}</span>
    </div>
  );
}

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("ko-KR");
}

const panel = { border: "1px solid #e5e7eb", borderRadius: 16, padding: 14, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" };
const input = { height: 38, border: "1px solid #d1d5db", borderRadius: 10, padding: "0 10px", minWidth: 160 };
const btnPrimary = { height: 38, padding: "0 12px", borderRadius: 10, border: "1px solid #111827", background: "#111827", color: "white", fontWeight: 700, cursor: "pointer" };
const btnDanger = { ...btnPrimary, border: "1px solid #991b1b", background: "#991b1b" };
const btnGhostButton = { height: 38, padding: "0 12px", borderRadius: 10, border: "1px solid #d1d5db", background: "white", color: "#111827", fontWeight: 700, cursor: "pointer" };
const listBtn = { textAlign: "left", display: "grid", gap: 4, border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, background: "white", cursor: "pointer" };
const errorBox = { border: "1px solid #fecaca", background: "#fff1f2", color: "#991b1b", borderRadius: 10, padding: 10 };
const okBox = { border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 10, padding: 10 };


