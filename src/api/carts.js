// src/api/carts.js
import { http } from "./http";

/**
 * 내 장바구니 조회
 * - 없으면(404) 생성 후 다시 조회해서 반환
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

/**
 * 내 장바구니 확보(없으면 생성)
 * POST /api/carts/me -> { cartId }
 */
export async function ensureMyCart() {
  const { data } = await http.post("/api/carts/me");
  return data; // { cartId }
}

/**
 * 내 장바구니에 담기
 * - CartService가 userId로 getOrCreate 하므로, cart가 없어도 자동 생성됨(서비스/컨트롤러 구현 기준)
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
