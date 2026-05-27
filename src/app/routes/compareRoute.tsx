import { PairCompare } from "../../compare/PairCompare";
import { DEFAULT_PAIRING_STATE, type PairingState } from "../../compare/pairing";
import { catalogThemes } from "../../data/catalog";
import { PREVIEW_TABS, type PreviewTabId } from "../../preview/PreviewTabs";

export interface CompareRouteSearch {
  dark?: string;
  light?: string;
  tab?: PreviewTabId;
}

const PREVIEW_TAB_VALUES = new Set<PreviewTabId>(PREVIEW_TABS.map((tab) => tab.value));

function stringParam(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function parseCompareRouteSearch(search: Record<string, unknown>): CompareRouteSearch {
  return {
    dark: stringParam(search.dark),
    light: stringParam(search.light),
    tab:
      typeof search.tab === "string" && PREVIEW_TAB_VALUES.has(search.tab as PreviewTabId)
        ? (search.tab as PreviewTabId)
        : undefined,
  };
}

export function compareRouteSearchToState(search: CompareRouteSearch): PairingState {
  return {
    darkThemeId: search.dark,
    lightThemeId: search.light,
    selectedPreviewTab: search.tab ?? DEFAULT_PAIRING_STATE.selectedPreviewTab,
  };
}

export function stateToCompareRouteSearch(state: PairingState): CompareRouteSearch {
  return {
    dark: state.darkThemeId,
    light: state.lightThemeId,
    tab: state.selectedPreviewTab,
  };
}

function catalogHrefForPairState(state: PairingState): string {
  const search = stateToCompareRouteSearch(state);
  const params = new URLSearchParams();

  if (search.light) {
    params.set("light", search.light);
  }

  if (search.dark) {
    params.set("dark", search.dark);
  }

  if (search.tab) {
    params.set("tab", search.tab);
  }

  const query = params.toString();

  return query ? `/?${query}` : "/";
}

export interface CompareRouteViewProps {
  onStateChange: (state: PairingState) => void;
  search: CompareRouteSearch;
}

export function CompareRouteView({ onStateChange, search }: CompareRouteViewProps) {
  const state = compareRouteSearchToState(search);

  return (
    <PairCompare
      browseHrefForSlot={() => catalogHrefForPairState(state)}
      entries={catalogThemes}
      onStateChange={onStateChange}
      state={state}
    />
  );
}
