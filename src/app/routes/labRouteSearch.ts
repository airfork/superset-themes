export interface LabRouteSearch {
  from?: string;
}

function stringParam(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function parseLabRouteSearch(search: Record<string, unknown>): LabRouteSearch {
  return {
    from: stringParam(search.from),
  };
}
