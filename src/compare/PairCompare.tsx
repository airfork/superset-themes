import type { PreviewTabId } from "../preview/PreviewTabs";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { PairSlot } from "./PairSlot";
import {
  clearPairSlot,
  DEFAULT_PAIRING_STATE,
  type PairingState,
  type PairSlotId,
  setPairPreviewTab,
} from "./pairing";

export interface PairCompareProps {
  browseHrefForSlot?: (slot: PairSlotId, state: PairingState) => string;
  entries: readonly CatalogThemeEntry[];
  onStateChange?: (state: PairingState) => void;
  state?: PairingState;
}

function findEntry(entries: readonly CatalogThemeEntry[], themeId: string | undefined) {
  return themeId ? entries.find((entry) => entry.theme.id === themeId) : undefined;
}

export function PairCompare({
  browseHrefForSlot,
  entries,
  onStateChange,
  state = DEFAULT_PAIRING_STATE,
}: PairCompareProps) {
  const lightEntry = findEntry(entries, state.lightThemeId);
  const darkEntry = findEntry(entries, state.darkThemeId);

  const updateSelectedTab = (selectedPreviewTab: PreviewTabId) => {
    onStateChange?.(setPairPreviewTab(state, selectedPreviewTab));
  };

  const clearSlot = (slot: PairSlotId) => {
    onStateChange?.(clearPairSlot(state, slot));
  };

  return (
    <section aria-labelledby="pair-compare-title" className="pair-compare">
      <div className="pair-compare__header">
        <div>
          <p className="eyebrow">Compare</p>
          <h2 id="pair-compare-title">Light and dark pairing</h2>
          <p>Review the same Superset surfaces side by side before choosing a matched pair.</p>
        </div>
        <p className="pair-compare__tab-state">Surface: {state.selectedPreviewTab}</p>
      </div>
      <div className="pair-compare__grid">
        <PairSlot
          browseHref={browseHrefForSlot?.("light", state)}
          entry={lightEntry}
          onClear={clearSlot}
          onTabChange={updateSelectedTab}
          selectedTab={state.selectedPreviewTab}
          slot="light"
        />
        <PairSlot
          browseHref={browseHrefForSlot?.("dark", state)}
          entry={darkEntry}
          onClear={clearSlot}
          onTabChange={updateSelectedTab}
          selectedTab={state.selectedPreviewTab}
          slot="dark"
        />
      </div>
    </section>
  );
}
