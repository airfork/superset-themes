import { getContrastRatio } from "../theme-core/contrast";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

interface CatalogBottomBarProps {
  variant?: "catalog";
  entry: CatalogThemeEntry;
  // When set, the hint cluster gains a "?" trigger that opens the full shortcut
  // reference. Omitted on surfaces that don't host the overlay (e.g. stories).
  onShowShortcuts?: () => void;
}

interface CompareBottomBarProps {
  variant: "compare";
  baseline?: CatalogThemeEntry;
  candidate?: CatalogThemeEntry;
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
    return <CompareBottomBar baseline={props.baseline} candidate={props.candidate} />;
  }
  return <CatalogBottomBar entry={props.entry} onShowShortcuts={props.onShowShortcuts} />;
}

function CatalogBottomBar({
  entry,
  onShowShortcuts,
}: {
  entry: CatalogThemeEntry;
  onShowShortcuts?: () => void;
}) {
  // Drop the family fact (and its separator) when it only echoes the name, e.g.
  // the "Tokyo Night" theme in the "Tokyo Night" family.
  const showFamily = entry.meta.family !== entry.theme.name;
  return (
    <footer className="chrome-bottombar">
      <div className="chrome-bottombar__facts">
        <span className="chrome-bottombar__name">{entry.theme.name}</span>
        {showFamily ? (
          <>
            <Sep />
            <span className="chrome-bottombar__family">{entry.meta.family}</span>
          </>
        ) : null}
        <Sep />
        <span className="chrome-bottombar__contrast">{formatContrast(entry.theme)}</span>
      </div>
      <div className="chrome-bottombar__hints">
        <KeyHint keyLabel="↓" action="next" />
        <Sep />
        <KeyHint keyLabel="⌘K" />
        <Sep />
        <KeyHint keyLabel="." action="pin" />
        {onShowShortcuts ? (
          <>
            <Sep />
            <button
              type="button"
              className="chrome-bottombar__hint chrome-bottombar__shortcuts"
              aria-label="Keyboard shortcuts"
              onClick={onShowShortcuts}
            >
              <kbd className="chrome-bottombar__key">?</kbd>
            </button>
          </>
        ) : null}
      </div>
    </footer>
  );
}

function CompareSlotFact({ label, entry }: { label: string; entry?: CatalogThemeEntry }) {
  return (
    <span className="chrome-bottombar__slot">
      <span className="chrome-bottombar__slot-label" aria-hidden="true">
        {label}
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

function CompareBottomBar({
  baseline,
  candidate,
}: {
  baseline?: CatalogThemeEntry;
  candidate?: CatalogThemeEntry;
}) {
  return (
    <footer className="chrome-bottombar">
      <div className="chrome-bottombar__facts">
        <CompareSlotFact label="Baseline" entry={baseline} />
        <Sep />
        <CompareSlotFact label="Comparing" entry={candidate} />
      </div>
      <div className="chrome-bottombar__hints">
        <KeyHint keyLabel="⌘K" />
        <Sep />
        <KeyHint keyLabel="Esc" action="exit" />
      </div>
    </footer>
  );
}
