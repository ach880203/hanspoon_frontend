import { useCallback, useEffect, useMemo, useState } from "react";
import {
  answerOneDayInquiry,
  answerOneDayReview,
  getOneDayClassReviews,
  getOneDayClasses,
  getOneDayInquiries,
} from "../../api/onedayApi";
import AdminOneDayClassManager from "./AdminOneDayClassManager";
import AdminOneDayInstructorManager from "./AdminOneDayInstructorManager";
import "./AdminOneDayClassHub.css";

const CLASS_MANAGE_TABS = [
  { id: "classes", label: "클래스 관리" },
  { id: "instructors", label: "강사 관리" },
  { id: "inquiries", label: "클래스 문의 관리" },
  { id: "reviews", label: "클래스 리뷰 관리" },
];

export default function AdminOneDayClassHub() {
  const [activeTab, setActiveTab] = useState("classes");

  return (
    <div className="admin-class-hub">
      <div className="admin-class-hub-head">
        <h2>원데이 클래스 통합 관리</h2>
        <p>클래스 등록, 강사 관리, 클래스 문의/리뷰 관리를 한 곳에서 처리합니다.</p>
      </div>

      <div className="admin-class-subtabs" role="tablist" aria-label="클래스 관리 하위 탭">
        {CLASS_MANAGE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={`admin-class-subtab-btn ${activeTab === tab.id ? "active" : ""}`}
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-class-subtab-content">
        {activeTab === "classes" ? <AdminOneDayClassManager /> : null}
        {activeTab === "instructors" ? <AdminOneDayInstructorManager /> : null}
        {activeTab === "inquiries" ? <OneDayInquiryManager /> : null}
        {activeTab === "reviews" ? <OneDayReviewManager /> : null}
      </div>
    </div>
  );
}

function OneDayInquiryManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [openAnswerInquiryId, setOpenAnswerInquiryId] = useState(null);
  const [answerDraftByInquiryId, setAnswerDraftByInquiryId] = useState({});
  const [savingAnswerInquiryId, setSavingAnswerInquiryId] = useState(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getOneDayInquiries();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message ?? "클래스 문의 목록을 불러오지 못했습니다.");
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const filteredInquiries = useMemo(() => {
    const normalizedKeyword = String(keyword || "").trim().toLowerCase();
    return inquiries.filter((item) => {
      const answered = Boolean(item?.answered);
      if (statusFilter === "WAIT" && answered) return false;
      if (statusFilter === "DONE" && !answered) return false;

      if (!normalizedKeyword) return true;
      const searchText = [
        item?.title,
        item?.content,
        item?.writerName,
        String(item?.classProductId ?? ""),
        String(item?.inquiryId ?? ""),
      ]
        .map((x) => String(x || ""))
        .join(" ")
        .toLowerCase();
      return searchText.includes(normalizedKeyword);
    });
  }, [inquiries, keyword, statusFilter]);

  const openAnswerForm = (item) => {
    const inquiryId = Number(item?.inquiryId);
    if (!inquiryId) return;
    setOpenAnswerInquiryId((prev) => (prev === inquiryId ? null : inquiryId));
    setAnswerDraftByInquiryId((prev) => {
      if (typeof prev[inquiryId] === "string") return prev;
      return { ...prev, [inquiryId]: String(item?.answerContent || "") };
    });
  };

  const submitAnswer = async (inquiryId) => {
    const answerContent = String(answerDraftByInquiryId[inquiryId] || "").trim();
    if (!answerContent) {
      setError("답글 내용을 입력해 주세요.");
      return;
    }

    setSavingAnswerInquiryId(inquiryId);
    setError("");
    setMessage("");
    try {
      await answerOneDayInquiry(inquiryId, { answerContent });
      setMessage("문의 답글이 저장되었습니다.");
      await loadInquiries();
      setOpenAnswerInquiryId(null);
    } catch (e) {
      setError(e?.message ?? "문의 답글 저장에 실패했습니다.");
    } finally {
      setSavingAnswerInquiryId(null);
    }
  };

  return (
    <section className="admin-class-panel">
      <div className="admin-class-panel-head">
        <h3>클래스 문의 관리</h3>
        <div className="admin-class-panel-actions">
          <input
            className="admin-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="제목, 내용, 작성자, 클래스 ID 검색"
          />
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">전체 상태</option>
            <option value="WAIT">답변 대기</option>
            <option value="DONE">답변 완료</option>
          </select>
          <button type="button" className="admin-btn-search" onClick={loadInquiries} disabled={loading}>
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
              <th>클래스 ID</th>
              <th>작성자</th>
              <th>제목</th>
              <th>작성일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-class-empty-row">문의 내역이 없습니다.</td>
              </tr>
            ) : (
              filteredInquiries.map((item) => {
                const inquiryId = Number(item?.inquiryId || 0);
                const answered = Boolean(item?.answered);
                const canAnswer = Boolean(item?.canAnswer ?? true);
                return (
                  <FragmentRow key={`inquiry-${inquiryId}`}>
                    <tr>
                      <td>
                        <span className={`admin-badge ${answered ? "badge-active" : "badge-ready"}`}>
                          {answered ? "답변완료" : "답변대기"}
                        </span>
                      </td>
                      <td>{item?.classProductId ?? "-"}</td>
                      <td>{item?.writerName || "이름 없음"}</td>
                      <td className="admin-class-ellipsis" title={item?.title || ""}>{item?.title || "-"}</td>
                      <td>{toDateText(item?.createdAt)}</td>
                      <td>
                        <button type="button" className="admin-btn-sm" onClick={() => openAnswerForm(item)} disabled={!canAnswer}>
                          {answered ? "답변수정" : "답변등록"}
                        </button>
                      </td>
                    </tr>
                    {openAnswerInquiryId === inquiryId ? (
                      <tr className="admin-class-answer-row">
                        <td colSpan="6">
                          <div className="admin-class-answer-box">
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
                            <div className="admin-class-answer-actions">
                              <button
                                type="button"
                                className="admin-btn-search"
                                onClick={() => submitAnswer(inquiryId)}
                                disabled={savingAnswerInquiryId === inquiryId}
                              >
                                {savingAnswerInquiryId === inquiryId ? "저장 중..." : "답글 저장"}
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
    </section>
  );
}

function OneDayReviewManager() {
  const [reviewViewMode, setReviewViewMode] = useState("byClass"); // byClass | all
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [openAnswerReviewId, setOpenAnswerReviewId] = useState(null);
  const [answerDraftByReviewId, setAnswerDraftByReviewId] = useState({});
  const [savingAnswerReviewId, setSavingAnswerReviewId] = useState(null);

  const loadClassOptions = useCallback(async () => {
    setLoadingClasses(true);
    setError("");
    try {
      const data = await getOneDayClasses({ page: 0, size: 200, sort: "createdAt,desc" });
      const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setClassOptions(list);
      setSelectedClassId((prev) => {
        if (prev && list.some((item) => String(item?.id) === String(prev))) return prev;
        return list.length > 0 ? String(list[0].id) : "";
      });
    } catch (e) {
      setError(e?.message ?? "클래스 목록을 불러오지 못했습니다.");
      setClassOptions([]);
      setSelectedClassId("");
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const loadReviewsByClass = useCallback(async (classId) => {
    const targetClassId = Number(classId);
    if (!targetClassId) {
      setReviews([]);
      return;
    }

    setLoadingReviews(true);
    setError("");
    try {
      const data = await getOneDayClassReviews(targetClassId);
      const classInfo = classOptions.find((item) => Number(item?.id) === targetClassId);
      const classTitle = classInfo?.title || `클래스 #${targetClassId}`;
      const normalized = (Array.isArray(data) ? data : []).map((item) => ({
        ...item,
        classId: item?.classId ?? targetClassId,
        classTitle,
      }));
      setReviews(normalized);
    } catch (e) {
      setError(e?.message ?? "클래스 리뷰 목록을 불러오지 못했습니다.");
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [classOptions]);

  const loadAllReviews = useCallback(async () => {
    if (classOptions.length === 0) {
      setReviews([]);
      return;
    }

    setLoadingReviews(true);
    setError("");
    try {
      const perClassResults = await Promise.allSettled(
        classOptions.map(async (classItem) => {
          const classId = Number(classItem?.id);
          if (!classId) return [];
          const list = await getOneDayClassReviews(classId);
          return (Array.isArray(list) ? list : []).map((item) => ({
            ...item,
            classId: item?.classId ?? classId,
            classTitle: classItem?.title || `클래스 #${classId}`,
          }));
        })
      );

      const merged = perClassResults
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value);

      merged.sort((a, b) => {
        const aTime = new Date(a?.createdAt || 0).getTime();
        const bTime = new Date(b?.createdAt || 0).getTime();
        return bTime - aTime;
      });

      setReviews(merged);
    } catch (e) {
      setError(e?.message ?? "전체 리뷰 목록을 불러오지 못했습니다.");
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [classOptions]);

  useEffect(() => {
    loadClassOptions();
  }, [loadClassOptions]);

  useEffect(() => {
    if (reviewViewMode !== "byClass") return;
    if (!selectedClassId) return;
    loadReviewsByClass(selectedClassId);
  }, [selectedClassId, reviewViewMode, loadReviewsByClass]);

  useEffect(() => {
    if (reviewViewMode !== "all") return;
    loadAllReviews();
  }, [reviewViewMode, loadAllReviews]);

  const selectedClass = useMemo(
    () => classOptions.find((item) => String(item?.id) === String(selectedClassId)),
    [classOptions, selectedClassId]
  );

  const openAnswerForm = (item) => {
    const reviewId = Number(item?.reviewId || 0);
    if (!reviewId) return;
    setOpenAnswerReviewId((prev) => (prev === reviewId ? null : reviewId));
    setAnswerDraftByReviewId((prev) => {
      if (typeof prev[reviewId] === "string") return prev;
      return { ...prev, [reviewId]: String(item?.answerContent || "") };
    });
  };

  const submitAnswer = async (reviewId) => {
    const answerContent = String(answerDraftByReviewId[reviewId] || "").trim();
    if (!answerContent) {
      setError("답글 내용을 입력해 주세요.");
      return;
    }

    setSavingAnswerReviewId(reviewId);
    setError("");
    setMessage("");
    try {
      await answerOneDayReview(reviewId, { answerContent });
      setMessage("리뷰 답글이 저장되었습니다.");
      if (reviewViewMode === "all") {
        await loadAllReviews();
      } else {
        await loadReviewsByClass(selectedClassId);
      }
      setOpenAnswerReviewId(null);
    } catch (e) {
      setError(e?.message ?? "리뷰 답글 저장에 실패했습니다.");
    } finally {
      setSavingAnswerReviewId(null);
    }
  };

  return (
    <section className="admin-class-panel">
      <div className="admin-class-panel-head">
        <h3>클래스 리뷰 관리</h3>
        <div className="admin-class-view-toggle">
          <button
            type="button"
            className={`admin-class-view-btn ${reviewViewMode === "byClass" ? "active" : ""}`}
            onClick={() => setReviewViewMode("byClass")}
          >
            클래스별 보기
          </button>
          <button
            type="button"
            className={`admin-class-view-btn ${reviewViewMode === "all" ? "active" : ""}`}
            onClick={() => setReviewViewMode("all")}
          >
            전체 리뷰 보기
          </button>
        </div>
        <div className="admin-class-panel-actions">
          {reviewViewMode === "byClass" ? (
            <select
              className="admin-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={loadingClasses || classOptions.length === 0}
            >
              {classOptions.length === 0 ? <option value="">클래스 없음</option> : null}
              {classOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title || `클래스 #${item.id}`}
                </option>
              ))}
            </select>
          ) : null}
          <button
            type="button"
            className="admin-btn-search"
            onClick={() => (reviewViewMode === "all" ? loadAllReviews() : loadReviewsByClass(selectedClassId))}
            disabled={loadingReviews || (reviewViewMode === "byClass" && !selectedClassId)}
          >
            {loadingReviews ? "조회 중..." : "리뷰 새로고침"}
          </button>
        </div>
      </div>

      {reviewViewMode === "byClass" && selectedClass ? (
        <div className="admin-class-selected-info">
          선택 클래스: {selectedClass.title || "-"} (ID: {selectedClass.id})
        </div>
      ) : null}
      {reviewViewMode === "all" ? (
        <div className="admin-class-selected-info">
          전체 리뷰 모아보기: 리뷰가 등록된 클래스와 함께 최신순으로 확인할 수 있습니다.
        </div>
      ) : null}

      {error ? <div className="admin-class-msg admin-class-msg-error">{error}</div> : null}
      {message ? <div className="admin-class-msg admin-class-msg-ok">{message}</div> : null}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>상태</th>
              <th>클래스</th>
              <th>리뷰 ID</th>
              <th>작성자</th>
              <th>평점</th>
              <th>내용</th>
              <th>작성일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-class-empty-row">리뷰 내역이 없습니다.</td>
              </tr>
            ) : (
              reviews.map((item) => {
                const reviewId = Number(item?.reviewId || 0);
                const answered = Boolean(item?.answerContent);
                const canAnswer = Boolean(item?.canAnswer ?? true);
                return (
                  <FragmentRow key={`review-${reviewId}`}>
                    <tr>
                      <td>
                        <span className={`admin-badge ${answered ? "badge-active" : "badge-ready"}`}>
                          {answered ? "답변완료" : "답변대기"}
                        </span>
                      </td>
                      <td>
                        {item?.classTitle || `클래스 #${item?.classId ?? "-"}`} (ID: {item?.classId ?? "-"})
                      </td>
                      <td>{reviewId || "-"}</td>
                      <td>{item?.reviewerName || "이름 없음"}</td>
                      <td>{renderStars(item?.rating)} ({item?.rating ?? 0}점)</td>
                      <td className="admin-class-ellipsis" title={item?.content || ""}>{item?.content || "-"}</td>
                      <td>{toDateText(item?.createdAt)}</td>
                      <td>
                        <button type="button" className="admin-btn-sm" onClick={() => openAnswerForm(item)} disabled={!canAnswer}>
                          {answered ? "답변수정" : "답변등록"}
                        </button>
                      </td>
                    </tr>
                    {openAnswerReviewId === reviewId ? (
                      <tr className="admin-class-answer-row">
                        <td colSpan="8">
                          <div className="admin-class-answer-box">
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
                            <div className="admin-class-answer-actions">
                              <button
                                type="button"
                                className="admin-btn-search"
                                onClick={() => submitAnswer(reviewId)}
                                disabled={savingAnswerReviewId === reviewId}
                              >
                                {savingAnswerReviewId === reviewId ? "저장 중..." : "답글 저장"}
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
    </section>
  );
}

function FragmentRow({ children }) {
  return <>{children}</>;
}

function toDateText(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("ko-KR");
}

function renderStars(value) {
  const score = Math.max(1, Math.min(5, Number(value || 0)));
  return "★".repeat(score) + "☆".repeat(5 - score);
}
