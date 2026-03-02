import { useState, useCallback, useEffect, useMemo } from "react";
import AdminRecipeListManager from "./AdminRecipeListManager";
import AdminRecipeDeletedManager from "./AdminRecipeDeletedManager";
import {
    answerRecipeReview,
    answerRecipeInquiry,
    deleteRecipeReview,
    deleteRecipeInquiry,
    fetchAdminRecipeInquiries,
    fetchAdminRecipeReviews
} from "../../api/recipeApi";
import "./AdminRecipeHub.css";

const RECIPE_TABS = [
    { id: "active", label: "레시피 목록 관리" },
    { id: "deleted", label: "삭제된 레시피 관리" },
    { id: "reviews", label: "레시피 리뷰 관리" },
    { id: "inquiries", label: "레시피 문의 관리" },
];

export default function AdminRecipeHub() {
    const [activeTab, setActiveTab] = useState("active");

    return (
        <div className="admin-recipe-hub">
            <div className="admin-recipe-hub-head">
                <h2>레시피 통합 관리자</h2>
                <p>전체 레시피 조회, 수정, 삭제 및 리뷰/문의 답변을 한 곳에서 관리합니다.</p>
            </div>

            <div className="admin-recipe-subtabs" role="tablist">
                {RECIPE_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`admin-recipe-subtab-btn ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="admin-recipe-subtab-content">
                {activeTab === "active" && <AdminRecipeListManager />}
                {activeTab === "deleted" && <AdminRecipeDeletedManager />}
                {activeTab === "reviews" && <RecipeReviewManager />}
                {activeTab === "inquiries" && <RecipeInquiryManager />}
            </div>
        </div>
    );
}

/**
 * 1. 레시피 문의 관리 매니저
 */
function RecipeInquiryManager() {
    const [loading, setLoading] = useState(false);
    const [inquiries, setInquiries] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [keyword, setKeyword] = useState("");
    const [openAnswerInquiryId, setOpenAnswerInquiryId] = useState(null);
    const [answerDraftByInquiryId, setAnswerDraftByInquiryId] = useState({});

    const loadInquiries = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAdminRecipeInquiries();
            setInquiries(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("문의 로드 실패", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadInquiries(); }, [loadInquiries]);

    const filteredInquiries = useMemo(() => {
        return inquiries.filter((item) => {
            const answered = Boolean(item?.answerContent);
            if (statusFilter === "WAIT" && answered) return false;
            if (statusFilter === "DONE" && !answered) return false;
            if (!keyword) return true;
            // 검색 조건에 레시피 제목 추가
            return (item?.title || "").includes(keyword) ||
                (item?.writerName || "").includes(keyword) ||
                (item?.recipeTitle || "").includes(keyword);
        });
    }, [inquiries, keyword, statusFilter]);

    // 🚩 handleAnswerInquiry & handleDeleteInquiry 로직은 유지 (생략 방지 위해 포함)
    const handleAnswerInquiry = async (inquiryId) => {
        const answerContent = answerDraftByInquiryId[inquiryId];
        if (!answerContent?.trim()) return alert("답변 내용을 입력해주세요.");
        try {
            await answerRecipeInquiry(inquiryId, { answerContent });
            alert("답변이 등록되었습니다.");
            setOpenAnswerInquiryId(null);
            loadInquiries();
        } catch (e) { alert("답변 등록 실패",e); }
    };

    const handleDeleteInquiry = async (inquiryId) => {
        if (!window.confirm("정말 이 문의를 삭제하시겠습니까?")) return;
        try {
            await deleteRecipeInquiry(inquiryId);
            alert("삭제되었습니다.");
            loadInquiries();
        } catch (e) { alert("삭제 실패",e); }
    };

    if (loading) return <div className="admin-class-msg">문의 목록을 불러오는 중입니다...</div>;

    return (
        <section className="admin-recipe-panel">
            <div className="admin-recipe-panel-head">
                <h3>레시피 문의 관리</h3>
                <div className="admin-recipe-panel-actions">
                    <input className="admin-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="제목, 작성자, 레시피명 검색" />
                    <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="ALL">전체</option>
                        <option value="WAIT">대기</option>
                        <option value="DONE">완료</option>
                    </select>
                </div>
            </div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                    {/* 🚩 레시피 컬럼 추가 */}
                    <tr><th>상태</th><th>레시피</th><th>작성자</th><th>제목</th><th>관리</th></tr>
                    </thead>
                    <tbody>
                    {filteredInquiries.map(item => (
                        <tr key={item.inquiryId}>
                            <td>{item.answerContent ? "완료" : "대기"}</td>
                            {/* 🚩 레시피 정보 표시 */}
                            <td style={{fontSize: '13px', color: '#666'}}>
                                <strong>{item.recipeTitle || "레시피 정보 없음"}</strong><br/>
                                (ID: {item.recipeId})
                            </td>
                            <td>{item.writerName}</td>
                            <td>{item.title}</td>
                            <td>
                                <button onClick={() => setOpenAnswerInquiryId(openAnswerInquiryId === item.inquiryId ? null : item.inquiryId)}>답변</button>
                                <button onClick={() => handleDeleteInquiry(item.inquiryId)} style={{color: 'red', marginLeft: '5px'}}>삭제</button>
                                {openAnswerInquiryId === item.inquiryId && (
                                    <div style={{marginTop: '10px'}}>
                                            <textarea className="admin-input" value={answerDraftByInquiryId[item.inquiryId] || ""}
                                                      onChange={(e) => setAnswerDraftByInquiryId({...answerDraftByInquiryId, [item.inquiryId]: e.target.value})} />
                                        <button onClick={() => handleAnswerInquiry(item.inquiryId)}>제출</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

/**
 * 2. 레시피 리뷰 관리 매니저
 */
function RecipeReviewManager() {
    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [openAnswerReviewId, setOpenAnswerReviewId] = useState(null);
    const [answerDraftByReviewId, setAnswerDraftByReviewId] = useState({});

    const loadReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAdminRecipeReviews();
            setReviews(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadReviews(); }, [loadReviews]);

    const handleAnswerReview = async (reviewId) => {
        const answerContent = answerDraftByReviewId[reviewId];
        if (!answerContent?.trim()) return alert("내용을 입력하세요.");
        try {
            await answerRecipeReview(reviewId, { answerContent });
            alert("리뷰 답변 완료");
            setOpenAnswerReviewId(null);
            loadReviews();
        } catch (e) { alert("답변 실패",e); }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;
        try {
            await deleteRecipeReview(reviewId);
            alert("리뷰 삭제 완료");
            loadReviews();
        } catch (e) { alert("삭제 실패",e); }
    };

    if (loading) return <div className="admin-class-msg">리뷰 목록을 불러오는 중입니다...</div>;

    return (
        <section className="admin-recipe-panel">
            <div className="admin-recipe-panel-head"><h3>레시피 리뷰 관리</h3></div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                    {/* 🚩 레시피 컬럼 추가 */}
                    <tr><th>상태</th><th>레시피</th><th>작성자</th><th>평점</th><th>내용</th><th>관리</th></tr>
                    </thead>
                    <tbody>
                    {reviews.map(item => (
                        <tr key={item.reviewId}>
                            <td>{item.answerContent ? "완료" : "대기"}</td>
                            {/* 🚩 레시피 정보 표시 */}
                            <td style={{fontSize: '13px', color: '#666'}}>
                                <strong>{item.recipeTitle || "레시피 정보 없음"}</strong><br/>
                                (ID: {item.recipeId})
                            </td>
                            <td>{item.reviewerName}</td>
                            <td>{"★".repeat(item.rating)}</td>
                            <td>{item.content}</td>
                            <td>
                                <button onClick={() => setOpenAnswerReviewId(openAnswerReviewId === item.reviewId ? null : item.reviewId)}>답변</button>
                                <button onClick={() => handleDeleteReview(item.reviewId)} style={{color: 'red', marginLeft: '5px'}}>삭제</button>
                                {openAnswerReviewId === item.reviewId && (
                                    <div style={{marginTop: '10px'}}>
                                            <textarea className="admin-input" value={answerDraftByReviewId[item.reviewId] || ""}
                                                      onChange={(e) => setAnswerDraftByReviewId({...answerDraftByReviewId, [item.reviewId]: e.target.value})} />
                                        <button onClick={() => handleAnswerReview(item.reviewId)}>제출</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
