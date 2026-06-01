import { supersetThemeSchema } from "./schema";
import type { CatalogThemeEntry, SupersetTheme } from "./themeTypes";

type SupersetDownloadTheme = {
  author: string;
  description: string;
  id: string;
  name: string;
  terminal: Record<string, string>;
  type: "dark" | "light";
  ui: Record<string, string>;
};

function themeFrom(themeOrEntry: SupersetTheme | CatalogThemeEntry): SupersetTheme {
  return "theme" in themeOrEntry ? themeOrEntry.theme : themeOrEntry;
}

export function toSupersetDownloadTheme(
  themeOrEntry: SupersetTheme | CatalogThemeEntry,
): SupersetDownloadTheme {
  const theme = supersetThemeSchema.parse(themeFrom(themeOrEntry));
  const { terminal, ui } = theme;

  return {
    author: theme.author,
    description: theme.description,
    id: theme.id,
    name: theme.name,
    terminal: {
      background: terminal.background,
      foreground: terminal.foreground,
      cursor: terminal.cursor,
      cursorAccent: terminal.background,
      selectionBackground: terminal.selection,
      black: terminal.black,
      red: terminal.red,
      green: terminal.green,
      yellow: terminal.yellow,
      blue: terminal.blue,
      magenta: terminal.magenta,
      cyan: terminal.cyan,
      white: terminal.white,
      brightBlack: terminal.brightBlack,
      brightRed: terminal.brightRed,
      brightGreen: terminal.brightGreen,
      brightYellow: terminal.brightYellow,
      brightBlue: terminal.brightBlue,
      brightMagenta: terminal.brightMagenta,
      brightCyan: terminal.brightCyan,
      brightWhite: terminal.brightWhite,
    },
    type: theme.type,
    ui: {
      background: ui.background,
      foreground: ui.foreground,
      card: ui.card,
      cardForeground: ui.cardForeground,
      popover: ui.popover,
      popoverForeground: ui.popoverForeground,
      primary: ui.primary,
      primaryForeground: ui.primaryForeground,
      secondary: ui.secondary,
      secondaryForeground: ui.secondaryForeground,
      muted: ui.muted,
      mutedForeground: ui.mutedForeground,
      accent: ui.accent,
      accentForeground: ui.accentForeground,
      tertiary: ui.muted,
      tertiaryActive: ui.secondary,
      destructive: ui.destructive,
      destructiveForeground: ui.destructiveForeground,
      border: ui.border,
      input: ui.input,
      ring: ui.ring,
      sidebar: ui.card,
      sidebarForeground: ui.foreground,
      sidebarPrimary: ui.primary,
      sidebarPrimaryForeground: ui.primaryForeground,
      sidebarAccent: ui.secondary,
      sidebarAccentForeground: ui.secondaryForeground,
      sidebarBorder: ui.border,
      sidebarRing: ui.ring,
      chart1: ui.primary,
      chart2: terminal.green,
      chart3: terminal.blue,
      chart4: terminal.yellow,
      chart5: terminal.red,
      highlightMatch: ui.selection,
      highlightActive: ui.selection,
      highlight: ui.selection,
      highlightForeground: ui.selectionForeground,
    },
  };
}

export function getThemeDownloadFileName(themeOrEntry: SupersetTheme | CatalogThemeEntry): string {
  return `${themeFrom(themeOrEntry).id}.json`;
}

export function exportThemeJson(themeOrEntry: SupersetTheme | CatalogThemeEntry): string {
  return `${JSON.stringify(toSupersetDownloadTheme(themeOrEntry), null, 2)}\n`;
}

export function downloadThemeJson(themeOrEntry: SupersetTheme | CatalogThemeEntry): void {
  const url = URL.createObjectURL(
    new Blob([exportThemeJson(themeOrEntry)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = getThemeDownloadFileName(themeOrEntry);
  anchor.click();
  URL.revokeObjectURL(url);
}
