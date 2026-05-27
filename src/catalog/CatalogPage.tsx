import { useMemo, useState } from "react";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import type {
  CatalogFilters,
  CatalogPairFilter,
  CatalogSortKey,
  CatalogThemeTypeFilter,
} from "./catalogFilters";
import {
  DEFAULT_CATALOG_FILTERS,
  filterCatalogThemes,
  getCatalogFilterOptions,
  sortCatalogThemes,
} from "./catalogFilters";
import { searchCatalogThemes } from "./catalogSearch";
import { ThemeCard } from "./ThemeCard";

export interface CatalogPageState {
  filters: CatalogFilters;
  query: string;
  sort: CatalogSortKey;
}

export interface CatalogPageProps {
  detailHrefForTheme?: (themeId: string) => string;
  entries: readonly CatalogThemeEntry[];
  onStateChange?: (state: CatalogPageState) => void;
  pinHrefForTheme?: (entry: CatalogThemeEntry) => string;
  state?: CatalogPageState;
}

export const DEFAULT_CATALOG_PAGE_STATE: CatalogPageState = {
  filters: {
    ...DEFAULT_CATALOG_FILTERS,
    styleTags: new Set<string>(),
  },
  query: "",
  sort: "name",
};

const TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] as const satisfies readonly { label: string; value: CatalogThemeTypeFilter }[];

const PAIR_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Paired", value: "paired" },
  { label: "Unpaired", value: "unpaired" },
] as const satisfies readonly { label: string; value: CatalogPairFilter }[];

const SORT_OPTIONS = [
  { label: "Name", value: "name" },
  { label: "Family", value: "family" },
  { label: "Accent hue", value: "accentHue" },
  { label: "Contrast", value: "contrast" },
] as const satisfies readonly { label: string; value: CatalogSortKey }[];

function cloneCatalogState(state: CatalogPageState): CatalogPageState {
  return {
    filters: {
      ...state.filters,
      styleTags: new Set(state.filters.styleTags),
    },
    query: state.query,
    sort: state.sort,
  };
}

function updateFilters(
  state: CatalogPageState,
  filters: Partial<CatalogFilters>,
): CatalogPageState {
  return {
    ...state,
    filters: {
      ...state.filters,
      ...filters,
    },
  };
}

function CatalogSelect<TValue extends string>({
  id,
  label,
  onChange,
  options,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: TValue) => void;
  options: readonly { label: string; value: TValue }[];
  value: TValue;
}) {
  return (
    <label className="catalog-field" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        name={id}
        onChange={(event) => onChange(event.currentTarget.value as TValue)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CatalogPage({
  detailHrefForTheme,
  entries,
  onStateChange,
  pinHrefForTheme,
  state,
}: CatalogPageProps) {
  const [internalState, setInternalState] = useState(() =>
    cloneCatalogState(DEFAULT_CATALOG_PAGE_STATE),
  );
  const currentState = state ?? internalState;
  const options = useMemo(() => getCatalogFilterOptions(entries), [entries]);
  const results = useMemo(() => {
    const searchedEntries = searchCatalogThemes(entries, currentState.query);
    const filteredEntries = filterCatalogThemes(searchedEntries, currentState.filters);

    return sortCatalogThemes(filteredEntries, currentState.sort);
  }, [currentState, entries]);

  const updateState = (nextState: CatalogPageState) => {
    if (!state) {
      setInternalState(cloneCatalogState(nextState));
    }

    onStateChange?.(cloneCatalogState(nextState));
  };

  const setFilters = (filters: Partial<CatalogFilters>) => {
    updateState(updateFilters(currentState, filters));
  };

  const toggleStyleTag = (tag: string) => {
    const styleTags = new Set(currentState.filters.styleTags);

    if (styleTags.has(tag)) {
      styleTags.delete(tag);
    } else {
      styleTags.add(tag);
    }

    setFilters({ styleTags });
  };

  return (
    <section aria-labelledby="catalog-title" className="catalog-page">
      <div className="catalog-page__header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2 id="catalog-title">Theme catalog</h2>
          <p>
            Browse Superset-compatible themes by mode, family, pairing readiness, contrast, and
            terminal palette depth.
          </p>
        </div>
        <p className="catalog-page__count">
          <strong>{results.length}</strong>
          <span>of {entries.length} themes</span>
        </p>
      </div>

      <div className="catalog-page__workspace">
        <fieldset className="catalog-filters">
          <legend className="sr-only">Catalog filters</legend>
          <label className="catalog-search" htmlFor="catalog-search">
            <span>Search themes</span>
            <input
              autoComplete="off"
              id="catalog-search"
              name="catalog-search"
              onChange={(event) =>
                updateState({
                  ...currentState,
                  query: event.currentTarget.value,
                })
              }
              placeholder="Name, tag, terminal…"
              type="search"
              value={currentState.query}
            />
          </label>

          <fieldset className="catalog-radio-group">
            <legend>Theme type</legend>
            {TYPE_OPTIONS.map((option) => (
              <label key={option.value}>
                <input
                  checked={currentState.filters.type === option.value}
                  name="catalog-theme-type"
                  onChange={() => setFilters({ type: option.value })}
                  type="radio"
                  value={option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>

          <CatalogSelect
            id="catalog-family"
            label="Family"
            onChange={(family) => setFilters({ family })}
            options={[
              { label: "All families", value: "all" },
              ...options.families.map((family) => ({ label: family, value: family })),
            ]}
            value={currentState.filters.family}
          />
          <CatalogSelect
            id="catalog-source"
            label="Source"
            onChange={(source) => setFilters({ source })}
            options={[
              { label: "All sources", value: "all" },
              ...options.sources.map((source) => ({ label: source, value: source })),
            ]}
            value={currentState.filters.source}
          />
          <CatalogSelect
            id="catalog-pairing"
            label="Pairing"
            onChange={(paired) => setFilters({ paired })}
            options={PAIR_OPTIONS}
            value={currentState.filters.paired}
          />
          <CatalogSelect
            id="catalog-warmth"
            label="Warmth"
            onChange={(warmth) => setFilters({ warmth })}
            options={[
              { label: "All warmths", value: "all" },
              ...options.warmths.map((warmth) => ({ label: warmth, value: warmth })),
            ]}
            value={currentState.filters.warmth}
          />
          <CatalogSelect
            id="catalog-contrast"
            label="Contrast"
            onChange={(contrastTier) => setFilters({ contrastTier })}
            options={[
              { label: "All contrast", value: "all" },
              ...options.contrastTiers.map((tier) => ({ label: tier, value: tier })),
            ]}
            value={currentState.filters.contrastTier}
          />
          <CatalogSelect
            id="catalog-terminal-palette"
            label="Terminal palette"
            onChange={(terminalPaletteQuality) => setFilters({ terminalPaletteQuality })}
            options={[
              { label: "All terminal palettes", value: "all" },
              ...options.terminalPaletteQualities.map((quality) => ({
                label: quality,
                value: quality,
              })),
            ]}
            value={currentState.filters.terminalPaletteQuality}
          />
          <CatalogSelect
            id="catalog-accent-hue"
            label="Accent hue"
            onChange={(value) => {
              if (value === "all") {
                setFilters({ accentHueRange: null });
                return;
              }

              setFilters({
                accentHueRange:
                  value === "cool" ? { end: 210, start: 140 } : { end: 20, start: 340 },
              });
            }}
            options={[
              { label: "All accent hues", value: "all" },
              { label: "Cool green to blue", value: "cool" },
              { label: "Warm red wrap", value: "warm" },
            ]}
            value={
              currentState.filters.accentHueRange === null
                ? "all"
                : currentState.filters.accentHueRange.start === 140
                  ? "cool"
                  : "warm"
            }
          />

          <fieldset className="catalog-tag-filter">
            <legend>Tags</legend>
            {options.styleTags.map((tag) => (
              <label key={tag}>
                <input
                  checked={currentState.filters.styleTags.has(tag)}
                  name={`catalog-tag-${tag}`}
                  onChange={() => toggleStyleTag(tag)}
                  type="checkbox"
                />
                <span>{tag}</span>
              </label>
            ))}
          </fieldset>
        </fieldset>

        <div className="catalog-results">
          <div className="catalog-results__toolbar">
            <CatalogSelect
              id="catalog-sort"
              label="Sort"
              onChange={(sort) =>
                updateState({
                  ...currentState,
                  sort,
                })
              }
              options={SORT_OPTIONS}
              value={currentState.sort}
            />
          </div>

          {results.length > 0 ? (
            <ul aria-label="Catalog results" className="catalog-grid">
              {results.map((entry) => (
                <li key={entry.theme.id}>
                  <ThemeCard
                    detailHref={detailHrefForTheme?.(entry.theme.id)}
                    entry={entry}
                    pinHref={pinHrefForTheme?.(entry)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="catalog-empty-state">
              <h3>No themes match</h3>
              <p>Clear a filter or broaden the search query to see more catalog entries.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
