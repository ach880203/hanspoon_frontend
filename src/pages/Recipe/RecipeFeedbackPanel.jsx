import { useCallback, useEffect, useMemo, useState } from "react";
import { loadAuth } from "../../utils/authStorage";
import {
  answerRecipeInquiry,
  answerRecipeReview,
  createRecipeInquiry,
  createRecipeReview,
  deleteRecipeInquiry,
  deleteRecipeReview,
  getRecipeInquiries,
  getRecipeReviews,
  updateRecipeInquiry,
  updateRecipeReview,
} from "../../api/recipeApi";
import { toErrorMessage } from "../../api/http";
import "./RecipeFeedbackPanel.css";

const TAB = {
  REVIEW: "REVIEW",
  INQUIRY: "INQUIRY",
};

function resolveAuthUserId() {
  const auth = loadAuth();
  return auth?.userId ?? auth?.memberId ?? auth?.id ?? null;
}

function isAdminRole() {
  const auth = loadAuth();
  const merged = [
    auth?.role,
    ...(Array.isArray(auth?.roles) ? auth.roles : []),
    ...(Array.isArray(auth?.authorities) ? auth.authorities : []),
  ]
    .map((item) => String(item || "").toUpperCase())
    .join(" ");

  return merged.includes("ROLE_ADMIN") || merged.includes("ADMIN");
}

function formatDate(value) {
  if (!value) return "일시 정보 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("ko-KR");
}

function renderStars(rating) {
  const score = Math.max(1, Math.min(5, Number(rating || 0)));
  return "★".repeat(score) + "☆".repeat(5 - score);
}

export default function RecipeFeedbackPanel({ recipeId }) {
  const [activeTab, setActiveTab] = useState(TAB.REVIEW);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [reviews, setReviews] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  const [reviewForm, setReviewForm] = useState({ rating: 5, content: "" });
  const [inquiryForm, setInquiryForm] = useState({
    category: "일반",
    title: "",
    content: "",
    secret: false,
  });

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingInquiryId, setEditingInquiryId] = useState(null);
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, content: "" });
  const [editInquiryForm, setEditInquiryForm] = useState({ category: "일반", title: "", content: "", secret: false });

  const [answerDraftByReviewId, setAnswerDraftByReviewId] = useState({});
  const [answerDraftByInquiryId, setAnswerDraftByInquiryId] = useState({});

  const userId = useMemo(() => resolveAuthUserId(), []);
  const isAdmin = useMemo(() => isAdminRole(), []);

  const load = useCallback(async () => {
    if (!recipeId) return;
    setBusy(true);
    setError("");
    setMessage("");

    const [reviewRes, inquiryRes] = await Promise.allSettled([
      getRecipeReviews(recipeId),
      getRecipeInquiries(recipeId),
    ]);

    const messages = [];
    if (reviewRes.status === "fulfilled") {
      setReviews(Array.isArray(reviewRes.value) ? reviewRes.value : []);
    } else {
      setReviews([]);
      messages.push(`리뷰 조회 실패: ${toErrorMessage(reviewRes.reason)}`);
    }

    if (inquiryRes.status === "fulfilled") {
      setInquiries(Array.isArray(inquiryRes.value) ? inquiryRes.value : []);
    } else {
      setInquiries([]);
      messages.push(`문의 조회 실패: ${toErrorMessage(inquiryRes.reason)}`);
    }

    setError(messages.join("\n"));
    setBusy(false);
  }, [recipeId]);

  useEffect(() => {
    load();
  }, [load]);

  const submitReview = async () => {
    if (!userId) {
      setError("리뷰 작성은 로그인 후 이용할 수 있습니다.");
      return;
    }

    const content = String(reviewForm.content || "").trim();
    if (!content) {
      setError("리뷰 내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await createRecipeReview({
        recipeId: Number(recipeId),
        rating: Number(reviewForm.rating),
        content,
      });
      setReviewForm({ rating: 5, content: "" });
      setMessage("리뷰가 등록되었습니다.");
      await load();
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const startEditReview = (item) => {
    setEditingReviewId(item.reviewId);
    setEditReviewForm({
      rating: Number(item.rating || 5),
      content: item.content || "",
    });
  };

  const saveEditReview = async (reviewId) => {
    const content = String(editReviewForm.content || "").trim();
    if (!content) {
      setError("리뷰 내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await updateRecipeReview(reviewId, {
        rating: Number(editReviewForm.rating),
        content,
      });
      setEditingReviewId(null);
      setMessage("리뷰가 수정되었습니다.");
      await load();
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const removeReview = async (reviewId) => {
    if (!window.confirm("리뷰를 삭제할까요?")) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await deleteRecipeReview(reviewId);
      setMessage("리뷰가 삭제되었습니다.");
      await load();
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submitReviewAnswer = async (reviewId) => {
    const answerContent = String(answerDraftByReviewId[reviewId] || "").trim();
    if (!answerContent) {
      setError("리뷰 답글 내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await answerRecipeReview(reviewId, { answerContent });
      setMessage("리뷰 답글이 등록되었습니다.");
      setAnswerDraftByReviewId((prev) => ({ ...prev, [reviewId]: "" }));
      await load();
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submitInquiry = async () => {
    if (!userId) {
      setError("문의 작성은 로그인 후 이용할 수 있습니다.");
      return;
    }

    const title = String(inquiryForm.title || "").trim();
    const content = String(inquiryForm.content || "").trim();
    if (!title) {
      setError("문의 제목을 입력해 주세요.");
      return;
    }
    if (!content) {
      setError("문의 내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await createRecipeInquiry({
        recipeId: Number(recipeId),
        category: String(inquiryForm.category || "일반").trim() || "일반",
        title,
        content,
        secret: Boolean(inquiryForm.secret),
      });
      setInquiryForm({ category: "일반", title: "", content: "", secret: false });
      setMessage("문의가 등록되었습니다.");
      await load();
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const startEditInquiry = (item) => {
    setEditingInquiryId(item.inquiryId);
    setEditInquiryForm({
      category: item.category || "일반",
      title: item.title || "",
      content: item.content || "",
      secret: Boolean(item.secret),
    });
  };

  const saveEditInquiry = async (inquiryId) => {
    const title = String(editInquiryForm.title || "").trim();
    const content = String(editInquiryForm.content || "").trim();
    if (!title || !content) {
      setError("문의 제목과 내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await updateRecipeInquiry(inquiryId, {
        category: String(editInquiryForm.category || "일반").trim() || "일반",
        title,
        content,
        secret: Boolean(editInquiryForm.secret),
      });
      setEditingInquiryId(null);
      setMessage("문의가 수정되었습니다.");
      await load();
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const removeInquiry = async (inquiryId) => {
    if (!window.confirm("문의를 삭제할까요?")) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await deleteRecipeInquiry(inquiryId);
      setMessage("문의가 삭제되었습니다.");
      await load();
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submitInquiryAnswer = async (inquiryId) => {
    const answerContent = String(answerDraftByInquiryId[inquiryId] || "").trim();
    if (!answerContent) {
      setError("문의 답글 내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await answerRecipeInquiry(inquiryId, { answerContent });
      setMessage("문의 답글이 등록되었습니다.");
      setAnswerDraftByInquiryId((prev) => ({ ...prev, [inquiryId]: "" }));
      await load();
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="recipe-feedback">
      <div className="recipe-feedback-head">
        <h3>레시피 소통</h3>
        <div className="recipe-feedback-tabs">
          <button
            type="button"
            className={activeTab === TAB.REVIEW ? "feedback-tab active" : "feedback-tab"}
            onClick={() => setActiveTab(TAB.REVIEW)}
          >
            리뷰 ({reviews.length})
          </button>
          <button
            type="button"
            className={activeTab === TAB.INQUIRY ? "feedback-tab active" : "feedback-tab"}
            onClick={() => setActiveTab(TAB.INQUIRY)}
          >
            문의 ({inquiries.length})
          </button>
        </div>
      </div>

      {error ? <div className="feedback-alert error" style={{ whiteSpace: "pre-line" }}>{error}</div> : null}
      {message ? <div className="feedback-alert ok">{message}</div> : null}

      {activeTab === TAB.REVIEW ? (
        <div className="feedback-body">
          <article className="feedback-form-card">
            <h4>리뷰 작성</h4>
            <div className="feedback-form-row">
              <label>
                평점
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                >
                  {[5, 4, 3, 2, 1].map((score) => (
                    <option key={`recipe-review-score-${score}`} value={score}>
                      {score}점
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" disabled={busy} onClick={submitReview}>
                {busy ? "처리 중..." : "리뷰 등록"}
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="레시피가 어땠는지 자유롭게 남겨 주세요."
              value={reviewForm.content}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, content: e.target.value }))}
            />
          </article>

          <div className="feedback-list">
            {reviews.length === 0 ? <div className="feedback-empty">등록된 리뷰가 없습니다.</div> : null}
            {reviews.map((item) => {
              const mine = Number(item.userId) === Number(userId);
              const canAnswer = Boolean(item.canAnswer && isAdmin);
              const isEditing = Number(editingReviewId) === Number(item.reviewId);

              return (
                <article key={`recipe-review-${item.reviewId}`} className="feedback-card">
                  <div className="feedback-card-head">
                    <div>
                      <strong>{item.reviewerName || "이름 없음"}</strong>
                      <span>{renderStars(item.rating)}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <div>
                      {mine && !isEditing ? (
                        <>
                          <button type="button" onClick={() => startEditReview(item)}>수정</button>
                          <button type="button" onClick={() => removeReview(item.reviewId)}>삭제</button>
                        </>
                      ) : null}
                      {mine && isEditing ? (
                        <>
                          <button type="button" onClick={() => saveEditReview(item.reviewId)}>저장</button>
                          <button type="button" onClick={() => setEditingReviewId(null)}>취소</button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {!isEditing ? (
                    <p className="feedback-content">{item.content || "리뷰 내용이 없습니다."}</p>
                  ) : (
                    <div className="feedback-edit-box">
                      <select
                        value={editReviewForm.rating}
                        onChange={(e) => setEditReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                      >
                        {[5, 4, 3, 2, 1].map((score) => (
                          <option key={`recipe-edit-score-${score}`} value={score}>
                            {score}점
                          </option>
                        ))}
                      </select>
                      <textarea
                        rows={3}
                        value={editReviewForm.content}
                        onChange={(e) => setEditReviewForm((prev) => ({ ...prev, content: e.target.value }))}
                      />
                    </div>
                  )}

                  {item.answerContent ? (
                    <div className="feedback-answer">
                      <strong>관리자 답글</strong>
                      <p>{item.answerContent}</p>
                      {item.answeredAt ? <span>{formatDate(item.answeredAt)}</span> : null}
                    </div>
                  ) : null}

                  {canAnswer ? (
                    <div className="feedback-answer-editor">
                      <textarea
                        rows={3}
                        placeholder="리뷰 답글을 입력해 주세요."
                        value={answerDraftByReviewId[item.reviewId] ?? ""}
                        onChange={(e) =>
                          setAnswerDraftByReviewId((prev) => ({ ...prev, [item.reviewId]: e.target.value }))
                        }
                      />
                      <button type="button" disabled={busy} onClick={() => submitReviewAnswer(item.reviewId)}>
                        답글 저장
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="feedback-body">
          <article className="feedback-form-card">
            <h4>문의 작성</h4>
            <div className="feedback-form-row">
              <label>
                분류
                <input
                  type="text"
                  value={inquiryForm.category}
                  onChange={(e) => setInquiryForm((prev) => ({ ...prev, category: e.target.value }))}
                />
              </label>
              <label className="feedback-secret-check">
                <input
                  type="checkbox"
                  checked={inquiryForm.secret}
                  onChange={(e) => setInquiryForm((prev) => ({ ...prev, secret: e.target.checked }))}
                />
                비밀글
              </label>
            </div>
            <input
              type="text"
              placeholder="문의 제목"
              value={inquiryForm.title}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              rows={4}
              placeholder="문의 내용을 입력해 주세요."
              value={inquiryForm.content}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, content: e.target.value }))}
            />
            <button type="button" disabled={busy} onClick={submitInquiry}>
              {busy ? "처리 중..." : "문의 등록"}
            </button>
          </article>

          <div className="feedback-list">
            {inquiries.length === 0 ? <div className="feedback-empty">등록된 문의가 없습니다.</div> : null}
            {inquiries.map((item) => {
              const mine = Number(item.userId) === Number(userId);
              const canAnswer = Boolean(item.canAnswer && isAdmin);
              const isEditing = Number(editingInquiryId) === Number(item.inquiryId);

              return (
                <article key={`recipe-inquiry-${item.inquiryId}`} className="feedback-card">
                  <div className="feedback-card-head">
                    <div>
                      <strong>{item.writerName || "이름 없음"}</strong>
                      <span>{item.secret ? "비밀글" : "공개글"}</span>
                      <span>{item.answered ? "답변 완료" : "답변 대기"}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <div>
                      {mine && !isEditing ? (
                        <>
                          <button type="button" onClick={() => startEditInquiry(item)}>수정</button>
                          <button type="button" onClick={() => removeInquiry(item.inquiryId)}>삭제</button>
                        </>
                      ) : null}
                      {mine && isEditing ? (
                        <>
                          <button type="button" onClick={() => saveEditInquiry(item.inquiryId)}>저장</button>
                          <button type="button" onClick={() => setEditingInquiryId(null)}>취소</button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {!isEditing ? (
                    <div className="feedback-inquiry-content">
                      <div className="feedback-inquiry-meta">[{item.category || "일반"}] {item.title || "제목 없음"}</div>
                      <p className="feedback-content">{item.content || "문의 내용이 없습니다."}</p>
                    </div>
                  ) : (
                    <div className="feedback-edit-box">
                      <input
                        type="text"
                        value={editInquiryForm.category}
                        onChange={(e) => setEditInquiryForm((prev) => ({ ...prev, category: e.target.value }))}
                        placeholder="분류"
                      />
                      <input
                        type="text"
                        value={editInquiryForm.title}
                        onChange={(e) => setEditInquiryForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="제목"
                      />
                      <textarea
                        rows={3}
                        value={editInquiryForm.content}
                        onChange={(e) => setEditInquiryForm((prev) => ({ ...prev, content: e.target.value }))}
                      />
                      <label className="feedback-secret-check">
                        <input
                          type="checkbox"
                          checked={Boolean(editInquiryForm.secret)}
                          onChange={(e) => setEditInquiryForm((prev) => ({ ...prev, secret: e.target.checked }))}
                        />
                        비밀글로 설정
                      </label>
                    </div>
                  )}

                  <div className="feedback-answer">
                    <strong>답글</strong>
                    <p>{item.answerContent ? item.answerContent : "아직 답글이 등록되지 않았습니다."}</p>
                    {item.answeredAt ? <span>{formatDate(item.answeredAt)}</span> : null}
                  </div>

                  {canAnswer ? (
                    <div className="feedback-answer-editor">
                      <textarea
                        rows={3}
                        placeholder="문의 답글을 입력해 주세요."
                        value={answerDraftByInquiryId[item.inquiryId] ?? ""}
                        onChange={(e) =>
                          setAnswerDraftByInquiryId((prev) => ({ ...prev, [item.inquiryId]: e.target.value }))
                        }
                      />
                      <button type="button" disabled={busy} onClick={() => submitInquiryAnswer(item.inquiryId)}>
                        답글 저장
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
