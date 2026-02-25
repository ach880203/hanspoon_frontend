import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">한스푼</h3>
            <p className="footer-description">
              일상의 맛을 배우고 즐기는 한스푼과 함께하세요.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">바로가기</h4>
            <ul className="footer-links">
              <li><a href="/notice">공지사항</a></li>
              <li><a href="/faq">자주 묻는 질문</a></li>
              <li><a href="/payment">결제</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">고객센터</h4>
            <p>이메일: support@hanspoon.com</p>
            <p>전화: 02-1234-5678</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 한스푼. 모든 권리 보유.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
