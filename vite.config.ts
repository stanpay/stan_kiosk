import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visitJejuDevApiPlugin } from "./vite.visitjeju-plugin.ts";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), visitJejuDevApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      // data.go.kr CORS 우회 (개발 서버)
      "/api/data-go-kr": {
        target: "https://apis.data.go.kr",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/data-go-kr/, ""),
      },
    },
  },
});
