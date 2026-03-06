import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { eventApi } from '../../api';
import './EventPopup.css';

const EventPopup = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [event, setEvent] = useState(null);

    useEffect(() => {
        const checkEventAndShowPopup = async () => {
            // 1. "오늘 하루 보지 않기" 체크 (로컬 스토리지)
            const hideUntil = localStorage.getItem('hideEventPopupUntil');
            if (hideUntil) {
                const now = new Date();
                const hideDate = new Date(hideUntil);
                if (now < hideDate) return;
                localStorage.removeItem('hideEventPopupUntil');
            }

            // 2. 현재 세션에서 닫았는지 체크 (세션 스토리지 - 반복 노출 방지)
            if (sessionStorage.getItem('hideEventPopupForSession')) {
                return;
            }

            try {
                const response = await eventApi.getEvents({ page: 0, size: 1, activeOnly: true });
                const contentData = response.data?.content || response.data?.data?.content;

                if (response.success && contentData && contentData.length > 0) {
                    const latestEvent = contentData[0];

                    // 3. 필터링: 제목에 '가입', '신규'가 포함된 '가입 유도' 이벤트는 로그인한 사용자에게 숨김
                    const isSignupEvent = latestEvent.title.includes('가입') || latestEvent.title.includes('신규');
                    if (user && isSignupEvent) {
                        return;
                    }

                    setEvent(latestEvent);
                    setIsVisible(true);
                }
            } catch (error) {
                console.error('[EventPopup] 이벤트 팝업 정보를 불러오는데 실패했습니다.', error);
            }
        };

        checkEventAndShowPopup();
    }, [user]); // user 상태 변화 시 재체크

    const handleHideToday = () => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        localStorage.setItem('hideEventPopupUntil', tomorrow.toISOString());
        setIsVisible(false);
    };

    const handleClose = () => {
        // 단순 닫기 시 세션 동안만 숨김 처리
        sessionStorage.setItem('hideEventPopupForSession', 'true');
        setIsVisible(false);
    };

    const handleEventClick = () => {
        if (event) {
            navigate(`/event/${event.eventId}`);
            setIsVisible(false);
        }
    }

    if (!isVisible || !event) return null;

    // 제목 등 내용물에 기인하여 마케팅 문구를 세팅합니다.
    const isSignupEvent = event.title.includes('가입') || event.title.includes('신규');
    const ctaText = isSignupEvent ? '지금 바로 가입하고 혜택 받기' : '자세히 알아보고 혜택 받기';
    const subText = isSignupEvent
        ? '시작하는 분들을 위해 한스푼이 특별한 선물을 준비했어요. 지금 바로 확인해 보세요!'
        : '지금 이 순간에만 만날 수 있는 한스푼의 특별한 이벤트를 확인해 보세요!';

    return (
        <div className="event-popup-overlay">
            <div className="event-popup">
                {/* 1. 이탈을 최소화하고 화면 외곽으로 빼둔 닫기(X) 아이콘 */}
                <button className="btn-close-icon" onClick={handleClose} aria-label="닫기">✕</button>

                {/* 2. 상단 히어로 이미지 영역 */}
                <div className="event-popup-hero" onClick={handleEventClick}>
                    {event.thumbnailUrl ? (
                        <img
                            src={event.thumbnailUrl}
                            alt={event.title}
                            className="event-popup-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=500";
                            }}
                        />
                    ) : (
                        <div className="event-popup-placeholder">
                            <span className="event-popup-icon">🎁</span>
                        </div>
                    )}
                </div>

                {/* 3. 명확한 시각적 위계의 헤드라인, 서브텍스트, 메인 CTA 버튼 영역 */}
                <div className="event-popup-body">
                    <h3 className="event-popup-headline">{event.title}</h3>
                    <p className="event-popup-subtext">{subText}</p>
                    <button className="btn-cta-primary" onClick={handleEventClick}>
                        {ctaText}
                    </button>
                </div>

                {/* 4. 시선을 뺏지 않는 보조 버튼 (오늘 하루 보지 않기) */}
                <div className="event-popup-footer">
                    <button className="btn-hide-today" onClick={handleHideToday}>
                        오늘 하루 더 이상 보지 않기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventPopup;
