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
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("react-router-dom") || id.includes("react-router")) return "router";
            if (id.includes("react-dom") || id.includes("react")) return "react-vendor";
            if (id.includes("axios")) return "axios";
            return "vendor";
          },
        },
      },
    },
  };
});
