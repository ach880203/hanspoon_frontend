// src/api/reviews.js
import { http } from "./http";

// 상품별 후기 목록 (로그인 없어도 조회 가능)
export async function fetchProductReviews(productId, page = 0, size = 10) {
  const { data } = await http.get(
    `/api/products/${Number(productId)}/reviews?page=${page}&size=${size}`
  );
  return data; // Page<ReviewResponseDto>
}

// 내 후기 목록
export async function fetchMyReviews(page = 0, size = 10) {
  const { data } = await http.get(`/api/reviews/me?page=${page}&size=${size}`);
  return data; // Page<ReviewResponseDto>
}

// 후기 등록(내 계정)
export async function createProductReview(productId, { rating, content }) {
  const { data } = await http.post(`/api/products/${Number(productId)}/reviews`, {
    rating: Number(rating),
    content,
  });
  return data; // ReviewResponseDto
}

// 후기 수정(내 후기만)
export async function updateReview(revId, { rating, content }) {
  const { data } = await http.patch(`/api/reviews/${Number(revId)}`, {
    rating: Number(rating),
    content,
  });
  return data; // ReviewResponseDto
}

// 후기 삭제(내 후기만)
export async function deleteReview(revId) {
  await http.del(`/api/reviews/${Number(revId)}`);
}
