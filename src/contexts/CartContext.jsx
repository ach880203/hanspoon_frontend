import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchMyCartCount } from "../api/carts";
import { toErrorMessage } from "../api/http";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState(null); // { title, message, imgUrl }

  const refreshCount = useCallback(async () => {
    try {
      const c = await fetchMyCartCount();
      setCount(Number(c) || 0);
    } catch (e) {
      // Do not block UX when badge refresh fails.
      console.debug("cart count refresh failed:", toErrorMessage(e));
    }
  }, []);

  const showToast = (payload) => {
    setToast(payload);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const value = useMemo(
    () => ({ count, setCount, refreshCount, toast, showToast }),
    [count, toast, refreshCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const v = useContext(CartContext);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}
