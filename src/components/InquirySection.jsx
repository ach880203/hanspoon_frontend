// src/components/InquirySection.jsx
import { useEffect, useState } from "react";
import { createProductInquiry, fetchProductInquiries } from "../api/productInquiries";
import { toErrorMessage } from "../api/http";

export default function InquirySection({ productId }) {
  const [data, setData] = useState(null); // Page<InquiryResponseDto>
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ content: "", secret: false });

  const load = async (p = 0) => {
    setErr("");
    try {
      const d = await fetchProductInquiries(productId, p, 10);
      setData(d);
    } catch (e) {
      setErr(toErrorMessage(e));
      setData(null);
    }
  };

  useEffect(() => { load(0); }, [productId]);

  const submit = async () => {
    if (!form.content.trim()) {
      setErr("문의 내용을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await createProductInquiry(productId, form);
      setForm({ content: "", secret: false });
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
      <h3>상품 문의</h3>
      {err && <div className="error">{err}</div>}

      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <textarea
          placeholder="문의 내용을 입력"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={3}
        />
        <div className="row" style={{ gap: 10, alignItems: "center" }}>
          <label className="row" style={{ gap: 6 }}>
            <input
              type="checkbox"
              checked={form.secret}
              onChange={(e) => setForm({ ...form, secret: e.target.checked })}
            />
            비밀글
          </label>
          <button disabled={busy} onClick={submit}>{busy ? "..." : "문의 등록"}</button>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {list.length === 0 ? (
          <div className="muted">아직 문의가 없어요.</div>
        ) : (
          list.map((q) => (
            <div key={q.inqId} className="panelMini">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="row" style={{ gap: 10, alignItems: "center" }}>
                  {q.answeredYn ? <span className="badge">ANSWERED</span> : <span className="badge">WAIT</span>}
                  <span className="badge" style={{ marginLeft: 8 }}>
                  {q.secret ? "SECRET" : "PUBLIC"}
                  </span>
                  <div className="muted" style={{ fontSize: 12 }}>{String(q.createdAt || "")}</div>
                </div>
              </div>

              <div style={{ marginTop: 6 }}>
                <b>Q.</b> {q.content}
              </div>

              <div style={{ marginTop: 8 }}>
                <b>A.</b>{" "}
                {q.answer ? <span>{q.answer}</span> : <span className="muted">아직 답변이 없습니다.</span>}
              </div>

              {q.answeredAt && (
                <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
                  answeredAt: {String(q.answeredAt)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {data && (
        <div className="row" style={{ gap: 8, marginTop: 12 }}>
          <button className="ghost" disabled={busy || (data.number ?? 0) <= 0} onClick={() => load((data.number ?? 0) - 1)}>이전</button>
          <div className="muted">page {(data.number ?? 0) + 1} / {data.totalPages ?? 1}</div>
          <button className="ghost" disabled={busy || (data.number ?? 0) + 1 >= (data.totalPages ?? 1)} onClick={() => load((data.number ?? 0) + 1)}>다음</button>
        </div>
      )}
    </div>
  );
}

