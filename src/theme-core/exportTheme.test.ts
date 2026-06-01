import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { exportThemeJson } from "./exportTheme";

function requireValue<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  return value as T;
}

describe("exportThemeJson", () => {
  it("exports a Superset marketplace-style import file without catalog metadata", () => {
    const entry = requireValue(catalogThemes[0]);

    const exportedTheme = JSON.parse(exportThemeJson(entry));

    expect(exportedTheme).toMatchObject({
      author: entry.theme.author,
      description: entry.theme.description,
      id: entry.theme.id,
      name: entry.theme.name,
      type: entry.theme.type,
    });
    expect(exportedTheme).not.toHaveProperty("version");
    expect(exportedTheme).not.toHaveProperty("meta");
    expect(exportedTheme).not.toHaveProperty("source");
    expect(exportedTheme).not.toHaveProperty("family");
    expect(exportedTheme).not.toHaveProperty("styleTags");
  });

  it("preserves Superset's official UI and terminal download keys", () => {
    const entry = requireValue(
      catalogThemes.find((candidate) => candidate.theme.id === "tokyo-night"),
    );
    const theme = {
      ...entry.theme,
      terminal: {
        ...entry.theme.terminal,
        cursorAccent: "#101010",
        selectionBackground: "#202020",
      },
      ui: {
        ...entry.theme.ui,
        chart1: "#111111",
        chart2: "#222222",
        chart3: "#333333",
        chart4: "#444444",
        chart5: "#555555",
        highlight: "#666666",
        highlightActive: "#777777",
        highlightForeground: "#888888",
        highlightMatch: "#999999",
        sidebar: "#aaaaaa",
        sidebarAccent: "#bbbbbb",
        sidebarAccentForeground: "#cccccc",
        sidebarBorder: "#dddddd",
        sidebarForeground: "#eeeeee",
        sidebarPrimary: "#121212",
        sidebarPrimaryForeground: "#232323",
        sidebarRing: "#343434",
        tertiary: "#454545",
        tertiaryActive: "#565656",
      },
    };

    const exportedTheme = JSON.parse(exportThemeJson(theme));

    expect(exportedTheme.ui).not.toHaveProperty("selection");
    expect(exportedTheme.ui).not.toHaveProperty("selectionForeground");
    expect(exportedTheme.ui).toMatchObject({
      chart1: "#111111",
      chart2: "#222222",
      chart3: "#333333",
      chart4: "#444444",
      chart5: "#555555",
      highlight: "#666666",
      highlightActive: "#777777",
      highlightForeground: "#888888",
      highlightMatch: "#999999",
      sidebar: "#aaaaaa",
      sidebarAccent: "#bbbbbb",
      sidebarAccentForeground: "#cccccc",
      sidebarBorder: "#dddddd",
      sidebarForeground: "#eeeeee",
      sidebarPrimary: "#121212",
      sidebarPrimaryForeground: "#232323",
      sidebarRing: "#343434",
      tertiary: "#454545",
      tertiaryActive: "#565656",
    });

    expect(exportedTheme.terminal).not.toHaveProperty("selection");
    expect(exportedTheme.terminal).not.toHaveProperty("selectionForeground");
    expect(exportedTheme.terminal).toMatchObject({
      cursorAccent: "#101010",
      selectionBackground: "#202020",
    });
  });
});
