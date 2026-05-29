import { catalogThemes } from "../data/catalog";
import { RailSearch } from "../rail/RailSearch";
import { RailSection } from "../rail/RailSection";
import type { ThemeDraft } from "./draftTheme";

interface LabRailProps {
  draft: ThemeDraft;
  onStartFromCatalog: (themeId: string) => void;
  onOpenPalette: () => void;
}

export function LabRail({ draft, onStartFromCatalog, onOpenPalette }: LabRailProps) {
  const selectedCatalogThemeId = draft.source.type === "catalog" ? draft.source.themeId : "";

  return (
    <div className="rail lab-rail">
      <div className="rail__search">
        <RailSearch onOpenPalette={onOpenPalette} />
      </div>

      <RailSection label="Source">
        <label className="catalog-field" htmlFor="lab-start-from">
          <span>Start from catalog theme</span>
          <select
            id="lab-start-from"
            name="lab-start-from"
            onChange={(event) => onStartFromCatalog(event.currentTarget.value)}
            value={selectedCatalogThemeId}
          >
            {selectedCatalogThemeId ? null : (
              <option value="" disabled>
                Imported or generated draft
              </option>
            )}
            {catalogThemes.map((entry) => (
              <option key={entry.theme.id} value={entry.theme.id}>
                {entry.theme.name}
              </option>
            ))}
          </select>
        </label>
      </RailSection>
    </div>
  );
}
