import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getDefaultFocusedTheme } from "../src/data/featured.ts";
import { getThemeCssVars } from "../src/preview/themeCssVars.ts";
import { criticalThemePlugin } from "./vite-plugin-critical-theme.mjs";

const defaultFocusedTheme = getDefaultFocusedTheme().theme;

function assertIncludes(actual, expected) {
  assert.ok(actual.includes(expected), `Expected output to include: ${expected}`);
}

test("critical theme CSS uses the runtime theme CSS variable mapper", () => {
  const plugin = criticalThemePlugin();

  const html = plugin.transformIndexHtml(
    '<html><head><style id="critical-theme"></style></head><body></body></html>',
  );
  const vars = getThemeCssVars(defaultFocusedTheme);

  assert.match(html, /<style id="critical-theme">/);
  assertIncludes(html, `--chrome-surface: ${vars["--chrome-surface"]};`);
  assertIncludes(html, `--chrome-muted-foreground: ${vars["--chrome-muted-foreground"]};`);
  assertIncludes(html, `--preview-focus-ring: ${vars["--preview-focus-ring"]};`);
  assertIncludes(html, `--preview-ui-selection: ${vars["--preview-ui-selection"]};`);
  assertIncludes(html, `--preview-terminal-selection: ${vars["--preview-terminal-selection"]};`);
});

test("critical theme CSS uses the runtime default focused theme", () => {
  const source = readFileSync("scripts/vite-plugin-critical-theme.mjs", "utf8");
  const plugin = criticalThemePlugin();

  const html = plugin.transformIndexHtml(
    '<html><head><style id="critical-theme"></style></head><body></body></html>',
  );

  assert.doesNotMatch(source, /FEATURED_DEFAULT_ID|tokyo-night/);
  assertIncludes(html, `:root[data-theme-id="${defaultFocusedTheme.id}"],`);
});
