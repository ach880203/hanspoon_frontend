import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getBackendBaseUrl } from "../utils/backendUrl";
import "./Auth/Auth.css";

export default function LoginPage() {
  const { login } = useAuth();
  const oauthBaseUrl = getBackendBaseUrl("http://localhost:8080");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const checkCapsLock = (e) => {
    if (e.getModifierState("CapsLock")) {
      setIsCapsLockOn(true);
    } else {
      setIsCapsLockOn(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
      // nav("/", { replace: true });
      window.location.href = "/"; // 페이지 새로고침을 통해 헤더 상태 강제 갱신
    } catch (e) {
      setErr(e.message || "로그인 실패");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">한스푼에 오신 것을 환영합니다. <br />당신만의 특별한 레시피를 만나보세요.</p>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label>이메일 주소</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@hanspoon.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={checkCapsLock}
              onKeyUp={checkCapsLock}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              required
            />
            {isCapsLockOn && (
              <div className="caps-lock-warning">
                Caps Lock이 켜져 있습니다.
              </div>
            )}
          </div>

          {err && <div className="auth-error">{err}</div>}

          <button disabled={busy} type="submit" className="auth-button">
            {busy ? "로그인 중..." : "로그인하기"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/signup">회원가입</Link>
          <span className="divider">|</span>
          <Link to="/find-password">비밀번호 찾기</Link>
        </div>

        <div className="social-divider">
          <span>간편 로그인</span>
        </div>

        <div className="social-grid">
          <a href={`${oauthBaseUrl}/oauth2/authorization/google`} className="btn-social btn-google">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="social-icon" />
            구글 계정으로 시작하기
          </a>
          <a href={`${oauthBaseUrl}/oauth2/authorization/kakao`} className="btn-social btn-kakao">
            <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png" alt="Kakao" className="social-icon" />
            카카오 계정으로 시작하기
          </a>
        </div>
      </div>
    </div>
  );
}
