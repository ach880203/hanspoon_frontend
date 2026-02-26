// src/api/shippingAddresses.js
import { http } from "./http";

// 내 배송지 목록
export async function fetchMyShippingAddresses() {
  const { data } = await http.get("/api/my/shipping-addresses");
  return data; // ShippingAddressDto.Response[]
}

// 내 기본 배송지
export async function fetchMyDefaultShippingAddress() {
  const { data } = await http.get("/api/my/shipping-addresses/default");
  return data; // ShippingAddressDto.Response
}

// 배송지 추가
export async function createMyShippingAddress(payload) {
  const { data } = await http.post("/api/my/shipping-addresses", payload);
  return data;
}

// 배송지 수정
export async function updateMyShippingAddress(id, payload) {
  const { data } = await http.put(`/api/my/shipping-addresses/${id}`, payload);
  return data;
}

// 배송지 삭제
export async function deleteMyShippingAddress(id) {
  await http.delete(`/api/my/shipping-addresses/${id}`);
}

// 기본 배송지 지정
export async function setDefaultMyShippingAddress(id) {
  const { data } = await http.patch(`/api/my/shipping-addresses/${id}/default`);
  return data;
}