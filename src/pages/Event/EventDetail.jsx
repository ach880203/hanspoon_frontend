import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventApi } from "../../api";
import "./Event.css";

function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEventDetail();
    }, [id]);

    const fetchEventDetail = async () => {
        setLoading(true);
        setError("");

        try {
            const result = await eventApi.getEventById(id);
            if (result.success) {
                setEventData(result.data);
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
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !eventData) {
        return (
            <div className="container">
                <div className="alert alert-error">{error || "이벤트를 찾을 수 없습니다."}</div>
                <div className="text-center mt-4">
                    <button onClick={() => navigate("/event")} className="btn btn-primary">
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="event-detail-page">
            <div className="container">
                <div className="event-detail-wrapper">
                    {eventData.thumbnailUrl && (
                        <div className="event-detail-hero">
                            <img
                                src={eventData.thumbnailUrl}
                                alt={eventData.title}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=800";
                                }}
                            />
                        </div>
                    )}

                    <div className="event-detail-header">
                        {eventData.isActive ? (
                            <span className="event-status-badge status-active" style={{ position: 'relative', top: 0, left: 0 }}>진행중</span>
                        ) : (
                            <span className="event-status-badge status-ended" style={{ position: 'relative', top: 0, left: 0 }}>종료됨</span>
                        )}
                        <h1 className="event-detail-title">{eventData.title}</h1>
                        <div className="event-detail-period">
                            🎈 {formatDate(eventData.startDate)} ~ {formatDate(eventData.endDate)}
                        </div>
                    </div>

                    <div className="event-detail-body">
                        {/* HTML 콘텐츠를 렌더링 */}
                        <div
                            className="event-html-content"
                            dangerouslySetInnerHTML={{ __html: eventData.content }}
                        />
                    </div>

                    <div className="event-detail-footer">
                        <button onClick={() => navigate("/event")} className="btn btn-secondary px-5 py-3">
                            목록으로
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventDetail;
