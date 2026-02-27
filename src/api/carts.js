// src/api/carts.js
import { http } from "./http";

/**
 * 내 장바구니 조회
 * - 장바구니가 없으면(404) 생성 후 다시 조회해서 반환합니다.
 */
export async function fetchMyCart() {
  try {
    const { data } = await http.get("/api/carts/me");
    return data; // CartResponseDto
  } catch (e) {
    if (e?.status === 404) {
      await ensureMyCart();               // 없으면 생성
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
    if (e?.status === 401 || e?.status === 404) return 0; // 미로그인/장바구니 없음
    throw e;
  }
}

/**
 * 내 장바구니 생성 (이미 있으면 기존 장바구니 반환)
 * POST /api/carts/me -> { cartId }
 */
export async function ensureMyCart() {
  const { data } = await http.post("/api/carts/me");
  return data; // { cartId }
}

/**
 * 내 장바구니에 상품 추가
 * - CartService가 userId 기준 getOrCreate를 수행하므로, 장바구니가 없어도 자동 생성됩니다.
 */
export async function addMyCartItem({ productId, quantity }) {
  const { data } = await http.post("/api/carts/me/items", {
    productId: Number(productId),
    quantity: Number(quantity),
  });
  return data; // CartResponseDto
}

/**
 * 내 장바구니에서 수량 변경
 */
export async function updateMyCartItem(itemId, quantity) {
  const { data } = await http.patch(`/api/carts/me/items/${itemId}`, {
    quantity: Number(quantity),
  });
  return data; // CartResponseDto
}

/**
 * 내 장바구니에서 아이템 삭제
 */
export async function deleteMyCartItem(itemId) {
  await http.del(`/api/carts/me/items/${itemId}`);
}
