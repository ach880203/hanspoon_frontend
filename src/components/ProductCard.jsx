import { Link } from "react-router-dom";

export default function ProductCard({ p, variant = "default" }) {
  const cardClassName = `card productCard ${variant === "market" ? "productCard-market" : ""}`;
  const imageSrc = p?.thumbnailUrl || p?.imgUrl || p?.imageUrl || p?.thumbnailImageUrl || "";
  const priceNum = Number(p?.price ?? 0);
  const priceText = Number.isFinite(priceNum) ? priceNum.toLocaleString("ko-KR") : "0";

  return (
    <Link to={`/products/${p.id}`} className={cardClassName}>
      <div className="thumb productCard-thumb">
        {imageSrc ? (
          <img src={imageSrc} alt={p?.name || "상품"} />
        ) : (
          <div className="thumbPlaceholder productCard-thumbPlaceholder">이미지 없음</div>
        )}
      </div>

      <div className="cardBody productCard-body">
        {p?.category ? <div className="badge productCard-badge">{p.category}</div> : null}
        <div className="title productCard-title">{p?.name || "상품"}</div>

        <div className="row productCard-row">
          <div className="price productCard-price">{priceText}원</div>
          <div className="stock productCard-stock">재고 {p?.stock ?? 0}</div>
        </div>
      </div>
    </Link>
  );
}
