// src/api/http.js
import { getAccessToken, clearAuth } from "../utils/authStorage";

function buildUrl(path, params) {
  if (!params) return path;

  // path가 "/api/products" 같은 상대경로라고 가정 (브라우저 환경)
  const url = new URL(path, window.location.origin);

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;

    if (Array.isArray(v)) {
      url.searchParams.delete(k);
      v.forEach((vv) => {
        if (vv === undefined || vv === null || vv === "") return;
        url.searchParams.append(k, String(vv));
      });
      return;
    }

    url.searchParams.set(k, String(v));
  });

  return url.pathname + url.search + url.hash;
}

async function request(path, { method = "GET", params, body, headers } = {}) {
  const token = getAccessToken();

  const h = new Headers(headers || {});
  if (token) h.set("Authorization", `Bearer ${token}`);

  const isFormData = body instanceof FormData;

  // JSON일 때만 Content-Type 설정
  if (body && !isFormData && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }

  // ✅ params를 URL에 붙임
  const url = buildUrl(path, params);

  const res = await fetch(url, {
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

  const payload = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  // ApiResponse 래퍼면 data만 꺼내기
  const data =
    payload && typeof payload === "object" && "data" in payload ? payload.data : payload;
  const message =
    payload && typeof payload === "object" && "message" in payload ? payload.message : null;

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
  if (err.error) return err.error;
  if (err.errors && Array.isArray(err.errors)) return err.errors.join(", ");
  return JSON.stringify(err);
}

export const http = {
  // ✅ opt 받도록 수정
  get: (path, opt) => request(path, opt),
  post: (path, body, opt) => request(path, { method: "POST", body, ...opt }),
  put: (path, body, opt) => request(path, { method: "PUT", body, ...opt }),
  patch: (path, body, opt) => request(path, { method: "PATCH", body, ...opt }),
  del: (path, opt) => request(path, { method: "DELETE", ...opt }),
};