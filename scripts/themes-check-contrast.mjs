import { existsSync } from "node:fs";

const themeDir = new URL("../src/data/themes/", import.meta.url);

if (!existsSync(themeDir)) {
  console.log("No catalog themes exist yet. Contrast checks start in Task 3.");
  process.exit(0);
}

console.log("Theme contrast checking is scaffolded. Full checks start in Task 3.");
