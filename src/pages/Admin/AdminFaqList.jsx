
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';

function AdminFaqList() {
    const [faqs, setFaqs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    // Note: AdminFaqController list returns PageResponse<FaqDto>
    // public ResponseEntity<ApiResponse<PageResponse<FaqDto>>> list(@PageableDefault(size = 20) Pageable pageable)

    const fetchFaqs = async () => {
        try {
            const response = await adminApi.getFaqs({ page, size: 20 });
            setFaqs(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('FAQ 불러오기 실패:', error);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, [page]);

    const handleDelete = async (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await adminApi.deleteFaq(id);
                alert('삭제되었습니다.');
                fetchFaqs();
            } catch (error) {
                console.error('삭제 실패:', error);
                alert('삭제에 실패했습니다.');
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>FAQ 관리</h2>
                <Link to="/admin/faq/write" className="btn btn-primary">
                    새 FAQ 작성
                </Link>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>카테고리</th>
                        <th>질문</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {faqs.map((faq) => (
                        <tr key={faq.faqId}>
                            <td>{faq.faqId}</td>
                            <td>{faq.category}</td>
                            <td>{faq.question}</td>
                            <td>
                                <Link to={`/admin/faq/edit/${faq.faqId}`} className="btn btn-sm btn-outline-primary me-2">
                                    수정
                                </Link>
                                <button
                                    onClick={() => handleDelete(faq.faqId)}
                                    className="btn btn-sm btn-outline-danger"
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Simple Pagination */}
            <div className="d-flex justify-content-center mt-4">
                <button
                    className="btn btn-outline-secondary me-2"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    이전
                </button>
                <span className="align-self-center mx-2">
                    {page + 1} / {totalPages === 0 ? 1 : totalPages}
                </span>
                <button
                    className="btn btn-outline-secondary ms-2"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                >
                    다음
                </button>
            </div>
        </div>
    );
}

export default AdminFaqList;
