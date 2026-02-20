// src/api/http.js
import { getAccessToken, clearAuth } from "../utils/authStorage";

async function request(path, { method = "GET", body, headers } = {}) {
  const token = getAccessToken();

  const h = new Headers(headers || {});
  if (token) h.set("Authorization", `Bearer ${token}`);

  const isFormData = body instanceof FormData;

  // JSON일 때만 Content-Type 설정
  if (body && !isFormData && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }

  const res = await fetch(path, {
    method,
    headers: h,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  // 401이면 토큰 만료/로그아웃 처리
  if (res.status === 401) {
    clearAuth();
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  // ApiResponse 래퍼면 data만 꺼내기 (백엔드가 ApiResponse 쓰고 있음)
  // success 응답: ApiResponse.success(message, data)
  // error 응답: ApiResponse.error(message)
  const data = payload && typeof payload === "object" && "data" in payload ? payload.data : payload;
  const message = payload && typeof payload === "object" && "message" in payload ? payload.message : null;

  if (!res.ok) {
    const err = new Error(message || "API Error");
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return { data, message, raw: payload };
}

export function toErrorMessage(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;

  // fetch에서 res.json() 파싱한 에러 형태 대비
  if (err.error) return err.error;
  if (err.errors && Array.isArray(err.errors)) return err.errors.join(", ");

  return JSON.stringify(err);
}

export const http = {
  get: (path) => request(path),
  post: (path, body, opt) => request(path, { method: "POST", body, ...opt }),
  put: (path, body, opt) => request(path, { method: "PUT", body, ...opt }),
  patch: (path, body, opt) => request(path, { method: "PATCH", body, ...opt }), // ✅ 추가
  del: (path, opt) => request(path, { method: "DELETE", ...opt }),
};


