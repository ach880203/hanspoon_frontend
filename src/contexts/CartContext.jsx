import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchMyCartCount } from "../api/carts"; // 아래에 추가할 API
import { toErrorMessage } from "../api/http";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState(null); // {title, message}

  const refreshCount = async () => {
    try {
      const c = await fetchMyCartCount();
      setCount(Number(c) || 0);
    } catch (e) {
      // badge는 실패해도 UX 치명적이진 않으니 조용히 처리
      console.debug("cart count refresh failed:", toErrorMessage(e));
    }
  };

  const showToast = (payload) => {
    setToast(payload);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    // 앱 처음 로딩 때 1회(로그인 상태면 정상)
    refreshCount();
  }, []);

  const value = useMemo(
    () => ({ count, setCount, refreshCount, toast, showToast }),
    [count, toast]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const v = useContext(CartContext);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}