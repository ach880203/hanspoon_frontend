import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';

function AdminNoticeList() {
    const [notices, setNotices] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

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
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>공지사항 관리</h2>
                <Link to="/admin/notice/write" className="btn btn-primary">
                    새 공지사항 작성
                </Link>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성일</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {notices.map((notice) => (
                        <tr key={notice.noticeId}>
                            <td>{notice.noticeId}</td>
                            <td>{notice.title}</td>
                            <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Link to={`/admin/notice/edit/${notice.noticeId}`} className="btn btn-sm btn-outline-primary me-2">
                                    수정
                                </Link>
                                <button onClick={() => handleDelete(notice.noticeId)} className="btn btn-sm btn-outline-danger">
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
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    이전
                </button>
                <span className="align-self-center mx-2">
                    {page + 1} / {totalPages === 0 ? 1 : totalPages}
                </span>
                <button
                    className="btn btn-outline-secondary ms-2"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                >
                    다음
                </button>
            </div>
        </div>
    );
}

export default AdminNoticeList;
