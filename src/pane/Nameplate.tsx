import { Copy, FlaskConical, Moon, Pin, Sun } from "lucide-react";
import { useState } from "react";
import { exportThemeJson } from "../theme-core/exportTheme";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

interface NameplateProps {
  entry: CatalogThemeEntry;
  onPin: (themeId: string) => void;
  expanded?: boolean;
  onExpandToggle?: () => void;
}

export function Nameplate({ entry, onPin, expanded = false, onExpandToggle }: NameplateProps) {
  const { meta, theme } = entry;
  const [copyState, setCopyState] = useState<"copied" | "idle">("idle");
  const isDark = theme.type === "dark";

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportThemeJson(entry));
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      // clipboard unavailable; silently leave state idle
    }
  };

  const modeLabel = `${isDark ? "Dark" : "Light"} theme`;
  const expandActionLabel = `${expanded ? "Collapse" : "Expand"} ${theme.name} pane`;

  return (
    // <div> instead of <header> to avoid double-banner against the TopBar — the
    // nameplate is inside <main>, but accessibility tooling sometimes still maps
    // <header> to role="banner" in that context.
    <div className="pane-nameplate">
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
              {theme.name}
            </button>
          ) : (
            theme.name
          )}
        </h2>
        <span className="pane-nameplate__family">{meta.family}</span>
        <span
          className={`pane-nameplate__mode pane-nameplate__mode--${theme.type}`}
          role="img"
          aria-label={modeLabel}
        >
          {isDark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
          <span aria-hidden="true">{isDark ? "Dark" : "Light"}</span>
        </span>
        <ul className="pane-nameplate__tags" aria-label="Theme style tags">
          {meta.styleTags.map((tag) => (
            <li key={tag} className="pane-nameplate__tag">
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div className="pane-nameplate__actions" role="toolbar" aria-label={`${theme.name} actions`}>
        <button type="button" className="pane-nameplate__action" onClick={() => onPin(theme.id)}>
          <Pin aria-hidden="true" />
          <span>Pin to compare</span>
        </button>
        <span className="pane-nameplate__divider" aria-hidden="true" />
        <a className="pane-nameplate__action" href={`/lab?from=${theme.id}`}>
          <FlaskConical aria-hidden="true" />
          <span>Open in Lab</span>
        </a>
        <span className="pane-nameplate__divider" aria-hidden="true" />
        <button type="button" className="pane-nameplate__action" onClick={copyJson}>
          <Copy aria-hidden="true" />
          <span>{copyState === "copied" ? "Copied" : "Copy JSON"}</span>
        </button>
      </div>
    </div>
  );
}
