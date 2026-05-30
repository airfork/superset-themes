import { getContrastRatio } from "../theme-core/contrast";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

interface CatalogBottomBarProps {
  variant?: "catalog";
  entry: CatalogThemeEntry;
}

interface CompareBottomBarProps {
  variant: "compare";
  a?: CatalogThemeEntry;
  b?: CatalogThemeEntry;
}

type BottomBarProps = CatalogBottomBarProps | CompareBottomBarProps;

function formatContrast(theme: CatalogThemeEntry["theme"]): string {
  const ratio = getContrastRatio(theme.ui.background, theme.ui.foreground);
  return `${ratio.toFixed(1)}:1`;
}

function Sep() {
  return (
    <span className="chrome-bottombar__sep" aria-hidden="true">
      ·
    </span>
  );
}

export function BottomBar(props: BottomBarProps) {
  if (props.variant === "compare") {
    return <CompareBottomBar a={props.a} b={props.b} />;
  }
  return <CatalogBottomBar entry={props.entry} />;
}

function CatalogBottomBar({ entry }: { entry: CatalogThemeEntry }) {
  return (
    <footer className="chrome-bottombar">
      <div className="chrome-bottombar__facts">
        <span className="chrome-bottombar__name">{entry.theme.name}</span>
        <Sep />
        <span className="chrome-bottombar__family">{entry.meta.family}</span>
        <Sep />
        <span className="chrome-bottombar__contrast">{formatContrast(entry.theme)}</span>
      </div>
      <div className="chrome-bottombar__hints">
        <span className="chrome-bottombar__hint">↓ next</span>
        <Sep />
        <span className="chrome-bottombar__hint">⌘K</span>
        <Sep />
        <span className="chrome-bottombar__hint">. pin</span>
      </div>
    </footer>
  );
}

function CompareSlotFact({ slot, entry }: { slot: "A" | "B"; entry?: CatalogThemeEntry }) {
  return (
    <span className="chrome-bottombar__slot">
      <span className="chrome-bottombar__slot-label" aria-hidden="true">
        {slot}
      </span>
      {entry ? (
        <>
          <span className="chrome-bottombar__name">{entry.theme.name}</span>
          <span className="chrome-bottombar__contrast">{formatContrast(entry.theme)}</span>
        </>
      ) : (
        <span className="chrome-bottombar__empty">empty</span>
      )}
    </span>
  );
}

function CompareBottomBar({ a, b }: { a?: CatalogThemeEntry; b?: CatalogThemeEntry }) {
  return (
    <footer className="chrome-bottombar">
      <div className="chrome-bottombar__facts">
        <CompareSlotFact slot="A" entry={a} />
        <Sep />
        <CompareSlotFact slot="B" entry={b} />
      </div>
      <div className="chrome-bottombar__hints">
        <span className="chrome-bottombar__hint">click to pin</span>
        <Sep />
        <span className="chrome-bottombar__hint">⌘K</span>
        <Sep />
        <span className="chrome-bottombar__hint">Esc to exit</span>
      </div>
    </footer>
  );
}
