import React, { useState } from 'react';
// 한나님의 API 관리 파일에서 Recommend 함수를 임포트합니다.
import { Recommend } from '../../api/recipeApi';

const RecommendButton = ({ recipeId, initialCount, isInitiallyRecommended }) => {
    const [recommendCount, setRecommendCount] = useState(initialCount || 0);
    const [isRecommended, setIsRecommended] = useState(isInitiallyRecommended || false);
    const [loading, setLoading] = useState(false);

    const handleRecommendClick = async () => {
        if (loading) return; // 연속 클릭 방지

        setLoading(true);
        try {
            // 🚩 한나님이 만드신 Recommend 함수를 여기서 호출합니다!
            const response = await Recommend(recipeId);

            if (response.status === 200 || response.status === 201) {
                // 추천 성공 시 로직
                if (!isRecommended) {
                    setRecommendCount(prev => prev + 1);
                    setIsRecommended(true);
                    alert("레시피를 추천했습니다! 스푼이 적립되었습니다! 🥄");
                } else {
                    // 만약 백엔드에서 토글(추천 취소) 기능을 지원한다면
                    setRecommendCount(prev => prev - 1);
                    setIsRecommended(false);
                    alert("추천을 취소했습니다.");
                }
            }
        } catch (error) {
            console.error("추천 오류:", error);
            // 로그인 안 했을 때나 본인 글일 때의 에러 처리
            alert("추천할 수 없습니다. (로그인 여부 또는 본인 글 확인)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="recommend-container" style={{ margin: '30px 0', textAlign: 'center' }}>
            <button
                onClick={handleRecommendClick}
                disabled={loading}
                style={{
                    backgroundColor: isRecommended ? '#ff6b6b' : '#fff',
                    color: isRecommended ? '#fff' : '#ff6b6b',
                    border: '2px solid #ff6b6b',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    cursor: loading ? 'default' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease-in-out',
                    fontSize: '16px'
                }}
            >
                <i className={`fa-${isRecommended ? 'solid' : 'regular'} fa-heart`}></i>
                <span>{isRecommended ? '추천됨' : '추천하기'}</span>
                <span style={{ borderLeft: '1px solid', paddingLeft: '10px', marginLeft: '5px' }}>
          {recommendCount}
        </span>
            </button>

            <p style={{ color: '#999', fontSize: '12px', marginTop: '10px' }}>
                이 레시피가 마음에 드신다면 스푼을 선물해 주세요!
            </p>
        </div>
    );
};

export default RecommendButton;