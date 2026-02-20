// src/api/wishes.js
import { http } from "./http";

export async function fetchMyWishes(page = 0, size = 20) {
  const { data } = await http.get(`/api/wishes/me?page=${page}&size=${size}`);
  return data; // Page<WishProductResponseDto>
}

export async function isWished(productId) {
  const { data } = await http.get(`/api/wishes/me/products/${Number(productId)}`);
  return data; // { productId, wished }
}

export async function toggleWish(productId) {
  const { data } = await http.post(`/api/wishes/me/products/${Number(productId)}/toggle`);
  return data; // { productId, wished }
}

export async function addWish(productId) {
  const { data } = await http.post(`/api/wishes/me/products/${Number(productId)}`);
  return data;
}

export async function removeWish(productId) {
  const { data } = await http.del(`/api/wishes/me/products/${Number(productId)}`);
  return data;
}
