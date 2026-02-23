// src/api/orders.js
import { http } from "./http";

// ??二쇰Ц ?앹꽦: (湲곗〈 /api/orders -> /api/orders/me 濡?蹂寃?
export async function createOrder({ receiverName, receiverPhone, address1, address2 }) {
  const { data } = await http.post("/api/orders/me", {
    receiverName,
    receiverPhone,
    address1,
    address2,
  });
  return data; // OrderResponseDto
}

// ??二쇰Ц ?곸꽭: (湲곗〈 /api/orders/{id} -> /api/orders/me/{id})
export async function fetchOrder(orderId) {
  const res = await http.get(`/api/orders/me/${orderId}`);
  return res.data; // OrderResponseDto
}

// ????二쇰Ц 紐⑸줉 (?꾪꽣留?吏??
export async function fetchMyOrders({ page = 0, size = 10, startDate, endDate, status } = {}) {
  const params = new URLSearchParams({ page, size });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (status) params.append('status', status);

  const { data } = await http.get(`/api/orders/me?${params.toString()}`);
  return data; // Spring Page
}

// ??寃곗젣: (湲곗〈 /api/orders/{id}/pay -> /api/orders/me/{id}/pay)
export async function payOrder(orderId, payMethod = "CARD") {
  const res = await http.post(`/api/orders/me/${orderId}/pay`, { payMethod });
  return res.data;
}

// ??ship/deliver: ??湲곗〈 洹몃?濡??좎? (愿由??뚯뒪?몄슜)
export async function shipOrder(orderId) {
  const res = await http.post(`/api/orders/${orderId}/ship`);
  return res.data;
}

export async function deliverOrder(orderId) {
  const res = await http.post(`/api/orders/${orderId}/deliver`);
  return res.data;
}

// ??취소/환불: (湲곗〈 /api/orders/{id}/cancel -> /api/orders/me/{id}/cancel)
export async function cancelOrder(orderId, reason) {
  const body = reason ? { reason } : {};
  const res = await http.post(`/api/orders/me/${orderId}/cancel`, body);
  return res.data;
}

