import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: ["lucide-react", "zod"],
  },
  plugins: [react()],
});
