import { useCallback, useEffect, useMemo, useState } from "react";
import {
  answerAdminProductInquiry,
  fetchAdminProductInquiries,
} from "../../api/adminProductApi";

function toDateText(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("ko-KR");
}

export default function AdminProductInquiryManager() {
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [openInquiryId, setOpenInquiryId] = useState(null);
  const [answerDraftById, setAnswerDraftById] = useState({});

  const load = useCallback(async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAdminProductInquiries(targetPage, 20);
      const content = Array.isArray(res?.content) ? res.content : [];
      setItems(content);
      setPage(Number(res?.number || 0));
      setTotalPages(Math.max(1, Number(res?.totalPages || 1)));
    } catch (e) {
      setError(e?.message || "상품 문의 목록을 불러오지 못했습니다.");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load(0);
  }, [load]);

  const filtered = useMemo(() => {
    const term = String(keyword || "").trim().toLowerCase();
    return items.filter((item) => {
      const answered = Boolean(item?.answeredYn);
      if (statusFilter === "WAIT" && answered) return false;
      if (statusFilter === "DONE" && !answered) return false;

      if (!term) return true;
      const text = [
        item?.inqId,
        item?.productId,
        item?.userId,
        item?.content,
        item?.answer,
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");
      return text.includes(term);
    });
  }, [items, keyword, statusFilter]);

  const submitAnswer = async (inqId) => {
    const answer = String(answerDraftById[inqId] || "").trim();
    if (!answer) {
      setError("답변 내용을 입력해 주세요.");
      return;
    }
    setSavingId(inqId);
    setError("");
    setMessage("");
    try {
      await answerAdminProductInquiry(inqId, answer);
      setMessage("문의 답변이 저장되었습니다.");
      setOpenInquiryId(null);
      await load(page);
    } catch (e) {
      setError(e?.message || "문의 답변 저장에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="admin-class-panel">
      <div className="admin-class-panel-head">
        <h3>상품 문의 관리</h3>
        <div className="admin-class-panel-actions">
          <input
            className="admin-input"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setKeyword(keywordInput.trim());
            }}
            placeholder="작성자/내용/ID 검색"
          />
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">전체 상태</option>
            <option value="WAIT">답변 대기</option>
            <option value="DONE">답변 완료</option>
          </select>
          <button type="button" className="admin-btn-search" onClick={() => setKeyword(keywordInput.trim())}>
            검색
          </button>
          <button type="button" className="admin-btn-search" onClick={() => load(page)} disabled={loading}>
            {loading ? "조회 중..." : "새로고침"}
          </button>
        </div>
      </div>

      {error ? <div className="admin-class-msg admin-class-msg-error">{error}</div> : null}
      {message ? <div className="admin-class-msg admin-class-msg-ok">{message}</div> : null}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>상태</th>
              <th>문의 ID</th>
              <th>상품 ID</th>
              <th>작성자</th>
              <th>내용</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-class-empty-row">
                  문의 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const inqId = Number(item?.inqId || 0);
                const answered = Boolean(item?.answeredYn);
                return (
                  <FragmentRow key={`product-inquiry-${inqId}`}>
                    <tr>
                      <td>
                        <span className={`admin-badge ${answered ? "badge-active" : "badge-ready"}`}>
                          {answered ? "답변 완료" : "답변 대기"}
                        </span>
                      </td>
                      <td>{inqId || "-"}</td>
                      <td>{item?.productId ?? "-"}</td>
                      <td>{item?.userId ?? "-"}</td>
                      <td className="admin-class-ellipsis" title={item?.content || ""}>
                        {item?.content || "-"}
                      </td>
                      <td>{toDateText(item?.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn-sm"
                          onClick={() => {
                            setOpenInquiryId((prev) => (prev === inqId ? null : inqId));
                            setAnswerDraftById((prev) => {
                              if (typeof prev[inqId] === "string") return prev;
                              return { ...prev, [inqId]: String(item?.answer || "") };
                            });
                          }}
                        >
                          {answered ? "답변 수정" : "답변 등록"}
                        </button>
                      </td>
                    </tr>
                    {openInquiryId === inqId ? (
                      <tr className="admin-class-answer-row">
                        <td colSpan="7">
                          <div className="admin-class-answer-box">
                            <div>
                              <strong>문의 내용</strong>
                              <p>{item?.content || "-"}</p>
                            </div>
                            {answered ? (
                              <div>
                                <strong>기존 답변</strong>
                                <p>{item?.answer || "-"}</p>
                              </div>
                            ) : null}
                            <div>
                              <strong>답변 작성</strong>
                              <textarea
                                className="admin-input"
                                rows={4}
                                value={answerDraftById[inqId] ?? ""}
                                onChange={(e) =>
                                  setAnswerDraftById((prev) => ({ ...prev, [inqId]: e.target.value }))
                                }
                              />
                            </div>
                            <div className="admin-class-answer-actions">
                              <button
                                type="button"
                                className="admin-btn-search"
                                onClick={() => submitAnswer(inqId)}
                                disabled={savingId === inqId}
                              >
                                {savingId === inqId ? "저장 중..." : "답변 저장"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </FragmentRow>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="class-list-pagination">
        <button
          type="button"
          className="btn-ghost"
          disabled={page <= 0 || loading}
          onClick={() => load(Math.max(page - 1, 0))}
        >
          이전
        </button>
        <span>
          {page + 1} / {totalPages} 페이지
        </span>
        <button
          type="button"
          className="btn-ghost"
          disabled={page >= totalPages - 1 || loading}
          onClick={() => load(Math.min(page + 1, totalPages - 1))}
        >
          다음
        </button>
      </div>
    </section>
  );
}

function FragmentRow({ children }) {
  return <>{children}</>;
}
