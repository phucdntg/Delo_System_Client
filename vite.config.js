import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// Chỉnh luôn trong file jsconfig.json nghen bro
export default defineConfig({
  plugins: [
    react({
      // React Compiler chỉ bật ở production — tránh xung đột React Refresh (HMR) khi dev
      babel: process.env.NODE_ENV === "production"
        ? { plugins: [["babel-plugin-react-compiler", {}]] }
        : undefined,
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/shared"),
      "@domains/system": path.resolve(__dirname, "src/domains/system/index.js"),
      "@domains/qms": path.resolve(__dirname, "src/domains/qms/index.js"),
      "@domains/qna": path.resolve(__dirname, "src/domains/qna/index.js"),
      "@domains/evaluation": path.resolve(
        __dirname,
        "src/domains/evaluation/index.js",
      ),
      "@domains/lookup": path.resolve(__dirname, "src/domains/lookup/index.js"),
      "@domains/auth": path.resolve(__dirname, "src/domains/auth/index.js"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@core": path.resolve(__dirname, "src/core"),
    },
  },
});
