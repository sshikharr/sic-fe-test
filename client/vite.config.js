import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  base: '/', // Add this line to ensure proper asset paths
  build: {
    outDir: "dist", // Explicitly set output directory
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
  },
  server: {
    host: true, // Needed for proper network access
    port: 5000,
    open: true,
    allowedHosts: [
      // The host from your latest error message
      "sic-fe-test.onrender.com", 
      // Other hosts you were trying to allow
      "modelmovementcontrolfrontend-2m1s.onrender.com", 
      "modelmovementcontrol-11.onrender.com",
      "modelmovementcontrol-112.onrender.com", 
    ],
  },
  preview: {
    allowedHosts: ["modelmovementcontrolfrontend-2m1s.onrender.com", "modelmovementcontrol-11.onrender.com","modelmovementcontrol-112.onrender.com", "https://sic-fe-test.onrender.com", "sic-fe-test.onrender.com"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});