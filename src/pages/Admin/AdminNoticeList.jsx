import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import './AdminList.css';

function AdminNoticeList() {
    const [notices, setNotices] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [query, setQuery] = useState('');

    const fetchNotices = async () => {
        try {
            const response = await adminApi.getNotices({ page, size: 10 });
            setNotices(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('공지사항 불러오기 실패:', error);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, [page]);

    const filtered = useMemo(() => {
        if (!query) return notices;
        return notices.filter((n) => (n.title || '').toLowerCase().includes(query.toLowerCase()));
    }, [notices, query]);

    const handleDelete = async (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await adminApi.deleteNotice(id);
                alert('삭제되었습니다.');
                fetchNotices();
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
                        <div className="admin-list-title">공지사항 관리</div>
                        <div style={{ color: '#6B7280', marginTop: 6 }}>공지사항을 확인, 등록, 수정하세요.</div>
                    </div>
                    <Link to="/admin/notice/write" className="admin-btn-sm" style={{ background: '#FF7E36', color: '#fff', border: 'none' }}>
                        새 공지사항 작성
                    </Link>
                </div>
            </div>

            <div className="admin-list-controls">
                <div className="admin-control-grid">
                    <div className="admin-search-box">
                        <input className="admin-input" placeholder="제목으로 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
                        <button className="admin-btn-search" onClick={() => setPage(0)}>검색</button>
                    </div>
                    <select className="admin-select" onChange={(e) => { /* placeholder for future filters */ }}>
                        <option value="">전체</option>
                        <option value="important">중요 공지</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: 90 }}>번호</th>
                            <th>제목</th>
                            <th style={{ width: 160 }}>작성일</th>
                            <th style={{ width: 220 }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((notice) => (
                            <tr key={notice.noticeId}>
                                <td>{notice.noticeId}</td>
                                <td>{notice.title}</td>
                                <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <Link to={`/admin/notice/edit/${notice.noticeId}`} className="admin-btn-sm" style={{ marginRight: 8 }}>
                                        수정
                                    </Link>
                                    <button onClick={() => handleDelete(notice.noticeId)} className="admin-btn-sm admin-btn-refund">
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

export default AdminNoticeList;
