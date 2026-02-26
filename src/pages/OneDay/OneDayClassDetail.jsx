import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { loadAuth } from "../../utils/authStorage";
import {
  answerOneDayInquiry,
  answerOneDayReview,
  createOneDayHold,
  createOneDayInquiry,
  createOneDayReview,
  deleteOneDayReview,
  getMyOneDayReservations,
  getMyOneDayWishes,
  getOneDayClassDetail,
  getOneDayClassReviews,
  getOneDayClassSessions,
  getOneDayInquiries,
  isOneDayAdmin,
  isOneDayInstructor,
  isSessionCompleted,
  resolveOneDayUserId,
  toggleOneDayWish,
} from "../../api/onedayApi";
import { toCategoryLabel, toLevelLabel, toRunTypeLabel, toSlotLabel } from "./onedayLabels";
import "./OneDayClassDetail.css";

const INQUIRY_CATEGORIES = ["예약", "결제", "클래스", "기타"];
const DETAIL_TABS = [
  { id: "detail", label: "클래스 상세" },
  { id: "inquiry", label: "클래스 문의" },
  { id: "review", label: "클래스 리뷰" },
  { id: "policy", label: "예약/환불 안내" },
];

export const OneDayClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tabBarRef = useRef(null);
  const sectionRefs = useRef({});
  const ratiosRef = useRef(new Map());

  const currentUserId = Number(resolveOneDayUserId() ?? 0);
  const admin = isOneDayAdmin();
  const instructor = isOneDayInstructor();

  const [detail, setDetail] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [myCompletedReservations, setMyCompletedReservations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("detail");

  const [isWished, setIsWished] = useState(false);
  const [reservingSessionId, setReservingSessionId] = useState(null);
  const [reservingAction, setReservingAction] = useState(null); // "hold" | "pay" | null

  const [selectedSessionDate, setSelectedSessionDate] = useState("");
  const [selectedReservationId, setSelectedReservationId] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [answeringReviewId, setAnsweringReviewId] = useState(null);
  const [openAnswerReviewId, setOpenAnswerReviewId] = useState(null);
  const [answerDraftByReviewId, setAnswerDraftByReviewId] = useState({});

  const [inquiryForm, setInquiryForm] = useState({
    category: INQUIRY_CATEGORIES[0],
    title: "",
    content: "",
    secret: false,
  });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [answeringInquiryId, setAnsweringInquiryId] = useState(null);
  const [openAnswerInquiryId, setOpenAnswerInquiryId] = useState(null);
  const [answerDraftByInquiryId, setAnswerDraftByInquiryId] = useState({});

  const buildBuyerState = () => {
    const auth = loadAuth() || {};
    return {
      buyerName: String(auth.userName || ""),
      buyerEmail: String(auth.email || ""),
      buyerTel: String(auth.phone || auth.userPhone || auth.tel || ""),
    };
  };

  const loadClassData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [detailData, sessionsData, reviewData, myCompletedData, myWishData, inquiryData] = await Promise.all([
        getOneDayClassDetail(classId),
        getOneDayClassSessions(classId),
        getOneDayClassReviews(classId),
        getMyOneDayReservations({ status: "COMPLETED", page: 0, size: 200 }),
        getMyOneDayWishes().catch(() => []),
        getOneDayInquiries(),
      ]);

      const completedList = Array.isArray(myCompletedData?.content) ? myCompletedData.content : [];
      const completedForThisClass = completedList.filter((item) => Number(item.classId) === Number(classId));
      const wishes = Array.isArray(myWishData) ? myWishData : [];
      const allInquiries = Array.isArray(inquiryData) ? inquiryData : [];
      const classInquiries = allInquiries.filter((item) => Number(item.classProductId) === Number(classId));

      setDetail(detailData);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setReviews(Array.isArray(reviewData) ? reviewData : []);
      setInquiries(classInquiries);
      setMyCompletedReservations(completedForThisClass);
      setIsWished(wishes.some((wish) => Number(wish.classProductId) === Number(classId)));

      const preferredReservationId = location.state?.fromReservationId;
      if (
        preferredReservationId &&
        completedForThisClass.some((item) => Number(item.reservationId) === Number(preferredReservationId))
      ) {
        setSelectedReservationId(String(preferredReservationId));
      } else if (completedForThisClass.length > 0) {
        setSelectedReservationId((prev) => prev || String(completedForThisClass[0].reservationId));
      }
    } catch (e) {
      setError(e?.message ?? "상세 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [classId, location.state]);

  useEffect(() => {
    loadClassData();
  }, [loadClassData]);

  useEffect(() => {
    setActiveTab("detail");
  }, [classId]);

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

  const detailImageList = useMemo(() => {
    if (!detail) return [];
    if (Array.isArray(detail.detailImageDataList) && detail.detailImageDataList.length > 0) {
      return detail.detailImageDataList.filter((src) => typeof src === "string" && src.length > 0);
    }
    return detail.detailImageData ? [detail.detailImageData] : [];
  }, [detail]);

  const sessionDateOptions = useMemo(() => {
    const dateSet = new Set(
      sessions
        .map((session) => toIsoDateKey(session?.startAt))
        .filter(Boolean)
    );
    return Array.from(dateSet).sort((a, b) => a.localeCompare(b));
  }, [sessions]);

  useEffect(() => {
    if (sessionDateOptions.length === 0) {
      setSelectedSessionDate("");
      return;
    }

    setSelectedSessionDate((prev) => {
      if (prev && sessionDateOptions.includes(prev)) return prev;

      const today = toIsoDateKey(new Date());
      if (today && sessionDateOptions.includes(today)) return today;

      return sessionDateOptions[0];
    });
  }, [sessionDateOptions]);

  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedSessionDate) return [];
    return sessions.filter((session) => toIsoDateKey(session?.startAt) === selectedSessionDate);
  }, [sessions, selectedSessionDate]);

  const reviewStats = useMemo(() => {
    const total = reviews.length;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((review) => {
      const score = Math.max(1, Math.min(5, Number(review.rating || 0)));
      ratingCounts[score] += 1;
    });

    const sum = reviews.reduce((acc, review) => acc + Number(review.rating || 0), 0);
    const average = total > 0 ? sum / total : 0;

    return {
      total,
      average,
      ratingCounts,
      ratingPercents: {
        5: total > 0 ? (ratingCounts[5] / total) * 100 : 0,
        4: total > 0 ? (ratingCounts[4] / total) * 100 : 0,
        3: total > 0 ? (ratingCounts[3] / total) * 100 : 0,
        2: total > 0 ? (ratingCounts[2] / total) * 100 : 0,
        1: total > 0 ? (ratingCounts[1] / total) * 100 : 0,
      },
    };
  }, [reviews]);

  const getHeaderHeight = () => {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--app-header-height");
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 72;
  };

  const getTabBarHeight = () => {
    const element = tabBarRef.current;
    return element ? element.getBoundingClientRect().height : 52;
  };

  const getScrollOffset = () => getHeaderHeight() + getTabBarHeight() + 12;

  const scrollToSection = (tabId) => {
    const element = sectionRefs.current[tabId];
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({ top, behavior: "smooth" });
    setActiveTab(tabId);
  };

  useEffect(() => {
    if (loading) return undefined;

    const topOffset = getHeaderHeight() + getTabBarHeight() + 8;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const key = entry.target.dataset.tab;
          if (!key) return;
          ratiosRef.current.set(key, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let bestTab = activeTab;
        let bestRatio = 0;
        for (const [key, ratio] of ratiosRef.current.entries()) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestTab = key;
          }
        }

        if (bestRatio > 0.15 && bestTab !== activeTab) {
          setActiveTab(bestTab);
        }
      },
      {
        root: null,
        rootMargin: `-${topOffset}px 0px -60% 0px`,
        threshold: [0, 0.15, 0.3, 0.5, 0.7, 1],
      }
    );

    const elements = Object.values(sectionRefs.current).filter(Boolean);
    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [activeTab, loading, detail, sessions.length, reviews.length, inquiries.length]);

  useEffect(() => {
    if (!selectedReservationId && reviewableReservations.length > 0) {
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
      if (!reservationId) throw new Error("예약 ID를 받지 못했습니다.");
      // 상태 필터를 강제하지 않고 selectedId만 전달해야 전체 예약 목록에서 현재 예약을 함께 확인할 수 있습니다.
      navigate(`/classes/oneday/reservations?selectedId=${reservationId}`);
    } catch (e) {
      setError(e?.message ?? "예약 홀딩에 실패했습니다.");
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
      const hold = await createOneDayHold(sessionId);
      const reservationId = Number(hold?.id);
      if (!reservationId) throw new Error("예약 ID를 받지 못했습니다.");

      navigate("/payment", {
        state: {
          reservationId,
          classId: Number(sessionId),
          itemName: detail?.title || "원데이 클래스",
          amount: sessionPrice,
          ...buildBuyerState(),
        },
      });
    } catch (e) {
      setError(e?.message ?? "바로 결제 처리 중 오류가 발생했습니다.");
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
      setMessage(wished ? "찜 목록에 추가했습니다." : "찜 목록에서 제거했습니다.");
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
      if (!rating || rating < 1 || rating > 5) throw new Error("별점은 1~5점 사이여야 합니다.");
      if (!content) throw new Error("리뷰 내용을 입력해 주세요.");

      await createOneDayReview({ reservationId, rating, content });
      setReviewForm({ rating: 5, content: "" });
      setMessage("리뷰가 등록되었습니다.");
      await loadClassData();
    } catch (e) {
      setError(e?.message ?? "리뷰 등록에 실패했습니다.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;
    setError("");
    setMessage("");
    setDeletingReviewId(reviewId);
    try {
      await deleteOneDayReview(reviewId);
      setMessage("리뷰가 삭제되었습니다.");
      await loadClassData();
    } catch (e) {
      setError(e?.message ?? "리뷰 삭제에 실패했습니다.");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleAnswerReview = async (reviewId) => {
    setError("");
    setMessage("");
    const answerContent = String(answerDraftByReviewId[reviewId] || "").trim();
    if (!answerContent) {
      setError("리뷰 답글 내용을 입력해 주세요.");
      return;
    }

    setAnsweringReviewId(reviewId);
    try {
      await answerOneDayReview(reviewId, { answerContent });
      setAnswerDraftByReviewId((prev) => ({ ...prev, [reviewId]: "" }));
      setOpenAnswerReviewId(null);
      setMessage("리뷰 답글이 등록되었습니다.");
      await loadClassData();
    } catch (e) {
      setError(e?.message ?? "리뷰 답글 등록에 실패했습니다.");
    } finally {
      setAnsweringReviewId(null);
    }
  };

  const handleCreateInquiry = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmittingInquiry(true);

    try {
      const title = inquiryForm.title.trim();
      const content = inquiryForm.content.trim();
      if (!title) throw new Error("문의 제목을 입력해 주세요.");
      if (!content) throw new Error("문의 내용을 입력해 주세요.");

      await createOneDayInquiry({
        classProductId: Number(classId),
        category: inquiryForm.category,
        title,
        content,
        secret: Boolean(inquiryForm.secret),
        hasAttachment: false,
      });

      setInquiryForm((prev) => ({ ...prev, title: "", content: "", secret: false }));
      setMessage("문의가 등록되었습니다.");
      await loadClassData();
    } catch (e) {
      setError(e?.message ?? "문의 등록에 실패했습니다.");
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleAnswerInquiry = async (inquiryId) => {
    setError("");
    setMessage("");
    const answerContent = String(answerDraftByInquiryId[inquiryId] || "").trim();
    if (!answerContent) {
      setError("문의 답글 내용을 입력해 주세요.");
      return;
    }

    setAnsweringInquiryId(inquiryId);
    try {
      await answerOneDayInquiry(inquiryId, { answerContent });
      setAnswerDraftByInquiryId((prev) => ({ ...prev, [inquiryId]: "" }));
      setOpenAnswerInquiryId(null);
      setMessage("문의 답글이 등록되었습니다.");
      await loadClassData();
    } catch (e) {
      setError(e?.message ?? "문의 답글 등록에 실패했습니다.");
    } finally {
      setAnsweringInquiryId(null);
    }
  };

  if (loading) return <div className="od-detail-page">불러오는 중...</div>;
  if (error && !detail) return <div className="od-detail-page od-error-box">{error}</div>;

  return (
    <div className="od-detail-page">
      <div className="od-detail-topbar">
        <Link to="/classes/oneday/classes" className="od-btn od-btn-ghost">
          목록으로
        </Link>
        <button
          type="button"
          className="od-btn od-btn-ghost"
          onClick={() => scrollToSection("inquiry")}
        >
          문의 영역으로 이동
        </button>
      </div>

      {error ? <div className="od-error-box">{error}</div> : null}
      {message ? <div className="od-ok-box">{message}</div> : null}

      <section className="od-hero-card">
        <div className="od-hero-main">
          <h1>{detail?.title}</h1>
          <p>{detail?.description || "요약 설명이 없습니다."}</p>
          <div className="od-chip-wrap">
            <span className="od-chip">{detail?.levelLabel ?? toLevelLabel(detail?.level)}</span>
            <span className="od-chip">{detail?.categoryLabel ?? toCategoryLabel(detail?.category)}</span>
            <span className="od-chip">{detail?.runTypeLabel ?? toRunTypeLabel(detail?.runType)}</span>
            <span className="od-chip">{detail?.instructorName || `강사 #${detail?.instructorId ?? "-"}`}</span>
          </div>
        </div>
        <button type="button" className="od-heart-btn" onClick={handleWishToggle} title={isWished ? "찜 해제" : "찜 추가"}>
          {isWished ? "♥" : "♡"}
        </button>
      </section>

      <div className="od-tabbar" ref={tabBarRef}>
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? "od-tab active" : "od-tab"}
            onClick={() => scrollToSection(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section
        className="od-panel od-section"
        data-tab="detail"
        ref={(element) => {
          sectionRefs.current.detail = element;
        }}
      >
        <h2>세션 선택</h2>
        {sessions.length === 0 ? (
          <div className="od-muted">등록된 세션이 없습니다.</div>
        ) : (
          <>
            <div className="od-session-date-filter">
              <label htmlFor="od-session-date">날짜 선택</label>
              <input
                id="od-session-date"
                type="date"
                value={selectedSessionDate}
                onChange={(e) => setSelectedSessionDate(e.target.value)}
                min={sessionDateOptions[0]}
                max={sessionDateOptions[sessionDateOptions.length - 1]}
              />
              <span className="od-meta">
                선택 날짜: {selectedSessionDate ? fmtDateOnly(selectedSessionDate) : "날짜를 선택해 주세요"}
              </span>
            </div>

            {sessionsForSelectedDate.length === 0 ? (
              <div className="od-muted">선택한 날짜에 세션이 없습니다.</div>
            ) : (
              <div className="od-session-grid">
                {sessionsForSelectedDate.map((session) => {
                  const startAt = session.startAt;
                  const remainingSeats =
                    session.remainingSeats ?? Math.max((session.capacity ?? 0) - (session.reservedCount ?? 0), 0);
                  const sessionId = session.id ?? session.sessionId;
                  const completed = Boolean(session.completed) || isSessionCompleted(startAt);
                  const full = Boolean(session.full) || remainingSeats <= 0;

                  return (
                    <article key={sessionId} className="od-session-card">
                      <div className="od-session-text">
                        <strong>
                          {fmtDate(startAt)} ({session.slotLabel ?? toSlotLabel(session.slot)})
                        </strong>
                        <span>정원 {session.capacity} / 예약 {session.reservedCount} / 잔여 {remainingSeats}</span>
                      </div>
                      <div className="od-session-actions">
                        <span className="od-chip od-price-chip">{Number(session.price ?? 0).toLocaleString("ko-KR")}원</span>
                        {completed ? <span className="od-badge od-badge-done">종료</span> : null}
                        {!completed && full ? <span className="od-badge od-badge-closed">정원 마감</span> : null}
                        <button
                          className="od-btn od-btn-ghost"
                          onClick={() => handleHoldOnly(sessionId)}
                          disabled={reservingSessionId === sessionId || completed || full}
                        >
                          {reservingSessionId === sessionId && reservingAction === "hold"
                            ? "홀딩 중..."
                            : completed
                            ? "종료"
                            : full
                            ? "마감"
                            : "예약 홀딩"}
                        </button>
                        <button
                          className="od-btn od-btn-primary"
                          onClick={() => handleDirectPayment(sessionId, session.price)}
                          disabled={reservingSessionId === sessionId || completed || full}
                        >
                          {reservingSessionId === sessionId && reservingAction === "pay"
                            ? "결제 이동 중..."
                            : completed
                            ? "종료"
                            : full
                            ? "마감"
                            : "바로 결제"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <section className="od-panel">
        <h2>클래스 상세 설명</h2>
        {detailImageList.length > 0 ? (
          <div style={{ display: "grid", gap: 12 }}>
            {detailImageList.map((src, index) => (
              <img
                key={`detail-image-${index}`}
                className="od-detail-image"
                src={src}
                alt={`${detail?.title || "클래스"} 상세 이미지 ${index + 1}`}
              />
            ))}
          </div>
        ) : null}
        <p className="od-detail-description">
          {detail?.detailDescription || detail?.description || "상세 설명이 아직 등록되지 않았습니다."}
        </p>
      </section>

      <section
        className="od-panel od-section"
        data-tab="inquiry"
        ref={(element) => {
          sectionRefs.current.inquiry = element;
        }}
      >
        <h2>문의하기</h2>
        <form className="od-form-grid" onSubmit={handleCreateInquiry}>
          <div className="od-form-row">
            <label>
              <span>문의 분류</span>
              <select
                value={inquiryForm.category}
                onChange={(e) => setInquiryForm((prev) => ({ ...prev, category: e.target.value }))}
              >
                {INQUIRY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>비밀글</span>
              <input
                type="checkbox"
                checked={inquiryForm.secret}
                onChange={(e) => setInquiryForm((prev) => ({ ...prev, secret: e.target.checked }))}
              />
            </label>
          </div>
          <label>
            <span>문의 제목</span>
            <input
              value={inquiryForm.title}
              maxLength={150}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="제목을 입력해 주세요."
            />
          </label>
          <label>
            <span>문의 내용</span>
            <textarea
              value={inquiryForm.content}
              maxLength={4000}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="문의 내용을 입력해 주세요."
            />
          </label>
          <button className="od-btn od-btn-primary" type="submit" disabled={submittingInquiry}>
            {submittingInquiry ? "등록 중..." : "문의 등록"}
          </button>
        </form>

        {inquiries.length === 0 ? (
          <div className="od-muted">이 클래스에 등록된 문의가 없습니다.</div>
        ) : (
          <div className="od-list-grid">
            {inquiries.map((item) => {
              const fallbackCanAnswer = admin || Number(item.userId) === currentUserId;
              const canAnswer = Boolean(item.canAnswer ?? fallbackCanAnswer);

              return (
                <article key={item.inquiryId} className="od-item-card">
                  <div className="od-item-head">
                    <strong>#{item.inquiryId} {item.title}</strong>
                    <div className="od-chip-wrap">
                      <span className="od-chip">{item.category}</span>
                      <span className="od-chip">{String(item.visibility) === "PRIVATE" ? "비밀글" : "공개글"}</span>
                      <span className="od-chip">{item.answered ? "답변완료" : "답변대기"}</span>
                    </div>
                  </div>
                  <p>{item.content}</p>
                  <span className="od-meta">작성자: {item.writerName || "이름 없음"} / {fmtDate(item.createdAt)}</span>

                  {item.answered ? (
                    <div className="od-answer-box">
                      <strong>답글</strong>
                      <p>{item.answerContent || "(답글 내용 없음)"}</p>
                      <span className="od-meta">답글 시각: {fmtDate(item.answeredAt)}</span>
                    </div>
                  ) : null}

                  {canAnswer ? (
                    <div className="od-inline-actions">
                      <button
                        type="button"
                        className="od-btn od-btn-ghost"
                        onClick={() => setOpenAnswerInquiryId((prev) => (prev === item.inquiryId ? null : item.inquiryId))}
                      >
                        답글 작성
                      </button>
                    </div>
                  ) : null}

                  {canAnswer && openAnswerInquiryId === item.inquiryId ? (
                    <div className="od-answer-form">
                      <textarea
                        value={answerDraftByInquiryId[item.inquiryId] || ""}
                        onChange={(e) =>
                          setAnswerDraftByInquiryId((prev) => ({ ...prev, [item.inquiryId]: e.target.value }))
                        }
                        placeholder="답글을 입력해 주세요."
                      />
                      <button
                        type="button"
                        className="od-btn od-btn-primary"
                        onClick={() => handleAnswerInquiry(item.inquiryId)}
                        disabled={answeringInquiryId === item.inquiryId}
                      >
                        {answeringInquiryId === item.inquiryId ? "등록 중..." : "답글 등록"}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section
        className="od-panel od-section"
        data-tab="review"
        ref={(element) => {
          sectionRefs.current.review = element;
        }}
      >
        <h2>리뷰 작성</h2>
        <form className="od-form-grid" onSubmit={handleCreateReview}>
          <label>
            <span>완료된 예약 선택</span>
            <select value={selectedReservationId} onChange={(e) => setSelectedReservationId(e.target.value)}>
              <option value="">완료된 예약을 선택해 주세요</option>
              {reviewableReservations.map((reservation) => (
                <option key={reservation.reservationId} value={reservation.reservationId}>
                  예약 #{reservation.reservationId} / {fmtDate(reservation.startAt)}
                </option>
              ))}
            </select>
          </label>

          <StarRatingInput rating={reviewForm.rating} onChange={(next) => setReviewForm((prev) => ({ ...prev, rating: next }))} />

          <label>
            <span>리뷰 내용</span>
            <textarea
              value={reviewForm.content}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="리뷰 내용을 입력해 주세요."
            />
          </label>

          <button className="od-btn od-btn-primary" type="submit" disabled={submittingReview || !selectedReservationId}>
            {submittingReview ? "등록 중..." : "리뷰 등록"}
          </button>
        </form>
      </section>

      <section className="od-panel">
        <h2>리뷰 목록</h2>
        <div className="od-review-stats">
          <div className="od-review-summary">
            <strong className="od-review-average">{reviewStats.average.toFixed(1)}</strong>
            <div className="od-review-stars">{renderStars(Math.round(reviewStats.average || 0))}</div>
            <span className="od-meta">총 {reviewStats.total}개 리뷰</span>
          </div>
          <div className="od-review-bars">
            {[5, 4, 3, 2, 1].map((score) => (
              <div className="od-review-bar-row" key={score}>
                <span>{score}점</span>
                <div className="od-review-bar-track">
                  <div
                    className="od-review-bar-fill"
                    style={{ width: `${reviewStats.ratingPercents[score].toFixed(1)}%` }}
                  />
                </div>
                <span>{reviewStats.ratingCounts[score]}개</span>
              </div>
            ))}
          </div>
        </div>
        {reviews.length === 0 ? (
          <div className="od-muted">아직 등록된 리뷰가 없습니다.</div>
        ) : (
          <div className="od-list-grid">
            {reviews.map((review) => {
              const mine = Number(review.userId) === currentUserId;
              const canReply = Boolean(review?.canAnswer ?? (admin || instructor));
              return (
                <article key={review.reviewId} className="od-item-card">
                  <div className="od-item-head">
                    <strong>{renderStars(Number(review.rating))} ({review.rating}점)</strong>
                    <span className="od-meta">작성자: {review.reviewerName || "이름 없음"}</span>
                  </div>
                  <p>{review.content}</p>
                  <span className="od-meta">{fmtDate(review.createdAt)}</span>

                  {review.answerContent ? (
                    <div className="od-answer-box">
                      <strong>관리자 답글</strong>
                      <p>{review.answerContent}</p>
                      <span className="od-meta">{fmtDate(review.answeredAt)}</span>
                    </div>
                  ) : null}

                  <div className="od-inline-actions">
                    {canReply ? (
                      <button
                        type="button"
                        className="od-btn od-btn-ghost"
                        onClick={() => setOpenAnswerReviewId((prev) => (prev === review.reviewId ? null : review.reviewId))}
                      >
                        답글 작성
                      </button>
                    ) : null}
                    {mine ? (
                      <button
                        type="button"
                        className="od-btn od-btn-danger"
                        onClick={() => handleDeleteReview(review.reviewId)}
                        disabled={deletingReviewId === review.reviewId}
                      >
                        {deletingReviewId === review.reviewId ? "삭제 중..." : "삭제"}
                      </button>
                    ) : null}
                  </div>

                  {canReply && openAnswerReviewId === review.reviewId ? (
                    <div className="od-answer-form">
                      <textarea
                        value={answerDraftByReviewId[review.reviewId] || ""}
                        onChange={(e) =>
                          setAnswerDraftByReviewId((prev) => ({ ...prev, [review.reviewId]: e.target.value }))
                        }
                        placeholder="리뷰 답글을 입력해 주세요."
                      />
                      <button
                        type="button"
                        className="od-btn od-btn-primary"
                        onClick={() => handleAnswerReview(review.reviewId)}
                        disabled={answeringReviewId === review.reviewId}
                      >
                        {answeringReviewId === review.reviewId ? "등록 중..." : "답글 등록"}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section
        className="od-panel od-section"
        data-tab="policy"
        ref={(element) => {
          sectionRefs.current.policy = element;
        }}
      >
        <h2>예약/환불 안내</h2>
        <div className="od-policy-box">
          <h3>예약 안내</h3>
          <ul>
            <li>예약 홀딩 후 결제가 완료되어야 최종 예약이 확정됩니다.</li>
            <li>세션별 잔여 좌석은 실시간 상황에 따라 변동될 수 있습니다.</li>
          </ul>

          <h3>취소/환불 안내</h3>
          <ul>
            <li>클래스 일정과 운영 정책에 따라 취소 가능 기간 및 환불 금액이 달라질 수 있습니다.</li>
            <li>환불 문의는 클래스 문의 탭에서 접수하면 관리자 확인 후 안내됩니다.</li>
          </ul>
        </div>
      </section>

      {detail?.instructorName || detail?.instructorBio ? (
        <section className="od-panel od-instructor-intro">
          <h2>강사 소개</h2>
          <div className="od-instructor-card">
            {detail?.instructorProfileImageData ? (
              <img
                className="od-instructor-photo"
                src={detail.instructorProfileImageData}
                alt={`${detail?.instructorName || "강사"} 프로필`}
              />
            ) : null}
            <div className="od-instructor-info">
              <strong>{detail?.instructorName || "강사 정보"}</strong>
              {detail?.instructorSpecialty ? <span className="od-chip">전문분야: {detail.instructorSpecialty}</span> : null}
              {detail?.instructorCareer ? <p>{detail.instructorCareer}</p> : null}
              {detail?.instructorBio ? <p>{detail.instructorBio}</p> : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

function StarRatingInput({ rating, onChange }) {
  return (
    <div className="od-star-row">
      {[1, 2, 3, 4, 5].map((value) => {
        const selected = rating >= value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`od-star-btn ${selected ? "is-active" : ""}`}
            aria-label={`${value}점`}
          >
            ★
          </button>
        );
      })}
      <span>{rating}점</span>
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

function fmtDateOnly(value) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("ko-KR");
}

function toIsoDateKey(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
