import { getCatalogThemeById } from "../../data/fixtures";
import { createDraftFromCatalogEntry } from "../../lab/draftTheme";
import { LabView } from "../../lab/LabView";

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
  onStartFromCatalog: (themeId: string) => void;
  search: LabRouteSearch;
}) {
  const entry = getCatalogThemeById(search.from ?? "") ?? getCatalogThemeById("aurora-light");

  if (!entry) {
    return (
      <main id="main-content" className="legacy-route-main">
        <section aria-label="Theme lab unavailable" className="theme-detail theme-detail--missing">
          <h2>Theme lab unavailable</h2>
          <p>No catalog themes are available to seed the lab.</p>
        </section>
      </main>
    );
  }

  return (
    <LabView
      initialDraft={createDraftFromCatalogEntry(entry)}
      key={entry.theme.id}
      onStartFromCatalog={onStartFromCatalog}
    />
  );
}
