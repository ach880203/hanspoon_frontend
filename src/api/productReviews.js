// src/api/productReviews.js
import { http } from "./http";

/**
 * 상품 리뷰 목록
 * - sort: "BEST" | "LATEST"  (백엔드가 지원 안 하면 무시될 수 있음)
 * - rating: 1~5 (별점 필터)
 * - keyword: 검색어
 */
export async function fetchProductReviews(productId, page = 0, size = 10, opt = {}) {
  const pid = Number(productId);

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));

  if (opt?.sort) params.set("sort", String(opt.sort));
  if (opt?.rating) params.set("rating", String(opt.rating));
  if (opt?.keyword) params.set("keyword", String(opt.keyword));

  const { data } = await http.get(`/api/products/${pid}/reviews?${params.toString()}`);
  return data; // Page<ReviewResponseDto>
}

/**
 * 내 리뷰 목록
 */
export async function fetchMyReviews(page = 0, size = 10) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));

  const { data } = await http.get(`/api/reviews/me?${params.toString()}`);
  return data; // Page<ReviewResponseDto>
}

/**
 * 리뷰 등록 (로그인 필요)
 */
export async function createProductReview(productId, { rating, content }) {
  const pid = Number(productId);
  const { data } = await http.post(`/api/products/${pid}/reviews`, {
    rating: Number(rating),
    content,
  });
  return data; // ReviewResponseDto
}

/**
 * 리뷰 수정 (내 리뷰만)
 */
export async function updateReview(revId, { rating, content }) {
  const { data } = await http.patch(`/api/reviews/${Number(revId)}`, {
    rating: Number(rating),
    content,
  });
  return data; // ReviewResponseDto
}

/**
 * 리뷰 삭제 (내 리뷰만)
 */
export async function deleteReview(revId) {
  await http.del(`/api/reviews/${Number(revId)}`);
}

/**
 * 리뷰 요약(좌측 집계용)
 * - avgRating, totalCount, countsByRating(1~5) 등을 반환하도록 백엔드에 엔드포인트가 있어야 함
 * - 아직 백엔드가 없으면 프론트에서 try/catch로 무시 가능
 */
export async function fetchProductReviewSummary(productId) {
  const pid = Number(productId);
  const { data } = await http.get(`/api/products/${pid}/reviews/summary`);
  return data;
}