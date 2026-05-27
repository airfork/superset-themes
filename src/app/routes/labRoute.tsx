import { catalogThemes } from "../../data/catalog";
import { getCatalogThemeById } from "../../data/fixtures";
import { createDraftFromCatalogEntry } from "../../lab/draftTheme";
import { LabPage } from "../../lab/LabPage";

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

export function LabRouteView({
  onStartFromCatalog,
  search,
}: {
  onStartFromCatalog?: (themeId: string) => void;
  search: LabRouteSearch;
}) {
  const entry = getCatalogThemeById(search.from ?? "") ?? getCatalogThemeById("aurora-light");

  if (!entry) {
    return (
      <section aria-label="Theme lab unavailable" className="theme-detail theme-detail--missing">
        <h2>Theme lab unavailable</h2>
        <p>No catalog themes are available to seed the lab.</p>
      </section>
    );
  }

  return (
    <LabPage
      catalogEntries={catalogThemes}
      initialDraft={createDraftFromCatalogEntry(entry)}
      key={entry.theme.id}
      onStartFromCatalog={onStartFromCatalog}
      selectedCatalogThemeId={entry.theme.id}
    />
  );
}
