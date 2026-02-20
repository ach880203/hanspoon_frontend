// src/api/auth.js
import { http } from "./http";

// ApiResponse 래퍼 풀기
function unwrap(resBody) {
  // 백엔드가 ApiResponse<T>로 주는 경우: { success, message, data }
  if (resBody && typeof resBody === "object" && "data" in resBody) {
    return resBody.data;
  }
  // 혹시 래핑 없이 내려오는 경우 대비
  return resBody;
}

// 에러 메시지 뽑기(백엔드 ApiResponse.error("...")도 잡기)
function extractError(err) {
  const body = err?.response?.data;
  return body?.message || body?.error || err?.message || "요청 실패";
}

export const authApi = {
  login: async ({ email, password }) => {
    try {
      const { data } = await http.post("/api/auth/login", { email, password });
      return unwrap(data); // LoginResponse
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  register: async (dto) => {
    try {
      const { data } = await http.post("/api/auth/register", dto);
      return unwrap(data); // Void or something
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  me: async () => {
    try {
      const { data } = await http.get("/api/auth/me");
      return unwrap(data); // LoginResponse
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  checkEmail: async (email) => {
    try {
      const { data } = await http.get(
        `/api/auth/check-email?email=${encodeURIComponent(email)}`
      );
      return unwrap(data); // Boolean
    } catch (err) {
      throw new Error(extractError(err));
    }
  },
};
