import type { CatalogThemeEntry, CatalogThemeMeta } from "../theme-core/themeTypes";

export type CatalogThemeTypeFilter = "all" | "dark" | "light";
export type CatalogPairFilter = "all" | "paired" | "unpaired";
export type CatalogSortKey = "accentHue" | "contrast" | "family" | "name";

export interface AccentHueRange {
  end: number;
  start: number;
}

export interface CatalogFilters {
  accentHueRange: AccentHueRange | null;
  contrastTier: CatalogThemeMeta["contrastTier"] | "all";
  family: string | "all";
  paired: CatalogPairFilter;
  source: CatalogThemeMeta["source"] | "all";
  styleTags: ReadonlySet<string>;
  terminalPaletteQuality: CatalogThemeMeta["terminalPaletteQuality"] | "all";
  type: CatalogThemeTypeFilter;
  warmth: CatalogThemeMeta["warmth"] | "all";
}

export interface CatalogFilterOptions {
  contrastTiers: CatalogThemeMeta["contrastTier"][];
  families: string[];
  sources: CatalogThemeMeta["source"][];
  styleTags: string[];
  terminalPaletteQualities: CatalogThemeMeta["terminalPaletteQuality"][];
  warmths: CatalogThemeMeta["warmth"][];
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  accentHueRange: null,
  contrastTier: "all",
  family: "all",
  paired: "all",
  source: "all",
  styleTags: new Set<string>(),
  terminalPaletteQuality: "all",
  type: "all",
  warmth: "all",
};

function sortedValues<T extends string>(values: Iterable<T>): T[] {
  return [...new Set(values)].sort((first, second) => first.localeCompare(second));
}

function hueInRange(hue: number, range: AccentHueRange): boolean {
  const start = ((range.start % 360) + 360) % 360;
  const end = ((range.end % 360) + 360) % 360;

  if (start <= end) {
    return hue >= start && hue <= end;
  }

  return hue >= start || hue <= end;
}

function matchesPairFilter(entry: CatalogThemeEntry, paired: CatalogPairFilter): boolean {
  if (paired === "all") {
    return true;
  }

  const hasPairGroup = Boolean(entry.meta.pairGroup);

  return paired === "paired" ? hasPairGroup : !hasPairGroup;
}

function matchesSelectedTags(entry: CatalogThemeEntry, selectedTags: ReadonlySet<string>): boolean {
  if (selectedTags.size === 0) {
    return true;
  }

  const entryTags = new Set(entry.meta.styleTags);

  return [...selectedTags].every((tag) => entryTags.has(tag));
}

export function filterCatalogThemes(
  entries: readonly CatalogThemeEntry[],
  filters: CatalogFilters,
): CatalogThemeEntry[] {
  return entries.filter((entry) => {
    const { meta, theme } = entry;

    return (
      (filters.type === "all" || theme.type === filters.type) &&
      (filters.source === "all" || meta.source === filters.source) &&
      (filters.family === "all" || meta.family === filters.family) &&
      matchesPairFilter(entry, filters.paired) &&
      matchesSelectedTags(entry, filters.styleTags) &&
      (filters.accentHueRange === null || hueInRange(meta.accentHue, filters.accentHueRange)) &&
      (filters.warmth === "all" || meta.warmth === filters.warmth) &&
      (filters.contrastTier === "all" || meta.contrastTier === filters.contrastTier) &&
      (filters.terminalPaletteQuality === "all" ||
        meta.terminalPaletteQuality === filters.terminalPaletteQuality)
    );
  });
}

export function getCatalogFilterOptions(
  entries: readonly CatalogThemeEntry[],
): CatalogFilterOptions {
  return {
    contrastTiers: sortedValues(entries.map((entry) => entry.meta.contrastTier)),
    families: sortedValues(entries.map((entry) => entry.meta.family)),
    sources: sortedValues(entries.map((entry) => entry.meta.source)),
    styleTags: sortedValues(entries.flatMap((entry) => entry.meta.styleTags)),
    terminalPaletteQualities: sortedValues(
      entries.map((entry) => entry.meta.terminalPaletteQuality),
    ),
    warmths: sortedValues(entries.map((entry) => entry.meta.warmth)),
  };
}

function variantRank(entry: CatalogThemeEntry): number {
  return entry.theme.type === "dark" ? 0 : 1;
}

function contrastRank(entry: CatalogThemeEntry): number {
  return entry.meta.contrastTier === "high" ? 0 : 1;
}

function compareByName(first: CatalogThemeEntry, second: CatalogThemeEntry): number {
  return first.theme.name.localeCompare(second.theme.name);
}

export function sortCatalogThemes(
  entries: readonly CatalogThemeEntry[],
  sortKey: CatalogSortKey,
): CatalogThemeEntry[] {
  return [...entries].sort((first, second) => {
    switch (sortKey) {
      case "accentHue":
        return first.meta.accentHue - second.meta.accentHue;
      case "contrast":
        return (
          contrastRank(first) - contrastRank(second) || variantRank(first) - variantRank(second)
        );
      case "family":
        return (
          first.meta.family.localeCompare(second.meta.family) ||
          variantRank(first) - variantRank(second) ||
          compareByName(first, second)
        );
      case "name":
        return compareByName(first, second);
    }

    return 0;
  });
}
