import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import './AdminList.css';

function AdminEventList() {
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [query, setQuery] = useState('');

    const fetchEvents = async () => {
        try {
            const response = await adminApi.getEvents({ page, size: 10 });
            setEvents(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('이벤트 불러오기 실패:', error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [page]);

    const filtered = useMemo(() => {
        if (!query) return events;
        return events.filter((e) => (e.title || '').toLowerCase().includes(query.toLowerCase()));
    }, [events, query]);

    const handleDelete = async (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await adminApi.deleteEvent(id);
                alert('삭제되었습니다.');
                fetchEvents();
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
                        <div className="admin-list-title">이벤트 관리</div>
                        <div style={{ color: '#6B7280', marginTop: 6 }}>이벤트를 등록/수정하고 상태를 관리하세요.</div>
                    </div>
                    <Link to="/admin/event/write" className="admin-btn-sm" style={{ background: '#FF7E36', color: '#fff', border: 'none' }}>
                        새 이벤트 등록
                    </Link>
                </div>
            </div>

            <div className="admin-list-controls">
                <div className="admin-control-grid">
                    <div className="admin-search-box">
                        <input className="admin-input" placeholder="제목으로 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
                        <button className="admin-btn-search" onClick={() => setPage(0)}>검색</button>
                    </div>
                    <select className="admin-select" onChange={(e) => { /* 상태 필터 여지 */ }}>
                        <option value="">전체</option>
                        <option value="ongoing">진행중</option>
                        <option value="ended">종료</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: 90 }}>번호</th>
                            <th>제목</th>
                            <th style={{ width: 220 }}>기간</th>
                            <th style={{ width: 120 }}>상태</th>
                            <th style={{ width: 220 }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((event) => {
                            const isExpired = new Date(event.endDate) < new Date();
                            return (
                                <tr key={event.eventId}>
                                    <td>{event.eventId}</td>
                                    <td>{event.title}</td>
                                    <td>{new Date(event.startDate).toLocaleDateString()} ~ {new Date(event.endDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`admin-badge ${isExpired ? 'badge-failed' : 'badge-paid'}`}>
                                            {isExpired ? '종료' : '진행중'}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/admin/event/edit/${event.eventId}`} className="admin-btn-sm" style={{ marginRight: 8 }}>
                                            수정
                                        </Link>
                                        <button onClick={() => handleDelete(event.eventId)} className="admin-btn-sm admin-btn-refund">
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
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

export default AdminEventList;
