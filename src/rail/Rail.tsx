import { useEffect, useMemo, useRef } from "react";
import { catalogThemes } from "../data/catalog";
import { getFeaturedThemes } from "../data/featured";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { RailRow } from "./RailRow";
import { RailSearch } from "./RailSearch";
import { RailSection } from "./RailSection";
import { useRailKeyboard } from "./useRailKeyboard";

interface RailProps {
  focusedThemeId: string;
  pinnedThemeIds: ReadonlySet<string>;
  onSelect: (themeId: string) => void;
  onOpenPalette: () => void;
}

type RowSection = "featured" | "light" | "dark";

interface RowDescriptor {
  rowKey: string;
  themeId: string;
  section: RowSection;
  entry: CatalogThemeEntry;
}

function byName(a: CatalogThemeEntry, b: CatalogThemeEntry): number {
  return a.theme.name.localeCompare(b.theme.name);
}

function rowKeyFor(section: RowSection, themeId: string): string {
  return `rail-row-${section}-${themeId}`;
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

  const orderedRows: RowDescriptor[] = useMemo(
    () => [
      ...featured.map((entry) => ({
        rowKey: rowKeyFor("featured", entry.theme.id),
        themeId: entry.theme.id,
        section: "featured" as const,
        entry,
      })),
      ...lights.map((entry) => ({
        rowKey: rowKeyFor("light", entry.theme.id),
        themeId: entry.theme.id,
        section: "light" as const,
        entry,
      })),
      ...darks.map((entry) => ({
        rowKey: rowKeyFor("dark", entry.theme.id),
        themeId: entry.theme.id,
        section: "dark" as const,
        entry,
      })),
    ],
    [featured, lights, darks],
  );

  const rowKeys = useMemo(() => orderedRows.map((row) => row.rowKey), [orderedRows]);

  // First occurrence of the focused theme wins (Featured before its light/dark home).
  const activeRowKey = useMemo(() => {
    const match = orderedRows.find((row) => row.themeId === focusedThemeId);
    return match?.rowKey ?? orderedRows[0]?.rowKey ?? "";
  }, [orderedRows, focusedThemeId]);

  const { focusedIndex, onKeyDown, setFocusedIndex } = useRailKeyboard({
    ids: rowKeys,
    activeId: activeRowKey,
    onActivate: (rowKey) => {
      const target = orderedRows.find((row) => row.rowKey === rowKey);
      if (target) {
        onSelect(target.themeId);
      }
    },
    onOpenPalette,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const lastFocusedIndex = useRef(focusedIndex);

  // When keyboard navigation moves the index, push DOM focus to the new row.
  useEffect(() => {
    if (lastFocusedIndex.current === focusedIndex) {
      return;
    }
    lastFocusedIndex.current = focusedIndex;
    const targetKey = rowKeys[focusedIndex];
    if (!targetKey || !containerRef.current) {
      return;
    }
    // Only move focus if focus is already inside the rail — avoids stealing focus on mount.
    if (!containerRef.current.contains(document.activeElement)) {
      return;
    }
    const target = containerRef.current.querySelector<HTMLButtonElement>(
      `#${CSS.escape(targetKey)}`,
    );
    target?.focus();
  }, [focusedIndex, rowKeys]);

  const renderRow = (row: RowDescriptor) => (
    <RailRow
      key={row.rowKey}
      id={row.rowKey}
      entry={row.entry}
      selected={row.themeId === focusedThemeId}
      pinned={pinnedThemeIds.has(row.themeId)}
      variant={row.section === "featured" ? "featured" : "basic"}
      onSelect={() => {
        const nextIndex = orderedRows.findIndex((candidate) => candidate.rowKey === row.rowKey);
        if (nextIndex >= 0) {
          setFocusedIndex(nextIndex);
        }
        onSelect(row.themeId);
      }}
      onKeyDown={onKeyDown}
      tabIndex={row.rowKey === rowKeys[focusedIndex] ? 0 : -1}
    />
  );

  return (
    <div className="rail" ref={containerRef}>
      <div className="rail__search">
        <RailSearch onOpenPalette={onOpenPalette} />
      </div>
      <RailSection label="Featured">
        {orderedRows.slice(0, featured.length).map(renderRow)}
      </RailSection>
      <RailSection label="Light">
        {orderedRows.slice(featured.length, featured.length + lights.length).map(renderRow)}
      </RailSection>
      <RailSection label="Dark">
        {orderedRows.slice(featured.length + lights.length).map(renderRow)}
      </RailSection>
    </div>
  );
}
