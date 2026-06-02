import type { LucideIcon } from "lucide-react";
import { Download } from "lucide-react";
import { getBaselineFirstThemes } from "../data/baseline";
import { catalogThemes } from "../data/catalog";
import { downloadThemeJsonLazy } from "../theme-core/downloadThemeLazy";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import type { RankableItem } from "./fuzzy";

export type PaletteSection = "Themes" | "Actions";

export interface PaletteCommand extends RankableItem {
  label: string;
  section: PaletteSection;
  hint?: string;
  // The global keypress that triggers this command, shown as a muted glyph so the
  // palette can teach shortcuts where they are clearer than the action label.
  shortcut?: string;
  // Leading glyph for action rows; theme rows use an accent swatch instead.
  icon?: LucideIcon;
  // Theme rows carry their own accent so the leading swatch shows the theme's
  // color, never the focused theme's.
  accent?: string;
  themeType?: "light" | "dark";
  run: () => Promise<void> | void;
}

export function buildThemeCommands(onSelectTheme: (themeId: string) => void): PaletteCommand[] {
  return getBaselineFirstThemes().map(({ theme, meta }) => ({
    id: theme.id,
    label: theme.name,
    section: "Themes",
    // Drop the hint when the family only echoes the name (e.g. "Tokyo Night" in
    // the Tokyo Night family), matching the rail eyebrow and bottom-bar fact.
    hint: meta.family === theme.name ? undefined : meta.family,
    keys: [theme.id, theme.name, meta.family],
    accent: theme.ui.accent,
    themeType: theme.type,
    run: () => onSelectTheme(theme.id),
  }));
}

// Mirrors the nameplate's Download JSON so the palette stays the canonical
// action surface: searching "download"/"export"/"json" must not dead-end.
export function downloadThemeJsonCommand(entry: CatalogThemeEntry): PaletteCommand {
  return {
    id: "action-download-theme-json",
    label: "Download theme JSON",
    section: "Actions",
    icon: Download,
    keys: ["download theme json", "download", "export", "json"],
    run: () => downloadThemeJsonLazy(entry),
  };
}

// The next theme in catalog order, wrapping at the end. Drives "Toggle next theme".
export function nextThemeId(currentId: string): string {
  const index = catalogThemes.findIndex((entry) => entry.theme.id === currentId);
  const next = catalogThemes[(index + 1) % catalogThemes.length];
  return next?.theme.id ?? currentId;
}
