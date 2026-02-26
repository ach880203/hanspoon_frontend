// src/pages/MyInquiriesPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteMyInquiry, fetchMyInquiries, updateMyInquiry } from "../api/productInquiries";
import { getMyOneDayInquiries } from "../api/onedayApi";
import { toErrorMessage } from "../api/http";
import "./MyInquiriesPage.css";

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
  if (source === INQUIRY_SOURCE.ONEDAY) return "클래스";
  return "전체";
}

function normalizeMarketInquiries(list) {
  return (list ?? []).map((item) => ({
    id: `MARKET-${item.inqId}`,
    source: INQUIRY_SOURCE.MARKET,
    inquiryId: item.inqId,
    targetId: item.productId,
    targetLabel: item.productName ? `마켓 · ${item.productName}` : `마켓 상품 #${item.productId}`,
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
    targetLabel: item.title ? `클래스 · ${item.title}` : `원데이 클래스 #${item.classProductId}`,
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

  const sourceStats = useMemo(() => {
    return {
      ALL: marketInquiries.length + oneDayInquiries.length,
      MARKET: marketInquiries.length,
      ONEDAY: oneDayInquiries.length,
    };
  }, [marketInquiries, oneDayInquiries]);

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
    <div className="my-inquiry-page">
      <header className="my-inquiry-hero">
        <h1>문의 내역</h1>
        <p>마켓과 클래스 문의를 한 곳에서 확인하고 관리할 수 있습니다.</p>
      </header>

      {err ? (
        <div className="my-inquiry-alert" style={{ whiteSpace: "pre-line" }}>
          {err}
        </div>
      ) : null}

      <section className="my-inquiry-toolbar">
        <div className="my-inquiry-filter">
          {[
            { value: INQUIRY_SOURCE.ALL, label: "전체" },
            { value: INQUIRY_SOURCE.MARKET, label: "마켓" },
            { value: INQUIRY_SOURCE.ONEDAY, label: "클래스" },
          ].map((tab) => (
            <button
              key={`inquiry-filter-${tab.value}`}
              type="button"
              className={sourceFilter === tab.value ? "inquiry-filter-tab is-active" : "inquiry-filter-tab"}
              onClick={() => setSourceFilter(tab.value)}
            >
              {tab.label} ({sourceStats[tab.value]})
            </button>
          ))}
        </div>
        <button type="button" className="inquiry-refresh-btn" disabled={busy} onClick={load}>
          {busy ? "불러오는 중..." : "새로고침"}
        </button>
      </section>

      <section className="my-inquiry-note">레시피 문의 도메인은 아직 없어 마켓/클래스만 표시됩니다.</section>

      {mergedInquiries.length === 0 ? (
        <section className="my-inquiry-empty">
          <strong>작성한 문의가 없습니다.</strong>
          <p>상품이나 클래스 상세에서 문의를 남기면 이곳에서 확인할 수 있습니다.</p>
        </section>
      ) : (
        <section className="my-inquiry-list">
          {mergedInquiries.map((item) => {
            const isEditing = editingId === item.id;
            const canEdit = item.source === INQUIRY_SOURCE.MARKET;
            const canDelete = item.source === INQUIRY_SOURCE.MARKET;

            return (
              <article key={item.id} className="my-inquiry-card">
                <div className="inquiry-card-head">
                  <div className="inquiry-head-left">
                    <span className="inquiry-source-badge">{sourceLabel(item.source)}</span>
                    <span className={item.answered ? "inquiry-state-badge answered" : "inquiry-state-badge waiting"}>
                      {item.answered ? "답변완료" : "답변대기"}
                    </span>
                    <span className="inquiry-visibility-badge">{item.secret ? "비밀글" : "공개글"}</span>
                    <span className="inquiry-date">{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="inquiry-head-right">
                    <button type="button" className="inquiry-ghost-btn" onClick={() => moveToTarget(item)}>
                      관련 페이지
                    </button>
                    {!isEditing ? (
                      <>
                        {canEdit ? (
                          <button
                            type="button"
                            className="inquiry-ghost-btn"
                            disabled={busy}
                            onClick={() => startEdit(item)}
                          >
                            수정
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            className="inquiry-danger-btn"
                            disabled={busy}
                            onClick={() => remove(item)}
                          >
                            삭제
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="inquiry-save-btn"
                          disabled={busy}
                          onClick={() => saveEdit(item)}
                        >
                          저장
                        </button>
                        <button type="button" className="inquiry-ghost-btn" disabled={busy} onClick={cancelEdit}>
                          취소
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="inquiry-target">{item.targetLabel}</div>
                {item.source === INQUIRY_SOURCE.ONEDAY ? (
                  <div className="inquiry-category">분류: {item.category}</div>
                ) : null}

                {!isEditing ? (
                  <div className="inquiry-question-box">
                    <strong>문의 내용</strong>
                    <p>{item.content || "문의 내용이 없습니다."}</p>
                  </div>
                ) : (
                  <div className="inquiry-edit-form">
                    <label>
                      <span>문의 내용</span>
                      <textarea
                        rows={4}
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      />
                    </label>
                    <label className="inquiry-secret-check">
                      <input
                        type="checkbox"
                        checked={editForm.secret}
                        onChange={(e) => setEditForm({ ...editForm, secret: e.target.checked })}
                      />
                      비밀글로 설정
                    </label>
                  </div>
                )}

                <div className="inquiry-answer-box">
                  <strong>답변</strong>
                  <p>{item.answer ? item.answer : "아직 답변이 없습니다."}</p>
                  {item.answeredAt ? <span>답변 일시: {formatDate(item.answeredAt)}</span> : null}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
