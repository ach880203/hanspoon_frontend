import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';

function PaymentFail() {
    const location = useLocation();
    const navigate = useNavigate();
    const errorMessage = location.state?.message || '결제 처리 중 오류가 발생했습니다.';

    return (
        <div className="payment-result-page">
            <div className="container">
                <div className="result-card fail">
                    <div className="result-icon">✕</div>
                    <h1 className="result-title">결제에 실패했습니다</h1>
                    <p className="result-message">
                        {errorMessage}
                        <br />
                        다시 시도해주세요.
                    </p>

                    <div className="error-info">
                        <h3>결제 실패 시 확인사항</h3>
                        <ul>
                            <li>카드 한도가 충분한지 확인해주세요</li>
                            <li>카드 정보가 정확한지 확인해주세요</li>
                            <li>인터넷 연결 상태를 확인해주세요</li>
                            <li>문제가 지속되면 고객센터로 문의해주세요</li>
                        </ul>
                    </div>

                    <div className="result-actions">
                        <button
                            onClick={() => navigate('/payment')}
                            className="btn btn-primary btn-large"
                        >
                            다시 시도하기
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-secondary btn-large"
                        >
                            홈으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentFail;
