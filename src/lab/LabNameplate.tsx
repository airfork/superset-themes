import { Moon, Sun } from "lucide-react";
import type { ThemeDraft } from "./draftTheme";

interface LabNameplateProps {
  draft: ThemeDraft;
  seed?: string;
}

function draftSourceLabel(draft: ThemeDraft, seed?: string): string {
  switch (draft.source.type) {
    case "catalog":
      return `Draft — based on ${draft.source.themeId}`;
    case "generated":
      return seed ? `Draft — generated, seed: ${seed}` : "Draft — generated";
    case "import":
      return "Draft — imported";
  }
}

// Lab variant of the pane nameplate: shows the draft title and its provenance
// instead of catalog family/style tags (drafts have no catalog metadata).
export function LabNameplate({ draft, seed }: LabNameplateProps) {
  const { theme } = draft;
  const isDark = theme.type === "dark";
  const modeLabel = `${isDark ? "Dark" : "Light"} theme`;

  return (
    <div className="pane-nameplate pane-nameplate--lab">
      <div className="pane-nameplate__title">
        <h2 className="pane-nameplate__name-text">{theme.name}</h2>
        <span className="pane-nameplate__family">{draftSourceLabel(draft, seed)}</span>
        <span
          className={`pane-nameplate__mode pane-nameplate__mode--${theme.type}`}
          role="img"
          aria-label={modeLabel}
        >
          {isDark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
          <span aria-hidden="true">{isDark ? "Dark" : "Light"}</span>
        </span>
        <span
          className="pane-nameplate__status"
          data-dirty={draft.dirty || undefined}
          role="status"
        >
          {draft.dirty ? "Unsaved changes" : "Draft clean"}
        </span>
      </div>
    </div>
  );
}
