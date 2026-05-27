import { existsSync } from "node:fs";

const themeDir = new URL("../src/data/themes/", import.meta.url);

if (!existsSync(themeDir)) {
  console.log("No catalog themes exist yet. Theme validation starts in Task 2.");
  process.exit(0);
}

console.log("Theme validation is scaffolded. Full validation starts in Task 2.");
