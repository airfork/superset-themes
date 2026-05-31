import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { getFocusRingColor } from "../theme-core/chromeTokens";
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
      "--preview-ui-selection": theme.ui.selection,
      "--preview-ui-selection-foreground": theme.ui.selectionForeground,
    });
  });

  it("maps terminal tokens to stable preview CSS variables", () => {
    const theme = requireValue(catalogThemes[1]).theme;

    expect(getThemeCssVars(theme)).toMatchObject({
      "--preview-terminal-background": theme.terminal.background,
      "--preview-terminal-foreground": theme.terminal.foreground,
      "--preview-terminal-cursor": theme.terminal.cursor,
      "--preview-terminal-selection": theme.terminal.selection,
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
