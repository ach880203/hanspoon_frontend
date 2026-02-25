// src/pages/MyInquiriesPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteMyInquiry, fetchMyInquiries, updateMyInquiry } from "../api/productInquiries";
import { getMyOneDayInquiries } from "../api/onedayApi";
import { toErrorMessage } from "../api/http";

const INQUIRY_SOURCE = {
  ALL: "ALL",
  MARKET: "MARKET",
  ONEDAY: "ONEDAY",
};

// 마켓 문의는 페이지 단위로 내려오므로, 통합 리스트를 위해 전체 페이지를 수집합니다.
async function fetchAllMarketInquiries(pageSize = 50) {
  const first = await fetchMyInquiries(0, pageSize);
  const totalPages = Number(first?.totalPages ?? 1);
  const merged = [...(first?.content ?? [])];

  for (let p = 1; p < totalPages; p += 1) {
    const next = await fetchMyInquiries(p, pageSize);
    merged.push(...(next?.content ?? []));
  }

  return merged;
}

function toMillis(value) {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function formatDate(value) {
  if (!value) return "일시 정보 없음";
  const ms = toMillis(value);
  if (!ms) return String(value);
  return new Date(ms).toLocaleString("ko-KR");
}

function sourceLabel(source) {
  if (source === INQUIRY_SOURCE.MARKET) return "마켓";
  if (source === INQUIRY_SOURCE.ONEDAY) return "원데이";
  return "전체";
}

function normalizeMarketInquiries(list) {
  return (list ?? []).map((item) => ({
    id: `MARKET-${item.inqId}`,
    source: INQUIRY_SOURCE.MARKET,
    inquiryId: item.inqId,
    targetId: item.productId,
    targetLabel: `마켓 상품 #${item.productId}`,
    content: item.content ?? "",
    answer: item.answer ?? "",
    answered: Boolean(item.answeredYn),
    secret: Boolean(item.secret),
    createdAt: item.createdAt ?? null,
    answeredAt: item.answeredAt ?? null,
  }));
}

function normalizeOneDayInquiries(list) {
  return (list ?? []).map((item) => ({
    id: `ONEDAY-${item.inquiryId}`,
    source: INQUIRY_SOURCE.ONEDAY,
    inquiryId: item.inquiryId,
    targetId: item.classProductId,
    targetLabel: item.title ? `원데이 문의: ${item.title}` : `원데이 클래스 #${item.classProductId}`,
    category: item.category ?? "일반",
    content: item.content ?? "",
    answer: item.answerContent ?? "",
    answered: Boolean(item.answered),
    secret: String(item.visibility || "").toUpperCase() === "PRIVATE",
    createdAt: item.createdAt ?? null,
    answeredAt: item.answeredAt ?? null,
  }));
}

export default function MyInquiriesPage() {
  const nav = useNavigate();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sourceFilter, setSourceFilter] = useState(INQUIRY_SOURCE.ALL);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ content: "", secret: false });

  const [marketInquiries, setMarketInquiries] = useState([]);
  const [oneDayInquiries, setOneDayInquiries] = useState([]);

  const load = async () => {
    setBusy(true);
    setErr("");

    const [marketRes, oneDayRes] = await Promise.allSettled([
      fetchAllMarketInquiries(),
      getMyOneDayInquiries(),
    ]);

    const messages = [];

    if (marketRes.status === "fulfilled") {
      setMarketInquiries(normalizeMarketInquiries(marketRes.value));
    } else {
      setMarketInquiries([]);
      messages.push(`마켓 문의 조회 실패: ${toErrorMessage(marketRes.reason)}`);
    }

    if (oneDayRes.status === "fulfilled") {
      setOneDayInquiries(normalizeOneDayInquiries(oneDayRes.value));
    } else {
      setOneDayInquiries([]);
      messages.push(`원데이 문의 조회 실패: ${toErrorMessage(oneDayRes.reason)}`);
    }

    setErr(messages.join("\n"));
    setBusy(false);
  };

  useEffect(() => {
    load();
  }, []);

  const mergedInquiries = useMemo(() => {
    const all = [...marketInquiries, ...oneDayInquiries];
    all.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

    if (sourceFilter === INQUIRY_SOURCE.ALL) return all;
    return all.filter((item) => item.source === sourceFilter);
  }, [marketInquiries, oneDayInquiries, sourceFilter]);

  const startEdit = (item) => {
    if (item.source !== INQUIRY_SOURCE.MARKET) return;

    setEditingId(item.id);
    setEditForm({
      content: item.content ?? "",
      secret: Boolean(item.secret),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ content: "", secret: false });
  };

  const saveEdit = async (item) => {
    if (!editingId || item.source !== INQUIRY_SOURCE.MARKET) return;
    if (!editForm.content.trim()) {
      setErr("내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setErr("");
    try {
      await updateMyInquiry(item.inquiryId, editForm);
      cancelEdit();
      await load();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    if (item.source !== INQUIRY_SOURCE.MARKET) return;
    if (!window.confirm("문의를 삭제할까요?")) return;

    setBusy(true);
    setErr("");
    try {
      await deleteMyInquiry(item.inquiryId);
      await load();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const moveToTarget = (item) => {
    if (item.source === INQUIRY_SOURCE.MARKET) {
      nav(`/products/${item.targetId}`);
      return;
    }

    if (item.source === INQUIRY_SOURCE.ONEDAY) {
      nav(`/classes/oneday/classes/${item.targetId}`);
    }
  };

  return (
    <div>
      <h1>문의 내역</h1>
      {err && <div className="error" style={{ whiteSpace: "pre-line" }}>{err}</div>}

      <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <button
            className={sourceFilter === INQUIRY_SOURCE.ALL ? "" : "ghost"}
            onClick={() => setSourceFilter(INQUIRY_SOURCE.ALL)}
          >
            전체
          </button>
          <button
            className={sourceFilter === INQUIRY_SOURCE.MARKET ? "" : "ghost"}
            onClick={() => setSourceFilter(INQUIRY_SOURCE.MARKET)}
          >
            마켓
          </button>
          <button
            className={sourceFilter === INQUIRY_SOURCE.ONEDAY ? "" : "ghost"}
            onClick={() => setSourceFilter(INQUIRY_SOURCE.ONEDAY)}
          >
            원데이
          </button>
          <button className="ghost" disabled={busy} onClick={load}>
            새로고침
          </button>
        </div>

        <div className="muted" style={{ fontSize: 12 }}>
          레시피는 현재 문의 도메인이 없어 이 탭에는 마켓/원데이 문의만 표시됩니다.
        </div>

        {mergedInquiries.length === 0 ? (
          <div className="muted">작성한 문의가 없습니다.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mergedInquiries.map((item) => {
              const isEditing = editingId === item.id;
              const canEdit = item.source === INQUIRY_SOURCE.MARKET;

              return (
                <div key={item.id} className="panelMini">
                  <div className="row" style={{ justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="badge">{sourceLabel(item.source)}</span>
                      <span className="badge">{item.answered ? "답변완료" : "답변대기"}</span>
                      <span className="badge">{item.secret ? "비밀" : "공개"}</span>
                      <span className="muted" style={{ fontSize: 12 }}>{formatDate(item.createdAt)}</span>

                      <button className="ghost" onClick={() => moveToTarget(item)}>
                        상세 보기
                      </button>
                    </div>

                    <div className="row" style={{ gap: 8 }}>
                      {!isEditing ? (
                        <>
                          {canEdit && (
                            <button className="ghost" disabled={busy} onClick={() => startEdit(item)}>
                              수정
                            </button>
                          )}
                          {canEdit && (
                            <button className="danger" disabled={busy} onClick={() => remove(item)}>
                              삭제
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button disabled={busy} onClick={() => saveEdit(item)}>저장</button>
                          <button className="ghost" disabled={busy} onClick={cancelEdit}>취소</button>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 8, fontWeight: 600 }}>{item.targetLabel}</div>
                  {item.source === INQUIRY_SOURCE.ONEDAY && (
                    <div className="muted" style={{ marginTop: 4, fontSize: 12 }}>분류: {item.category}</div>
                  )}

                  {!isEditing ? (
                    <>
                      <div style={{ marginTop: 8 }}>
                        <b>문.</b> {item.content}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <b>답.</b>{" "}
                        {item.answer ? <span>{item.answer}</span> : <span className="muted">아직 답변이 없습니다.</span>}
                      </div>
                      {item.answeredAt && (
                        <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
                          답변일시: {formatDate(item.answeredAt)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                      <textarea
                        rows={3}
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      />
                      <label className="row" style={{ gap: 6 }}>
                        <input
                          type="checkbox"
                          checked={editForm.secret}
                          onChange={(e) => setEditForm({ ...editForm, secret: e.target.checked })}
                        />
                        비밀글
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
