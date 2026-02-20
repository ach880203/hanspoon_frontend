const KEY = "HANSPOON_CART_ID";

export function getCartId() {
  const v = localStorage.getItem(KEY);
  return v ? Number(v) : null;
}

export function setCartId(id) {
  localStorage.setItem(KEY, String(id));
}

export function clearCartId() {
  localStorage.removeItem(KEY);
}
