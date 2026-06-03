import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const projectRoot = new URL("..", import.meta.url);
const siteUrl = "https://airfork.github.io/superset-themes/";
const siteDescription = "Browse, compare, edit, and export Superset-compatible application themes.";

function readText(path) {
  return readFileSync(new URL(path, projectRoot), "utf8");
}

function assertIncludes(source, expected) {
  assert.ok(source.includes(expected), `Expected source to include:\n${expected}`);
}

test("index.html exposes install, browser, and social metadata", () => {
  const html = readText("index.html");

  for (const expected of [
    '<meta name="description" content="Browse, compare, edit, and export Superset-compatible application themes." />',
    '<meta name="robots" content="index, follow" />',
    '<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />',
    '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#151110" />',
    '<link rel="canonical" href="https://airfork.github.io/superset-themes/" />',
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.svg" />',
    '<link rel="manifest" href="/site.webmanifest" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Superset Theme Catalog" />',
    '<meta property="og:title" content="Superset Theme Catalog" />',
    `<meta property="og:description" content="${siteDescription}" />`,
    `<meta property="og:url" content="${siteUrl}" />`,
    '<meta property="og:image" content="https://airfork.github.io/superset-themes/social-card.svg" />',
    '<meta property="og:image:type" content="image/svg+xml" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:title" content="Superset Theme Catalog" />',
    `<meta name="twitter:description" content="${siteDescription}" />`,
    '<meta name="twitter:image" content="https://airfork.github.io/superset-themes/social-card.svg" />',
  ]) {
    assertIncludes(html, expected);
  }
});

test("public metadata assets are present and internally consistent", () => {
  const favicon = readText("public/favicon.svg");
  const appleIcon = readText("public/apple-touch-icon.svg");
  const socialCard = readText("public/social-card.svg");
  const robots = readText("public/robots.txt");
  const sitemap = readText("public/sitemap.xml");
  const manifest = JSON.parse(readText("public/site.webmanifest"));

  assertIncludes(favicon, "<svg");
  assertIncludes(appleIcon, "<svg");
  assertIncludes(socialCard, 'width="1200"');
  assertIncludes(socialCard, "Superset Theme Catalog");

  assertIncludes(robots, "User-agent: *");
  assertIncludes(robots, "Allow: /");
  assertIncludes(robots, `${siteUrl}sitemap.xml`);

  assertIncludes(sitemap, "<urlset");
  for (const path of ["", "compare", "lab"]) {
    assertIncludes(sitemap, `<loc>${siteUrl}${path}</loc>`);
  }

  assert.equal(manifest.name, "Superset Theme Catalog");
  assert.equal(manifest.short_name, "Superset Themes");
  assert.equal(manifest.start_url, ".");
  assert.equal(manifest.scope, ".");
  assert.equal(manifest.theme_color, "#151110");
  assert.equal(manifest.background_color, "#ffffff");
  assert.deepEqual(manifest.icons, [
    {
      src: "favicon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any maskable",
    },
  ]);

  assert.ok(readFileSync(join(new URL("public", projectRoot).pathname, "favicon.svg")));
});
