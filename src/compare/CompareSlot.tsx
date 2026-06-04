import { X } from "lucide-react";
import type { CSSProperties } from "react";
import { Nameplate } from "../pane/Nameplate";
import type { SceneId } from "../pane/SceneTabs";
import { SettingsScene } from "../pane/SettingsScene";
import { WorkspaceScene } from "../pane/WorkspaceScene";
import { getThemeCssVars } from "../preview/themeCssVars";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

export type CompareRole = "baseline" | "candidate";

interface CompareSlotProps {
  role: CompareRole;
  entry?: CatalogThemeEntry;
  scene: SceneId;
  // Only the candidate can be cleared; the baseline is always present (it is also
  // the chrome theme), so it carries no clear control.
  onClear?: () => void;
}

function roleLabel(role: CompareRole): string {
  return role === "baseline" ? "Baseline" : "Comparing";
}

export function CompareSlot({ role, entry, scene, onClear }: CompareSlotProps) {
  const label = roleLabel(role);

  if (!entry) {
    // Only the candidate is ever empty.
    return (
      <section className="compare-slot compare-slot--empty" aria-label="Comparing slot, empty">
        <p className="compare-slot__placeholder">Pick a theme from the rail to compare.</p>
      </section>
    );
  }

  // The slot scopes its own --preview-* vars so its descendants render in this
  // theme while the surrounding chrome keeps reading :root (the baseline theme).
  const scopedVars = getThemeCssVars(entry.theme) as CSSProperties;

  return (
    <section
      className="compare-slot"
      aria-label={`${label}: ${entry.theme.name}`}
      style={scopedVars}
      data-theme-type={entry.theme.type}
      data-role={role}
    >
      <div className="compare-slot__chrome">
        <span className="compare-slot__eyebrow">{label}</span>
        {role === "candidate" && onClear ? (
          <button
            type="button"
            className="compare-slot__unpin"
            onClick={onClear}
            aria-label={`Remove ${entry.theme.name} from comparison`}
          >
            <X aria-hidden="true" />
            <span>Clear</span>
          </button>
        ) : null}
      </div>
      <Nameplate entry={entry} compact />
      <div className="compare-slot__body">
        {scene === "workspace" ? <WorkspaceScene entry={entry} /> : <SettingsScene entry={entry} />}
      </div>
    </section>
  );
}
