// src/pages/MyReviewsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteReview, fetchMyReviews, updateReview } from "../api/productReviews";
import { toErrorMessage } from "../api/http";

export default function MyReviewsPage() {
  const nav = useNavigate();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, content: "" });

  const load = async (p = 0) => {
    setErr("");
    try {
      const d = await fetchMyReviews(p, 10);
      setData(d);
      setPage(d?.number ?? p);
    } catch (e) {
      setErr(toErrorMessage(e));
      setData(null);
    }
  };

  useEffect(() => { load(0); }, []);

  const startEdit = (r) => {
    setEditingId(r.revId);
    setEditForm({
      rating: Number(r.rating ?? 5),
      content: r.content ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ rating: 5, content: "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editForm.content.trim()) {
      setErr("내용을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await updateReview(editingId, editForm);
      cancelEdit();
      await load(page);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (revId) => {
    if (!window.confirm("리뷰를 삭제할까요?")) return;
    setBusy(true);
    setErr("");
    try {
      await deleteReview(revId);
      await load(page);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const list = data?.content || [];

  return (
    <div>
      <h1>My Reviews</h1>
      {err && <div className="error">{err}</div>}

      <div className="panel">
        {list.length === 0 ? (
          <div className="muted">작성한 리뷰가 없습니다.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map((r) => {
              const isEditing = editingId === r.revId;

              return (
                <div key={r.revId} className="panelMini">
                  <div className="row" style={{ justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <div className="row" style={{ gap: 10, alignItems: "center" }}>
                      <span className="badge">{r.rating}점</span>
                      <div className="muted" style={{ fontSize: 12 }}>{String(r.createdAt || "")}</div>

                      <button className="ghost" onClick={() => nav(`/products/${r.productId}`)}>
                        상품 보기
                      </button>
                    </div>

                    <div className="row" style={{ gap: 8 }}>
                      {!isEditing ? (
                        <>
                          <button className="ghost" disabled={busy} onClick={() => startEdit(r)}>수정</button>
                          <button className="danger" disabled={busy} onClick={() => remove(r.revId)}>삭제</button>
                        </>
                      ) : (
                        <>
                          <button disabled={busy} onClick={saveEdit}>저장</button>
                          <button className="ghost" disabled={busy} onClick={cancelEdit}>취소</button>
                        </>
                      )}
                    </div>
                  </div>

                  {!isEditing ? (
                    <div style={{ marginTop: 8 }}>{r.content}</div>
                  ) : (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                      <select
                        value={editForm.rating}
                        onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                        style={{ width: 120 }}
                      >
                        {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n}점</option>)}
                      </select>
                      <textarea
                        rows={3}
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {data && (
          <div className="row" style={{ gap: 8, marginTop: 12 }}>
            <button className="ghost" disabled={busy || (data.number ?? 0) <= 0} onClick={() => load((data.number ?? 0) - 1)}>이전</button>
            <div className="muted">page {(data.number ?? 0) + 1} / {data.totalPages ?? 1}</div>
            <button className="ghost" disabled={busy || (data.number ?? 0) + 1 >= (data.totalPages ?? 1)} onClick={() => load((data.number ?? 0) + 1)}>다음</button>
          </div>
        )}
      </div>
    </div>
  );
}

