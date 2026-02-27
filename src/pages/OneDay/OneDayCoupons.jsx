import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getMyOneDayCoupons } from "../../api/onedayApi";
import { toDiscountTypeLabel } from "./onedayLabels";
import { OneDayTopTabs } from "./OneDayTopTabs";

const EXPIRE_SOON_DAYS = 3;

export const OneDayCoupons = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const refresh = Number(searchParams.get("refresh") || 0);

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await getMyOneDayCoupons();
      const list = Array.isArray(data) ? data : [];
      setCoupons(list);
      setMessage(`쿠폰 ${list.length}건`);
    } catch (e) {
      setError(e?.message ?? "쿠폰 조회 실패");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons, refresh]);

  const onRefresh = () => {
    const next = new URLSearchParams(searchParams);
    next.set("refresh", String(refresh + 1));
    setSearchParams(next, { replace: false });
  };

  const sortedCoupons = useMemo(() => {
    return [...coupons].sort((a, b) => Date.parse(b?.issueAt ?? "") - Date.parse(a?.issueAt ?? ""));
  }, [coupons]);

  const expireSoonCoupons = useMemo(() => {
    return sortedCoupons.filter((coupon) => {
      const leftDays = getDaysUntil(coupon?.expiresAt);
      return leftDays >= 0 && leftDays <= EXPIRE_SOON_DAYS;
    });
  }, [sortedCoupons]);

  return (
    <div style={{ paddingBottom: 24 }}>
      <OneDayTopTabs />

      <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto", display: "grid", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>내 쿠폰</h1>

        <div style={panel}>
          <button style={btnPrimary} onClick={onRefresh} disabled={loading}>
            {loading ? "조회중..." : "쿠폰 조회"}
          </button>
        </div>

        {error && <div style={errorBox}>{error}</div>}
        {message && <div style={okBox}>{message}</div>}
        {expireSoonCoupons.length > 0 ? (
          <div style={warnBox}>
            만료 임박 쿠폰 {expireSoonCoupons.length}개가 있어요. 만료 전에 사용해 주세요.
          </div>
        ) : null}

        <div style={panel}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>쿠폰 목록</h2>
          {sortedCoupons.length === 0 ? (
            <div style={{ color: "#6b7280" }}>쿠폰이 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {sortedCoupons.map((c) => (
                <div key={c.userCouponId} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <strong>{c.name}</strong>
                    <span style={badge(c.usable)}>{c.usable ? "사용 가능" : "사용 불가"}</span>
                  </div>
                  <span style={{ color: "#4b5563", fontSize: 14 }}>
                    {c.discountTypeLabel ?? toDiscountTypeLabel(c.discountType)} {Number(c.discountValue ?? 0).toLocaleString("ko-KR")}
                  </span>
                  <span style={{ color: "#6b7280", fontSize: 13 }}>
                    발급: {fmtDate(c.issueAt)} / 만료: {fmtDate(c.expiresAt)}
                  </span>
                  <span style={{ color: "#6b7280", fontSize: 13 }}>
                    유효기간: 발급일로부터 6개월 (만료일 {fmtDate(c.expiresAt)})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("ko-KR");
}

function getDaysUntil(value) {
  if (!value) return -1;
  const expireTime = new Date(value).getTime();
  if (Number.isNaN(expireTime)) return -1;
  const now = Date.now();
  return Math.ceil((expireTime - now) / (1000 * 60 * 60 * 24));
}

const panel = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const btnPrimary = {
  height: 38,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 10,
  display: "grid",
  gap: 4,
};

const badge = (usable) => ({
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: `1px solid ${usable ? "#86efac" : "#fca5a5"}`,
  background: usable ? "#f0fdf4" : "#fff1f2",
  color: usable ? "#166534" : "#991b1b",
  fontWeight: 700,
});

const errorBox = {
  border: "1px solid #fecaca",
  background: "#fff1f2",
  color: "#991b1b",
  borderRadius: 10,
  padding: 10,
};

const okBox = {
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#166534",
  borderRadius: 10,
  padding: 10,
};

const warnBox = {
  border: "1px solid #fed7aa",
  background: "#fff7ed",
  color: "#9a3412",
  borderRadius: 10,
  padding: 10,
  fontWeight: 700,
};
