// src/components/ReviewSection.jsx
import { useEffect, useState } from "react";
import { createProductReview, fetchProductReviews } from "../api/productReviews";
import { toErrorMessage } from "../api/http";

function Stars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return <span style={{ letterSpacing: 1 }}>{Array.from({ length: 5 }, (_, i) => (i < v ? "*" : ".")).join("")}</span>;
}

export default function ReviewSection({ productId }) {
  const [data, setData] = useState(null); // Page<ReviewResponseDto>
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ rating: 5, content: "" });

  const load = async (p = 0) => {
    setErr("");
    try {
      const d = await fetchProductReviews(productId, p, 10);
      setData(d);
    } catch (e) {
      setErr(toErrorMessage(e));
      setData(null);
    }
  };

  useEffect(() => { load(0); }, [productId]);

  const submit = async () => {
    if (!form.content.trim()) {
      setErr("리뷰 내용을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await createProductReview(productId, form);
      setForm({ rating: 5, content: "" });
      await load(0);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const list = data?.content || [];

  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <h3>상품 리뷰</h3>
      {err && <div className="error">{err}</div>}

      <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
          {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n}점</option>)}
        </select>
        <input
          placeholder="리뷰 내용을 입력"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          style={{ minWidth: 260, flex: 1 }}
        />
        <button disabled={busy} onClick={submit}>{busy ? "..." : "리뷰 등록"}</button>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {list.length === 0 ? (
          <div className="muted">아직 리뷰가 없어요.</div>
        ) : (
          list.map((r) => (
            <div key={r.revId} className="panelMini">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="row" style={{ gap: 10, alignItems: "center" }}>
                  <Stars value={r.rating} />
                  <div className="muted" style={{ fontSize: 12 }}>
                    {String(r.createdAt || "")}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 6 }}>{r.content}</div>
            </div>
          ))
        )}
      </div>

      {data && (
        <div className="row" style={{ gap: 8, marginTop: 12 }}>
          <button className="ghost" disabled={busy || (data.number ?? 0) <= 0} onClick={() => load((data.number ?? 0) - 1)}>이전</button>
          <div className="muted">페이지 {(data.number ?? 0) + 1} / {data.totalPages ?? 1}</div>
          <button className="ghost" disabled={busy || (data.number ?? 0) + 1 >= (data.totalPages ?? 1)} onClick={() => load((data.number ?? 0) + 1)}>다음</button>
        </div>
      )}
    </div>
  );
}

