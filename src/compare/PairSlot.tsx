import { X } from "lucide-react";
import { type PreviewTabId, PreviewTabs } from "../preview/PreviewTabs";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import type { PairSlotId } from "./pairing";

export interface PairSlotProps {
  browseHref?: string;
  entry?: CatalogThemeEntry;
  onClear?: (slot: PairSlotId) => void;
  onTabChange?: (tab: PreviewTabId) => void;
  selectedTab: PreviewTabId;
  slot: PairSlotId;
}

function slotLabel(slot: PairSlotId) {
  return slot === "light" ? "Light theme slot" : "Dark theme slot";
}

export function PairSlot({
  browseHref,
  entry,
  onClear,
  onTabChange,
  selectedTab,
  slot,
}: PairSlotProps) {
  return (
    <section aria-label={slotLabel(slot)} className="pair-slot">
      <div className="pair-slot__header">
        <div>
          <p className="eyebrow">{slot} slot</p>
          <h3>{entry ? entry.theme.name : `No ${slot} theme pinned`}</h3>
        </div>
        {entry ? (
          <button className="pair-slot__clear" onClick={() => onClear?.(slot)} type="button">
            <X aria-hidden="true" />
            <span>Clear {slot}</span>
          </button>
        ) : (
          <a className="pair-slot__browse" href={browseHref ?? "/"}>
            Add {slot} theme
          </a>
        )}
      </div>
      {entry ? (
        <PreviewTabs onTabChange={onTabChange} selectedTab={selectedTab} theme={entry.theme} />
      ) : (
        <div className="pair-slot__empty">
          <p>Pin a {slot} theme from the catalog or a detail page to compare shared surfaces.</p>
        </div>
      )}
    </section>
  );
}
