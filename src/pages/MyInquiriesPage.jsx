// src/pages/MyInquiriesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteMyInquiry, fetchMyInquiries, updateMyInquiry } from "../api/productInquiries";
import { toErrorMessage } from "../api/http";

export default function MyInquiriesPage() {
  const nav = useNavigate();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ content: "", secret: false });

  const load = async (p = 0) => {
    setErr("");
    try {
      const d = await fetchMyInquiries(p, 10);
      setData(d);
      setPage(d?.number ?? p);
    } catch (e) {
      setErr(toErrorMessage(e));
      setData(null);
    }
  };

  useEffect(() => { load(0); /* eslint-disable-next-line */ }, []);

  const startEdit = (q) => {
    setEditingId(q.inqId);
    // ⚠️ InquiryResponseDto에 secret이 없으면 false로만 편집되게 처리
    setEditForm({
      content: q.content ?? "",
      secret: Boolean(q.secret),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ content: "", secret: false });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editForm.content.trim()) {
      setErr("내용을 입력해줘.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await updateMyInquiry(editingId, editForm);
      cancelEdit();
      await load(page);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (inqId) => {
    if (!window.confirm("문의를 삭제할까?")) return;
    setBusy(true);
    setErr("");
    try {
      await deleteMyInquiry(inqId);
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
      <h1>My Inquiries</h1>
      {err && <div className="error">{err}</div>}

      <div className="panel">
        {list.length === 0 ? (
          <div className="muted">내 문의가 없습니다.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map((q) => {
              const isEditing = editingId === q.inqId;

              return (
                <div key={q.inqId} className="panelMini">
                  <div className="row" style={{ justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <div className="row" style={{ gap: 10, alignItems: "center" }}>
                      {q.answeredYn ? <span className="badge">ANSWERED</span> : <span className="badge">WAIT</span>}
                      <span className="badge" style={{ marginLeft: 8 }}>
                      {q.secret ? "SECRET" : "PUBLIC"}
                      </span>
                      <div className="muted" style={{ fontSize: 12 }}>{String(q.createdAt || "")}</div>

                      <button className="ghost" onClick={() => nav(`/products/${q.productId}`)}>
                        상품 보기
                      </button>
                    </div>

                    <div className="row" style={{ gap: 8 }}>
                      {!isEditing ? (
                        <>
                          <button className="ghost" disabled={busy} onClick={() => startEdit(q)}>수정</button>
                          <button className="danger" disabled={busy} onClick={() => remove(q.inqId)}>삭제</button>
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
                    <>
                      <div style={{ marginTop: 8 }}>
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
                    </>
                  ) : (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                      <textarea
                        rows={3}
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      />
                      {/* DTO에 secret이 없어서 UI는 “요청 DTO에 맞춰”만 제공 */}
                      <label className="row" style={{ gap: 6 }}>
                        <input
                          type="checkbox"
                          checked={editForm.secret}
                          onChange={(e) => setEditForm({ ...editForm, secret: e.target.checked })}
                        />
                        비밀글
                      </label>
                      <div className="muted" style={{ fontSize: 12 }}>
                        (DTO에 secret이 내려오지 않으면, 수정 화면에서는 기본값 false로 보입니다)
                      </div>
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
