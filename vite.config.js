import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/shared"),
      "@domains/system": path.resolve(__dirname, "src/domains/system/index.js"),
      "@domains/qms": path.resolve(__dirname, "src/domains/qms/index.js"),
      "@domains/auth": path.resolve(__dirname, "src/domains/auth/index.js"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@core": path.resolve(__dirname, "src/core"),
    },
  },
});
