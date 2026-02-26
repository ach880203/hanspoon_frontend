import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paymentApi } from "../../api";
import { formatPhoneNumber } from "../../utils/format";
import "./Payment.css";

function formatDateOnly(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("ko-KR");
}

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [pointBalance, setPointBalance] = useState(0);
  const [usedPoints, setUsedPoints] = useState(0);
  const [portOneConfig, setPortOneConfig] = useState(null);

  const {
    itemName,
    amount,
    reservationId,
    classId,
    orderId, // ✅ 상품 주문 시 전달받은 ID
    buyerName: initialBuyerName,
    buyerEmail: initialBuyerEmail,
    buyerTel: initialBuyerTel,
  } = location.state || {};

  const [formData, setFormData] = useState({
    itemName: itemName || "상품 결제",
    amount: amount || 0,
    buyerName: initialBuyerName || "",
    buyerEmail: initialBuyerEmail || "",
    buyerTel: initialBuyerTel ? formatPhoneNumber(initialBuyerTel) : "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configData, couponData, balance] = await Promise.all([
          paymentApi.getPortOneConfig(),
          paymentApi.getMyCoupons(),
          paymentApi.getPointBalance(),
        ]);

        const cfg = configData?.data || configData;
        if (!cfg) {
          alert("결제 설정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        } else {
          setPortOneConfig(cfg);
        }

        setCoupons(Array.isArray(couponData) ? couponData.filter((c) => c.usable) : []);
        setPointBalance(typeof balance === "number" ? balance : 0);
      } catch (error) {
        if (error.response?.status === 401) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }
        alert(`결제 정보를 불러오는 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const baseAmount = Number(formData.amount) || 0;

    let couponDiscount = 0;
    if (selectedCoupon) {
      couponDiscount =
        selectedCoupon.discountType === "FIXED"
          ? Number(selectedCoupon.discountValue || 0)
          : Math.floor(baseAmount * (Number(selectedCoupon.discountValue || 0) / 100));
    }

    setDiscountAmount(couponDiscount);

    const maxApplicablePoints = Math.max(0, baseAmount - couponDiscount);
    if (usedPoints > maxApplicablePoints) {
      setUsedPoints(maxApplicablePoints);
    }
  }, [selectedCoupon, formData.amount, usedPoints]);

  const finalAmount = useMemo(() => {
    return Number(formData.amount) - discountAmount - usedPoints;
  }, [formData.amount, discountAmount, usedPoints]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "buyerTel" ? formatPhoneNumber(value) : value,
    }));
  };

  const handlePointInput = (e) => {
    const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
    if (Number.isNaN(value)) return;

    let targetPoint = Math.max(0, Math.min(value, pointBalance));
    const remainingAmountAfterCoupon = Number(formData.amount) - discountAmount;
    targetPoint = Math.min(targetPoint, remainingAmountAfterCoupon);
    setUsedPoints(targetPoint);
  };

  const applyAllPoints = () => {
    const remainingAmountAfterCoupon = Number(formData.amount) - discountAmount;
    setUsedPoints(Math.min(pointBalance, remainingAmountAfterCoupon));
  };

  const resolvePaymentConfig = (config) => {
    if (paymentMethod === "kakaopay") return { channelKey: config.channelKeyKakao, payMethodType: "EASY_PAY" };
    if (paymentMethod === "tosspay") return { channelKey: config.channelKeyToss, payMethodType: "EASY_PAY" };
    return { channelKey: config.channelKeyTossPayments, payMethodType: "CARD" };
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!portOneConfig) {
      alert("결제 설정을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.buyerEmail)) {
      alert("올바른 이메일 형식을 입력해 주세요. (예: user@domain.com)");
      return;
    }

    setLoading(true);
    try {
      const config = portOneConfig?.data || portOneConfig;
      const { channelKey, payMethodType } = resolvePaymentConfig(config);

      if (!channelKey || channelKey.startsWith("${")) {
        alert("결제 채널 설정이 올바르지 않습니다. 관리자에게 문의해 주세요.");
        setLoading(false);
        return;
      }

      // ✅ 상품 주문 번호가 있으면 그것을 결제 고유 ID로 사용, 없으면 새로 생성 (클래스 등)
      const merchantUid = orderId ? String(orderId) : `PAY-${Date.now()}`;

      const response = await window.PortOne.requestPayment({
        storeId: config.storeId,
        channelKey,
        paymentId: merchantUid,
        orderName: formData.itemName,
        totalAmount: finalAmount,
        currency: "CURRENCY_KRW",
        payMethod: payMethodType,
        customer: {
          fullName: formData.buyerName,
          email: formData.buyerEmail,
          phoneNumber: formData.buyerTel.replace(/-/g, ""),
        },
      });

      if (response.code != null) {
        navigate("/payment/fail", { state: { message: response.message || "결제에 실패했습니다." } });
        return;
      }

      const verifyResult = await paymentApi.verifyPayment({
        paymentId: response.paymentId,
        orderId: merchantUid, // 서버에서 조회 시 사용
        amount: Number(formData.amount),
        productId: null,
        classId: classId ? Number(classId) : null,
        reservationId: reservationId ? Number(reservationId) : null,
        userCouponId: selectedCoupon ? selectedCoupon.userCouponId : null,
        usedPoints,
        quantity: 1,
      });

      if (!verifyResult.success) {
        navigate("/payment/fail", { state: { message: verifyResult.message || "결제 검증에 실패했습니다." } });
        return;
      }

      navigate("/payment/success", { state: { paymentData: verifyResult.data || verifyResult } });
    } catch (error) {
      navigate("/payment/fail", { state: { message: error.message || "결제 처리 중 오류가 발생했습니다." } });
    } finally {
      setLoading(false);
    }
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
                    onChange={handleChange}
                    readOnly={!!itemName}
                    placeholder="상품명을 입력해 주세요"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">결제 금액</label>
                  <input
                    type="number"
                    name="amount"
                    className="form-input"
                    value={formData.amount}
                    onChange={handleChange}
                    readOnly={!!amount}
                    placeholder="0"
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
                    placeholder="이름을 입력해 주세요"
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
                    placeholder="이메일 주소를 입력해 주세요"
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
                      const couponId = Number(e.target.value);
                      setSelectedCoupon(coupons.find((c) => c.userCouponId === couponId) || null);
                    }}
                    value={selectedCoupon?.userCouponId || ""}
                  >
                    <option value="">적용할 쿠폰을 선택해 주세요</option>
                    {coupons.map((c) => (
                      <option key={c.userCouponId} value={c.userCouponId}>
                        {c.name} ({c.discountType === "FIXED" ? `${c.discountValue.toLocaleString()}원` : `${c.discountValue}%`} 할인, 발급일로부터 6개월 유효, 만료 {formatDateOnly(c.expiresAt)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">포인트 사용 (보유: {pointBalance.toLocaleString()}P)</label>
                  <div className="point-input-group">
                    <input type="number" className="form-input" value={usedPoints} onChange={handlePointInput} placeholder="0" />
                    <button type="button" className="btn-point-all" onClick={applyAllPoints}>
                      전액 사용
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
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="method-icon-wrapper">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2c3e50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <span>신용/체크카드</span>
                  </label>

                  <label className="payment-method-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="kakaopay"
                      checked={paymentMethod === "kakaopay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="method-icon-wrapper">
                      <img
                        src="https://play-lh.googleusercontent.com/W43xj43ErMIs5BQgCdMKEa0NXCoUUW8DjQc5SxcDfLrC26H8sHDmoFIUWLYmsQahpo0"
                        alt="카카오페이"
                        className="payment-logo-img"
                      />
                    </div>
                    <span>카카오페이</span>
                  </label>

                  <label className="payment-method-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="tosspay"
                      checked={paymentMethod === "tosspay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="method-icon-wrapper">
                      <img
                        src="https://media.licdn.com/dms/image/v2/C560BAQE9411tskRlZQ/company-logo_200_200/company-logo_200_200/0/1662339512733/toss_payments_logo?e=2147483647&v=beta&t=zCKkS9mu5GlCHjEoleeEVpOM3H2IDWj9TZsri1wNQXM"
                        alt="토스페이"
                        className="payment-logo-img"
                      />
                    </div>
                    <span>토스페이</span>
                  </label>
                </div>
              </div>

              <div className="payment-summary">
                <div className="summary-row">
                  <span>상품 금액</span>
                  <span>{Number(formData.amount).toLocaleString()}원</span>
                </div>
                <div className="summary-row">
                  <span>쿠폰 할인</span>
                  <span className="discount-value">-{discountAmount.toLocaleString()}원</span>
                </div>
                <div className="summary-row">
                  <span>포인트 사용</span>
                  <span className="discount-value">-{usedPoints.toLocaleString()}원</span>
                </div>
                <div className="summary-row border-top">
                  <span>총 결제금액</span>
                  <strong className="total-amount">{finalAmount.toLocaleString()}원</strong>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-large" disabled={loading}>
                {loading ? "결제 진행 중..." : `${finalAmount.toLocaleString()}원 결제하기`}
              </button>
            </form>

            <div className="payment-notice">
              <p>* 결제 및 개인정보는 안전하게 보호됩니다.</p>
              <p>* 결제 후 7일 이내 환불 요청이 가능합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
