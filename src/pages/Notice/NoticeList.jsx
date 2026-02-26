import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { noticeApi } from "../../api";
import "./Notice.css";

function NoticeList() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchNotices();
  }, [page]);

  const fetchNotices = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await noticeApi.getNotices({ page, size: 10 });

      if (result.success) {
        setNotices(result.data.content || []);
        setTotalPages(result.data.totalPages || 0);
      } else {
        setError(result.message || "공지사항을 불러올 수 없습니다.");
      }
    } catch (err) {
      setError(err.message || "공지사항을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="notice-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">공지사항</h1>
          <p className="page-description">한스푼의 새로운 소식을 확인해 보세요.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="notice-list">
          {notices.length === 0 ? (
            <div className="empty-state">
              <p>등록된 공지사항이 없습니다.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <Link key={notice.noticeId} to={`/notice/${notice.noticeId}`} className="notice-item" style={{ textDecoration: 'none' }}>
                <div className="notice-content">
                  {/* 타이틀에서 파란색 링크 효과 제거 위해 color 적용 */}
                  <h3 className="notice-title" style={{ color: '#2c3e50' }}>{notice.title}</h3>
                  <p className="notice-preview">{stripHtml(notice.content).substring(0, 100)}...</p>
                  <div className="notice-meta">
                    <span className="notice-date">{formatDate(notice.createdAt)}</span>
                    {notice.isImportant && <span className="badge badge-important">중요</span>}
                  </div>
                </div>
                <div className="notice-arrow">{">"}</div>
              </Link>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-secondary" onClick={() => setPage(page - 1)} disabled={page === 0}>
              이전
            </button>
            <span className="page-info">
              {page + 1} / {totalPages}
            </span>
            <button className="btn btn-secondary" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NoticeList;
