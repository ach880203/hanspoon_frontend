import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Layout.css";

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="layout-root">
      <header className="layout-header">
        <Link to="/" className="layout-brand">Hanspoon</Link>

        <nav className="layout-nav">
          <MenuLink to="/recipes" label="Recipes" />
          <MenuLink to="/classes/oneday" label="Classes" />
          <MenuLink to="/products" label="Market" />
          <MenuLink to="/notice" label="Notice" />
          <MenuLink to="/faq" label="FAQ" />
          <MenuLink to="/mypage" label="MyPage" />
          <MenuLink to="/cart" label="Cart" />

          {user?.role?.includes("ADMIN") && <MenuLink to="/admin" label="Admin" />}

          {user ? (
            <button className="logout-btn" onClick={logout}>
              Logout ({user.userName || user.email})
            </button>
          ) : (
            <Link to="/login" className="login-link">Login</Link>
          )}
        </nav>
      </header>

      <main className="layout-mainContainer">
        <Outlet />
      </main>

      <footer className="layout-footer">
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8, color: "var(--primary)" }}>Hanspoon</div>
        <p>요리의 즐거움을 나누는 Hanspoon 입니다.</p>
        <p style={{ marginTop: 24, fontSize: 12 }}>Hanspoon © 2026. All rights reserved.</p>
      </footer>

      <ScrollTopButton />
    </div>
  );
}

function ScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button className="scroll-top-btn" onClick={scrollToTop} aria-label="Scroll to top">
      ↑
    </button>
  );
}

function MenuLink({ to, label }) {
  return (
    <NavLink to={to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
      {label}
    </NavLink>
  );
}
