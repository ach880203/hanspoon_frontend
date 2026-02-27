// src/api/orders.js
import { http } from "./http";

// 내 주문 생성: /api/orders/me
export async function createOrder({ receiverName, receiverPhone, address1, address2 }) {
  const { data } = await http.post("/api/orders/me", {
    receiverName,
    receiverPhone,
    address1,
    address2,
  });
  return data; // OrderResponseDto
}

// 내 주문 상세: /api/orders/me/{id}
export async function fetchOrder(orderId) {
  const res = await http.get(`/api/orders/me/${orderId}`);
  return res.data; // OrderResponseDto
}

// 내 주문 목록 조회 (필터 미지정 시 전체)
export async function fetchMyOrders({ page = 0, size = 10, startDate, endDate, status } = {}) {
  const params = new URLSearchParams({ page, size });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (status) params.append('status', status);

  const { data } = await http.get(`/api/orders/me?${params.toString()}`);
  return data; // Spring Page
}

// 내 주문 결제: /api/orders/me/{id}/pay
export async function payOrder(orderId, payMethod = "CARD") {
  const res = await http.post(`/api/orders/me/${orderId}/pay`, { payMethod });
  return res.data;
}

// 내 주문 배송완료 처리: /api/orders/me/{id}/deliver
export async function deliverMyOrder(orderId) {
  const res = await http.post(`/api/orders/me/${orderId}/deliver`);
  return res.data;
}

// 내 주문 취소/환불: /api/orders/me/{id}/cancel
export async function cancelOrder(orderId, reason) {
  const body = reason ? { reason } : {};
  const res = await http.post(`/api/orders/me/${orderId}/cancel`, body);
  return res.data;
}
