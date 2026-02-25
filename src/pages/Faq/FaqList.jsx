import { useState, useEffect } from 'react';
import { faqApi } from '../../api';
import './Faq.css';

// 기본 FAQ 데이터 (API에서 못 가져올 경우를 대비한 폴백 및 상단 고정 데이터)
const DEFAULT_FAQS = [
    { faqId: 'd1', category: '쿠킹클래스', question: '클래스는 어떻게 신청하나요?', answer: '클래스 상세 페이지에서 희망 날짜와 시간을 선택한 뒤 신청하기 버튼을 눌러 결제를 진행하시면 신청이 완료됩니다.' },
    { faqId: 'd2', category: '쿠킹클래스', question: '클래스 정원은 몇 명인가요?', answer: '클래스 성격에 따라 다르지만 일반적으로 4명에서 12명 내외로 운영됩니다.' },
    { faqId: 'd3', category: '주문/배송', question: '배송은 얼마나 걸리나요?', answer: '결제 완료 후 보통 영업일 기준 2~5일 내에 받아보실 수 있습니다.' },
    { faqId: 'd4', category: '주문/배송', question: '배송 조회는 어디서 하나요?', answer: '마이페이지의 주문/배송 조회 메뉴에서 운송장 정보를 확인하실 수 있습니다.' },
    { faqId: 'd5', category: '결제/환불', question: '취소 및 환불 규정이 궁금해요.', answer: '주문 상태 및 상품 유형에 따라 환불 정책이 다릅니다. 상세 내용은 각 상품 페이지와 결제 안내를 참고해 주세요.' },
    { faqId: 'd6', category: '결제/환불', question: '결제가 계속 실패해요.', answer: '카드 한도, 유효기간, 보안 설정, 네트워크 상태를 확인해 주세요. 동일 문제가 반복되면 고객센터로 문의해 주세요.' },
    { faqId: 'd7', category: '레시피', question: '레시피를 직접 등록할 수 있나요?', answer: '네, 회원이라면 누구나 레시피를 등록할 수 있습니다. 등록 후 운영 검수를 거쳐 공개됩니다.' },
    { faqId: 'd8', category: '레시피', question: '등록한 레시피를 수정할 수 있나요?', answer: '마이페이지의 내 레시피 메뉴에서 수정 및 삭제가 가능합니다.' },
    { faqId: 'd9', category: '기타', question: '회원 탈퇴는 어떻게 하나요?', answer: '마이페이지 개인정보 관리에서 회원 탈퇴를 진행할 수 있습니다.' },
    { faqId: 'd10', category: '기타', question: '비밀번호를 잊어버렸어요.', answer: '로그인 페이지에서 비밀번호 찾기를 이용해 재설정할 수 있습니다.' }
];

const CATEGORY_ORDER = ['쿠킹클래스', '주문/배송', '결제/환불', '레시피', '기타'];

function FaqList() {
    const [faqs, setFaqs] = useState(DEFAULT_FAQS);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const result = await faqApi.getFaqs();

                if (result.success && result.data && Array.isArray(result.data)) {
                    const combined = [...DEFAULT_FAQS, ...result.data];
                    const normalized = combined.map((item) => ({
                        ...item,
                        category: item.category || '기타'
                    }));
                    setFaqs(normalized);
                }
            } catch (err) {
                console.error('FAQ 불러오기 실패, 기본 데이터 유지:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    const toggleFaq = (id) => {
        setOpenId(openId === id ? null : id);
    };

    const presentCategories = Array.from(new Set(faqs.map((f) => f.category)));
    const sortedCategories = CATEGORY_ORDER.filter((c) => presentCategories.includes(c))
        .concat(presentCategories.filter((c) => !CATEGORY_ORDER.includes(c)));

    if (loading) {
        return (
            <div className="faq-loading-container">
                <div className="faq-spinner"></div>
                <p>자주 묻는 질문을 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="faq-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">자주 묻는 질문</h1>
                    <p className="page-description">한스푼 이용에 대해 궁금한 점을 확인하세요.</p>
                </div>

                <div className="faq-container">
                    {sortedCategories.length === 0 ? (
                        <div className="faq-empty">등록된 질문이 없습니다.</div>
                    ) : (
                        sortedCategories.map((category) => (
                            <div key={category} className="faq-category-section">
                                <h2 className="category-title">{category}</h2>
                                <div className="faq-list">
                                    {faqs.filter((f) => f.category === category).map((faq, index) => (
                                        <div
                                            key={faq.faqId || `idx-${index}`}
                                            className={`faq-item ${openId === (faq.faqId || `idx-${index}`) ? 'active' : ''}`}
                                        >
                                            <button
                                                className="faq-question"
                                                onClick={() => toggleFaq(faq.faqId || `idx-${index}`)}
                                            >
                                                <span className="faq-icon-q">문</span>
                                                <span className="faq-question-text">{faq.question}</span>
                                                <svg className="faq-toggle-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9"></polyline>
                                                </svg>
                                            </button>

                                            {openId === (faq.faqId || `idx-${index}`) && (
                                                <div className="faq-answer-wrapper">
                                                    <div className="faq-answer">
                                                        <span className="faq-icon-a">답</span>
                                                        <div className="faq-answer-content">
                                                            <p>{faq.answer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="faq-contact">
                    <div className="card">
                        <h3>원하는 답변을 찾지 못하셨나요?</h3>
                        <p>고객센터로 문의해 주시면 빠르게 도와드리겠습니다.</p>
                        <div className="contact-info">
                            <div className="contact-item">
                                <strong>이메일</strong> support@hanspoon.com
                            </div>
                            <div className="contact-item">
                                <strong>상담전화</strong> 1234-5678 (평일 09:00~18:00)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FaqList;
