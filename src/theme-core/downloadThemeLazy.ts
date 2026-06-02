import type { CatalogThemeEntry, SupersetTheme } from "./themeTypes";

export async function downloadThemeJsonLazy(
  themeOrEntry: SupersetTheme | CatalogThemeEntry,
): Promise<void> {
  const { downloadThemeJson } = await import("./exportTheme");
  downloadThemeJson(themeOrEntry);
}
