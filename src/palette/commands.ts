import { catalogThemes } from "../data/catalog";
import { getFeaturedFirstThemes } from "../data/featured";
import { exportThemeJson } from "../theme-core/exportTheme";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import type { RankableItem } from "./fuzzy";

export type PaletteSection = "Themes" | "Actions";

export interface PaletteCommand extends RankableItem {
  label: string;
  section: PaletteSection;
  hint?: string;
  // The global keypress that triggers this command, shown as a key chip so the
  // palette teaches the shortcut where power users look for it (e.g. "." pins).
  shortcut?: string;
  run: () => void;
}

export function buildThemeCommands(onSelectTheme: (themeId: string) => void): PaletteCommand[] {
  return getFeaturedFirstThemes().map(({ theme, meta }) => ({
    id: theme.id,
    label: theme.name,
    section: "Themes",
    // Drop the hint when the family only echoes the name (e.g. "Tokyo Night" in
    // the Tokyo Night family), matching the rail eyebrow and bottom-bar fact.
    hint: meta.family === theme.name ? undefined : meta.family,
    keys: [theme.id, theme.name, meta.family],
    run: () => onSelectTheme(theme.id),
  }));
}

// Mirrors the nameplate's Copy JSON so the palette stays the canonical action
// surface: searching "export"/"copy"/"json" must not dead-end at "No matches".
export function copyThemeJsonCommand(entry: CatalogThemeEntry): PaletteCommand {
  return {
    id: "action-copy-theme-json",
    label: "Copy theme JSON",
    section: "Actions",
    keys: ["copy theme json", "copy", "export", "json"],
    run: () => void navigator.clipboard.writeText(exportThemeJson(entry)),
  };
}

// The next theme in catalog order, wrapping at the end. Drives "Toggle next theme".
export function nextThemeId(currentId: string): string {
  const index = catalogThemes.findIndex((entry) => entry.theme.id === currentId);
  const next = catalogThemes[(index + 1) % catalogThemes.length];
  return next?.theme.id ?? currentId;
}
