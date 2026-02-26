import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { noticeApi } from '../../api';
import './Notice.css';

function NoticeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNoticeDetail();
    }, [id]);

    const fetchNoticeDetail = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await noticeApi.getNoticeById(id);

            if (result.success) {
                setNotice(result.data);
            } else {
                setError(result.message || '공지사항을 불러올 수 없습니다.');
            }
        } catch (err) {
            setError(err.message || '공지사항을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="alert alert-error">{error}</div>
                <button onClick={() => navigate('/notice')} className="btn btn-primary">
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    if (!notice) {
        return (
            <div className="container">
                <div className="alert alert-info">공지사항을 찾을 수 없습니다.</div>
                <button onClick={() => navigate('/notice')} className="btn btn-primary">
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="notice-detail-page">
            <div className="container">
                <div className="notice-detail-card">
                    <div className="notice-detail-header">
                        {notice.isImportant && (
                            <span className="badge badge-important">중요</span>
                        )}
                        <h1 className="notice-detail-title">{notice.title}</h1>
                        <div className="notice-detail-meta">
                            <span>작성일 {formatDate(notice.createdAt)}</span>
                            {notice.updatedAt && notice.updatedAt !== notice.createdAt && (
                                <span>수정일 {formatDate(notice.updatedAt)}</span>
                            )}
                        </div>
                    </div>

                    <div className="notice-detail-content">
                        {notice.content}
                    </div>

                    <div className="notice-detail-footer">
                        <button
                            onClick={() => navigate('/notice')}
                            className="btn btn-secondary"
                        >
                            목록으로
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NoticeDetail;

