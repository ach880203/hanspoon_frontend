import { useCart } from "../contexts/CartContext";
import "./CartToast.css";

export default function CartToast() {
  const { toast } = useCart();
  if (!toast) return null;

  return (
    <div className="cartToast">
      <div className="cartToastInner">
        {toast.imgUrl && <img src={toast.imgUrl} alt="" />}
        <div className="cartToastText">
          <div className="cartToastTitle">{toast.title || "장바구니에 담았습니다."}</div>
          <div className="cartToastMsg">{toast.message}</div>
        </div>
      </div>
    </div>
  );
}