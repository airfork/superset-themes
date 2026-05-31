import { X } from "lucide-react";
import type { CSSProperties } from "react";
import { Nameplate } from "../pane/Nameplate";
import type { SceneId } from "../pane/SceneTabs";
import { SettingsScene } from "../pane/SettingsScene";
import { WorkspaceScene } from "../pane/WorkspaceScene";
import { getThemeCssVars } from "../preview/themeCssVars";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import type { CompareSlotId } from "./compareState";

interface CompareSlotProps {
  slot: CompareSlotId;
  entry?: CatalogThemeEntry;
  scene: SceneId;
  onUnpin: (slot: CompareSlotId) => void;
  // A pin from outside the view swapped this slot's theme without moving focus
  // here; the cue draws the eye to the change before the Undo window closes.
  attention?: boolean;
}

function slotLabel(slot: CompareSlotId): string {
  return slot === "a" ? "A" : "B";
}

export function CompareSlot({ slot, entry, scene, onUnpin, attention }: CompareSlotProps) {
  const label = slotLabel(slot);

  if (!entry) {
    return (
      <section
        className="compare-slot compare-slot--empty"
        aria-label={`Compare slot ${label}, empty`}
      >
        <p className="compare-slot__placeholder">Pin a theme from the rail to fill slot {label}.</p>
      </section>
    );
  }

  // The slot scopes its own --preview-* vars so its descendants render in this
  // theme while the surrounding chrome keeps reading :root (the entry theme).
  const scopedVars = getThemeCssVars(entry.theme) as CSSProperties;

  return (
    <section
      className="compare-slot"
      aria-label={`Compare slot ${label}: ${entry.theme.name}`}
      style={scopedVars}
      data-theme-type={entry.theme.type}
      data-attention={attention ? "true" : undefined}
    >
      <div className="compare-slot__chrome">
        <span className="compare-slot__eyebrow">Slot {label}</span>
        <button
          type="button"
          className="compare-slot__unpin"
          onClick={() => onUnpin(slot)}
          aria-label={`Remove ${entry.theme.name} from comparison`}
        >
          <X aria-hidden="true" />
          <span>Unpin</span>
        </button>
      </div>
      <Nameplate entry={entry} compact />
      <div className="compare-slot__body">
        {scene === "workspace" ? <WorkspaceScene entry={entry} /> : <SettingsScene entry={entry} />}
      </div>
    </section>
  );
}
