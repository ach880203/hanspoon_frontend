import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import './AdminList.css';

function AdminFaqList() {
    const [faqs, setFaqs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [query, setQuery] = useState('');
    // Note: AdminFaqController list returns PageResponse<FaqDto>
    // public ResponseEntity<ApiResponse<PageResponse<FaqDto>>> list(@PageableDefault(size = 20) Pageable pageable)

    const fetchFaqs = async () => {
        try {
            const response = await adminApi.getFaqs({ page, size: 20 });
            setFaqs(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('자주 묻는 질문 목록 불러오기 실패:', error);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, [page]);

    const filtered = useMemo(() => {
        if (!query) return faqs;
        return faqs.filter((f) => (f.question || '').toLowerCase().includes(query.toLowerCase()));
    }, [faqs, query]);

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
        <div className="admin-list-container">
            <div className="admin-list-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="admin-list-title">자주 묻는 질문 관리</div>
                        <div style={{ color: '#6B7280', marginTop: 6 }}>FAQ을 그룹별로 관리하고 빠르게 검색하세요.</div>
                    </div>
                    <Link to="/admin/faq/write" className="admin-btn-sm" style={{ background: '#FF7E36', color: '#fff', border: 'none' }}>
                        새 질문 등록
                    </Link>
                </div>
            </div>

            <div className="admin-list-controls">
                <div className="admin-control-grid">
                    <div className="admin-search-box">
                        <input className="admin-input" placeholder="질문으로 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
                        <button className="admin-btn-search" onClick={() => setPage(0)}>검색</button>
                    </div>
                    <select className="admin-select" onChange={(e) => { /* 카테고리 필터 추가 가능 */ }}>
                        <option value="">전체 카테고리</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: 90 }}>번호</th>
                            <th style={{ width: 180 }}>카테고리</th>
                            <th>질문</th>
                            <th style={{ width: 220 }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((faq) => (
                            <tr key={faq.faqId}>
                                <td>{faq.faqId}</td>
                                <td>{faq.category}</td>
                                <td>{faq.question}</td>
                                <td>
                                    <Link to={`/admin/faq/edit/${faq.faqId}`} className="admin-btn-sm" style={{ marginRight: 8 }}>
                                        수정
                                    </Link>
                                    <button onClick={() => handleDelete(faq.faqId)} className="admin-btn-sm admin-btn-refund">
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="admin-pagination">
                <button className="admin-page-btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>◀</button>
                <div className="admin-page-info">{page + 1} / {totalPages === 0 ? 1 : totalPages}</div>
                <button className="admin-page-btn" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>▶</button>
            </div>
        </div>
    );
}

export default AdminFaqList;
