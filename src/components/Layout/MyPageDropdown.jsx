import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { mypageApi } from "../../api/mypage";
import "./MyPageDropdown.css";

export default function MyPageDropdown() {
  const { user, logout, updateUserBalance } = useAuth();
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
        // 드롭다운 오픈 시 지연을 줄이기 위해 요약/쿠폰 정보를 병렬 조회합니다.
        const [summaryRes, couponRes] = await Promise.allSettled([
          mypageApi.getSummary(),
          mypageApi.getMyCoupons(),
        ]);

        if (!alive) return;

        if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
          const summaryData = summaryRes.value.data;
          setSummary(summaryData);

          // 최신 포인트 잔액을 AuthContext에도 반영해 다른 화면과 동기화합니다.
          if (summaryData && typeof summaryData.spoonBalance === "number") {
            updateUserBalance(summaryData.spoonBalance);
          }
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
  }, [isOpen]); // user 객체 전체를 의존성에 넣으면 업데이트 시 무한 루프 위험이 있어 제거

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
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" fill="var(--primary-light)" />
                  <path d="M14 20H26M20 14V26" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="28" cy="28" r="8" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
                  <text x="26" y="31.5" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial" textAnchor="middle">
                    P
                  </text>
                </svg>
              </div>
              <div className="stat-label">
                <span className="label-text">포인트</span>
                <span className="stat-value">
                  {statsLoading && user?.spoonBalance === undefined ? "..." : (user?.spoonBalance ?? 0).toLocaleString()}
                </span>
              </div>
            </Link>

            <Link to="/classes/oneday/coupons" className="stat-box" onClick={() => setIsOpen(false)}>
              <div className="stat-icon-wrapper">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="5" y="10" width="30" height="20" rx="4" fill="var(--primary)" />
                  <circle cx="12" cy="20" r="2.5" fill="white" />
                  <line x1="18" y1="12" x2="18" y2="28" stroke="white" strokeDasharray="2 2" />
                  <text x="26" y="24" fill="white" fontSize="13" fontWeight="900" fontFamily="Arial" textAnchor="middle">
                    %
                  </text>
                </svg>
              </div>
              <div className="stat-label">
                <span className="label-text">쿠폰</span>
                <span className="stat-value">{statsLoading && couponCount === null ? "..." : couponCount ?? 0}</span>
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
              <Link to="/mypage/reservations" onClick={() => setIsOpen(false)}>
                클래스 예약 내역
              </Link>
            </li>
            <li>
              <Link to="/mypage/wishlist" onClick={() => setIsOpen(false)}>
                찜 목록
              </Link>
            </li>
            <li>
              <Link to="/mypage/reviews" onClick={() => setIsOpen(false)}>
                내 리뷰
              </Link>
            </li>
            <li>
              <Link to="/mypage/inquiries" onClick={() => setIsOpen(false)}>
                문의 내역
              </Link>
            </li>
            <li>
              <Link to="/mypage/profile" onClick={() => setIsOpen(false)}>
                내 정보 수정
              </Link>
            </li>
            <li>
              <Link to="/event" onClick={() => setIsOpen(false)}>
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
