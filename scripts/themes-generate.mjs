import { writeFileSync } from "node:fs";
import { generateRandomTheme } from "../src/lab/randomTheme.ts";
import { exportCatalogThemeJson } from "../src/theme-core/exportTheme.ts";

function readOption(name) {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function readMode() {
  const mode = readOption("--mode");

  if (!mode) {
    return "dark";
  }

  if (mode !== "dark" && mode !== "light") {
    console.error("Expected --mode to be light or dark.");
    process.exit(1);
  }

  return mode;
}

function readHueRange() {
  const min = readOption("--hue-min");
  const max = readOption("--hue-max");

  if (!min && !max) {
    return undefined;
  }

  return {
    max: Number(max ?? 360),
    min: Number(min ?? 0),
  };
}

const seed = readOption("--seed") ?? "preview";
const theme = generateRandomTheme({
  hueRange: readHueRange(),
  mode: readMode(),
  seed,
});
const json = exportCatalogThemeJson(theme);
const outPath = readOption("--out");

if (outPath) {
  writeFileSync(outPath, json, "utf8");
  console.error(`Wrote ${theme.id} to ${outPath}.`);
} else {
  process.stdout.write(json);
}
