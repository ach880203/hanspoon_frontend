import { Link } from "react-router-dom";

export default function ProductCard({ p }) {
  return (
    <Link to={`/products/${p.id}`} className="card">
      <div className="thumb">
        {p.thumbnailUrl ? (
          <img src={p.thumbnailUrl} alt={p.name} />
        ) : (
          <div className="thumbPlaceholder">이미지 없음</div>
        )}
      </div>
      <div className="cardBody">
        <div className="badge">{p.category}</div>
        <div className="title">{p.name}</div>
        <div className="row">
          <div className="price">{p.price.toLocaleString()}원</div>
          <div className="stock">재고 {p.stock}</div>
        </div>
      </div>
    </Link>
  );
}

