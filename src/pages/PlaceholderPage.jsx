// src/pages/PlaceholderPage.jsx
import { Link, useLocation } from "react-router-dom";

export default function PlaceholderPage({ title = "준비중", desc }) {
  const loc = useLocation();

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>{title}</h1>
      <div style={{ color: "#64748b", marginBottom: 16 }}>
        {desc ?? `이 페이지는 아직 API/화면 구현 전입니다. (현재 경로: ${loc.pathname})`}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link to="/" style={btnStyle}>메인으로</Link>
        <Link to="/products" style={btnStyle}>마켓(상품)</Link>
        <Link to="/cart" style={btnStyle}>장바구니</Link>
        <Link to="/admin/add-product" style={btnStyle}>관리자: 상품등록</Link>
      </div>
    </div>
  );
}

const btnStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  textDecoration: "none",
  color: "#0f172a",
  background: "white",
};
