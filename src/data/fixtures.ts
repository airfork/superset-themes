import type { CatalogThemeEntry, SupersetTheme } from "../theme-core/themeTypes";
import { catalogThemes } from "./catalog";

export const themeFixtures = catalogThemes.map((entry) => entry.theme) satisfies SupersetTheme[];

export function getThemeById(themeId: string): SupersetTheme | undefined {
  return themeFixtures.find((theme) => theme.id === themeId);
}

export function getCatalogThemeById(themeId: string): CatalogThemeEntry | undefined {
  return catalogThemes.find((entry) => entry.theme.id === themeId);
}
