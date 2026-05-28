import { useMemo } from "react";
import { catalogThemes } from "../data/catalog";
import { getFeaturedThemes } from "../data/featured";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { RailRow } from "./RailRow";
import { RailSearch } from "./RailSearch";
import { RailSection } from "./RailSection";

interface RailProps {
  focusedThemeId: string;
  pinnedThemeIds: ReadonlySet<string>;
  onSelect: (themeId: string) => void;
  onOpenPalette: () => void;
}

function byName(a: CatalogThemeEntry, b: CatalogThemeEntry): number {
  return a.theme.name.localeCompare(b.theme.name);
}

export function Rail({ focusedThemeId, pinnedThemeIds, onSelect, onOpenPalette }: RailProps) {
  const featured = useMemo(() => getFeaturedThemes(), []);
  const lights = useMemo(
    () =>
      catalogThemes
        .filter((entry) => entry.theme.type === "light")
        .slice()
        .sort(byName),
    [],
  );
  const darks = useMemo(
    () =>
      catalogThemes
        .filter((entry) => entry.theme.type === "dark")
        .slice()
        .sort(byName),
    [],
  );

  return (
    <div className="rail">
      <div className="rail__search">
        <RailSearch onOpenPalette={onOpenPalette} />
      </div>
      <RailSection label="Featured">
        {featured.map((entry) => (
          <RailRow
            key={`featured-${entry.theme.id}`}
            entry={entry}
            selected={entry.theme.id === focusedThemeId}
            pinned={pinnedThemeIds.has(entry.theme.id)}
            variant="featured"
            onSelect={() => onSelect(entry.theme.id)}
          />
        ))}
      </RailSection>
      <RailSection label="Light">
        {lights.map((entry) => (
          <RailRow
            key={`light-${entry.theme.id}`}
            entry={entry}
            selected={entry.theme.id === focusedThemeId}
            pinned={pinnedThemeIds.has(entry.theme.id)}
            variant="basic"
            onSelect={() => onSelect(entry.theme.id)}
          />
        ))}
      </RailSection>
      <RailSection label="Dark">
        {darks.map((entry) => (
          <RailRow
            key={`dark-${entry.theme.id}`}
            entry={entry}
            selected={entry.theme.id === focusedThemeId}
            pinned={pinnedThemeIds.has(entry.theme.id)}
            variant="basic"
            onSelect={() => onSelect(entry.theme.id)}
          />
        ))}
      </RailSection>
    </div>
  );
}
