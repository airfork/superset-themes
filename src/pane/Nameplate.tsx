import { Copy, FlaskConical, Maximize2, Minimize2, Moon, Pin, Sun } from "lucide-react";
import { useState } from "react";
import { exportThemeJson } from "../theme-core/exportTheme";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

interface NameplateProps {
  entry: CatalogThemeEntry;
  // Omitted in compare slots, where the theme is already pinned and the slot owns
  // Unpin, so offering "Pin to compare" again would be a contradictory second verb.
  onPin?: (themeId: string) => void;
  expanded?: boolean;
  onExpandToggle?: () => void;
  // Compare slots are narrow; compact collapses the action labels to icon-only
  // (label kept as an accessible tooltip) so the title keeps its full width.
  compact?: boolean;
}

export function Nameplate({
  entry,
  onPin,
  expanded = false,
  onExpandToggle,
  compact = false,
}: NameplateProps) {
  const { meta, theme } = entry;
  const [copyState, setCopyState] = useState<"copied" | "failed" | "idle">("idle");
  const isDark = theme.type === "dark";

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportThemeJson(entry));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    window.setTimeout(() => setCopyState("idle"), 1600);
  };

  const copyLabel =
    copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy JSON";

  const modeLabel = `${isDark ? "Dark" : "Light"} theme`;
  const expandActionLabel = `${expanded ? "Collapse" : "Expand"} ${theme.name} pane`;

  return (
    // <div> instead of <header> to avoid double-banner against the TopBar — the
    // nameplate is inside <main>, but accessibility tooling sometimes still maps
    // <header> to role="banner" in that context.
    <div className={`pane-nameplate${compact ? " pane-nameplate--compact" : ""}`}>
      <div className="pane-nameplate__title">
        <h2 className="pane-nameplate__name-text">
          {onExpandToggle ? (
            <button
              type="button"
              className="pane-nameplate__name pane-nameplate__name--expandable"
              onClick={onExpandToggle}
              aria-label={expandActionLabel}
              aria-expanded={expanded}
            >
              <span className="pane-nameplate__name-label">{theme.name}</span>
              {expanded ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
            </button>
          ) : (
            theme.name
          )}
        </h2>
        <span className="pane-nameplate__family">{meta.family}</span>
        <span className="pane-nameplate__mode" role="img" aria-label={modeLabel}>
          {isDark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
        </span>
        {compact ? null : (
          <ul className="pane-nameplate__tags" aria-label="Theme style tags">
            {meta.styleTags.map((tag) => (
              <li key={tag} className="pane-nameplate__tag">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pane-nameplate__actions" role="toolbar" aria-label={`${theme.name} actions`}>
        {onPin ? (
          <>
            <button
              type="button"
              className="pane-nameplate__action"
              onClick={() => onPin(theme.id)}
            >
              <Pin aria-hidden="true" />
              <span>Pin to compare</span>
            </button>
            <span className="pane-nameplate__divider" aria-hidden="true" />
          </>
        ) : null}
        <a
          className="pane-nameplate__action"
          href={`/lab?from=${theme.id}`}
          title={compact ? "Open in Lab" : undefined}
        >
          <FlaskConical aria-hidden="true" />
          <span className="pane-nameplate__action-label">Open in Lab</span>
        </a>
        <span className="pane-nameplate__divider" aria-hidden="true" />
        <button
          type="button"
          className={`pane-nameplate__action${
            copyState === "failed" ? " pane-nameplate__action--error" : ""
          }`}
          onClick={copyJson}
          title={compact ? copyLabel : undefined}
        >
          <Copy aria-hidden="true" />
          <span className="pane-nameplate__action-label" aria-live="polite">
            {copyLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
