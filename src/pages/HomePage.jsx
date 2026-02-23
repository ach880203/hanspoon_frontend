import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Home.css";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="hero-text">
          <h1>
            요리의 즐거움을
            <br />
            <span style={{ color: "var(--primary)" }}>한스푼</span>과 함께
          </h1>
          <p>
            레시피, 원데이 클래스, 신선한 식재료까지.
            한 번에 둘러보고 바로 시작해 보세요.
          </p>
          <div style={{ marginTop: 32 }}>
            <Link to="/recipes/list" className="btn-auth-primary" style={{ display: "inline-block" }}>
              레시피 둘러보기
            </Link>
          </div>
        </div>
      </div>

      <div className="home-layout">
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
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                더 많은 기능을 사용하려면
                <br />
                로그인해 주세요.
              </p>
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

        <main className="main-content">
          <UseCaseCard
            icon="🍳"
            title="레시피"
            description="다양한 요리법을 찾고 직접 만든 레시피를 공유해 보세요."
            links={[
              { to: "/recipes", label: "레시피 등록" },
              { to: "/recipes/user", label: "내 레시피" },
              { to: "/recipes/list", label: "레시피 리스트" },
              { to: "/recipes/deletelist", label: "삭제 레시피" },
            ]}
            sublinks={[
              { to: "/reviews", label: "리뷰" },
              { to: "/wishlist", label: "관심 목록" },
            ]}
          />

          <UseCaseCard
            icon="🧑‍🍳"
            title="원데이 클래스"
            description="전문 셰프와 함께하는 실습형 클래스에 참여해 보세요."
            links={[
              { to: "/classes/oneday", label: "원데이 홈" },
              { to: "/classes/oneday/classes?runType=ALWAYS", label: "정기 클래스" },
              { to: "/classes/oneday/classes?runType=EVENT", label: "이벤트 클래스" },
            ]}
            sublinks={[
              { to: "/classes/oneday/wishes", label: "찜 목록" },
              { to: "/classes/oneday/inquiry", label: "클래스 문의" },
              { to: "/classes/oneday/reservations", label: "예약 내역" },
            ]}
          />

          <UseCaseCard
            icon="🛒"
            title="마켓"
            description="신선한 식재료와 주방 용품을 한 곳에서 만나보세요."
            links={[
              { to: "/products?category=INGREDIENT", label: "식재료" },
              { to: "/products?category=MEAL_KIT", label: "밀키트" },
              { to: "/products", label: "전체 상품" },
            ]}
            sublinks={[
              { to: "/cart", label: "장바구니" },
              { to: "/orders", label: "주문/배송" },
            ]}
          />

          <UseCaseCard
            icon="📢"
            title="고객지원"
            description="공지사항과 FAQ를 확인하고 필요한 정보를 빠르게 찾아보세요."
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
            icon="🛠"
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
