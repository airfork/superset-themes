import type { CatalogThemeEntry } from "../theme-core/themeTypes";

function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function searchableTextForEntry({ meta, theme }: CatalogThemeEntry): string {
  return [
    theme.id,
    theme.name,
    theme.author,
    theme.description,
    theme.type,
    meta.source,
    meta.family,
    meta.variant,
    meta.warmth,
    meta.contrastTier,
    meta.terminalPaletteQuality,
    meta.license,
    meta.portStatus,
    meta.notes,
    meta.upstreamUrl ?? "",
    ...meta.styleTags,
  ]
    .join(" ")
    .toLocaleLowerCase();
}

export function searchCatalogThemes(
  entries: readonly CatalogThemeEntry[],
  query: string,
): CatalogThemeEntry[] {
  const tokens = normalizeSearchText(query).split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return [...entries];
  }

  return entries.filter((entry) => {
    const haystack = searchableTextForEntry(entry);

    return tokens.every((token) => haystack.includes(token));
  });
}
