import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { getDefaultFocusedTheme, getFeaturedThemes } from "../src/data/featured.ts";
import { getThemeCssVars } from "../src/preview/themeCssVars.ts";
import { githubPagesSpaFallbackPlugin } from "../vite.config.ts";
import { criticalThemePlugin } from "./vite-plugin-critical-theme.mjs";

const defaultFocusedTheme = getDefaultFocusedTheme().theme;
const STUB_HTML = '<html><head><style id="critical-theme"></style></head><body></body></html>';
const SCRIPT_REGEX = /<script>([\s\S]*?)<\/script>/;

function renderHtml() {
  return criticalThemePlugin().transformIndexHtml(STUB_HTML);
}

function assertIncludes(actual, expected) {
  assert.ok(actual.includes(expected), `Expected output to include: ${expected}`);
}

function runInlineScript({ pathname = "/", search = "", prefersDark = true, random = 0 } = {}) {
  const html = renderHtml();
  const script = SCRIPT_REGEX.exec(html)?.[1];
  assert.ok(script, "Expected critical theme HTML to include an inline script.");

  const attributes = [];
  const math = Object.create(Math);
  math.random = () => random;

  vm.runInNewContext(script, {
    URLSearchParams,
    document: {
      documentElement: {
        setAttribute: (name, value) => attributes.push([name, value]),
      },
    },
    location: { pathname, search },
    Math: math,
    window: {
      matchMedia: (query) => ({
        matches: prefersDark && query === "(prefers-color-scheme: dark)",
      }),
    },
  });

  return attributes;
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

test("inline first-paint script seeds bare catalog visits", () => {
  assert.deepEqual(runInlineScript({ pathname: "/", search: "", prefersDark: true, random: 0 }), [
    ["data-theme-id", "tokyo-night"],
  ]);
});

test("inline first-paint script leaves non-catalog deep links untouched", () => {
  assert.deepEqual(
    runInlineScript({
      pathname: "/compare",
      search: "?a=aurora-light&from=graphite-dark",
      prefersDark: true,
      random: 0,
    }),
    [],
  );
  assert.deepEqual(
    runInlineScript({
      pathname: "/lab",
      search: "?from=aurora-dark",
      prefersDark: false,
      random: 0,
    }),
    [],
  );
});

test("GitHub Pages fallback plugin emits direct route artifacts for sitemap routes", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "superset-pages-"));

  try {
    await writeFile(
      join(outDir, "index.html"),
      "<!doctype html><title>Superset Theme Catalog</title>",
    );

    const plugin = githubPagesSpaFallbackPlugin();
    plugin.configResolved?.({ build: { outDir } });
    await plugin.closeBundle?.();

    const expectedHtml = readFileSync(join(outDir, "index.html"), "utf8");
    for (const path of [
      "404.html",
      "compare.html",
      "compare/index.html",
      "lab.html",
      "lab/index.html",
    ]) {
      assert.equal(readFileSync(join(outDir, path), "utf8"), expectedHtml);
    }
    assert.equal(readFileSync(join(outDir, ".nojekyll"), "utf8"), "");
  } finally {
    await rm(outDir, { force: true, recursive: true });
  }
});
