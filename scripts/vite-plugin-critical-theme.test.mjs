import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getThemeCssVars } from "../src/preview/themeCssVars.ts";
import { criticalThemePlugin } from "./vite-plugin-critical-theme.mjs";

const tokyoNightTheme = JSON.parse(readFileSync("src/data/themes/tokyo-night.json", "utf8"));

function assertIncludes(actual, expected) {
  assert.ok(actual.includes(expected), `Expected output to include: ${expected}`);
}

test("critical theme CSS uses the runtime theme CSS variable mapper", () => {
  const plugin = criticalThemePlugin();
  plugin.configResolved({ root: process.cwd() });

  const html = plugin.transformIndexHtml(
    '<html><head><style id="critical-theme"></style></head><body></body></html>',
  );
  const vars = getThemeCssVars(tokyoNightTheme);

  assert.match(html, /<style id="critical-theme">/);
  assertIncludes(html, `--chrome-surface: ${vars["--chrome-surface"]};`);
  assertIncludes(html, `--chrome-muted-foreground: ${vars["--chrome-muted-foreground"]};`);
  assertIncludes(html, `--preview-focus-ring: ${vars["--preview-focus-ring"]};`);
  assertIncludes(html, `--preview-ui-selection: ${vars["--preview-ui-selection"]};`);
  assertIncludes(html, `--preview-terminal-selection: ${vars["--preview-terminal-selection"]};`);
});
