import { catalogThemes } from "../data/catalog";
import { exportThemeJson } from "../theme-core/exportTheme";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import type { RankableItem } from "./fuzzy";

export type PaletteSection = "Themes" | "Actions";

export interface PaletteCommand extends RankableItem {
  label: string;
  section: PaletteSection;
  hint?: string;
  run: () => void;
}

export function buildThemeCommands(onSelectTheme: (themeId: string) => void): PaletteCommand[] {
  return catalogThemes.map(({ theme, meta }) => ({
    id: theme.id,
    label: theme.name,
    section: "Themes",
    hint: meta.family,
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
