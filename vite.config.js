import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Vite 설정: 개발 서버 프록시의 타겟을 환경변수 `VITE_API_BASE_URL`에서 읽어옵니다.
// 배포 환경에서는 이 값을 실제 백엔드 URL로 설정하면 됩니다.
export default defineConfig(({ mode }) => {
  // loadEnv로 .env, .env.development 등에서 VITE_ 접두사가 붙은 변수들을 읽어옵니다.
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_API_BASE_URL || "http://localhost:8080";
  

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": { target: backend, changeOrigin: true },
        "/images": { target: backend, changeOrigin: true },
      },
    },
    build: {
      rollupOptions: {
        output: {
          // 경고를 숨기지 않고, 실제로 번들을 분리해 초기 로드 청크 크기를 낮춥니다.
          // 이전 고정 청크 규칙은 vendor <-> react-vendor 순환 의존을 만들어
          // 프로덕션에서 React 객체가 초기화되기 전에 참조되는 문제가 있었습니다.
          // 패키지 단위로 안정적으로 나눠 순환 청크 가능성을 줄입니다.
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            const afterNodeModules = id.split("node_modules/")[1] || "";
            const segments = afterNodeModules.split("/");
            const first = segments[0] || "";
            const second = segments[1] || "";
            const pkg = first.startsWith("@") ? `${first}/${second}` : first;
            if (!pkg) return "vendor";
            return `pkg-${pkg.replace("@", "").replace("/", "-")}`;
          },
        },
      },
    },
  };
});
