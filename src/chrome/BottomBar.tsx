import { getContrastRatio } from "../theme-core/contrast";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

interface BottomBarProps {
  entry: CatalogThemeEntry;
}

function formatContrast(theme: CatalogThemeEntry["theme"]): string {
  const ratio = getContrastRatio(theme.ui.background, theme.ui.foreground);
  return `${ratio.toFixed(1)}:1`;
}

export function BottomBar({ entry }: BottomBarProps) {
  return (
    <footer className="chrome-bottombar">
      <div className="chrome-bottombar__facts">
        <span className="chrome-bottombar__name">{entry.theme.name}</span>
        <span className="chrome-bottombar__sep" aria-hidden="true">
          ·
        </span>
        <span className="chrome-bottombar__family">{entry.meta.family}</span>
        <span className="chrome-bottombar__sep" aria-hidden="true">
          ·
        </span>
        <span className="chrome-bottombar__contrast">{formatContrast(entry.theme)}</span>
      </div>
      <div className="chrome-bottombar__hints">
        <span className="chrome-bottombar__hint">↓ next</span>
        <span className="chrome-bottombar__sep" aria-hidden="true">
          ·
        </span>
        <span className="chrome-bottombar__hint">⌘K</span>
        <span className="chrome-bottombar__sep" aria-hidden="true">
          ·
        </span>
        <span className="chrome-bottombar__hint">. pin</span>
      </div>
    </footer>
  );
}
