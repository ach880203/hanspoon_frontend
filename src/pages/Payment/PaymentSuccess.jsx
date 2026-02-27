import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paymentApi } from "../../api/paymentApi";
import { useCart } from "../../contexts/CartContext";
import "./Payment.css";

function toPaymentMethodLabel(value) {
  const method = String(value || "").toLowerCase();
  if (method === "card") return "신용/체크카드";
  if (method === "kakaopay" || method === "kakao" || method === "easy_pay_kakao") return "카카오페이";
  if (method === "tosspay" || method === "toss" || method === "easy_pay_toss") return "토스페이";
  if (method === "easy_pay") return "간편결제";
  return value || "결제수단 정보 없음";
}

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshCount } = useCart();
  const [paymentData, setPaymentData] = useState(() => {
    const fromState = location.state?.paymentData;
    if (fromState) return fromState;

    const fromStorage = sessionStorage.getItem("lastPaymentSuccess");
    if (!fromStorage) return {};

    try {
      return JSON.parse(fromStorage);
    } catch {
      return {};
    }
  });

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    let alive = true;

    const loadPaymentDetail = async () => {
      const payId = paymentData?.payId;
      if (!payId) return;

      try {
        const detail = await paymentApi.getPaymentDetail(payId);
        if (!alive || !detail) return;

        setPaymentData((prev) => ({
          ...prev,
          itemName: prev?.itemName || detail.orderName || "결제 상품",
          amount: Number(prev?.amount ?? detail.totalPrice ?? 0),
        }));
      } catch {
        // 상세 조회 실패 시에도 결제 성공 정보는 유지합니다.
      }
    };

    loadPaymentDetail();
    return () => {
      alive = false;
    };
  }, [paymentData?.payId]);

  const displayInfo = useMemo(() => {
    return {
      orderNo: paymentData?.merchantUid || paymentData?.orderId || paymentData?.paymentId || "없음",
      itemName: paymentData?.itemName || paymentData?.orderName || "없음",
      amount: Number(paymentData?.amount ?? 0),
      payMethod: toPaymentMethodLabel(paymentData?.payMethod || paymentData?.methodType),
    };
  }, [paymentData]);

  return (
    <div className="payment-result-page">
      <div className="container">
        <div className="result-card success">
          <div className="result-icon">확인</div>
          <h1 className="result-title">결제가 완료되었습니다</h1>
          <p className="result-message">
            결제가 정상적으로 처리되었습니다.
            <br />
            결제 내역은 마이페이지에서 확인하실 수 있습니다.
          </p>

          {paymentData && (
            <div className="payment-details">
              <div className="detail-row">
                <span className="detail-label">주문번호</span>
                <span className="detail-value">{displayInfo.orderNo}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">상품명</span>
                <span className="detail-value">{displayInfo.itemName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">결제금액</span>
                <span className="detail-value highlight">
                  {displayInfo.amount.toLocaleString("ko-KR")}원
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">결제수단</span>
                <span className="detail-value">{displayInfo.payMethod}</span>
              </div>
            </div>
          )}

          <div className="result-actions">
            <button onClick={() => navigate("/")} className="btn btn-primary btn-large">
              홈으로 돌아가기
            </button>
            <button onClick={() => navigate("/payment")} className="btn btn-secondary btn-large">
              추가 결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
