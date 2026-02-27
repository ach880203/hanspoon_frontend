// src/api/inquiries.js
import { http } from "./http";

// 상품별 문의 목록 조회 (로그인 없이도 조회 가능)
export async function fetchProductInquiries(productId, page = 0, size = 10) {
  const { data } = await http.get(
    `/api/products/${Number(productId)}/inquiries?page=${page}&size=${size}`
  );
  return data; // Page<InquiryResponseDto>
}

// 내 문의 목록 조회
export async function fetchMyInquiries(page = 0, size = 10) {
  const { data } = await http.get(`/api/inquiries/me?page=${page}&size=${size}`);
  return data; // Page<InquiryResponseDto>
}

// 문의 등록 (내 계정)
export async function createProductInquiry(productId, { content, secret }) {
  const { data } = await http.post(`/api/products/${Number(productId)}/inquiries`, {
    content,
    secret: !!secret,
  });
  return data; // InquiryResponseDto
}

// 문의 수정 (내 문의만)
export async function updateMyInquiry(inqId, { content, secret }) {
  const { data } = await http.patch(`/api/inquiries/${Number(inqId)}`, {
    content,
    secret: !!secret,
  });
  return data; // InquiryResponseDto
}

// 문의 삭제 (내 문의만)
export async function deleteMyInquiry(inqId) {
  await http.del(`/api/inquiries/${Number(inqId)}`);
}

// (선택) 답변 등록 (관리자/판매자 전용)
export async function answerInquiry(inqId, { answer }) {
  const { data } = await http.post(`/api/inquiries/${Number(inqId)}/answer`, { answer });
  return data; // InquiryResponseDto
}
