import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { loadAuth } from "../../utils/authStorage";
import {
  answerOneDayReview,
  createOneDayHold,
  createOneDayReview,
  deleteOneDayReview,
  getMyOneDayReservations,
  getMyOneDayWishes,
  getOneDayClassDetail,
  getOneDayClassReviews,
  getOneDayClassSessions,
  isOneDayAdmin,
  isSessionCompleted,
  resolveOneDayUserId,
  toggleOneDayWish,
} from "../../api/onedayApi";

import { toCategoryLabel, toLevelLabel, toRunTypeLabel, toSlotLabel } from "./onedayLabels";

export const OneDayClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserId = Number(resolveOneDayUserId() ?? 0);
  const admin = isOneDayAdmin();

  const [detail, setDetail] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [myCompletedReservations, setMyCompletedReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reservingSessionId, setReservingSessionId] = useState(null);
  // 같은 세션에서 어떤 동작(홀딩/바로결제)을 실행 중인지 UI에 표시하기 위한 상태입니다.
  // 예: 홀딩 버튼 클릭 시 "홀딩중...", 바로결제 클릭 시 "결제 이동중..."으로 문구를 분리합니다.
  const [reservingAction, setReservingAction] = useState(null); // "hold" | "pay" | null
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [answeringReviewId, setAnsweringReviewId] = useState(null);
  const [answerDraftByReviewId, setAnswerDraftByReviewId] = useState({});
  const [openAnswerReviewId, setOpenAnswerReviewId] = useState(null);
  const [selectedReservationId, setSelectedReservationId] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: "" });
  const [isWished, setIsWished] = useState(false);
  const buildBuyerState = () => {
    // 결제 페이지 입력칸 자동 채움을 위해 로그인 사용자 스냅샷을 state로 전달합니다.
    // phone은 저장 구조가 환경마다 다를 수 있어 후보 키를 함께 확인합니다.
    const auth = loadAuth() || {};
    return {
      buyerName: String(auth.userName || ""),
      buyerEmail: String(auth.email || ""),
      buyerTel: String(auth.phone || auth.userPhone || auth.tel || ""),
    };
  };

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [detailData, sessionsData, reviewData, myCompletedData, myWishData] = await Promise.all([
        getOneDayClassDetail(classId),
        getOneDayClassSessions(classId),
        getOneDayClassReviews(classId),
        getMyOneDayReservations({ status: "COMPLETED", page: 0, size: 200 }),
        getMyOneDayWishes().catch(() => []),
      ]);

      const completedList = Array.isArray(myCompletedData?.content) ? myCompletedData.content : [];
      const completedForThisClass = completedList.filter((x) => Number(x.classId) === Number(classId));

      setDetail(detailData);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setReviews(Array.isArray(reviewData) ? reviewData : []);
      setMyCompletedReservations(completedForThisClass);
      const wishes = Array.isArray(myWishData) ? myWishData : [];
      setIsWished(wishes.some((wish) => Number(wish.classProductId) === Number(classId)));

      const preferredReservationId = location.state?.fromReservationId;
      if (
        preferredReservationId &&
        completedForThisClass.some((x) => Number(x.reservationId) === Number(preferredReservationId))
      ) {
        setSelectedReservationId(String(preferredReservationId));
      } else if (completedForThisClass.length > 0) {
        setSelectedReservationId((prev) => prev || String(completedForThisClass[0].reservationId));
      }
    } catch (e) {
      setError(e?.message ?? "상세 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [classId, location.state]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);
  const reviewedReservationIds = useMemo(
    () => new Set(reviews.map((review) => Number(review.reservationId)).filter(Boolean)),
    [reviews]
  );

  const reviewableReservations = useMemo(
    () =>
      myCompletedReservations.filter(
        (reservation) => !reviewedReservationIds.has(Number(reservation.reservationId))
      ),
    [myCompletedReservations, reviewedReservationIds]
  );

  useEffect(() => {
    if (reviewableReservations.length > 0 && !selectedReservationId) {
      setSelectedReservationId(String(reviewableReservations[0].reservationId));
    }
  }, [reviewableReservations, selectedReservationId]);

  const handleHoldOnly = async (sessionId) => {
    setError("");
    setMessage("");
    setReservingSessionId(sessionId);
    setReservingAction("hold");
    try {
      const hold = await createOneDayHold(sessionId);
      const reservationId = Number(hold?.id);
      if (!reservationId) {
        throw new Error("예약 ID를 받지 못했습니다.");
      }

      // 핵심 요구사항:
      // "예약 홀딩" 버튼은 결제 화면으로 가지 않고, HOLD 상태 예약만 만든 뒤
      // 사용자가 바로 확인할 수 있도록 내 예약 페이지(선택된 예약 강조)로 이동합니다.
      navigate(`/classes/oneday/reservations?status=HOLD&selectedId=${reservationId}`);
    } catch (e) {
      setError(e?.message ?? "예약 홀딩 실패");
    } finally {
      setReservingSessionId(null);
      setReservingAction(null);
    }
  };

  const handleDirectPayment = async (sessionId, sessionPrice) => {
    setError("");
    setMessage("");
    setReservingSessionId(sessionId);
    setReservingAction("pay");
    try {

      // 핵심 요구사항:
      // "바로 결제" 버튼은 기존과 동일하게 HOLD를 먼저 생성한 다음 결제 페이지로 이동합니다.
      // HOLD 선점 없이 결제부터 진행하면 동시성 상황에서 좌석 보장이 어렵기 때문입니다.
      // 1. 홀드 생성 (예약 선점)
      const hold = await createOneDayHold(sessionId);
      const reservationId = Number(hold?.id);
      if (!reservationId) {
        throw new Error("예약 ID를 받지 못했습니다.");
      }

      // 2. 결제 화면으로 이동
      navigate("/payment", {
        state: {
          reservationId,
          classId: Number(sessionId), // 백엔드 검증을 위해 세션 ID 전달
          itemName: detail.title || "원데이 클래스",
          amount: sessionPrice,
          ...buildBuyerState(),
        },
      });
    } catch (e) {
      setError(e?.message ?? "예약 처리 실패");
    } finally {
      setReservingSessionId(null);
      setReservingAction(null);
    }
  };

  const handleWishToggle = async () => {
    setError("");
    setMessage("");
    try {
      const data = await toggleOneDayWish(Number(classId));
      const wished = Boolean(data?.wished);
      setIsWished(wished);
      setMessage(wished ? "찜에 추가했습니다." : "찜에서 제거했습니다.");
    } catch (e) {
      setError(e?.message ?? "찜 처리에 실패했습니다.");
    }
  };

  const handleCreateReview = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmittingReview(true);

    try {
      const reservationId = Number(selectedReservationId);
      const rating = Number(reviewForm.rating);
      const content = reviewForm.content.trim();

      if (!reservationId) throw new Error("완료된 예약을 선택해 주세요.");
      if (!rating || rating < 1 || rating > 5) throw new Error("별점은 1점~5점 사이여야 합니다.");
      if (!content) throw new Error("리뷰 내용을 입력해 주세요.");

      await createOneDayReview({ reservationId, rating, content });
      setReviewForm({ rating: 5, content: "" });
      setMessage("리뷰가 등록되었습니다.");
      await loadPage();
    } catch (e) {
      setError(e?.message ?? "리뷰 등록에 실패했습니다.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingReviewId(reviewId);

    try {
      // 초보자 참고:
      // 이 API는 실제 행을 지우지 않고 delFlag=true + deletedAt=현재시각으로 갱신합니다.
      // 즉, 화면에서는 사라지지만 DB에는 삭제 이력이 남아서 감사/복구 분석이 가능합니다.
      await deleteOneDayReview(reviewId);
      setMessage("리뷰가 삭제되었습니다.");
      await loadPage();
    } catch (e) {
      setError(e?.message ?? "리뷰 삭제에 실패했습니다.");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleAnswerReview = async (reviewId) => {
    setError("");
    setMessage("");

    // 초보자 참고:
    // 답글 입력값은 reviewId별로 따로 저장합니다.
    // 여러 리뷰 카드가 동시에 있어도 입력이 섞이지 않게 하기 위함입니다.
    const answerContent = String(answerDraftByReviewId[reviewId] || "").trim();
    if (!answerContent) {
      setError("답글 내용을 입력해 주세요.");
      return;
    }

    setAnsweringReviewId(reviewId);
    try {
      await answerOneDayReview(reviewId, { answerContent });
      setMessage("리뷰 답글이 등록되었습니다.");
      setAnswerDraftByReviewId((prev) => ({ ...prev, [reviewId]: "" }));
      setOpenAnswerReviewId(null);
      await loadPage();
    } catch (e) {
      setError(e?.message ?? "리뷰 답글 등록에 실패했습니다.");
    } finally {
      setAnsweringReviewId(null);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>불러오는 중...</div>;
  if (error && !detail) return <div style={{ padding: 20, color: "#b91c1c" }}>{error}</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto", display: "grid", gap: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Link to="/classes/oneday/classes" style={btnGhost}>
          목록으로
        </Link>
        <button
          style={btnGhostButton}
          onClick={() => navigate(`/classes/oneday/inquiry?classId=${Number(classId) || ""}`)}
        >
          문의하기
        </button>
      </div>

      {error && <div style={errorBox}>{error}</div>}
      {message && <div style={okBox}>{message}</div>}

      <section style={panel}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>{detail?.title}</h1>
          <button
            type="button"
            style={heartBtn}
            onClick={handleWishToggle}
            aria-label="찜 토글"
            title={isWished ? "찜 해제" : "찜 추가"}
          >
            {isWished ? "♥" : "♡"}
          </button>
        </div>
        <p style={{ color: "#4b5563" }}>{detail?.description || "설명이 없습니다."}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={chip}>{detail?.levelLabel ?? toLevelLabel(detail?.level)}</span>
          <span style={chip}>{detail?.categoryLabel ?? toCategoryLabel(detail?.category)}</span>
          <span style={chip}>{detail?.runTypeLabel ?? toRunTypeLabel(detail?.runType)}</span>
          <span style={chip}>강사 #{detail?.instructorId ?? "-"}</span>
        </div>
      </section>

      <section style={panel}>
        <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>세션</h2>

        {sessions.length === 0 ? (
          <div style={{ color: "#6b7280" }}>조건에 맞는 세션이 없습니다.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {sessions.map((session) => {
              const startAt = session.startAt;
              const remainingSeats =
                session.remainingSeats ?? Math.max((session.capacity ?? 0) - (session.reservedCount ?? 0), 0);
              const sessionId = session.id ?? session.sessionId;
              const completed = Boolean(session.completed) || isSessionCompleted(startAt);
              const full = Boolean(session.full) || remainingSeats <= 0;

              return (
                <div key={sessionId} style={card}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <strong>
                      {fmtDate(startAt)} ({session.slotLabel ?? toSlotLabel(session.slot)})
                    </strong>
                    <span style={{ color: "#4b5563", fontSize: 13 }}>
                      정원 {session.capacity} / 예약 {session.reservedCount} / 잔여 {remainingSeats}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={chip}>{Number(session.price ?? 0).toLocaleString("ko-KR")}원</span>
                    {completed ? <span style={doneBadge}>종료</span> : null}
                    {!completed && full ? <span style={closedBadge}>정원 마감</span> : null}
                    <button
                      style={btnGhostButton}
                      onClick={() => handleHoldOnly(sessionId)}
                      disabled={reservingSessionId === sessionId || completed || full}
                    >
                      {reservingSessionId === sessionId && reservingAction === "hold"
                        ? "홀딩중..."
                        : completed
                        ? "종료"
                        : full
                        ? "정원 마감"
                        : "예약 홀딩"}
                    </button>
                    <button
                      style={btnPrimary}
                      onClick={() => handleDirectPayment(sessionId, session.price)}
                      disabled={reservingSessionId === sessionId || completed || full}
                    >
                      {reservingSessionId === sessionId && reservingAction === "pay"
                        ? "결제 이동중..."
                        : completed
                        ? "종료"
                        : full
                        ? "정원 마감"
                        : "바로 결제"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={panel}>
        <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>리뷰 작성</h2>
        <form style={{ display: "grid", gap: 8 }} onSubmit={handleCreateReview}>
          <select style={input} value={selectedReservationId} onChange={(e) => setSelectedReservationId(e.target.value)}>
            <option value="">완료된 내 예약 선택</option>
            {reviewableReservations.map((reservation) => (
              <option key={reservation.reservationId} value={reservation.reservationId}>
                예약 #{reservation.reservationId} / {fmtDate(reservation.startAt)}
              </option>
            ))}
          </select>

          {/*
            초보자 참고:
            별점 UI를 버튼으로 만든 이유는 사용자가 직관적으로 점수를 선택할 수 있기 때문입니다.
            선택된 별 개수를 reviewForm.rating(1~5)으로 저장하고, 서버로는 숫자 값만 전송합니다.
          */}
          <StarRatingInput
            rating={reviewForm.rating}
            onChange={(next) => setReviewForm((prev) => ({ ...prev, rating: next }))}
          />

          <textarea
            style={{ ...input, minHeight: 90, padding: 10 }}
            placeholder="리뷰 내용을 입력해 주세요."
            value={reviewForm.content}
            onChange={(e) => setReviewForm((prev) => ({ ...prev, content: e.target.value }))}
          />

          <button type="submit" style={btnPrimary} disabled={submittingReview || !selectedReservationId}>
            {submittingReview ? "등록중..." : "리뷰 등록"}
          </button>
        </form>
      </section>

      <section style={panel}>
        <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>리뷰 목록</h2>
        {reviews.length === 0 ? (
          <div style={{ color: "#6b7280" }}>리뷰가 없습니다.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {reviews.map((review) => {
              const mine = Number(review.userId) === currentUserId;
              // 서버 권한값(canAnswer)을 우선 사용하고, 없을 때만 기존 관리자 판별값을 fallback으로 사용합니다.
              const canReply = Boolean(review?.canAnswer ?? admin);
              return (
                <div key={review.reviewId} style={card}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <strong>
                      {renderStars(Number(review.rating))} ({review.rating}점) / 작성자 {review.reviewerName || "이름 없음"}
                    </strong>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 220 }}>{review.content}</div>
                      {canReply ? (
                        <button
                          type="button"
                          style={btnComment}
                          onClick={() =>
                            setOpenAnswerReviewId((prev) => (prev === review.reviewId ? null : review.reviewId))
                          }
                        >
                          답글
                        </button>
                      ) : null}
                    </div>
                    <span style={{ color: "#6b7280", fontSize: 13 }}>{fmtDate(review.createdAt)}</span>

                    {review.answerContent ? (
                      <div style={answerBox}>
                        <strong style={{ fontSize: 13 }}>
                          관리자 답글{review.answeredByName ? ` (${review.answeredByName})` : ""}
                        </strong>
                        <div>{review.answerContent}</div>
                        <span style={{ color: "#6b7280", fontSize: 12 }}>
                          {fmtDate(review.answeredAt)}
                        </span>
                      </div>
                    ) : null}

                    {canReply && openAnswerReviewId === review.reviewId ? (
                      <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
                        {/* 
                          초보자 참고:
                          "답글" 버튼을 눌렀을 때만 입력창을 보여주는 토글 방식입니다.
                          등록이 끝나면 입력창을 자동으로 닫아 대댓글 구조가 깔끔하게 유지됩니다.
                        */}
                        <textarea
                          style={{ ...input, minHeight: 84, padding: 10, resize: "vertical" }}
                          placeholder="관리자 답글을 입력해 주세요."
                          value={answerDraftByReviewId[review.reviewId] ?? ""}
                          onChange={(e) =>
                            setAnswerDraftByReviewId((prev) => ({
                              ...prev,
                              [review.reviewId]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          style={btnPrimary}
                          onClick={() => handleAnswerReview(review.reviewId)}
                          disabled={answeringReviewId === review.reviewId}
                        >
                          {answeringReviewId === review.reviewId ? "답글 등록중..." : "답글 등록"}
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {mine ? (
                    <button
                      type="button"
                      style={btnDanger}
                      onClick={() => handleDeleteReview(review.reviewId)}
                      disabled={deletingReviewId === review.reviewId}
                    >
                      {deletingReviewId === review.reviewId ? "삭제중..." : "삭제"}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

function StarRatingInput({ rating, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {[1, 2, 3, 4, 5].map((value) => {
        const selected = rating >= value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              fontSize: 28,
              lineHeight: 1,
              color: selected ? "#f59e0b" : "#d1d5db",
            }}
            aria-label={`${value}점`}
          >
            ★
          </button>
        );
      })}
      <span style={{ color: "#4b5563", fontSize: 14 }}>{rating}점</span>
    </div>
  );
}

function renderStars(value) {
  const score = Math.max(1, Math.min(5, Number(value || 0)));
  return "★".repeat(score) + "☆".repeat(5 - score);
}

function fmtDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("ko-KR");
}

const panel = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const input = {
  height: 38,
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "0 10px",
  minWidth: 160,
};

const chip = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
};

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 10,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const answerBox = {
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1e3a8a",
  borderRadius: 8,
  padding: 8,
  display: "grid",
  gap: 4,
};

const doneBadge = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #86efac",
  background: "#f0fdf4",
  color: "#166534",
  fontWeight: 700,
};

const closedBadge = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #fca5a5",
  background: "#fff1f2",
  color: "#991b1b",
  fontWeight: 700,
};

const btnPrimary = {
  height: 38,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnComment = {
  height: 30,
  padding: "0 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
  width: "fit-content",
};

const btnDanger = {
  height: 38,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #991b1b",
  background: "#991b1b",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnGhost = {
  height: 38,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
};

const btnGhostButton = {
  ...btnGhost,
  cursor: "pointer",
};

const heartBtn = {
  width: 40,
  height: 40,
  borderRadius: 999,
  border: "1px solid #fca5a5",
  background: "#fff1f2",
  color: "#e11d48",
  fontSize: 22,
  lineHeight: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const errorBox = {
  border: "1px solid #fecaca",
  background: "#fff1f2",
  color: "#991b1b",
  borderRadius: 10,
  padding: 10,
};

const okBox = {
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#166534",
  borderRadius: 10,
  padding: 10,
};


