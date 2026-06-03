import { describe, expect, it } from "vitest";
import { getFeaturedIdsByMode, pickThemeIdForScheme } from "./defaultThemeSelection";

describe("getFeaturedIdsByMode", () => {
  it("groups featured ids by theme type in featured order", () => {
    const byMode = getFeaturedIdsByMode();
    expect(byMode.dark).toEqual(["tokyo-night", "catppuccin-mocha"]);
    expect(byMode.light).toEqual(["solarized-light", "rose-pine-dawn", "github-light"]);
  });
});

describe("pickThemeIdForScheme", () => {
  const byMode = { light: ["l1", "l2", "l3"], dark: ["d1", "d2"] };

  it("picks a dark theme when the OS prefers dark", () => {
    expect(pickThemeIdForScheme(true, byMode, 0, "fb")).toBe("d1");
    expect(pickThemeIdForScheme(true, byMode, 0.99, "fb")).toBe("d2");
  });

  it("picks a light theme when the OS prefers light", () => {
    expect(pickThemeIdForScheme(false, byMode, 0, "fb")).toBe("l1");
    expect(pickThemeIdForScheme(false, byMode, 0.99, "fb")).toBe("l3");
  });

  it("clamps an out-of-range random value to the last entry", () => {
    expect(pickThemeIdForScheme(true, byMode, 1, "fb")).toBe("d2");
  });

  it("falls back to the other mode when the preferred pool is empty", () => {
    expect(pickThemeIdForScheme(true, { light: ["l1"], dark: [] }, 0, "fb")).toBe("l1");
  });

  it("returns the fallback id when both pools are empty", () => {
    expect(pickThemeIdForScheme(true, { light: [], dark: [] }, 0, "fb")).toBe("fb");
  });
});
