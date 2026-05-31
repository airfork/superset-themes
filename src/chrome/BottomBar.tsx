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

// Chips the pressable key and trails the verb as muted text. The leading space
// before the verb is a real text node so the hint reads "↓ next", not "↓next".
function KeyHint({ keyLabel, action }: { keyLabel: string; action?: string }) {
  return (
    <span className="chrome-bottombar__hint">
      <kbd className="chrome-bottombar__key">{keyLabel}</kbd>
      {action ? ` ${action}` : null}
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
        <KeyHint keyLabel="↓" action="next" />
        <Sep />
        <KeyHint keyLabel="⌘K" />
        <Sep />
        <KeyHint keyLabel="." action="pin" />
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
        <KeyHint keyLabel="⌘K" />
        <Sep />
        <KeyHint keyLabel="Esc" action="exit" />
      </div>
    </footer>
  );
}
