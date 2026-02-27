import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventApi } from "../../api";
import "./Event.css";

function EventList() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchEvents();
    }, [page]);

    const fetchEvents = async () => {
        setLoading(true);
        setError("");

        try {
            // activeOnly를 false로 주어 진행/종료 이벤트 모두 불러옴
            const result = await eventApi.getEvents({ page, size: 9, activeOnly: false });

            if (result.success) {
                setEvents(result.data.content || []);
                setTotalPages(result.data.totalPages || 0);
            } else {
                setError(result.message || "이벤트를 불러올 수 없습니다.");
            }
        } catch (err) {
            setError(err.message || "이벤트를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="event-page">
            <div className="container">
                <div className="event-header">
                    <h1 className="event-title">진행중인 이벤트</h1>
                    <p className="event-description">한스푼이 준비한 특별한 혜택을 놓치지 마세요.</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {events.length === 0 ? (
                    <div className="empty-state">
                        <p>현재 진행 중인 이벤트가 없습니다.</p>
                    </div>
                ) : (
                    <div className="event-grid">
                        {events.map((event) => (
                            <Link key={event.eventId} to={`/event/${event.eventId}`} className="event-card">
                                <div className="event-thumbnail">
                                    {event.isActive ? (
                                        <span className="event-status-badge status-active">진행중</span>
                                    ) : (
                                        <span className="event-status-badge status-ended">종료</span>
                                    )}
                                    {event.thumbnailUrl ? (
                                        <img
                                            src={event.thumbnailUrl}
                                            alt={event.title}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=500";
                                            }}
                                        />
                                    ) : (
                                        <div className="event-placeholder">🎁</div>
                                    )}
                                </div>
                                <div className="event-info">
                                    <h3 className="event-card-title">{event.title}</h3>
                                    <div className="event-card-period">
                                        🕒 {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

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

export default EventList;
