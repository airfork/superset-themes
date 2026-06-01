import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { checkThemeContrast, getContrastPairs, getContrastRatio } from "./contrast";
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
  it("returns cloned contrast pair definitions", () => {
    const firstCall = getContrastPairs();
    const firstPair = requireValue(firstCall[0]);

    (firstPair as { threshold: number }).threshold = 0;

    expect(requireValue(getContrastPairs()[0]).threshold).toBe(4.5);
  });

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
          ratio: expect.any(Number),
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
    expect(
      result.warnings.find((warning) => warning.foregroundPath === "ui.foreground")?.ratio,
    ).toBeCloseTo(1.0085, 4);
  });

  it("treats Superset baseline contrast misses as fidelity warnings, not theme errors", () => {
    const supersetDark = requireValue(
      catalogThemes.find((entry) => entry.theme.id === "superset-dark"),
    ).theme;

    const result = checkThemeContrast(supersetDark);

    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundPath: "ui.destructive",
          foregroundPath: "ui.destructiveForeground",
          required: true,
          severity: "warning",
        }),
      ]),
    );
    expect(result.warnings.filter((warning) => warning.severity === "error")).toEqual([]);
  });

  it("returns structured invalid-color issues without throwing", () => {
    const baseTheme = requireValue(catalogThemes[0]).theme;
    const invalidTheme: SupersetTheme = {
      ...baseTheme,
      id: "invalid-color-test",
      ui: {
        ...baseTheme.ui,
        foreground: "not-a-color",
      },
    };

    const result = checkThemeContrast(invalidTheme);

    expect(result.invalidColors).toEqual([
      expect.objectContaining({
        backgroundPath: "ui.background",
        foregroundPath: "ui.foreground",
        invalidColor: "not-a-color",
        severity: "error",
        tokenPath: "ui.foreground",
      }),
    ]);
    expect(result.issues).toEqual(expect.arrayContaining(result.invalidColors));
  });
});
