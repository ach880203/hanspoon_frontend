// src/pages/MyReviewsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteReview, fetchMyReviews, updateReview } from "../api/productReviews";
import { deleteOneDayReview, getMyOneDayReviews } from "../api/onedayApi";
import { fetchMyRecipeReviews } from "../api/recipeApi";
import { toErrorMessage } from "../api/http";

const REVIEW_SOURCE = {
  ALL: "ALL",
  MARKET: "MARKET",
  ONEDAY: "ONEDAY",
  RECIPE: "RECIPE",
};

// 마켓 리뷰는 페이징 응답이므로 모든 페이지를 순회해서 전체 리스트를 만듭니다.
// 통합 목록에서 소스별 필터를 걸어도 데이터가 빠지지 않도록 전체를 수집합니다.
async function fetchAllMarketReviews(pageSize = 50) {
  const first = await fetchMyReviews(0, pageSize);
  const totalPages = Number(first?.totalPages ?? 1);
  const merged = [...(first?.content ?? [])];

  for (let p = 1; p < totalPages; p += 1) {
    const next = await fetchMyReviews(p, pageSize);
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

function getSourceLabel(source) {
  if (source === REVIEW_SOURCE.MARKET) return "마켓";
  if (source === REVIEW_SOURCE.ONEDAY) return "원데이";
  if (source === REVIEW_SOURCE.RECIPE) return "레시피";
  return "전체";
}

function normalizeMarketReviews(list) {
  return (list ?? []).map((item) => ({
    id: `MARKET-${item.revId}`,
    source: REVIEW_SOURCE.MARKET,
    reviewId: item.revId,
    targetId: item.productId,
    targetLabel: `마켓 상품 #${item.productId}`,
    rating: Number(item.rating ?? 0),
    content: item.content ?? "",
    createdAt: item.createdAt ?? null,
    raw: item,
  }));
}

function normalizeOneDayReviews(list) {
  return (list ?? []).map((item) => ({
    id: `ONEDAY-${item.reviewId}`,
    source: REVIEW_SOURCE.ONEDAY,
    reviewId: item.reviewId,
    targetId: item.classId,
    targetLabel: `원데이 클래스 #${item.classId}`,
    rating: Number(item.rating ?? 0),
    content: item.content ?? "",
    createdAt: item.createdAt ?? null,
    answerContent: item.answerContent ?? "",
    raw: item,
  }));
}

function normalizeRecipeReviews(list) {
  return (list ?? []).map((item) => ({
    id: `RECIPE-${item.revId}`,
    source: REVIEW_SOURCE.RECIPE,
    reviewId: item.revId,
    targetId: item.recipeId,
    targetLabel: item.recipeTitle ? `레시피: ${item.recipeTitle}` : `레시피 #${item.recipeId}`,
    rating: Number(item.rating ?? 0),
    content: item.content ?? "",
    createdAt: null,
    raw: item,
  }));
}

export default function MyReviewsPage() {
  const nav = useNavigate();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sourceFilter, setSourceFilter] = useState(REVIEW_SOURCE.ALL);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, content: "" });

  const [marketReviews, setMarketReviews] = useState([]);
  const [oneDayReviews, setOneDayReviews] = useState([]);
  const [recipeReviews, setRecipeReviews] = useState([]);

  const load = async () => {
    setBusy(true);
    setErr("");

    const [marketRes, oneDayRes, recipeRes] = await Promise.allSettled([
      fetchAllMarketReviews(),
      getMyOneDayReviews(),
      fetchMyRecipeReviews(),
    ]);

    const messages = [];

    if (marketRes.status === "fulfilled") {
      setMarketReviews(normalizeMarketReviews(marketRes.value));
    } else {
      setMarketReviews([]);
      messages.push(`마켓 리뷰 조회 실패: ${toErrorMessage(marketRes.reason)}`);
    }

    if (oneDayRes.status === "fulfilled") {
      setOneDayReviews(normalizeOneDayReviews(oneDayRes.value));
    } else {
      setOneDayReviews([]);
      messages.push(`원데이 리뷰 조회 실패: ${toErrorMessage(oneDayRes.reason)}`);
    }

    if (recipeRes.status === "fulfilled") {
      setRecipeReviews(normalizeRecipeReviews(recipeRes.value));
    } else {
      setRecipeReviews([]);
      messages.push(`레시피 리뷰 조회 실패: ${toErrorMessage(recipeRes.reason)}`);
    }

    setErr(messages.join("\n"));
    setBusy(false);
  };

  useEffect(() => {
    load();
  }, []);

  const mergedReviews = useMemo(() => {
    const all = [...marketReviews, ...oneDayReviews, ...recipeReviews];
    all.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

    if (sourceFilter === REVIEW_SOURCE.ALL) return all;
    return all.filter((item) => item.source === sourceFilter);
  }, [marketReviews, oneDayReviews, recipeReviews, sourceFilter]);

  const startEdit = (item) => {
    if (item.source !== REVIEW_SOURCE.MARKET) return;

    setEditingId(item.id);
    setEditForm({
      rating: Number(item.rating ?? 5),
      content: item.content ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ rating: 5, content: "" });
  };

  const saveEdit = async (item) => {
    if (!editingId || item.source !== REVIEW_SOURCE.MARKET) return;
    if (!editForm.content.trim()) {
      setErr("내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setErr("");
    try {
      await updateReview(item.reviewId, {
        rating: Number(editForm.rating),
        content: editForm.content,
      });
      cancelEdit();
      await load();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    const sourceLabel = getSourceLabel(item.source);
    if (!window.confirm(`${sourceLabel} 리뷰를 삭제할까요?`)) return;

    setBusy(true);
    setErr("");
    try {
      if (item.source === REVIEW_SOURCE.MARKET) {
        await deleteReview(item.reviewId);
      } else if (item.source === REVIEW_SOURCE.ONEDAY) {
        await deleteOneDayReview(item.reviewId);
      } else {
        setErr("레시피 리뷰 삭제는 현재 이 화면에서 지원하지 않습니다.");
        setBusy(false);
        return;
      }
      await load();
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const moveToTarget = (item) => {
    if (item.source === REVIEW_SOURCE.MARKET) {
      nav(`/products/${item.targetId}`);
      return;
    }
    if (item.source === REVIEW_SOURCE.ONEDAY) {
      nav(`/classes/oneday/classes/${item.targetId}`);
      return;
    }
    if (item.source === REVIEW_SOURCE.RECIPE) {
      nav(`/recipes/${item.targetId}`);
    }
  };

  return (
    <div>
      <h1>내 리뷰</h1>
      {err && <div className="error" style={{ whiteSpace: "pre-line" }}>{err}</div>}

      <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <button
            className={sourceFilter === REVIEW_SOURCE.ALL ? "" : "ghost"}
            onClick={() => setSourceFilter(REVIEW_SOURCE.ALL)}
          >
            전체
          </button>
          <button
            className={sourceFilter === REVIEW_SOURCE.MARKET ? "" : "ghost"}
            onClick={() => setSourceFilter(REVIEW_SOURCE.MARKET)}
          >
            마켓
          </button>
          <button
            className={sourceFilter === REVIEW_SOURCE.ONEDAY ? "" : "ghost"}
            onClick={() => setSourceFilter(REVIEW_SOURCE.ONEDAY)}
          >
            원데이
          </button>
          <button
            className={sourceFilter === REVIEW_SOURCE.RECIPE ? "" : "ghost"}
            onClick={() => setSourceFilter(REVIEW_SOURCE.RECIPE)}
          >
            레시피
          </button>

          <button className="ghost" disabled={busy} onClick={load}>
            새로고침
          </button>
        </div>

        {mergedReviews.length === 0 ? (
          <div className="muted">작성한 리뷰가 없습니다.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mergedReviews.map((item) => {
              const isEditing = editingId === item.id;
              const canEdit = item.source === REVIEW_SOURCE.MARKET;
              const canDelete = item.source === REVIEW_SOURCE.MARKET || item.source === REVIEW_SOURCE.ONEDAY;

              return (
                <div key={item.id} className="panelMini">
                  <div className="row" style={{ justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="badge">{getSourceLabel(item.source)}</span>
                      <span className="badge">{item.rating}점</span>
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
                          {canDelete && (
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

                  {!isEditing ? (
                    <div style={{ marginTop: 8 }}>{item.content}</div>
                  ) : (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                      <select
                        value={editForm.rating}
                        onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                        style={{ width: 120 }}
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n}점</option>
                        ))}
                      </select>

                      <textarea
                        rows={3}
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      />
                    </div>
                  )}

                  {item.source === REVIEW_SOURCE.ONEDAY && item.answerContent && (
                    <div style={{ marginTop: 8 }}>
                      <b>답글:</b> {item.answerContent}
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
