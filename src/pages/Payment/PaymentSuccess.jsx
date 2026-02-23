import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentData = location.state?.paymentData || {};

  return (
    <div className="payment-result-page">
      <div className="container">
        <div className="result-card success">
          <div className="result-icon">OK</div>
          <h1 className="result-title">결제가 완료되었습니다</h1>
          <p className="result-message">
            결제가 정상적으로 처리되었습니다.
            <br />
            결제 내역은 마이페이지에서 확인할 수 있습니다.
          </p>

          {paymentData && (
            <div className="payment-details">
              <div className="detail-row">
                <span className="detail-label">주문번호</span>
                <span className="detail-value">{paymentData.merchantUid || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">상품명</span>
                <span className="detail-value">{paymentData.itemName || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">결제금액</span>
                <span className="detail-value highlight">
                  {paymentData.amount?.toLocaleString() || "0"}원
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">결제수단</span>
                <span className="detail-value">{paymentData.payMethod || "N/A"}</span>
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
