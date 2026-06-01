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

  it("maps internal selection tokens to Superset's official UI and terminal download keys", () => {
    const entry = requireValue(
      catalogThemes.find((candidate) => candidate.theme.id === "tokyo-night"),
    );

    const exportedTheme = JSON.parse(exportThemeJson(entry));

    expect(exportedTheme.ui).not.toHaveProperty("selection");
    expect(exportedTheme.ui).not.toHaveProperty("selectionForeground");
    expect(exportedTheme.ui).toMatchObject({
      chart1: entry.theme.ui.primary,
      highlight: entry.theme.ui.selection,
      highlightActive: entry.theme.ui.selection,
      highlightForeground: entry.theme.ui.selectionForeground,
      highlightMatch: entry.theme.ui.selection,
      sidebar: entry.theme.ui.card,
      sidebarAccent: entry.theme.ui.secondary,
      sidebarAccentForeground: entry.theme.ui.secondaryForeground,
      sidebarBorder: entry.theme.ui.border,
      sidebarForeground: entry.theme.ui.foreground,
      sidebarPrimary: entry.theme.ui.primary,
      sidebarPrimaryForeground: entry.theme.ui.primaryForeground,
      sidebarRing: entry.theme.ui.ring,
      tertiary: entry.theme.ui.muted,
      tertiaryActive: entry.theme.ui.secondary,
    });

    expect(exportedTheme.terminal).not.toHaveProperty("selection");
    expect(exportedTheme.terminal).not.toHaveProperty("selectionForeground");
    expect(exportedTheme.terminal).toMatchObject({
      cursorAccent: entry.theme.terminal.background,
      selectionBackground: entry.theme.terminal.selection,
    });
  });
});
