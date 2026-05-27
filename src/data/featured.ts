import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { catalogThemes } from "./catalog";

export const FEATURED_IDS = [
  "tokyo-night",
  "catppuccin-mocha",
  "solarized-light",
  "rose-pine-dawn",
  "one-dark",
] as const;

export type FeaturedId = (typeof FEATURED_IDS)[number];

export function getFeaturedThemes(): CatalogThemeEntry[] {
  return FEATURED_IDS.map((id) => {
    const entry = catalogThemes.find((candidate) => candidate.theme.id === id);
    if (!entry) {
      throw new Error(`Featured theme missing from catalog: ${id}`);
    }
    return entry;
  });
}

export function getDefaultFocusedTheme(): CatalogThemeEntry {
  const [first] = getFeaturedThemes();
  if (!first) {
    throw new Error("Featured theme list is empty.");
  }
  return first;
}
