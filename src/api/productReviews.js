// src/api/reviews.js
import { http } from "./http";

// ?곹뭹蹂??꾧린 紐⑸줉 (濡쒓렇???놁뼱??議고쉶 媛??
export async function fetchProductReviews(productId, page = 0, size = 10) {
  const { data } = await http.get(
    `/api/products/${Number(productId)}/reviews?page=${page}&size=${size}`
  );
  return data; // Page<ReviewResponseDto>
}

// ???꾧린 紐⑸줉
export async function fetchMyReviews(page = 0, size = 10) {
  const { data } = await http.get(`/api/reviews/me?page=${page}&size=${size}`);
  return data; // Page<ReviewResponseDto>
}

// ?꾧린 ?깅줉(??怨꾩젙)
export async function createProductReview(productId, { rating, content }) {
  const { data } = await http.post(`/api/products/${Number(productId)}/reviews`, {
    rating: Number(rating),
    content,
  });
  return data; // ReviewResponseDto
}

// ?꾧린 수정(???꾧린留?
export async function updateReview(revId, { rating, content }) {
  const { data } = await http.patch(`/api/reviews/${Number(revId)}`, {
    rating: Number(rating),
    content,
  });
  return data; // ReviewResponseDto
}

// ?꾧린 삭제(???꾧린留?
export async function deleteReview(revId) {
  await http.del(`/api/reviews/${Number(revId)}`);
}

