import react from "@vitejs/plugin-react";
import path from "path";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Vite config для Slash Admin
// https://vitejs.dev/config/
export default defineConfig({
  root: "./src/admin-panel",
  
  plugins: [
    react(),
    // tailwindcss(), // Disabled - using PostCSS instead
    vanillaExtractPlugin({
      identifiers: ({ debugId }) => `${debugId}`,
    }),
    tsconfigPaths({
      root: "./src/admin-panel",
    }),
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/admin-panel"),
      "~": path.resolve(__dirname, "./src/admin-panel"),
      "#": path.resolve(__dirname, "./src/admin-panel"),
      "#/enum": path.resolve(__dirname, "./src/admin-panel/types/enum.ts"),
    },
  },
  
  server: {
    port: 3001,
    open: false,
  },
  
  build: {
    outDir: path.resolve(__dirname, "./dist-admin"),
    emptyOutDir: true,
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router"],
          "antd-vendor": ["antd", "@ant-design/cssinjs", "styled-components"],
          "charts-vendor": ["apexcharts", "react-apexcharts"],
          "calendar-vendor": [
            "@fullcalendar/core",
            "@fullcalendar/react",
            "@fullcalendar/daygrid",
            "@fullcalendar/timegrid",
            "@fullcalendar/interaction",
            "@fullcalendar/list",
          ],
          "utils-vendor": ["axios", "dayjs", "zustand", "ramda", "numeral"],
          "ui-vendor": ["@iconify/react", "motion", "qrcode.react"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    chunkSizeWarningLimit: 1500,
  },
  
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router",
      "antd",
      "axios",
      "dayjs",
      "zustand",
    ],
  },
});
