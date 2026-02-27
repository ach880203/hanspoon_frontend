import { useCallback, useEffect, useMemo, useState } from "react";
import {
  answerRecipeInquiry,
  answerRecipeReview,
  fetchAdminRecipeInquiries,
  fetchAdminRecipeReviews,
} from "../../api/recipeApi";
import { toErrorMessage } from "../../api/http";
import "./AdminRecipeFeedbackHub.css";

const FEEDBACK_TAB = {
  INQUIRY: "INQUIRY",
  REVIEW: "REVIEW",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("ko-KR");
}

function renderStars(value) {
  const score = Math.max(1, Math.min(5, Number(value || 0)));
  return "★".repeat(score) + "☆".repeat(5 - score);
}

export default function AdminRecipeFeedbackHub() {
  const [activeTab, setActiveTab] = useState(FEEDBACK_TAB.INQUIRY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");

  const [inquiries, setInquiries] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [answerDraftByInquiryId, setAnswerDraftByInquiryId] = useState({});
  const [answerDraftByReviewId, setAnswerDraftByReviewId] = useState({});
  const [savingInquiryId, setSavingInquiryId] = useState(null);
  const [savingReviewId, setSavingReviewId] = useState(null);
  const [openInquiryId, setOpenInquiryId] = useState(null);
  const [openReviewId, setOpenReviewId] = useState(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminRecipeInquiries();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(`레시피 문의 조회 실패: ${toErrorMessage(e)}`);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminRecipeReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(`레시피 리뷰 조회 실패: ${toErrorMessage(e)}`);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === FEEDBACK_TAB.INQUIRY) {
      loadInquiries();
    } else {
      loadReviews();
    }
  }, [activeTab, loadInquiries, loadReviews]);

  const filteredInquiries = useMemo(() => {
    const term = String(keyword || "").trim().toLowerCase();
    if (!term) return inquiries;
    return inquiries.filter((item) => {
      const text = [
        item?.inquiryId,
        item?.recipeId,
        item?.writerName,
        item?.category,
        item?.title,
        item?.content,
      ]
        .map((x) => String(x || "").toLowerCase())
        .join(" ");
      return text.includes(term);
    });
  }, [inquiries, keyword]);

  const filteredReviews = useMemo(() => {
    const term = String(keyword || "").trim().toLowerCase();
    if (!term) return reviews;
    return reviews.filter((item) => {
      const text = [
        item?.reviewId,
        item?.recipeId,
        item?.reviewerName,
        item?.content,
      ]
        .map((x) => String(x || "").toLowerCase())
        .join(" ");
      return text.includes(term);
    });
  }, [reviews, keyword]);

  const submitInquiryAnswer = async (inquiryId) => {
    const answerContent = String(answerDraftByInquiryId[inquiryId] || "").trim();
    if (!answerContent) {
      setError("문의 답글 내용을 입력해 주세요.");
      return;
    }

    setSavingInquiryId(inquiryId);
    setError("");
    setMessage("");
    try {
      await answerRecipeInquiry(inquiryId, { answerContent });
      setMessage("문의 답글이 저장되었습니다.");
      setOpenInquiryId(null);
      setAnswerDraftByInquiryId((prev) => ({ ...prev, [inquiryId]: "" }));
      await loadInquiries();
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setSavingInquiryId(null);
    }
  };

  const submitReviewAnswer = async (reviewId) => {
    const answerContent = String(answerDraftByReviewId[reviewId] || "").trim();
    if (!answerContent) {
      setError("리뷰 답글 내용을 입력해 주세요.");
      return;
    }

    setSavingReviewId(reviewId);
    setError("");
    setMessage("");
    try {
      await answerRecipeReview(reviewId, { answerContent });
      setMessage("리뷰 답글이 저장되었습니다.");
      setOpenReviewId(null);
      setAnswerDraftByReviewId((prev) => ({ ...prev, [reviewId]: "" }));
      await loadReviews();
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setSavingReviewId(null);
    }
  };

  return (
    <section className="admin-recipe-feedback">
      <div className="admin-recipe-feedback-head">
        <h3>레시피 문의/리뷰 관리</h3>
        <div className="admin-recipe-feedback-tabs">
          <button
            type="button"
            className={activeTab === FEEDBACK_TAB.INQUIRY ? "admin-tab-btn active" : "admin-tab-btn"}
            onClick={() => setActiveTab(FEEDBACK_TAB.INQUIRY)}
          >
            문의 관리
          </button>
          <button
            type="button"
            className={activeTab === FEEDBACK_TAB.REVIEW ? "admin-tab-btn active" : "admin-tab-btn"}
            onClick={() => setActiveTab(FEEDBACK_TAB.REVIEW)}
          >
            리뷰 관리
          </button>
        </div>
      </div>

      <div className="admin-recipe-feedback-controls">
        <input
          className="admin-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="작성자, 내용, ID로 검색"
        />
        <button
          type="button"
          className="admin-btn-search"
          onClick={() => (activeTab === FEEDBACK_TAB.INQUIRY ? loadInquiries() : loadReviews())}
          disabled={loading}
        >
          {loading ? "조회 중..." : "새로고침"}
        </button>
      </div>

      {error ? <div className="admin-recipe-feedback-msg error">{error}</div> : null}
      {message ? <div className="admin-recipe-feedback-msg ok">{message}</div> : null}

      {activeTab === FEEDBACK_TAB.INQUIRY ? (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>상태</th>
                <th>문의 ID</th>
                <th>레시피 ID</th>
                <th>작성자</th>
                <th>제목</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="admin-recipe-feedback-empty">레시피 문의가 없습니다.</td>
                </tr>
              ) : (
                filteredInquiries.map((item) => {
                  const inquiryId = Number(item?.inquiryId || 0);
                  const answered = Boolean(item?.answered);
                  return (
                    <FragmentRow key={`admin-recipe-inquiry-${inquiryId}`}>
                      <tr>
                        <td>
                          <span className={`admin-badge ${answered ? "badge-active" : "badge-ready"}`}>
                            {answered ? "답변 완료" : "답변 대기"}
                          </span>
                        </td>
                        <td>{inquiryId || "-"}</td>
                        <td>{item?.recipeId ?? "-"}</td>
                        <td>{item?.writerName || "이름 없음"}</td>
                        <td className="admin-recipe-feedback-ellipsis" title={item?.title || ""}>
                          [{item?.category || "일반"}] {item?.title || "-"}
                        </td>
                        <td>{formatDate(item?.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn-sm"
                            onClick={() => {
                              setOpenInquiryId((prev) => (prev === inquiryId ? null : inquiryId));
                              setAnswerDraftByInquiryId((prev) => {
                                if (typeof prev[inquiryId] === "string") return prev;
                                return { ...prev, [inquiryId]: String(item?.answerContent || "") };
                              });
                            }}
                          >
                            {answered ? "답글 수정" : "답글 등록"}
                          </button>
                        </td>
                      </tr>
                      {openInquiryId === inquiryId ? (
                        <tr className="admin-recipe-feedback-answer-row">
                          <td colSpan="7">
                            <div className="admin-recipe-feedback-answer-box">
                              <div>
                                <strong>문의 내용</strong>
                                <p>{item?.content || "-"}</p>
                              </div>
                              {answered ? (
                                <div>
                                  <strong>기존 답글</strong>
                                  <p>{item?.answerContent || "-"}</p>
                                </div>
                              ) : null}
                              <div>
                                <strong>답글 작성</strong>
                                <textarea
                                  className="admin-input"
                                  rows={4}
                                  value={answerDraftByInquiryId[inquiryId] ?? ""}
                                  onChange={(e) =>
                                    setAnswerDraftByInquiryId((prev) => ({ ...prev, [inquiryId]: e.target.value }))
                                  }
                                  placeholder="문의 답글을 입력해 주세요."
                                />
                              </div>
                              <div className="admin-recipe-feedback-answer-actions">
                                <button
                                  type="button"
                                  className="admin-btn-search"
                                  onClick={() => submitInquiryAnswer(inquiryId)}
                                  disabled={savingInquiryId === inquiryId}
                                >
                                  {savingInquiryId === inquiryId ? "저장 중..." : "답글 저장"}
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
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>상태</th>
                <th>리뷰 ID</th>
                <th>레시피 ID</th>
                <th>작성자</th>
                <th>평점</th>
                <th>내용</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="8" className="admin-recipe-feedback-empty">레시피 리뷰가 없습니다.</td>
                </tr>
              ) : (
                filteredReviews.map((item) => {
                  const reviewId = Number(item?.reviewId || 0);
                  const answered = Boolean(item?.answerContent);
                  return (
                    <FragmentRow key={`admin-recipe-review-${reviewId}`}>
                      <tr>
                        <td>
                          <span className={`admin-badge ${answered ? "badge-active" : "badge-ready"}`}>
                            {answered ? "답글 완료" : "답글 대기"}
                          </span>
                        </td>
                        <td>{reviewId || "-"}</td>
                        <td>{item?.recipeId ?? "-"}</td>
                        <td>{item?.reviewerName || "이름 없음"}</td>
                        <td>{renderStars(item?.rating)} ({item?.rating ?? 0}점)</td>
                        <td className="admin-recipe-feedback-ellipsis" title={item?.content || ""}>
                          {item?.content || "-"}
                        </td>
                        <td>{formatDate(item?.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn-sm"
                            onClick={() => {
                              setOpenReviewId((prev) => (prev === reviewId ? null : reviewId));
                              setAnswerDraftByReviewId((prev) => {
                                if (typeof prev[reviewId] === "string") return prev;
                                return { ...prev, [reviewId]: String(item?.answerContent || "") };
                              });
                            }}
                          >
                            {answered ? "답글 수정" : "답글 등록"}
                          </button>
                        </td>
                      </tr>
                      {openReviewId === reviewId ? (
                        <tr className="admin-recipe-feedback-answer-row">
                          <td colSpan="8">
                            <div className="admin-recipe-feedback-answer-box">
                              <div>
                                <strong>리뷰 내용</strong>
                                <p>{item?.content || "-"}</p>
                              </div>
                              {answered ? (
                                <div>
                                  <strong>기존 답글</strong>
                                  <p>{item?.answerContent || "-"}</p>
                                </div>
                              ) : null}
                              <div>
                                <strong>답글 작성</strong>
                                <textarea
                                  className="admin-input"
                                  rows={4}
                                  value={answerDraftByReviewId[reviewId] ?? ""}
                                  onChange={(e) =>
                                    setAnswerDraftByReviewId((prev) => ({ ...prev, [reviewId]: e.target.value }))
                                  }
                                  placeholder="리뷰 답글을 입력해 주세요."
                                />
                              </div>
                              <div className="admin-recipe-feedback-answer-actions">
                                <button
                                  type="button"
                                  className="admin-btn-search"
                                  onClick={() => submitReviewAnswer(reviewId)}
                                  disabled={savingReviewId === reviewId}
                                >
                                  {savingReviewId === reviewId ? "저장 중..." : "답글 저장"}
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
      )}
    </section>
  );
}

function FragmentRow({ children }) {
  return <>{children}</>;
}
