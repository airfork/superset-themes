export interface CatalogRouteSearch {
  theme?: string;
}

function stringParam(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function parseCatalogRouteSearch(search: Record<string, unknown>): CatalogRouteSearch {
  return {
    theme: stringParam(search.theme),
  };
}
