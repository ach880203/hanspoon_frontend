const KAKAO_SDK_SELECTOR = "script[data-kakao-maps-sdk='true']";
const KAKAO_SDK_URL_PREFIX = "https://dapi.kakao.com/v2/maps/sdk.js";

let sdkLoadPromise = null;

function hasKakaoMapServices() {
  return Boolean(window.kakao?.maps?.services);
}

function buildKakaoSdkUrl(jsKey) {
  const params = new URLSearchParams({
    appkey: jsKey,
    libraries: "services",
    autoload: "false",
  });
  return `${KAKAO_SDK_URL_PREFIX}?${params.toString()}`;
}

/**
 * 카카오 지도 SDK를 비동기로 안전하게 로드합니다.
 * - index.html 정적 script 대신 런타임에 주입해서 parser-blocking 경고를 피합니다.
 * - autoload=false + kakao.maps.load 조합으로 로딩 완료 시점을 명확히 보장합니다.
 */
export function ensureKakaoMapSdkLoaded() {
  if (window.kakao?.maps && hasKakaoMapServices()) {
    return Promise.resolve();
  }

  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  const jsKey = String(import.meta.env.VITE_KAKAO_JS_KEY || "").trim();
  if (!jsKey) {
    return Promise.reject(new Error("카카오 JavaScript 키(VITE_KAKAO_JS_KEY)가 설정되지 않았습니다."));
  }

  sdkLoadPromise = new Promise((resolve, reject) => {
    const resolveWhenReady = () => {
      if (!window.kakao?.maps?.load) {
        reject(new Error("카카오 지도 SDK 초기화 객체를 찾지 못했습니다."));
        return;
      }

      window.kakao.maps.load(() => {
        if (!hasKakaoMapServices()) {
          reject(new Error("카카오 지도 services 라이브러리를 찾지 못했습니다. SDK URL에 libraries=services가 필요합니다."));
          return;
        }
        resolve();
      });
    };

    const existing = document.querySelector(KAKAO_SDK_SELECTOR);
    if (existing) {
      if (window.kakao?.maps?.load) {
        resolveWhenReady();
        return;
      }

      existing.addEventListener("load", resolveWhenReady, { once: true });
      existing.addEventListener("error", () => reject(new Error("카카오 지도 SDK 로드에 실패했습니다.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = buildKakaoSdkUrl(jsKey);
    script.async = true;
    script.defer = true;
    script.dataset.kakaoMapsSdk = "true";
    script.addEventListener("load", resolveWhenReady, { once: true });
    script.addEventListener("error", () => reject(new Error("카카오 지도 SDK 로드에 실패했습니다.")), { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    // 실패한 Promise를 캐시하면 재시도가 막히므로 초기화합니다.
    sdkLoadPromise = null;
    throw error;
  });

  return sdkLoadPromise;
}
