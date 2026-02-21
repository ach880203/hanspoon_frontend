﻿import { NavLink } from "react-router-dom";
import "./OneDayTopTabs.css";

const TABS = [
  { to: "/classes/oneday/classes", label: "전체 클래스" },
  { to: "/classes/oneday/create", label: "클래스 등록" },
  { to: "/classes/oneday/search", label: "세션 검색" },
  { to: "/classes/oneday/reservations", label: "내 예약" },
  { to: "/classes/oneday/wishes", label: "찜" },
  { to: "/classes/oneday/coupons", label: "쿠폰" },
  { to: "/classes/oneday/inquiry", label: "문의하기" },
];

export function OneDayTopTabs() {
  return (
    <div className="oneday-top-tabs-wrap">
      <nav className="oneday-top-tabs">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              isActive ? "oneday-tab-link oneday-tab-link-active" : "oneday-tab-link"
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
