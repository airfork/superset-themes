import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getDefaultFocusedTheme, getFeaturedThemes } from "../src/data/featured.ts";
import { getThemeCssVars } from "../src/preview/themeCssVars.ts";
import { criticalThemePlugin } from "./vite-plugin-critical-theme.mjs";

const defaultFocusedTheme = getDefaultFocusedTheme().theme;
const STUB_HTML = '<html><head><style id="critical-theme"></style></head><body></body></html>';

function renderHtml() {
  return criticalThemePlugin().transformIndexHtml(STUB_HTML);
}

function assertIncludes(actual, expected) {
  assert.ok(actual.includes(expected), `Expected output to include: ${expected}`);
}

test("critical theme CSS uses the runtime theme CSS variable mapper", () => {
  const html = renderHtml();
  const vars = getThemeCssVars(defaultFocusedTheme);

  assert.match(html, /<style id="critical-theme">/);
  assertIncludes(html, `--chrome-surface: ${vars["--chrome-surface"]};`);
  assertIncludes(html, `--chrome-muted-foreground: ${vars["--chrome-muted-foreground"]};`);
  assertIncludes(html, `--preview-focus-ring: ${vars["--preview-focus-ring"]};`);
  assertIncludes(html, `--preview-ui-selection: ${vars["--preview-ui-selection"]};`);
  assertIncludes(html, `--preview-terminal-selection: ${vars["--preview-terminal-selection"]};`);
});

test("critical theme CSS does not hardcode a theme id and keeps a no-attribute fallback", () => {
  const source = readFileSync("scripts/vite-plugin-critical-theme.mjs", "utf8");
  const html = renderHtml();

  assert.doesNotMatch(source, /FEATURED_DEFAULT_ID|tokyo-night/);
  assertIncludes(html, ":root:not([data-theme-id])");
  assertIncludes(html, "html:not([data-theme-id])");
});

test("bakes a critical block for every featured theme", () => {
  const html = renderHtml();
  for (const { theme } of getFeaturedThemes()) {
    assertIncludes(html, `:root[data-theme-id="${theme.id}"]`);
    assertIncludes(html, `html[data-theme-id="${theme.id}"]`);
    assertIncludes(html, `background: ${theme.ui.background};`);
  }
});

test("injects an inline first-paint script that reads the OS color scheme", () => {
  const html = renderHtml();
  assertIncludes(html, "<script>");
  assertIncludes(html, "URLSearchParams");
  assertIncludes(html, "prefers-color-scheme: dark");
  assertIncludes(html, "data-theme-id");
  // Featured ids must be embedded so the script can pick within the OS mode.
  assertIncludes(html, `"${defaultFocusedTheme.id}"`);
});
