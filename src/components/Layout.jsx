import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import MyPageDropdown from "./Layout/MyPageDropdown";
import CartBadge from "./CartBadge";
import CartToast from "./CartToast";
import "./Layout.css";

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Read auth state once at layout level so header/drawer share the same source.
  const { user, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");


  const drawerRef = useRef(null);
  const searchRef = useRef(null);

  // Accept both "ADMIN" and "ROLE_ADMIN" style role values.
  const isAdmin = !!user?.role?.includes("ADMIN");

  const primaryNav = useMemo(
    () => [
      { to: "/recipes", label: "레시피" },
      { to: "/classes/oneday", label: "클래스" },
      { to: "/products", label: "마켓" },
      { to: "/notice", label: "공지사항" },
      { to: "/faq", label: "자주 묻는 질문" },
    ],
    []
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ESC로 오버레이 닫기 + 바디 스크롤 잠금
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      setMobileOpen(false);
      setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const locked = mobileOpen || searchOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  useOnClickOutside(drawerRef, () => setMobileOpen(false), mobileOpen);
  useOnClickOutside(searchRef, () => setSearchOpen(false), searchOpen);

  const openSearch = () => {
    setSearchOpen(true);
    setSearchValue("");
    // 다음 tick에 포커스
    setTimeout(() => {
      const el = document.getElementById("hs-search-input");
      el?.focus();
    }, 0);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchValue.trim();
    setSearchOpen(false);
    if (!q) return;
    navigate(`/search?query=${encodeURIComponent(q)}`);
  };


  const onLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <div className="layout-root">
      <header className={`hs-header ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="hs-header-inner">
          {/* LEFT */}
          <div className="hs-left">
            <Link to="/" className="hs-brand" aria-label="한스푼 홈">
              <span className="hs-brand-mark" aria-hidden="true">🥄</span>
              <span className="hs-brand-text">한스푼</span>
            </Link>
          </div>

          {/* CENTER */}
          <nav className="hs-nav" aria-label="주요 메뉴">
            {primaryNav.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                className={({ isActive }) => `hs-navLink ${isActive ? "active" : ""}`}
              >
                {m.label}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT */}
          <div className="hs-actions">
            {isAdmin && (
              <Link to="/admin" className="hs-pill hs-pill--admin">
                관리자
              </Link>
            )}

            <button className="hs-iconBtn" onClick={openSearch} aria-label="검색">
              <img
                src="https://cdn-icons-png.flaticon.com/512/861/861627.png"
                alt="검색"
                className="hs-search-img"
              />
            </button>

            <CartBadge>
              <Link to="/cart" className="hs-iconBtn" aria-label="장바구니">
                <IconCart />
              </Link>
            </CartBadge>

            {user ? (
              <MyPageDropdown />
            ) : (
              <Link to="/login" className="hs-pill hs-pill--primary">
                로그인
              </Link>
            )}

            <button
              className="hs-burger"
              onClick={() => setMobileOpen(true)}
              aria-label="메뉴 열기"
            >
              <IconMenu />
            </button>
          </div>
        </div>

        {/* SEARCH OVERLAY */}
        {searchOpen && (
          <div className="hs-overlay" role="dialog" aria-modal="true">
            <div className="hs-searchPanel" ref={searchRef}>
              <div className="hs-searchTop">
                <div className="hs-searchTitle">검색</div>
                <button className="hs-iconBtn" onClick={() => setSearchOpen(false)} aria-label="검색 닫기">
                  <IconClose />
                </button>
              </div>

              <form className="hs-searchForm" onSubmit={submitSearch}>
                <input
                  id="hs-search-input"
                  className="hs-searchInput"
                  placeholder="레시피 · 클래스 · 상품을 검색해보세요"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button className="hs-searchSubmit" type="submit">
                  검색
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MOBILE DRAWER */}
        {mobileOpen && (
          <div className="hs-overlay" role="dialog" aria-modal="true">
            <aside className="hs-drawer" ref={drawerRef}>
              <div className="hs-drawerTop">
                <Link to="/" className="hs-brand" onClick={() => setMobileOpen(false)}>
                  <span className="hs-brand-mark" aria-hidden="true">🥄</span>
                  <span className="hs-brand-text">한스푼</span>
                </Link>
                <button className="hs-iconBtn" onClick={() => setMobileOpen(false)} aria-label="메뉴 닫기">
                  <IconClose />
                </button>
              </div>

              <div className="hs-drawerSection">
                {primaryNav.map((m) => (
                  <NavLink
                    key={m.to}
                    to={m.to}
                    className={({ isActive }) => `hs-drawerLink ${isActive ? "active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {m.label}
                  </NavLink>
                ))}
              </div>

              <div className="hs-drawerSection hs-drawerSection--sub">
                <Link to="/mypage" className="hs-drawerLink" onClick={() => setMobileOpen(false)}>
                  마이페이지
                </Link>
                <Link to="/cart" className="hs-drawerLink" onClick={() => setMobileOpen(false)}>
                  장바구니
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="hs-drawerLink" onClick={() => setMobileOpen(false)}>
                    관리자
                  </Link>
                )}
              </div>

              <div className="hs-drawerBottom">
                {user ? (
                  <button className="hs-drawerCta hs-drawerCta--ghost" onClick={onLogout}>
                    로그아웃
                  </button>
                ) : (
                  <Link to="/login" className="hs-drawerCta" onClick={() => setMobileOpen(false)}>
                    로그인
                  </Link>
                )}
                <button className="hs-drawerCta hs-drawerCta--ghost" onClick={openSearch}>
                  검색
                </button>
              </div>
            </aside>
          </div>
        )}

        <CartToast />
        
      </header>

      <main className="layout-mainContainer">
        <Outlet />
      </main>

      <footer className="layout-footer">
        <div className="layout-footer-inner">
          <div
            style={{
              fontWeight: 900,
              fontSize: 18,
              marginBottom: 8,
              color: "var(--primary)",
            }}
          >
            한스푼
          </div>
          <p>요리의 즐거움을 나누는 한스푼입니다.</p>
          <p style={{ marginTop: 24, fontSize: 12 }}>
            한스푼 © 2026. 모든 권리 보유.
          </p>
        </div>
      </footer>

      <ScrollTopButton />
    </div>
  );
}

function ScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      className="scroll-top-btn"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="맨 위로 이동"
    >
      ↑
    </button>
  );
}

function useOnClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (e) => {
      const el = ref?.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      handler?.();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, enabled]);
}

/* ---------- Icons (no deps) ---------- */
function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconCart() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 7h15l-1.5 9h-12L6 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M6 7 5 3H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
      <path d="M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
