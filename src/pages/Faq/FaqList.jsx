import { useState, useEffect } from 'react';
import { faqApi } from '../../api';
import './Faq.css';

// 기본 FAQ 데이터 (API에서 못 가져올 경우를 대비한 폴백 및 상단 고정 데이터)
const DEFAULT_FAQS = [
    { faqId: 'd1', category: '쿠킹클래스', question: '클래스는 어떻게 신청하나요?', answer: '클래스 상세 페이지에서 희망하는 날짜와 시간을 선택하신 후 [신청하기] 버튼을 클릭해 결제를 진행하시면 최종 신청이 완료됩니다.\n신청 결과는 마이페이지의 [클래스 신청 내역]에서 실시간으로 확인하실 수 있습니다.' },
    { faqId: 'd2', category: '쿠킹클래스', question: '클래스 정원은 몇 명인가요?', answer: '수업의 집중도와 안전을 위해 최소 4명에서 최대 12명 내외로 운영됩니다.\n클래스 성격에 따라 정원이 상이할 수 있으니, 각 클래스의 상세 페이지 하단 [클래스 정보] 탭을 꼭 확인해 주세요.' },
    { faqId: 'd17', category: '쿠킹클래스', question: '영어 수강이 가능한가요?', answer: '현재 대부분의 클래스는 한국어로 진행됩니다.\n다만, 글로벌 셰프가 진행하는 특정 클래스에 한해 영어 통역 서비스가 제공될 수 있으니 상세 페이지의 개설 공지를 참고해 주세요.' },
    { faqId: 'd24', category: '쿠킹클래스', question: '앞치마와 필기도구를 챙겨가야 하나요?', answer: '한스푼 스튜디오에는 깨끗하게 세탁된 앞치마와 레시피 메모를 위한 필기도구가 준비되어 있습니다.\n개인 앞치마를 사용하고 싶으신 경우 지참하셔도 무방하며, 남은 음식을 가져가실 개인 용기를 가져오시면 환경 보호에도 큰 도움이 됩니다.' },
    { faqId: 'd8', category: '쿠킹클래스', question: '수업이 취소될 수도 있나요?', answer: '클래스 개시 2일 전까지 최소 인원이 미달될 경우 부득이하게 수업이 취소될 수 있습니다.\n이 경우 신청하신 분들께 개별 연락(문자/전화)을 드리고 결제하신 금액은 100% 환불 처리해 드립니다.' },

    { faqId: 'd3', category: '주문/배송', question: '배송 기간은 얼마나 걸리나요?', answer: '영업일 기준 결제 완료 후 보통 2~5일 이내에 받아보실 수 있습니다.\n신선 식품의 경우 최상의 상태를 유지하기 위해 주문 제작 후 당일 또는 익일 발송을 원칙으로 하고 있습니다.' },
    { faqId: 'd12', category: '주문/배송', question: '배송 조회는 어디서 하나요?', answer: '로그인 후 [마이페이지 > 주문/배송 내역]에서 해당 주문 건의 운송장 번호를 클릭하시면 실시간 배송 현황을 확인하실 수 있습니다.' },
    { faqId: 'd18', category: '주문/배송', question: '신선 식품인데 배송 시 부재중이면 어떻게 하나요?', answer: '한스푼의 마켓 식품은 친환경 보냉 박스와 아이스팩에 넣어 안전하게 배송됩니다.\n다만, 신선도 유지를 위해 가급적 당일 수령을 권장하며 직접 수령이 어려운 경우 경비실이나 통풍이 잘 되는 곳으로 수령 장소를 지정해 주세요.' },
    { faqId: 'd19', category: '주문/배송', question: '배송지 변경은 언제까지 가능한가요?', answer: '상품 상태가 [결제완료] 또는 [상품준비중] 단계에서만 수정이 가능합니다.\n[배송준비중] 단계부터는 운송장이 출력되어 출고가 시작되므로 변경이 어려운 점 양해 부탁드립니다.' },
    { faqId: 'd25', category: '주문/배송', question: '여러 상품을 주문하면 묶음 배송이 되나요?', answer: '출고지가 동일한 상품군에 한하여 자동으로 묶음 배송 처리됩니다.\n다만, 냉동 식품과 일반 공산품처럼 보관 방식이 다른 상품은 안전을 위해 개별 포장되어 발송될 수 있습니다.' },
    { faqId: 'd7', category: '주문/배송', question: '해외 배송도 가능한가요?', answer: '현재 한스푼 마켓은 국내 배송 서비스만 제공하고 있습니다.\n차후 해외 계시는 한식 팬분들을 위해 글로벌 배송 서비스를 준비 중에 있습니다.' },

    { faqId: 'd4', category: '결제/환불', question: '취소 및 환불 규정은 어떻게 되나요?', answer: '클래스는 3일 전까지 취소 시 100% 환불, 2일 전 70%, 1일 전 50%가 환불됩니다. 당일 취소는 환불이 불가합니다.\n일반 상품은 상품 수령 후 7일 이내에 교환/반품 신청이 가능하며, 변심의 경우 왕복 배송비는 고객님 부담입니다.' },
    { faqId: 'd10', category: '결제/환불', question: '결제 완료 후 확인은 어디서 하나요?', answer: '결제가 성공적으로 마무리되면 마이페이지의 [구매내역] 또는 [클래스 내역]에서 확인하실 수 있습니다.\n카드 결제의 경우 승인 즉시 확인 가능하며, 카카오페이 등 간편 결제 또한 즉시 반영됩니다.' },
    { faqId: 'd5', category: '결제/환불', question: '결제가 자꾸 실패해요.', answer: '카드 한도 초과, 유효기간 만료, 혹은 인터넷 브라우저의 보안 설정 문제일 수 있습니다.\n크롬(Chrome) 브라우저 사용을 권장하며, 지속적으로 실패할 경우 고객센터로 문의해 주시기 바랍니다.' },
    { faqId: 'd20', category: '결제/환불', question: '스푼(포인트)과 쿠폰을 동시에 사용할 수 있나요?', answer: '네, 가능합니다! 상품 상세 페이지에서 쿠폰을 먼저 적용하신 후, 결제 단계에서 보유하신 스푼을 입력하여 중복 할인을 받으실 수 있습니다.' },

    { faqId: 'd6', category: '레시피', question: '레시피를 직접 등록할 수 있나요?', answer: '네, 한스푼 회원이라면 누구나 자신만의 비법 레시피를 공유할 수 있습니다.\n[레시피 > 레시피 등록] 메뉴를 이용해 주세요. 등록하신 레시피는 운영진의 검수(2~3일 소요)를 거쳐 전체 공개됩니다.' },
    { faqId: 'd21', category: '레시피', question: '등록한 레시피를 수정하거나 삭제하고 싶어요.', answer: '작성하신 레시피는 [마이페이지 > 내가 쓴 레시피]에서 언제든 수정하거나 삭제하실 수 있습니다.\n내용이 크게 변경될 경우 재검수가 진행될 수 있는 점 참고해 주세요.' },
    { faqId: 'd9', category: '레시피', question: '재료가 부족하면 대체 가능한가요?', answer: '레시피 상세 설명 하단에 셰프님이 추천하는 [대체 가능한 재료] 팁이 포함되어 있는 경우가 많습니다.\n특정 알레르기가 있는 경우 셰프님께 1:1 메시지로 문의해 보세요.' },

    { faqId: 'd15', category: '기타', question: '단골 혜택(스푼)이 있나요?', answer: '모든 결제 금액의 1%가 기본 스푼으로 적립됩니다.\nVIP 등급이 되시면 적립률 상향은 물론, 신규 클래스 우선 신청권 등 다양한 특별 혜택을 누리실 수 있습니다.' },
    { faqId: 'd22', category: '기타', question: '회원 탈퇴는 어떻게 하나요?', answer: '회원 탈퇴는 [마이페이지 > 개인정보 관리] 하단의 [회원 탈퇴] 버튼을 통해 진행하실 수 있습니다.\n탈퇴 시 보유하신 스푼과 쿠폰은 모두 소멸되며 복구가 불가능하니 신중히 결정해 주세요.' },
    { faqId: 'd23', category: '기타', question: '비밀번호를 잊어버렸는데 어떻게 찾나요?', answer: '로그인 페이지 하단의 [비밀번호 찾기]를 클릭하신 후 가입하신 이메일을 입력해 주세요.\n해당 이메일로 임시 비밀번호를 발송해 드리거나 비밀번호 재설정 링크를 보내드립니다.' },
    { faqId: 'd16', category: '기타', question: '비회원 주문이 가능한가요?', answer: '현재 한스푼은 회원제로 운영되고 있어 로그인이 필요합니다.\n불필요한 정보 입력 없이 SNS 계정으로 5초 만에 가입 가능한 간편 로그인 서비스를 제공 중입니다.' }
];

const CATEGORY_ORDER = ['쿠킹클래스', '주문/배송', '결제/환불', '레시피', '기타'];

function FaqList() {
    const [faqs, setFaqs] = useState(DEFAULT_FAQS);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                console.log('Fetching FAQs for merging...');
                const result = await faqApi.getFaqs();
                console.log('API Result:', result);

                if (result.success && result.data && Array.isArray(result.data)) {
                    // 기본 FAQ와 API 데이터를 합침 (중복 방지는 queston 기준 등으로 할 수 있으나 여기서는 단순 합산)
                    // API 데이터가 우선순위를 가지게 하려면 적절히 처리
                    const combined = [...DEFAULT_FAQS, ...result.data];
                    // 만약 API 데이터에 'category'가 없으면 '기타'로 처리
                    const normalized = combined.map(item => ({
                        ...item,
                        category: item.category || '기타'
                    }));
                    setFaqs(normalized);
                }
            } catch (err) {
                console.error('FAQ fetching failed, staying with defaults:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    const toggleFaq = (id) => {
        setOpenId(openId === id ? null : id);
    };

    // 카테고리별 그룹화 및 정렬
    const presentCategories = Array.from(new Set(faqs.map(f => f.category)));
    const sortedCategories = CATEGORY_ORDER.filter(c => presentCategories.includes(c))
        .concat(presentCategories.filter(c => !CATEGORY_ORDER.includes(c)));

    if (loading) {
        return (
            <div className="faq-loading-container">
                <div className="faq-spinner"></div>
                <p>FAQ를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="faq-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">자주 묻는 질문</h1>
                    <p className="page-description">한스푼 이용에 대해 궁금한 점을 여기서 확인하세요.</p>
                </div>

                <div className="faq-container">
                    {sortedCategories.length === 0 ? (
                        <div className="faq-empty">등록된 FAQ가 없습니다.</div>
                    ) : (
                        sortedCategories.map(category => (
                            <div key={category} className="faq-category-section">
                                <h2 className="category-title">{category}</h2>
                                <div className="faq-list">
                                    {faqs.filter(f => f.category === category).map((faq, index) => (
                                        <div
                                            key={faq.faqId || `idx-${index}`}
                                            className={`faq-item ${openId === (faq.faqId || `idx-${index}`) ? 'active' : ''}`}
                                        >
                                            <button
                                                className="faq-question"
                                                onClick={() => toggleFaq(faq.faqId || `idx-${index}`)}
                                            >
                                                <span className="faq-icon-q">Q.</span>
                                                <span className="faq-question-text">{faq.question}</span>
                                                <svg className="faq-toggle-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9"></polyline>
                                                </svg>
                                            </button>

                                            {openId === (faq.faqId || `idx-${index}`) && (
                                                <div className="faq-answer-wrapper">
                                                    <div className="faq-answer">
                                                        <span className="faq-icon-a">A</span>
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
                        <p>고객센터로 문의해주시면 친절하게 답변드리겠습니다.</p>
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
