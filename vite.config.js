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
  };
});
