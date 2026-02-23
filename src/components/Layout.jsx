import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./Layout/Header";
import Footer from "./Layout/Footer";
import "./Layout.css";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="layout-root">
      <Header />

      <main className="layout-mainContainer">
        <Outlet />
      </main>

      <Footer />

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
