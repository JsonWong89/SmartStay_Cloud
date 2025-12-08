import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: true,   // allow network access
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5077",   // your backend API
        changeOrigin: true,
        secure: false,
      }
    }
  }
});


