import { supersetThemeSchema } from "./schema";
import type { CatalogThemeEntry, SupersetTheme } from "./themeTypes";

export function exportThemeJson(themeOrEntry: SupersetTheme | CatalogThemeEntry): string {
  const theme = "theme" in themeOrEntry ? themeOrEntry.theme : themeOrEntry;
  const parsedTheme = supersetThemeSchema.parse(theme);

  return `${JSON.stringify(parsedTheme, null, 2)}\n`;
}
