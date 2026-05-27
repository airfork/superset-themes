import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { criticalThemePlugin } from "./scripts/vite-plugin-critical-theme.mjs";

export default defineConfig({
  optimizeDeps: {
    include: ["lucide-react", "zod"],
  },
  plugins: [react(), criticalThemePlugin()],
});
