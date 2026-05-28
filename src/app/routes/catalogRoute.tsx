import type { PreviewTabId } from "../../preview/PreviewTabs";

export interface CatalogRouteSearch {
  theme?: string;
  // Compare entry params are preserved for now so `Pin to compare` continues to
  // route into /compare. Phase 6 replaces this with the compare-mode state
  // machine and will drop these fields.
  dark?: string;
  light?: string;
  tab?: PreviewTabId;
}

function stringParam(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

const PREVIEW_TAB_VALUES = new Set<PreviewTabId>([
  "workspace",
  "editor",
  "terminal",
  "diff",
  "command",
  "settings",
]);

export function parseCatalogRouteSearch(search: Record<string, unknown>): CatalogRouteSearch {
  return {
    theme: stringParam(search.theme),
    dark: stringParam(search.dark),
    light: stringParam(search.light),
    tab:
      typeof search.tab === "string" && PREVIEW_TAB_VALUES.has(search.tab as PreviewTabId)
        ? (search.tab as PreviewTabId)
        : undefined,
  };
}
