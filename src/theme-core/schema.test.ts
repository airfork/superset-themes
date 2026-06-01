import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { themeFixtures } from "../data/fixtures";
import { catalogThemeMetaSchema, supersetThemeSchema, validateCatalogThemes } from "./schema";

function requireValue<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  return value as T;
}

describe("theme schema", () => {
  it("parses every fixture theme", () => {
    for (const theme of themeFixtures) {
      expect(supersetThemeSchema.parse(theme)).toMatchObject({
        description: theme.description,
        id: theme.id,
        type: theme.type,
      });
    }
  });

  it("normalizes legacy app themes into Superset's full theme token surface", () => {
    const theme = requireValue(themeFixtures[0]);
    const parsed = supersetThemeSchema.parse({
      ...theme,
      terminal: {
        ...theme.terminal,
        cursorAccent: undefined,
        selectionBackground: undefined,
      },
      ui: {
        ...theme.ui,
        chart1: undefined,
        highlightActive: undefined,
        highlightForeground: undefined,
        highlightMatch: undefined,
        sidebar: undefined,
        sidebarAccent: undefined,
        sidebarAccentForeground: undefined,
        sidebarBorder: undefined,
        sidebarForeground: undefined,
        sidebarPrimary: undefined,
        sidebarPrimaryForeground: undefined,
        sidebarRing: undefined,
        tertiary: undefined,
        tertiaryActive: undefined,
      },
    });

    expect(parsed.ui).toMatchObject({
      chart1: theme.ui.primary,
      highlightActive: theme.ui.selection,
      highlightForeground: theme.ui.selectionForeground,
      highlightMatch: theme.ui.selection,
      sidebar: theme.ui.card,
      sidebarAccent: theme.ui.secondary,
      sidebarAccentForeground: theme.ui.secondaryForeground,
      sidebarBorder: theme.ui.border,
      sidebarForeground: theme.ui.foreground,
      sidebarPrimary: theme.ui.primary,
      sidebarPrimaryForeground: theme.ui.primaryForeground,
      sidebarRing: theme.ui.ring,
      tertiary: theme.ui.muted,
      tertiaryActive: theme.ui.secondary,
    });
    expect(parsed.terminal).toMatchObject({
      cursorAccent: theme.terminal.background,
      selectionBackground: theme.terminal.selection,
    });
  });

  it("rejects invalid theme types", () => {
    expect(() =>
      supersetThemeSchema.parse({
        ...themeFixtures[0],
        type: "midnight",
      }),
    ).toThrow();
  });

  it("parses every catalog metadata entry", () => {
    for (const entry of catalogThemes) {
      expect(catalogThemeMetaSchema.parse(entry.meta)).toMatchObject({
        themeId: entry.theme.id,
      });
    }
  });

  it("includes Rose Pine Dawn as a ported light theme", () => {
    const rose = catalogThemes.find((entry) => entry.theme.id === "rose-pine-dawn");
    expect(rose).toBeDefined();
    expect(rose?.theme.type).toBe("light");
    expect(rose?.meta.source).toBe("upstream-port");
    expect(rose?.meta.family).toBe("Rosé Pine");
  });

  it("includes One Dark as a ported dark theme", () => {
    const oneDark = catalogThemes.find((entry) => entry.theme.id === "one-dark");
    expect(oneDark).toBeDefined();
    expect(oneDark?.theme.type).toBe("dark");
    expect(oneDark?.meta.source).toBe("upstream-port");
    expect(oneDark?.meta.family).toBe("One Dark");
  });

  it("includes Superset's install-safe light and dark baseline themes", () => {
    const baseline = catalogThemes.filter((entry) => entry.meta.family === "Superset");

    expect(baseline.map((entry) => entry.theme.id)).toEqual(["superset-light", "superset-dark"]);
    expect(baseline.map((entry) => entry.theme.type)).toEqual(["light", "dark"]);
    expect(baseline.map((entry) => entry.meta.baselineRank)).toEqual([1, 2]);
    expect(baseline.map((entry) => entry.meta.source)).toEqual(["upstream-port", "upstream-port"]);
    expect(baseline.map((entry) => entry.theme.id)).not.toContain("light");
    expect(baseline.map((entry) => entry.theme.id)).not.toContain("dark");
  });

  it("includes an expanded upstream port batch with paired Solarized variants", () => {
    const upstreamPorts = catalogThemes.filter((entry) => entry.meta.source === "upstream-port");

    expect(upstreamPorts.map((entry) => entry.theme.id).sort()).toEqual([
      "catppuccin-mocha",
      "dracula",
      "gruvbox-dark",
      "nord",
      "one-dark",
      "rose-pine-dawn",
      "solarized-dark",
      "solarized-light",
      "superset-dark",
      "superset-light",
      "tokyo-night",
    ]);
    expect(
      upstreamPorts
        .filter((entry) => "pairGroup" in entry.meta && entry.meta.pairGroup === "solarized")
        .map((entry) => entry.theme.type)
        .sort(),
    ).toEqual(["dark", "light"]);
    expect(
      Object.fromEntries(upstreamPorts.map((entry) => [entry.theme.id, entry.meta.license]).sort()),
    ).toMatchObject({
      "catppuccin-mocha": "MIT",
      dracula: "MIT",
      "gruvbox-dark": "MIT/X11",
      nord: "MIT",
      "one-dark": "MIT",
      "rose-pine-dawn": "MIT",
      "solarized-dark": "MIT",
      "solarized-light": "MIT",
      "superset-dark": "Elastic License 2.0",
      "superset-light": "Elastic License 2.0",
      "tokyo-night": "MIT",
    });
    expect(new Set(upstreamPorts.map((entry) => entry.meta.portStatus))).toEqual(
      new Set(["ported", "adapted"]),
    );
  });

  it("fails catalog validation for duplicate theme IDs", () => {
    const firstTheme = requireValue(themeFixtures[0]);
    const secondTheme = requireValue(themeFixtures[1]);
    const firstEntry = requireValue(catalogThemes[0]);
    const secondEntry = requireValue(catalogThemes[1]);

    const result = validateCatalogThemes([
      {
        theme: firstTheme,
        meta: firstEntry.meta,
      },
      {
        theme: { ...secondTheme, id: firstTheme.id },
        meta: { ...secondEntry.meta, themeId: firstTheme.id, pairGroup: undefined },
      },
    ]);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(`Duplicate theme id: ${firstTheme.id}`);
  });
});
