import {
  CatalogPage,
  type CatalogPageState,
  DEFAULT_CATALOG_PAGE_STATE,
} from "../../catalog/CatalogPage";
import type {
  AccentHueRange,
  CatalogPairFilter,
  CatalogSortKey,
  CatalogThemeTypeFilter,
} from "../../catalog/catalogFilters";
import { catalogThemes } from "../../data/catalog";
import { PREVIEW_TABS, type PreviewTabId } from "../../preview/PreviewTabs";
import type { CatalogThemeEntry, CatalogThemeMeta } from "../../theme-core/themeTypes";

export interface CatalogRouteSearch {
  contrast?: CatalogThemeMeta["contrastTier"];
  dark?: string;
  family?: string;
  hue?: "cool" | "warm";
  light?: string;
  paired?: CatalogPairFilter;
  q?: string;
  sort?: CatalogSortKey;
  source?: CatalogThemeMeta["source"];
  tags?: string;
  tab?: PreviewTabId;
  terminal?: CatalogThemeMeta["terminalPaletteQuality"];
  type?: CatalogThemeTypeFilter;
  warmth?: CatalogThemeMeta["warmth"];
}

const TYPE_VALUES = new Set<CatalogThemeTypeFilter>(["all", "dark", "light"]);
const PAIR_VALUES = new Set<CatalogPairFilter>(["all", "paired", "unpaired"]);
const SORT_VALUES = new Set<CatalogSortKey>(["accentHue", "contrast", "family", "name"]);
const SOURCE_VALUES = new Set<CatalogThemeMeta["source"]>([
  "fixture",
  "generated",
  "upstream-port",
]);
const WARMTH_VALUES = new Set<CatalogThemeMeta["warmth"]>(["cool", "neutral", "warm"]);
const CONTRAST_VALUES = new Set<CatalogThemeMeta["contrastTier"]>(["high", "standard"]);
const TERMINAL_VALUES = new Set<CatalogThemeMeta["terminalPaletteQuality"]>([
  "balanced",
  "basic",
  "rich",
]);
const PREVIEW_TAB_VALUES = new Set<PreviewTabId>(PREVIEW_TABS.map((tab) => tab.value));

function isKnownValue<TValue extends string>(
  value: unknown,
  values: ReadonlySet<TValue>,
): value is TValue {
  return typeof value === "string" && values.has(value as TValue);
}

function stringParam(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function hueRangeFromRouteValue(hue: CatalogRouteSearch["hue"]): AccentHueRange | null {
  if (hue === "cool") {
    return { end: 210, start: 140 };
  }

  if (hue === "warm") {
    return { end: 20, start: 340 };
  }

  return null;
}

function routeValueFromHueRange(range: AccentHueRange | null): CatalogRouteSearch["hue"] {
  if (!range) {
    return undefined;
  }

  if (range.start === 140 && range.end === 210) {
    return "cool";
  }

  if (range.start === 340 && range.end === 20) {
    return "warm";
  }

  return undefined;
}

export function parseCatalogRouteSearch(search: Record<string, unknown>): CatalogRouteSearch {
  return {
    contrast: isKnownValue(search.contrast, CONTRAST_VALUES) ? search.contrast : undefined,
    dark: stringParam(search.dark),
    family: stringParam(search.family),
    hue: search.hue === "cool" || search.hue === "warm" ? search.hue : undefined,
    light: stringParam(search.light),
    paired: isKnownValue(search.paired, PAIR_VALUES) ? search.paired : undefined,
    q: stringParam(search.q),
    sort: isKnownValue(search.sort, SORT_VALUES) ? search.sort : undefined,
    source: isKnownValue(search.source, SOURCE_VALUES) ? search.source : undefined,
    tags: stringParam(search.tags),
    tab:
      typeof search.tab === "string" && PREVIEW_TAB_VALUES.has(search.tab as PreviewTabId)
        ? (search.tab as PreviewTabId)
        : undefined,
    terminal: isKnownValue(search.terminal, TERMINAL_VALUES) ? search.terminal : undefined,
    type: isKnownValue(search.type, TYPE_VALUES) ? search.type : undefined,
    warmth: isKnownValue(search.warmth, WARMTH_VALUES) ? search.warmth : undefined,
  };
}

export function catalogRouteSearchToState(search: CatalogRouteSearch): CatalogPageState {
  return {
    filters: {
      ...DEFAULT_CATALOG_PAGE_STATE.filters,
      accentHueRange: hueRangeFromRouteValue(search.hue),
      contrastTier: search.contrast ?? DEFAULT_CATALOG_PAGE_STATE.filters.contrastTier,
      family: search.family ?? DEFAULT_CATALOG_PAGE_STATE.filters.family,
      paired: search.paired ?? DEFAULT_CATALOG_PAGE_STATE.filters.paired,
      source: search.source ?? DEFAULT_CATALOG_PAGE_STATE.filters.source,
      styleTags: new Set(search.tags?.split(",").filter(Boolean) ?? []),
      terminalPaletteQuality:
        search.terminal ?? DEFAULT_CATALOG_PAGE_STATE.filters.terminalPaletteQuality,
      type: search.type ?? DEFAULT_CATALOG_PAGE_STATE.filters.type,
      warmth: search.warmth ?? DEFAULT_CATALOG_PAGE_STATE.filters.warmth,
    },
    query: search.q ?? DEFAULT_CATALOG_PAGE_STATE.query,
    sort: search.sort ?? DEFAULT_CATALOG_PAGE_STATE.sort,
  };
}

export function stateToCatalogRouteSearch(state: CatalogPageState): CatalogRouteSearch {
  const search: CatalogRouteSearch = {};

  if (state.query) {
    search.q = state.query;
  }

  if (state.sort !== DEFAULT_CATALOG_PAGE_STATE.sort) {
    search.sort = state.sort;
  }

  if (state.filters.type !== DEFAULT_CATALOG_PAGE_STATE.filters.type) {
    search.type = state.filters.type;
  }

  if (state.filters.source !== "all") {
    search.source = state.filters.source;
  }

  if (state.filters.family !== DEFAULT_CATALOG_PAGE_STATE.filters.family) {
    search.family = state.filters.family;
  }

  if (state.filters.paired !== DEFAULT_CATALOG_PAGE_STATE.filters.paired) {
    search.paired = state.filters.paired;
  }

  if (state.filters.styleTags.size > 0) {
    search.tags = [...state.filters.styleTags].sort().join(",");
  }

  if (state.filters.warmth !== "all") {
    search.warmth = state.filters.warmth;
  }

  if (state.filters.contrastTier !== "all") {
    search.contrast = state.filters.contrastTier;
  }

  if (state.filters.terminalPaletteQuality !== "all") {
    search.terminal = state.filters.terminalPaletteQuality;
  }

  const hue = routeValueFromHueRange(state.filters.accentHueRange);

  if (hue) {
    search.hue = hue;
  }

  return search;
}

function compareHrefForEntry(entry: CatalogThemeEntry, search: CatalogRouteSearch): string {
  const params = new URLSearchParams();

  params.set("tab", search.tab ?? "workspace");

  if (entry.theme.type === "light") {
    params.set("light", entry.theme.id);
  } else if (search.light) {
    params.set("light", search.light);
  }

  if (entry.theme.type === "dark") {
    params.set("dark", entry.theme.id);
  } else if (search.dark) {
    params.set("dark", search.dark);
  }

  return `/compare?${params.toString()}`;
}

function mergePairSearch(
  nextSearch: CatalogRouteSearch,
  currentSearch: CatalogRouteSearch,
): CatalogRouteSearch {
  return {
    ...nextSearch,
    dark: currentSearch.dark,
    light: currentSearch.light,
    tab: currentSearch.tab,
  };
}

export interface CatalogRouteViewProps {
  onStateChange: (search: CatalogRouteSearch) => void;
  search: CatalogRouteSearch;
}

export function CatalogRouteView({ onStateChange, search }: CatalogRouteViewProps) {
  return (
    <CatalogPage
      detailHrefForTheme={(themeId) => `/themes/${themeId}`}
      entries={catalogThemes}
      onStateChange={(nextState) =>
        onStateChange(mergePairSearch(stateToCatalogRouteSearch(nextState), search))
      }
      pinHrefForTheme={(entry) => compareHrefForEntry(entry, search)}
      state={catalogRouteSearchToState(search)}
    />
  );
}
