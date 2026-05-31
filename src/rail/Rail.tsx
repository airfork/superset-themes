import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBaselineThemes } from "../data/baseline";
import { catalogThemes } from "../data/catalog";
import { getFeaturedThemes } from "../data/featured";
import { foldForMatch } from "../text/foldForMatch";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { RailRow } from "./RailRow";
import { RailSearch } from "./RailSearch";
import { RailSection } from "./RailSection";
import { useRailKeyboard } from "./useRailKeyboard";

interface RailProps {
  focusedThemeId: string;
  pinnedThemeIds: ReadonlySet<string>;
  onSelect: (themeId: string) => void;
  hint?: string;
  // Mirror the filter outward so ⌘K can seed itself with whatever's typed here.
  onFilterChange?: (query: string) => void;
}

type RowSection = "baseline" | "featured" | "light" | "dark";

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

export function Rail({
  focusedThemeId,
  pinnedThemeIds,
  onSelect,
  hint,
  onFilterChange,
}: RailProps) {
  const [query, setQuery] = useState("");
  const handleQueryChange = useCallback(
    (next: string) => {
      setQuery(next);
      onFilterChange?.(next);
    },
    [onFilterChange],
  );
  const featured = useMemo(() => getFeaturedThemes(), []);
  const baseline = useMemo(() => getBaselineThemes(), []);
  // Themes that have a pinned row, so a later Light/Dark occurrence can name it.
  const featuredIds = useMemo(() => new Set(featured.map((entry) => entry.theme.id)), [featured]);
  const baselineIds = useMemo(() => new Set(baseline.map((entry) => entry.theme.id)), [baseline]);
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
      ...baseline.map((entry) => ({
        rowKey: rowKeyFor("baseline", entry.theme.id),
        themeId: entry.theme.id,
        section: "baseline" as const,
        entry,
      })),
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
    [baseline, featured, lights, darks],
  );

  const normalizedQuery = foldForMatch(query.trim());
  const visibleRows = useMemo(
    () =>
      orderedRows.filter(
        (row) =>
          normalizedQuery === "" || foldForMatch(row.entry.theme.name).includes(normalizedQuery),
      ),
    [orderedRows, normalizedQuery],
  );
  const visibleRowKeys = useMemo(() => visibleRows.map((row) => row.rowKey), [visibleRows]);

  // First visible occurrence of the focused theme wins (Featured before its light/dark home).
  // When the filter hides the focused theme, fall back to the first visible row.
  const activeRowKey = useMemo(() => {
    const match = visibleRows.find((row) => row.themeId === focusedThemeId);
    return match?.rowKey ?? visibleRows[0]?.rowKey ?? "";
  }, [visibleRows, focusedThemeId]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const onFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const { focusedIndex, onKeyDown, setFocusedIndex } = useRailKeyboard({
    ids: visibleRowKeys,
    activeId: activeRowKey,
    onFocusSearch,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const lastFocusedIndex = useRef(focusedIndex);

  // When keyboard navigation moves the index, push DOM focus to the new row.
  useEffect(() => {
    if (lastFocusedIndex.current === focusedIndex) {
      return;
    }
    lastFocusedIndex.current = focusedIndex;
    const targetKey = visibleRowKeys[focusedIndex];
    if (!targetKey || !containerRef.current) {
      return;
    }
    // Only move focus if focus is already on a row. The search input also lives
    // inside the rail, and filtering can change the roving index while a user is
    // typing; stealing focus after the first character would make filtering unusable.
    const activeElement = document.activeElement;
    if (
      !containerRef.current.contains(activeElement) ||
      !(activeElement instanceof HTMLButtonElement)
    ) {
      return;
    }
    const target = containerRef.current.querySelector<HTMLButtonElement>(
      `#${CSS.escape(targetKey)}`,
    );
    target?.focus();
  }, [focusedIndex, visibleRowKeys]);

  const sectionRows = (section: RowSection): RowDescriptor[] =>
    visibleRows.filter((row) => row.section === section);

  const renderRow = (row: RowDescriptor) => (
    <RailRow
      key={row.rowKey}
      id={row.rowKey}
      entry={row.entry}
      selected={row.themeId === focusedThemeId}
      pinned={pinnedThemeIds.has(row.themeId)}
      variant={row.section === "baseline" || row.section === "featured" ? "featured" : "basic"}
      alsoInSection={
        row.section === "baseline" || row.section === "featured"
          ? undefined
          : baselineIds.has(row.themeId)
            ? "Superset"
            : featuredIds.has(row.themeId)
              ? "Featured"
              : undefined
      }
      onSelect={() => {
        const nextIndex = visibleRows.findIndex((candidate) => candidate.rowKey === row.rowKey);
        if (nextIndex >= 0) {
          setFocusedIndex(nextIndex);
        }
        onSelect(row.themeId);
      }}
      onKeyDown={onKeyDown}
      tabIndex={row.rowKey === visibleRowKeys[focusedIndex] ? 0 : -1}
    />
  );

  return (
    <div className="rail" ref={containerRef}>
      <div className="rail__search">
        <RailSearch value={query} onChange={handleQueryChange} inputRef={searchInputRef} />
      </div>
      {hint ? (
        <p className="rail__hint" role="status" aria-live="polite">
          {hint}
        </p>
      ) : null}
      {visibleRows.length === 0 ? (
        <p className="rail__empty" role="status">
          {`No themes match "${query.trim()}"`}
          <span className="rail__empty-hint">Press ⌘K to search families &amp; ids</span>
        </p>
      ) : (
        (
          [
            ["Superset", "baseline"],
            ["Featured", "featured"],
            ["Light", "light"],
            ["Dark", "dark"],
          ] as const
        ).map(([label, section]) => {
          const rows = sectionRows(section);
          // A filter can empty a section; render only the ones with matches so no
          // heading lingers over zero rows.
          return rows.length > 0 ? (
            <RailSection key={section} label={label}>
              {rows.map(renderRow)}
            </RailSection>
          ) : null;
        })
      )}
    </div>
  );
}
