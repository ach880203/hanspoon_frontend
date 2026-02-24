import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { mypageApi } from "../../api/mypage";
import "./MyPageDropdown.css";

export default function MyPageDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [couponCount, setCouponCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    let alive = true;

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        // Load summary and coupons in parallel to reduce dropdown open latency.
        const [summaryRes, couponRes] = await Promise.allSettled([
          mypageApi.getSummary(),
          mypageApi.getMyCoupons(),
        ]);

        if (!alive) return;

        if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
          setSummary(summaryRes.value.data);
        }

        if (couponRes.status === "fulfilled" && couponRes.value?.success) {
          const coupons = couponRes.value.data ?? [];
          setCouponCount(coupons.filter((coupon) => coupon.usable).length);
        } else {
          setCouponCount(0);
        }
      } catch {
        if (!alive) return;
        setCouponCount(0);
      } finally {
        if (alive) setStatsLoading(false);
      }
    };

    fetchStats();
    return () => {
      alive = false;
    };
  }, [isOpen, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <div className="mypage-dropdown-container" ref={dropdownRef}>
      <button className="mypage-trigger" onClick={() => setIsOpen((prev) => !prev)}>
        <span className="user-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <span className="trigger-text">마이페이지</span>
      </button>

      {isOpen && (
        <div className="mypage-dropdown-menu">
          <div className="dropdown-header">
            <div className="user-profile">
              <div className="profile-img">
                <div className="avatar-placeholder">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#aaa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
              <div className="user-info">
                <div className="user-name">{user?.userName || "사용자"}</div>
                <div className="user-handle">#{summary?.userId || "guest"}</div>
              </div>
            </div>
          </div>

          <div className="dropdown-stats-grid">
            <Link to="/mypage/points" className="stat-box" onClick={() => setIsOpen(false)}>
              <div className="stat-icon-wrapper">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <circle cx="17" cy="17" r="16" fill="#8E44AD" />
                  <path d="M12 17H22M17 12V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="23" cy="23" r="7" fill="#8E44AD" stroke="white" strokeWidth="1.5" />
                  <text x="21" y="26" fill="white" fontSize="10" fontWeight="900" fontFamily="Arial">
                    P
                  </text>
                </svg>
              </div>
              <div className="stat-label">
                <span className="label-text">포인트</span>
                <span className="stat-value">
                  {statsLoading ? "..." : (summary?.spoonBalance ?? 0).toLocaleString()}
                </span>
              </div>
            </Link>

            <Link
              to="/classes/oneday/coupons"
              className="stat-box"
              onClick={() => setIsOpen(false)}
            >
              <div className="stat-icon-wrapper">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <rect x="4" y="8" width="26" height="18" rx="3" fill="#9B59B6" />
                  <circle cx="10" cy="17" r="2" fill="white" />
                  <line x1="15" y1="10" x2="15" y2="24" stroke="white" strokeDasharray="3 3" />
                  <text x="20" y="21" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial">
                    %
                  </text>
                </svg>
              </div>
              <div className="stat-label">
                <span className="label-text">쿠폰</span>
                <span className="stat-value">{statsLoading ? "..." : couponCount ?? 0}</span>
              </div>
            </Link>
          </div>

          <ul className="dropdown-links">
            <li>
              <Link to="/mypage/orders" onClick={() => setIsOpen(false)}>
                주문/배송 조회
              </Link>
            </li>
            <li>
              <Link to="/mypage/reviews" onClick={() => setIsOpen(false)}>
                나의 리뷰
              </Link>
            </li>
            <li>
              <Link to="/mypage/wishlist" onClick={() => setIsOpen(false)}>
                찜 목록
              </Link>
            </li>
            <li>
              <Link to="/mypage/profile" onClick={() => setIsOpen(false)}>
                내 정보 수정
              </Link>
            </li>
            <li>
              <Link to="/events" onClick={() => setIsOpen(false)}>
                이벤트
              </Link>
            </li>
            <li className="logout-item">
              <button className="logout-btn-link" onClick={handleLogout}>
                로그아웃
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
