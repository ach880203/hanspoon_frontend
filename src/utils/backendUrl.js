/**
 * 백엔드 기본 URL을 한 곳에서 관리하기 위한 유틸입니다.
 * - VITE_API_BASE_URL이 있으면 그 값을 사용합니다.
 * - 없으면 상대 경로(프록시/동일 오리진)를 사용합니다.
 */
export function getBackendBaseUrl(fallback = "") {
  const raw = (import.meta.env.VITE_API_BASE_URL || fallback || "").trim();
  if (!raw) return "";

  const trimmed = raw.replace(/\/+$/, "");
  const isLocalBaseUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(trimmed);
  const isBrowserLocal =
    typeof window !== "undefined" &&
    /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

  // 배포 도메인에서 localhost 값이 남아 있으면 상대 경로를 사용하도록 비웁니다.
  if (isLocalBaseUrl && !isBrowserLocal) {
    return "";
  }
  return trimmed;
}

function isAbsoluteUrl(path) {
  return /^(?:https?:)?\/\//i.test(path) || /^data:/i.test(path) || /^blob:/i.test(path);
}

function normalizePath(path) {
  const trimmed = String(path || "").trim();
  if (!trimmed) return "";
  if (isAbsoluteUrl(trimmed)) return trimmed;

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (withLeadingSlash.startsWith("/images/recipe/")) {
    return withLeadingSlash.replace("/images/recipe/", "/images/");
  }
  return withLeadingSlash;
}

/**
 * 백엔드 절대 URL이 있을 때는 붙여주고, 없으면 상대 경로를 그대로 반환합니다.
 * @param {string} path - "/api/..." 또는 "/images/..." 형태의 경로
 */
export function toBackendUrl(path, fallback = "") {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath) return normalizedPath;
  if (isAbsoluteUrl(normalizedPath)) return normalizedPath;

  const base = getBackendBaseUrl(fallback);
  if (!base) return normalizedPath;

  // API 호출이 아닌 정적 리소스는 /api 접두어를 제거한 오리진에 붙입니다.
  const resolvedBase = normalizedPath.startsWith("/api/") ? base : base.replace(/\/api$/i, "");
  return `${resolvedBase}${normalizedPath}`;
}

