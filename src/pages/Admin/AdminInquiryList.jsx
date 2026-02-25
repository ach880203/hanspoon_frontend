import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import * as onedayApi from "../../api/onedayApi";
import { answerInquiry } from "../../api/productInquiries";
import "./AdminList.css";

const AdminInquiryList = () => {
    const [activeTab, setActiveTab] = useState("product"); // "product" or "oneday"
    const [loading, setLoading] = useState(false);
    const [inquiries, setInquiries] = useState([]);
    const [pagination, setPagination] = useState({ page: 0, totalPages: 0 });

    const [answerInputs, setAnswerInputs] = useState({}); // { inquiryId: "답변내용" }
    const [showAnswerForm, setShowAnswerForm] = useState(null); // 펼쳐진 답변 폼 ID

    const fetchInquiries = async (page = 0) => {
        setLoading(true);
        try {
            if (activeTab === "product") {
                const res = await adminApi.getProductInquiriesAdmin(page);
                // Backend returns Page<InquiryResponseDto> directly via ResponseEntity.ok(data)
                // Check if it's wrapped in ApiResponse
                const data = res.success === false ? [] : (res.content || res.data?.content || []);
                setInquiries(data);
                setPagination({
                    page: res.number ?? 0,
                    totalPages: res.totalPages ?? 0
                });
            } else {
                const res = await onedayApi.getOneDayInquiries();
                // onedayApi uses unwrap(api.get(...)) -> returns data directly
                setInquiries(res || []);
                setPagination({ page: 0, totalPages: 1 });
            }
        } catch (error) {
            console.error("Failed to fetch inquiries:", error);
            alert("문의 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries(0);
    }, [activeTab]);

    const handleAnswerChange = (id, value) => {
        setAnswerInputs(prev => ({ ...prev, [id]: value }));
    };

    const submitAnswer = async (inqId) => {
        const answer = answerInputs[inqId]?.trim();
        if (!answer) return alert("답변 내용을 입력해주세요.");

        try {
            if (activeTab === "product") {
                await answerInquiry(inqId, { answer });
            } else {
                await onedayApi.answerOneDayInquiry(inqId, { answerContent: answer });
            }
            alert("답변이 등록되었습니다.");
            setShowAnswerForm(null);
            setAnswerInputs(prev => ({ ...prev, [inqId]: "" }));
            fetchInquiries(pagination.page);
        } catch (error) {
            console.error("Failed to submit answer:", error);
            alert("답변 등록에 실패했습니다.");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <div className="admin-list-content">
            <div className="admin-tabs-nav mb-4">
                <button
                    className={`admin-tab-btn ${activeTab === "product" ? "active" : ""}`}
                    onClick={() => setActiveTab("product")}
                >
                    상품 문의
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === "oneday" ? "active" : ""}`}
                    onClick={() => setActiveTab("oneday")}
                >
                    원데이 클래스 문의
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">로딩 중...</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>상태</th>
                                <th>작성자</th>
                                <th>내용</th>
                                <th>작성일</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">문의 내역이 없습니다.</td>
                                </tr>
                            ) : (
                                inquiries.map((inq) => {
                                    const id = activeTab === "product" ? inq.inqId : inq.id;
                                    const answered = activeTab === "product" ? inq.answeredYn : inq.answered;
                                    const content = activeTab === "product" ? inq.content : inq.content;
                                    const writer = activeTab === "product" ? inq.userId : inq.writerName;

                                    return (
                                        <React.Fragment key={id}>
                                            <tr>
                                                <td>
                                                    <span className={`admin-badge ${answered ? "badge-active" : "badge-ready"}`}>
                                                        {answered ? "답변완료" : "답변대기"}
                                                    </span>
                                                </td>
                                                <td>{writer}</td>
                                                <td className="text-start" style={{ maxWidth: '300px' }}>
                                                    <div className="text-truncate" title={content}>{content}</div>
                                                </td>
                                                <td>{formatDate(inq.createdAt)}</td>
                                                <td>
                                                    <button
                                                        className="admin-btn-sm"
                                                        onClick={() => setShowAnswerForm(showAnswerForm === id ? null : id)}
                                                    >
                                                        {answered ? "답변수정" : "답변하기"}
                                                    </button>
                                                </td>
                                            </tr>
                                            {showAnswerForm === id && (
                                                <tr className="answer-form-row">
                                                    <td colSpan="5" style={{ background: '#F9FAFB', padding: '24px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '700', marginBottom: '8px', color: '#374151' }}>문의 내용</div>
                                                                <div style={{ padding: '16px', border: '1px solid #E5E7EB', background: '#FFFFFF', borderRadius: '12px', color: '#111827', lineHeight: '1.6' }}>
                                                                    {content}
                                                                </div>
                                                            </div>
                                                            {answered && (
                                                                <div>
                                                                    <div style={{ fontWeight: '700', marginBottom: '8px', color: '#059669' }}>기존 답변</div>
                                                                    <div style={{ padding: '16px', border: '1px solid #E5E7EB', background: '#F0FDF4', borderRadius: '12px', color: '#047857', lineHeight: '1.6' }}>
                                                                        {activeTab === "product" ? inq.answer : inq.answerContent}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div style={{ fontWeight: '700', marginBottom: '8px', color: '#374151' }}>답변 작성</div>
                                                                <textarea
                                                                    className="admin-input"
                                                                    rows="4"
                                                                    placeholder="답변 내용을 입력하세요..."
                                                                    value={answerInputs[id] ?? (activeTab === "product" ? (inq.answer || "") : (inq.answerContent || ""))}
                                                                    onChange={(e) => handleAnswerChange(id, e.target.value)}
                                                                />
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <button
                                                                    className="admin-btn-search"
                                                                    onClick={() => submitAnswer(id)}
                                                                >
                                                                    답변 저장
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === "product" && pagination.totalPages > 1 && (
                <div className="admin-pagination">
                    <button
                        className="admin-page-btn"
                        onClick={() => fetchInquiries(Math.max(0, pagination.page - 1))}
                        disabled={pagination.page === 0}
                    >
                        &lt;
                    </button>
                    <span className="admin-page-info">
                        {pagination.page + 1} / {pagination.totalPages}
                    </span>
                    <button
                        className="admin-page-btn"
                        onClick={() => fetchInquiries(Math.min(pagination.totalPages - 1, pagination.page + 1))}
                        disabled={pagination.page >= pagination.totalPages - 1}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminInquiryList;
