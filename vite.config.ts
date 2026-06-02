import { copyFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { criticalThemePlugin } from "./scripts/vite-plugin-critical-theme.mjs";

function normalizeAssetBase(basePath: string | undefined): string {
  const source = basePath?.trim() || "/";

  if (source === "." || source === "./") {
    return "./";
  }

  if (source === "/") {
    return "/";
  }

  const withLeadingSlash = source.startsWith("/") ? source : `/${source}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function githubPagesSpaFallbackPlugin(): Plugin {
  let outDir = "dist";

  return {
    name: "github-pages-spa-fallback",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      copyFileSync(join(outDir, "index.html"), join(outDir, "404.html"));
      writeFileSync(join(outDir, ".nojekyll"), "");
    },
  };
}

const base = normalizeAssetBase(
  process.env.VITE_BASE_PATH ?? (process.env.GITHUB_PAGES ? "/superset-themes/" : "/"),
);

export default defineConfig({
  base,
  optimizeDeps: {
    include: ["lucide-react", "zod"],
  },
  plugins: [react(), criticalThemePlugin(), githubPagesSpaFallbackPlugin()],
});
