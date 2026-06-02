import { describe, expect, it } from "vitest";
import { normalizeRouterBasepath, toAppHref } from "./basepath";

describe("normalizeRouterBasepath", () => {
  it("keeps root hosting at /", () => {
    expect(normalizeRouterBasepath("/")).toBe("/");
    expect(normalizeRouterBasepath("")).toBe("/");
  });

  it("normalizes GitHub Pages project paths for TanStack Router basepath", () => {
    expect(normalizeRouterBasepath("/superset-themes/")).toBe("/superset-themes");
    expect(normalizeRouterBasepath("superset-themes")).toBe("/superset-themes");
  });
});

describe("toAppHref", () => {
  it("keeps root-hosted hrefs unchanged", () => {
    expect(toAppHref("/lab?from=tokyo-night", "/")).toBe("/lab?from=tokyo-night");
  });

  it("prefixes hrefs for GitHub Pages project hosting", () => {
    expect(toAppHref("/lab?from=tokyo-night", "/superset-themes")).toBe(
      "/superset-themes/lab?from=tokyo-night",
    );
  });
});
