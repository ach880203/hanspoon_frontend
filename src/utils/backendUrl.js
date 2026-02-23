/**
 * 백엔드 기본 URL을 한 곳에서 관리하기 위한 유틸입니다.
 * - VITE_API_BASE_URL이 있으면 그 값을 사용합니다.
 * - 없으면 상대 경로(프록시/동일 오리진)를 사용합니다.
 */
export function getBackendBaseUrl(fallback = "") {
  const raw = (import.meta.env.VITE_API_BASE_URL || fallback || "").trim();
  return raw.replace(/\/+$/, "");
}

/**
 * 백엔드 절대 URL이 있을 때는 붙여주고, 없으면 상대 경로를 그대로 반환합니다.
 * @param {string} path - "/api/..." 또는 "/images/..." 형태의 경로
 */
export function toBackendUrl(path, fallback = "") {
  const base = getBackendBaseUrl(fallback);
  if (!base) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

