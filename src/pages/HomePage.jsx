import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Home.css";

export default function HomePage() {
  const { user, logout } = useAuth();
  return (
    <div className="home-container">
      {/* 히어로 섹션 */}
      <div className="home-hero">
        <div className="hero-text">
          <h1>요리의 즐거움을 <br /><span style={{ color: "var(--primary)" }}>한 스푼</span> 더하다</h1>
          <p>전 세계의 다채로운 레시피와 원데이 클래스, 그리고 신선한 식재료까지. 한스푼에서 당신의 식탁을 특별하게 만들어보세요.</p>
          <div style={{ marginTop: 32 }}>
            <Link to="/recipes" className="btn-auth-primary" style={{ display: "inline-block" }}>레시피 탐색하기</Link>
          </div>
        </div>
      </div>

      <div className="home-layout">
        {/* 좌측: 사이드 바 */}
        <aside className="login-aside">
          {user ? (
            <section className="auth-panel profile-panel">
              <div className="profile-info">
                <div className="profile-avatar">👤</div>
                <div className="profile-details">
                  <h3 className="user-name">{user.userName || "사용자"}님</h3>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
              <div className="auth-btn-grid">
                <Link to="/mypage" className="btn-auth-secondary">마이페이지</Link>
                <button onClick={logout} className="btn-logout-small">로그아웃</button>
              </div>
            </section>
          ) : (
            <section className="auth-panel">
              <h3>로그인</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>더 많은 기능을 이용하려면 <br />로그인해 주세요.</p>
              <div className="auth-btn-grid">
                <Link to="/login" className="btn-auth-primary">로그인</Link>
                <Link to="/signup" className="btn-auth-secondary">회원가입</Link>
              </div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 12 }}>
                <Link to="/find-id" className="sublink">아이디 찾기</Link>
                <Link to="/find-password" className="sublink">비밀번호 찾기</Link>
              </div>
            </section>
          )}
        </aside>

        {/* 우측: 메인 서비스 */}
        <main className="main-content">
          <UseCaseCard
            icon="📖"
            title="레시피"
            description="다양한 요리법을 찾아보고 나만의 레시피를 공유하세요."
            links={[
              { to: "/recipes", label: "레시피 등록" },
              { to: "/recipes/user", label: "유저 레시피" },
              { to: "/recipes/list", label: "레시피 리스트" },
              { to: "/recipes/deletelist", label: "삭제레시피 리스트" },
            ]}
            sublinks={[
              { to: "/reviews", label: "리뷰 구경" },
              { to: "/wishlist", label: "찜한 레시피" },
            ]}
          />

          <UseCaseCard
            icon="👨‍🍳"
            title="원데이 클래스"
            description="전문가와 함께하는 요리 클래스에 참여해보세요."
            links={[
              { to: "/classes/oneday", label: "원데이 클래스" },
              { to: "/classes/regular", label: "정기 클래스" },
            ]}
            sublinks={[
              { to: "/mypage/reservations", label: "예약 내역" },
              { to: "/inquiries", label: "클래스 문의" },
            ]}
          />

          <UseCaseCard
            icon="🛒"
            title="마켓"
            description="신선한 재료와 도구를 한 곳에서 만나보세요."
            links={[
              { to: "/products?category=INGREDIENT", label: "식재료" },
              { to: "/products?category=MEAL_KIT", label: "밀키트" },
              { to: "/products", label: "전체 마켓" },
            ]}
            sublinks={[
              { to: "/cart", label: "장바구니" },
              { to: "/orders", label: "배송 조회" },
            ]}
          />

          <UseCaseCard
            icon="📢"
            title="커뮤니티 / 지원"
            description="공지사항과 자주 묻는 질문을 확인하세요."
            links={[
              { to: "/notice", label: "공지사항" },
              { to: "/faq", label: "FAQ" },
            ]}
            sublinks={[]}
          />

          <UseCaseCard
            icon="👤"
            title="마이페이지"
            links={[
              { to: "/mypage/profile", label: "정보 수정" },
              { to: "/mypage/orders", label: "주문 관리" },
              { to: "/mypage/wishlist", label: "관심 목록" },
            ]}
          />

          <UseCaseCard
            icon="⚙️"
            title="관리자"
            links={[
              { to: "/admin/users", label: "회원" },
              { to: "/admin/market", label: "상품" },
              { to: "/admin/classes", label: "클래스" },
            ]}
          />
        </main>
      </div>
    </div>
  );
}

function UseCaseCard({ icon, title, description, links, sublinks }) {
  return (
    <div className="use-case-card">
      <div className="card-title">
        <span style={{ fontSize: 28 }}>{icon}</span>
        {title}
      </div>
      {description && <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>{description}</p>}

      <div className="card-links">
        {links.map((x) => (
          <Link key={x.to} to={x.to} className="pill-link">{x.label}</Link>
        ))}
      </div>

      {sublinks?.length > 0 && (
        <div className="sublinks-section">
          {sublinks.map((x) => (
            <Link key={x.to} to={x.to} className="sublink">{x.label}</Link>
          ))}
        </div>
      )}
    </div>
  );
}

function UseCaseBox({ title, links, sublinks }) {
  return (
    <div style={box}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>{title}</div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {links.map((x) => (
          <Link key={x.to} to={x.to} style={pill}>{x.label}</Link>
        ))}
      </div>

      {sublinks?.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {sublinks.map((x) => (
            <Link key={x.to} to={x.to} style={pillSub}>{x.label}</Link>
          ))}
        </div>
      )}
    </div>
  );
}

const card = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 16,
};

const h3 = { margin: "0 0 12px 0" };

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  textDecoration: "none",
  color: "#0f172a",
  background: "#fff",
  textAlign: "center",
};

const btnPrimary = {
  ...btn,
  border: "1px solid #2563eb",
  color: "#2563eb",
  fontWeight: 700,
};

const box = {
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 12,
  background: "#f8fafc",
};

const pill = {
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid #cbd5e1",
  textDecoration: "none",
  color: "#0f172a",
  background: "#fff",
  fontSize: 13,
};

const pillSub = {
  ...pill,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
};
