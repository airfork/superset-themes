import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { getFocusRingColor } from "../theme-core/chromeTokens";
import { getPaletteActiveSurface, getWorkspaceControlSurface } from "../theme-core/paletteTokens";
import { getThemeCssVars } from "./themeCssVars";

function requireValue<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  return value as T;
}

describe("getThemeCssVars", () => {
  it("maps UI tokens to stable preview CSS variables", () => {
    const theme = requireValue(catalogThemes[0]).theme;

    expect(getThemeCssVars(theme)).toMatchObject({
      "--preview-ui-accent": theme.ui.accent,
      "--preview-ui-accent-foreground": theme.ui.accentForeground,
      "--preview-ui-background": theme.ui.background,
      "--preview-ui-border": theme.ui.border,
      "--preview-ui-card": theme.ui.card,
      "--preview-ui-card-foreground": theme.ui.cardForeground,
      "--preview-ui-destructive": theme.ui.destructive,
      "--preview-ui-destructive-foreground": theme.ui.destructiveForeground,
      "--preview-ui-foreground": theme.ui.foreground,
      "--preview-focus-ring": getFocusRingColor(theme),
      "--preview-ui-primary": theme.ui.primary,
      "--preview-ui-primary-foreground": theme.ui.primaryForeground,
      "--preview-ui-selection": theme.ui.highlightActive,
      "--preview-ui-selection-foreground": theme.ui.highlightForeground,
      "--preview-ui-sidebar": theme.ui.sidebar,
      "--preview-ui-sidebar-accent": theme.ui.sidebarAccent,
      "--preview-ui-sidebar-accent-foreground": theme.ui.sidebarAccentForeground,
      "--preview-ui-sidebar-border": theme.ui.sidebarBorder,
      "--preview-ui-sidebar-foreground": theme.ui.sidebarForeground,
      "--preview-ui-sidebar-primary": theme.ui.sidebarPrimary,
      "--preview-ui-sidebar-primary-foreground": theme.ui.sidebarPrimaryForeground,
      "--preview-ui-sidebar-ring": theme.ui.sidebarRing,
      "--preview-ui-tertiary": theme.ui.tertiary,
      "--preview-ui-tertiary-active": theme.ui.tertiaryActive,
      "--preview-ui-highlight-active": theme.ui.highlightActive,
      "--preview-ui-highlight-foreground": theme.ui.highlightForeground,
      "--preview-ui-highlight-match": theme.ui.highlightMatch,
      "--preview-ui-chart-1": theme.ui.chart1,
    });
  });

  it("derives the command palette active/hover bands so focus stays visible", () => {
    const theme = requireValue(
      catalogThemes.find((entry) => entry.theme.id === "gruvbox-light"),
    ).theme;
    const surface = getPaletteActiveSurface(theme);

    const control = getWorkspaceControlSurface(theme);

    expect(getThemeCssVars(theme)).toMatchObject({
      "--preview-popover-active": surface.active,
      "--preview-popover-active-foreground": surface.activeForeground,
      "--preview-popover-hover": surface.hover,
      "--preview-background-active": control.active,
      "--preview-background-active-foreground": control.activeForeground,
    });
    // Gruvbox Light ships accent === popover; the derived band must not equal the surface.
    expect(surface.active).not.toBe(theme.ui.popover);
    expect(control.active).not.toBe(theme.ui.background);
  });

  it("maps terminal tokens to stable preview CSS variables", () => {
    const theme = requireValue(catalogThemes[1]).theme;

    expect(getThemeCssVars(theme)).toMatchObject({
      "--preview-terminal-background": theme.terminal.background,
      "--preview-terminal-foreground": theme.terminal.foreground,
      "--preview-terminal-cursor": theme.terminal.cursor,
      "--preview-terminal-cursor-accent": theme.terminal.cursorAccent,
      "--preview-terminal-selection": theme.terminal.selectionBackground,
      "--preview-terminal-selection-background": theme.terminal.selectionBackground,
      "--preview-terminal-selection-foreground": theme.terminal.selectionForeground,
      "--preview-terminal-black": theme.terminal.black,
      "--preview-terminal-bright-white": theme.terminal.brightWhite,
      "--preview-terminal-red": theme.terminal.red,
      "--preview-terminal-bright-red": theme.terminal.brightRed,
      "--preview-terminal-blue": theme.terminal.blue,
      "--preview-terminal-bright-blue": theme.terminal.brightBlue,
    });
  });
});
