import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { checkThemeContrast, getContrastRatio } from "./contrast";
import type { SupersetTheme } from "./themeTypes";

function requireValue<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  return value as T;
}

describe("getContrastRatio", () => {
  it("calculates WCAG contrast ratios for foreground and background colors", () => {
    expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 2);
    expect(getContrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 2);
  });
});

describe("checkThemeContrast", () => {
  it("checks required UI, terminal, and selection token pairs", () => {
    const theme = requireValue(catalogThemes[0]).theme;

    const result = checkThemeContrast(theme);

    expect(result.warnings).toEqual([]);
    expect(result.checkedPairs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundPath: "ui.background",
          foregroundPath: "ui.foreground",
          required: true,
        }),
        expect.objectContaining({
          backgroundPath: "ui.card",
          foregroundPath: "ui.cardForeground",
          required: true,
        }),
        expect.objectContaining({
          backgroundPath: "ui.primary",
          foregroundPath: "ui.primaryForeground",
          required: true,
        }),
        expect.objectContaining({
          backgroundPath: "ui.destructive",
          foregroundPath: "ui.destructiveForeground",
          required: true,
        }),
        expect.objectContaining({
          backgroundPath: "terminal.background",
          foregroundPath: "terminal.foreground",
          required: true,
        }),
        expect.objectContaining({
          backgroundPath: "ui.selection",
          foregroundPath: "ui.selectionForeground",
          required: false,
        }),
        expect.objectContaining({
          backgroundPath: "terminal.selection",
          foregroundPath: "terminal.selectionForeground",
          required: false,
        }),
      ]),
    );
  });

  it("returns structured warnings for contrast failures", () => {
    const baseTheme = requireValue(catalogThemes[0]).theme;
    const failingTheme: SupersetTheme = {
      ...baseTheme,
      id: "low-contrast-test",
      ui: {
        ...baseTheme.ui,
        background: "#ffffff",
        foreground: "#fefefe",
        primary: "#888888",
        primaryForeground: "#8a8a8a",
      },
      terminal: {
        ...baseTheme.terminal,
        background: "#111111",
        foreground: "#121212",
      },
    };

    const result = checkThemeContrast(failingTheme);

    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundPath: "ui.background",
          foregroundPath: "ui.foreground",
          ratio: expect.closeTo(1.01, 2),
          required: true,
          severity: "error",
          threshold: 4.5,
        }),
        expect.objectContaining({
          backgroundPath: "ui.primary",
          foregroundPath: "ui.primaryForeground",
          ratio: expect.any(Number),
          required: true,
          severity: "error",
          threshold: 4.5,
        }),
        expect.objectContaining({
          backgroundPath: "terminal.background",
          foregroundPath: "terminal.foreground",
          ratio: expect.any(Number),
          required: true,
          severity: "error",
          threshold: 4.5,
        }),
      ]),
    );
  });
});
