// src/pages/SignupPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/auth";
import { formatPhoneNumber } from "../utils/format";

export default function SignupPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: "",
    userName: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    address: "",
  });
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const checkCapsLock = (e) => {
    if (e.getModifierState("CapsLock")) {
      setIsCapsLockOn(true);
    } else {
      setIsCapsLockOn(false);
    }
  };

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const checkEmail = async () => {
    setErr(null);
    setOk(null);

    if (!form.email.trim()) {
      setErr("이메일을 입력해주세요.");
      return;
    }

    try {
      const available = await authApi.checkEmail(form.email.trim());
      setOk(available ? "사용 가능한 이메일입니다." : "이미 사용중인 이메일입니다.");
    } catch (e) {
      setErr(e?.message || "이메일 확인 실패");
    }
  };

  const validate = () => {
    const email = form.email.trim();
    const userName = form.userName.trim();

    if (!email) return "이메일을 입력해주세요.";
    if (!userName) return "이름을 입력해주세요.";
    if (!form.password) return "비밀번호를 입력해주세요.";
    if (form.password.length < 8 || form.password.length > 20)
      return "비밀번호는 8~20자로 입력해주세요.";
    if (!form.passwordConfirm) return "비밀번호 확인을 입력해주세요.";
    if (form.password !== form.passwordConfirm) return "비밀번호가 일치하지 않습니다.";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const msg = validate();
    if (msg) {
      setErr(msg);
      return;
    }

    setBusy(true);
    try {
      // 백엔드 DTO와 키 이름 일치시켜서 전송
      await authApi.register({
        email: form.email.trim(),
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        userName: form.userName.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      });

      nav("/login", { replace: true });
    } catch (e) {
      setErr(e?.message || "회원가입 실패");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">한스푼의 회원이 되어 <br />더 많은 혜택과 레시피를 누려보세요.</p>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label>이메일 주소</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={form.email}
                onChange={onChange("email")}
                placeholder="example@hanspoon.com"
                autoComplete="email"
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={checkEmail}
                disabled={busy}
                className="auth-button"
                style={{ width: 'auto', padding: '0 20px', marginTop: 0, fontSize: 14 }}
              >
                중복확인
              </button>
            </div>
            {ok && <div style={{ color: "#16a34a", fontSize: 13, marginLeft: 4 }}>{ok}</div>}
          </div>

          <div className="form-group">
            <label>이름</label>
            <input
              value={form.userName}
              onChange={onChange("userName")}
              placeholder="홍길동"
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              value={form.password}
              onChange={onChange("password")}
              onKeyDown={checkCapsLock}
              onKeyUp={checkCapsLock}
              placeholder="8~20자의 영문, 숫자, 특수문자"
              type="password"
              autoComplete="new-password"
              required
            />
            {isCapsLockOn && (
              <div className="caps-lock-warning">
                Caps Lock이 켜져 있습니다.
              </div>
            )}
          </div>

          <div className="form-group">
            <label>비밀번호 확인</label>
            <input
              value={form.passwordConfirm}
              onChange={onChange("passwordConfirm")}
              onKeyDown={checkCapsLock}
              onKeyUp={checkCapsLock}
              placeholder="비밀번호를 한번 더 입력해주세요"
              type="password"
              autoComplete="new-password"
              required
            />
            {isCapsLockOn && (
              <div className="caps-lock-warning">
                Caps Lock이 켜져 있습니다.
              </div>
            )}
          </div>

          <div className="form-group">
            <label>휴대폰 번호 (선택)</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: formatPhoneNumber(e.target.value) }))}
              placeholder="010-0000-0000"
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label>주소 (선택)</label>
            <input
              value={form.address}
              onChange={onChange("address")}
              placeholder="배송받으실 주소를 입력해주세요"
              autoComplete="street-address"
            />
          </div>

          {err && <div className="auth-error">{err}</div>}

          <button disabled={busy} type="submit" className="auth-button">
            {busy ? "가입 중..." : "회원가입 완료"}
          </button>
        </form>

        <div className="auth-links">
          <span style={{ fontWeight: 400 }}>이미 계정이 있으신가요?</span>
          <Link to="/login" style={{ color: "#FF7E36" }}>로그인하기</Link>
        </div>
      </div>
    </div>
  );
}
