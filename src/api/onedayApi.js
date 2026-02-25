﻿import axiosInstance from "./axios";
import { loadAuth } from "../utils/authStorage";

const api = axiosInstance;

async function unwrap(promise) {
  const res = await promise;
  const body = res.data;

  // 원데이 API는 success/data/message 공통 응답 형식을 사용합니다.
  if (body && typeof body === "object" && "success" in body) {
    if (!body.success) {
      throw new Error(body?.message || "요청 처리 중 오류가 발생했습니다.");
    }
    return body.data;
  }

  return body;
}

// 로그인 사용자 식별자(userId)를 공통으로 꺼내는 함수입니다.
// 백엔드와 필드명이 다를 수 있어 여러 후보 키를 순서대로 확인합니다.
export function resolveOneDayUserId() {
  const auth = loadAuth();
  return auth?.userId ?? auth?.memberId ?? auth?.id ?? null;
}

// 관리자 권한 여부를 프런트에서 빠르게 확인할 때 사용합니다.
// 서버에서도 다시 권한 검증을 하므로, 이 값은 UI 제어용 보조 정보입니다.
export function isOneDayAdmin() {
  const auth = loadAuth();
  // 초보자 참고:
  // 로그인 응답의 role 포맷이 환경마다 다를 수 있습니다.
  // 예) "ROLE_ADMIN", "ADMIN", "[ROLE_ADMIN]", "ROLE_USER,ROLE_ADMIN"
  // 그래서 문자열을 정규화한 뒤 ADMIN 권한 포함 여부를 판별합니다.
  const role = normalizeRoleText(auth?.role);
  if (hasAdminRole(role)) return true;

  // 일부 로그인 응답은 roles/authorities 배열로 내려올 수 있어서 함께 확인합니다.
  const roles = Array.isArray(auth?.roles) ? auth.roles : [];
  const authorities = Array.isArray(auth?.authorities) ? auth.authorities : [];
  const merged = [...roles, ...authorities].map((x) => normalizeRoleText(x));
  return merged.some((x) => hasAdminRole(x));
}

/**
 * role 텍스트를 권한 판별에 유리한 형태로 정리합니다.
 * - 대괄호 제거: "[ROLE_ADMIN]" -> "ROLE_ADMIN"
 * - 공백 제거
 * - 대문자 통일
 */
function normalizeRoleText(value) {
  return String(value || "")
    .replace(/\[|\]/g, "")
    .trim()
    .toUpperCase();
}

/**
 * 문자열 안에 관리자 권한 토큰이 포함되는지 확인합니다.
 * - 단일 값: ROLE_ADMIN / ADMIN
 * - CSV/공백 혼합 문자열도 지원
 */
function hasAdminRole(roleText) {
  if (!roleText) return false;
  const tokens = roleText.split(/[,\s]+/).filter(Boolean);
  return tokens.includes("ROLE_ADMIN") || tokens.includes("ADMIN");
}

export const getOneDayHome = (config = {}) => unwrap(api.get("/api/oneday/home", config));

export const getOneDayClasses = (params, config = {}) =>
  unwrap(api.get("/api/oneday/classes", { ...config, params }));

// 원데이 클래스 + 세션 등록 API입니다. (관리자 전용)
export const createOneDayClass = (payload, config = {}) =>
  unwrap(api.post("/api/oneday/classes", payload, config));

// 클래스 수정 API (관리자 전용)
export const updateOneDayClass = (classId, payload, config = {}) =>
  unwrap(api.put(`/api/oneday/classes/${classId}`, payload, config));

// 클래스 삭제 API (관리자 전용)
export const deleteOneDayClass = (classId, config = {}) =>
  unwrap(api.delete(`/api/oneday/classes/${classId}`, config));

export const getOneDayClassDetail = (classId, config = {}) =>
  unwrap(api.get(`/api/oneday/classes/${classId}`, config));

export const getOneDayClassSessions = (classId, params, config = {}) =>
  unwrap(api.get(`/api/oneday/classes/${classId}/sessions`, { ...config, params }));

export const searchOneDaySessions = (params, config = {}) =>
  unwrap(api.get("/api/oneday/sessions/search", { ...config, params }));

export const createOneDayHold = (sessionId, config = {}) =>
  unwrap(api.post(`/api/oneday/sessions/${sessionId}/reservations`, null, config));

export const payOneDayReservation = (reservationId, config = {}) =>
  unwrap(api.post(`/api/oneday/reservations/${reservationId}/pay`, null, config));

export const cancelOneDayReservation = (reservationId, config = {}) =>
  unwrap(api.post(`/api/oneday/reservations/${reservationId}/cancel`, null, config));

export const getMyOneDayReservations = (params = {}, config = {}) =>
  unwrap(api.get("/api/oneday/reservations", { ...config, params }));

export const getMyReservationDetail = (reservationId, config = {}) =>
  unwrap(api.get(`/api/oneday/reservations/${reservationId}`, config));

export const getMyOneDayCoupons = (config = {}) =>
  unwrap(api.get("/api/oneday/coupons/me", config));

export const toggleOneDayWish = (classProductId, config = {}) =>
  unwrap(api.post("/api/oneday/wishes/toggle", null, { ...config, params: { classProductId } }));

export const getMyOneDayWishes = (config = {}) =>
  unwrap(api.get("/api/oneday/wishes", config));

export const createOneDayReview = (payload, config = {}) =>
  unwrap(api.post("/api/oneday/reviews", payload, config));

export const deleteOneDayReview = (reviewId, config = {}) =>
  unwrap(api.delete(`/api/oneday/reviews/${reviewId}`, config));

export const getOneDayClassReviews = (classId, config = {}) =>
  unwrap(api.get(`/api/oneday/reviews/classes/${classId}`, config));

// 리뷰 답글 등록은 관리자만 가능합니다.
export const answerOneDayReview = (reviewId, payload, config = {}) =>
  unwrap(api.post(`/api/oneday/reviews/${reviewId}/answer`, payload, config));

export const createOneDayInquiry = (payload, config = {}) =>
  unwrap(api.post("/api/oneday/inquiries", payload, config));

// 모든 원데이 문의 목록을 조회합니다.
// 서버가 공개글/비밀글 노출 권한을 판단해 마스킹된 데이터를 반환합니다.
export const getOneDayInquiries = (config = {}) =>
  unwrap(api.get("/api/oneday/inquiries", config));

// 문의 답글 등록 API입니다.
// 서버에서 "작성자 or 관리자" 권한을 다시 검증합니다.
export const answerOneDayInquiry = (inquiryId, payload, config = {}) =>
  unwrap(api.post(`/api/oneday/inquiries/${inquiryId}/answer`, payload, config));

export function isSessionCompleted(startAt) {
  if (!startAt) return false;
  const startTime = new Date(startAt).getTime();
  if (Number.isNaN(startTime)) return false;
  return startTime <= Date.now();
}
