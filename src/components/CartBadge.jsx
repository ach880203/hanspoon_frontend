import { useCart } from "../contexts/CartContext";
import "./CartBadge.css";

export default function CartBadge({ children }) {
  const { count } = useCart();

  return (
    <div className="cartBadgeWrap">
      {children}
      {count > 0 && <span className="cartBadge">{count}</span>}
    </div>
  );
}