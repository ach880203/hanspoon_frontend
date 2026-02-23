// src/api/inquiries.js
import { http } from "./http";

// ?곹뭹蹂?臾몄쓽 紐⑸줉 (濡쒓렇???놁뼱??議고쉶 媛??
export async function fetchProductInquiries(productId, page = 0, size = 10) {
  const { data } = await http.get(
    `/api/products/${Number(productId)}/inquiries?page=${page}&size=${size}`
  );
  return data; // Page<InquiryResponseDto>
}

// ??臾몄쓽 紐⑸줉
export async function fetchMyInquiries(page = 0, size = 10) {
  const { data } = await http.get(`/api/inquiries/me?page=${page}&size=${size}`);
  return data; // Page<InquiryResponseDto>
}

// 臾몄쓽 ?깅줉(??怨꾩젙)
export async function createProductInquiry(productId, { content, secret }) {
  const { data } = await http.post(`/api/products/${Number(productId)}/inquiries`, {
    content,
    secret: !!secret,
  });
  return data; // InquiryResponseDto
}

// 臾몄쓽 수정(??臾몄쓽留?
export async function updateMyInquiry(inqId, { content, secret }) {
  const { data } = await http.patch(`/api/inquiries/${Number(inqId)}`, {
    content,
    secret: !!secret,
  });
  return data; // InquiryResponseDto
}

// 臾몄쓽 삭제(??臾몄쓽留?
export async function deleteMyInquiry(inqId) {
  await http.del(`/api/inquiries/${Number(inqId)}`);
}

// (?좏깮) ?듬? ?깅줉(愿由ъ옄/?먮ℓ?먯슜)
export async function answerInquiry(inqId, { answer }) {
  const { data } = await http.post(`/api/inquiries/${Number(inqId)}/answer`, { answer });
  return data; // InquiryResponseDto
}

