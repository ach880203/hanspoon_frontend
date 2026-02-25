// src/api/carts.js
import { http } from "./http";

/**
 * ???λ컮援щ땲 議고쉶
 * - ?놁쑝硫?404) ?앹꽦 ???ㅼ떆 議고쉶?댁꽌 諛섑솚
 */
export async function fetchMyCart() {
  try {
    const { data } = await http.get("/api/carts/me");
    return data; // CartResponseDto
  } catch (e) {
    if (e?.status === 404) {
      await ensureMyCart();               // ?놁쑝硫??앹꽦
      const { data } = await http.get("/api/carts/me");
      return data;
    }
    throw e;
  }
}

export async function fetchMyCartCount() {
  try {
    const { data } = await http.get("/api/carts/me/count");
    return data?.count ?? data ?? 0;
  } catch (e) {
    if (e?.status === 401 || e?.status === 404) return 0; // 미로그인/장바구니없음
    throw e;
  }
}

/**
 * ???λ컮援щ땲 ?뺣낫(?놁쑝硫??앹꽦)
 * POST /api/carts/me -> { cartId }
 */
export async function ensureMyCart() {
  const { data } = await http.post("/api/carts/me");
  return data; // { cartId }
}

/**
 * ???λ컮援щ땲???닿린
 * - CartService媛 userId濡?getOrCreate ?섎?濡? cart媛 ?놁뼱???먮룞 ?앹꽦???쒕퉬??而⑦듃濡ㅻ윭 援ы쁽 湲곗?)
 */
export async function addMyCartItem({ productId, quantity }) {
  const { data } = await http.post("/api/carts/me/items", {
    productId: Number(productId),
    quantity: Number(quantity),
  });
  return data; // CartResponseDto
}

/**
 * ???λ컮援щ땲?먯꽌 ?섎웾 蹂寃?
 */
export async function updateMyCartItem(itemId, quantity) {
  const { data } = await http.patch(`/api/carts/me/items/${itemId}`, {
    quantity: Number(quantity),
  });
  return data; // CartResponseDto
}

/**
 * ???λ컮援щ땲?먯꽌 ?꾩씠??삭제
 */
export async function deleteMyCartItem(itemId) {
  await http.del(`/api/carts/me/items/${itemId}`);
}

