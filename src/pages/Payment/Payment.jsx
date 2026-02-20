import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentApi } from '../../api';
import { formatPhoneNumber } from '../../utils/format';
import './Payment.css';

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const [paymentMethod, setPaymentMethod] = useState('card');
    const { itemName, amount, reservationId, classId, orderId } = location.state || {};

    const [formData, setFormData] = useState({
        itemName: itemName || '원데이 클래스',
        amount: amount || 50000,
        buyerName: '',
        buyerEmail: '',
        buyerTel: ''
    });
    const [loading, setLoading] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [pointBalance, setPointBalance] = useState(0);
    const [usedPoints, setUsedPoints] = useState(0);

    const [portOneConfig, setPortOneConfig] = useState(null);

    // 1. 설정 및 데이터 가져오기
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configData, couponData, balance] = await Promise.all([
                    paymentApi.getPortOneConfig(),
                    paymentApi.getMyCoupons(),
                    paymentApi.getPointBalance()
                ]);

                console.log("Loaded Config:", configData); // 디버깅 로그

                // API 응답 구조에 따라 데이터 추출
                const cfg = configData?.data || configData;
                if (cfg) {
                    setPortOneConfig(cfg);
                } else {
                    console.error("PortOne config is empty/null");
                    alert("결제 설정을 불러오지 못했습니다. 새로고침 해주세요.");
                }

                setCoupons(Array.isArray(couponData) ? couponData.filter(c => c.usable) : []);
                setPointBalance(typeof balance === 'number' ? balance : 0);
            } catch (error) {
                console.error('필요한 정보를 불러오는데 실패했습니다.', error);
                if (error.response && error.response.status === 401) {
                    alert('로그인이 필요한 서비스입니다.');
                    navigate('/login');
                } else {
                    alert('결제 정보를 불러오는 중 오류가 발생했습니다: ' + (error.message || "Unknown error"));
                }
            }
        };

        fetchData();
    }, []);

    // 쿠폰 및 포인트 변경 시 할인액 계산
    useEffect(() => {
        const baseAmount = formData.amount;
        let couponDiscount = 0;

        if (selectedCoupon) {
            if (selectedCoupon.discountType === 'FIXED') {
                couponDiscount = selectedCoupon.discountValue;
            } else {
                couponDiscount = Math.floor(baseAmount * (selectedCoupon.discountValue / 100));
            }
        }

        setDiscountAmount(couponDiscount);

        // 사용 포인트가 쿠폰 할인 후 금액을 초초과하지 않도록 조정
        const maxApplicablePoints = Math.max(0, baseAmount - couponDiscount);
        if (usedPoints > maxApplicablePoints) {
            setUsedPoints(maxApplicablePoints);
        }
    }, [selectedCoupon, formData.amount, usedPoints]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'buyerTel' ? formatPhoneNumber(value) : value
        });
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!portOneConfig) {
            alert('결제 설정을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.buyerEmail)) {
            alert('올바른 이메일 형식을 입력해주세요. (예: test@email.com)');
            return;
        }

        setLoading(true);

        try {
            // 결제 수단에 따른 채널 키 선택
            const config = portOneConfig?.data || portOneConfig;

            console.log("PortOne Config Loaded:", config); // 디버깅용 로그

            let channelKey;
            let payMethodType = "CARD";

            if (paymentMethod === 'kakaopay') {
                channelKey = config.channelKeyKakao;
                payMethodType = "EASY_PAY";
            } else if (paymentMethod === 'tosspay') {
                channelKey = config.channelKeyToss;
                payMethodType = "EASY_PAY";
            } else {
                channelKey = config.channelKeyTossPayments;
                payMethodType = "CARD";
            }

            if (!channelKey || channelKey.startsWith("${")) {
                throw new Error("결제 채널 키가 올바르게 설정되지 않았습니다. 백엔드 환경변수(PORTONE_CHANNEL_KEY 등) 설정을 확인해주세요.");
            }

            const merchantUid = `PAY-${Date.now()}`;
            const totalAmount = Number(formData.amount) - discountAmount - usedPoints;

            const response = await window.PortOne.requestPayment({
                storeId: config.storeId,
                channelKey: channelKey,
                paymentId: merchantUid,
                orderName: formData.itemName,
                totalAmount: totalAmount,
                currency: "CURRENCY_KRW",
                payMethod: payMethodType,
                customer: {
                    fullName: formData.buyerName,
                    email: formData.buyerEmail,
                    phoneNumber: formData.buyerTel.replace(/-/g, ''),
                }
            });

            if (response.code != null) {
                throw new Error(response.message || "결제가 취소되었거나 실패했습니다.");
            }

            // 4. 백엔드 결제 검증
            const verifyResult = await paymentApi.verifyPayment({
                paymentId: response.paymentId,
                orderId: merchantUid,
                amount: Number(formData.amount), // 기준 금액 (할인 전)
                productId: null,
                classId: classId ? Number(classId) : null,
                reservationId: reservationId ? Number(reservationId) : null,
                userCouponId: selectedCoupon ? selectedCoupon.userCouponId : null,
                usedPoints: usedPoints, // 포인트 정보 추가
                quantity: 1
            });

            if (verifyResult.success) {
                navigate('/payment/success', {
                    state: { paymentData: verifyResult.data || verifyResult }
                });
            } else {
                throw new Error(verifyResult.message || "결제 검증에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert(error.message || '결제 처리 중 오류가 발생했습니다.');
            navigate('/payment/fail', { state: { message: error.message } });
        } finally {
            setLoading(false);
        }
    };

    const handlePointInput = (e) => {
        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
        if (isNaN(val)) return;

        let targetPoint = Math.max(0, Math.min(val, pointBalance));
        const remainingAmountAfterCoupon = formData.amount - discountAmount;
        targetPoint = Math.min(targetPoint, remainingAmountAfterCoupon);

        setUsedPoints(targetPoint);
    };

    const applyAllPoints = () => {
        const remainingAmountAfterCoupon = formData.amount - discountAmount;
        setUsedPoints(Math.min(pointBalance, remainingAmountAfterCoupon));
    };

    return (
        <div className="payment-page">
            <div className="container">
                <div className="payment-container">
                    <div className="payment-card">
                        <h1 className="payment-title">결제하기</h1>
                        <p className="payment-subtitle">안전하고 간편한 결제</p>

                        <form onSubmit={handlePayment} className="payment-form">
                            <div className="form-section">
                                <h3 className="section-title">상품 정보</h3>
                                <div className="form-group">
                                    <label className="form-label">상품명</label>
                                    <input
                                        type="text"
                                        name="itemName"
                                        className="form-input"
                                        value={formData.itemName}
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">결제 금액</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        className="form-input"
                                        value={formData.amount}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title">구매자 정보</h3>
                                <div className="form-group">
                                    <label className="form-label">이름</label>
                                    <input
                                        type="text"
                                        name="buyerName"
                                        className="form-input"
                                        placeholder="홍길동"
                                        value={formData.buyerName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">이메일</label>
                                    <input
                                        type="email"
                                        name="buyerEmail"
                                        className="form-input"
                                        placeholder="example@email.com"
                                        value={formData.buyerEmail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">전화번호</label>
                                    <input
                                        type="tel"
                                        name="buyerTel"
                                        className="form-input"
                                        placeholder="010-1234-5678"
                                        value={formData.buyerTel}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title">할인 적용</h3>

                                <div className="form-group">
                                    <label className="form-label">쿠폰 선택</label>
                                    <select
                                        className="form-input"
                                        onChange={(e) => {
                                            const id = Number(e.target.value);
                                            setSelectedCoupon(coupons.find(c => c.userCouponId === id) || null);
                                        }}
                                        value={selectedCoupon?.userCouponId || ""}
                                    >
                                        <option value="">적용할 쿠폰을 선택하세요</option>
                                        {coupons.map(c => (
                                            <option key={c.userCouponId} value={c.userCouponId}>
                                                {c.name} ({c.discountType === 'FIXED' ? `${c.discountValue.toLocaleString()}원` : `${c.discountValue}%`} 할인)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">스푼 포인트 사용 (보유: {pointBalance.toLocaleString()}P)</label>
                                    <div className="point-input-group">
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={usedPoints}
                                            onChange={handlePointInput}
                                            placeholder="0"
                                        />
                                        <button
                                            type="button"
                                            className="btn-point-all"
                                            onClick={applyAllPoints}
                                        >
                                            전액사용
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title">결제 수단</h3>
                                <div className="payment-methods">
                                    <label className="payment-method-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="method-icon">💳</span>
                                        <span>신용/체크카드</span>
                                    </label>
                                    <label className="payment-method-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="kakaopay"
                                            checked={paymentMethod === 'kakaopay'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="method-icon">💛</span>
                                        <span>카카오페이</span>
                                    </label>
                                    <label className="payment-method-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="tosspay"
                                            checked={paymentMethod === 'tosspay'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="method-icon">💙</span>
                                        <span>토스페이</span>
                                    </label>
                                </div>
                            </div>

                            <div className="payment-summary">
                                <div className="summary-row">
                                    <span>상품 금액</span>
                                    <span>{formData.amount.toLocaleString()}원</span>
                                </div>
                                <div className="summary-row">
                                    <span>쿠폰 할인</span>
                                    <span className="discount-value">
                                        -{discountAmount.toLocaleString()}원
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span>포인트 사용</span>
                                    <span className="discount-value">
                                        -{usedPoints.toLocaleString()}원
                                    </span>
                                </div>
                                <div className="summary-row border-top">
                                    <span>총 결제금액</span>
                                    <strong className="total-amount">
                                        {(formData.amount - discountAmount - usedPoints).toLocaleString()}원
                                    </strong>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-full btn-large"
                                disabled={loading}
                            >
                                {loading ? '결제 진행 중...' : `${(formData.amount - discountAmount - usedPoints).toLocaleString()}원 결제하기`}
                            </button>
                        </form>

                        <div className="payment-notice">
                            <p>• 결제 시 개인정보는 안전하게 암호화되어 전송됩니다.</p>
                            <p>• 결제 후 7일 이내 환불이 가능합니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Payment;
