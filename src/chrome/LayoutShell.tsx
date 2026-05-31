import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Palette } from "../palette/Palette";
import type { PaletteProps } from "../palette/usePalette";
import { useFocusedTheme } from "../theme/useFocusedTheme";
import { BottomBar } from "./BottomBar";
import { TopBar } from "./TopBar";

const RAIL_REGION_ID = "theme-rail";

interface LayoutShellProps {
  rail: ReactNode;
  pane: ReactNode;
  onOpenPalette: () => void;
  onShowShortcuts?: () => void;
  palette?: PaletteProps;
  expanded?: boolean;
  bottomBar?: ReactNode;
}

export function LayoutShell({
  rail,
  pane,
  onOpenPalette,
  onShowShortcuts,
  palette,
  expanded = false,
  bottomBar,
}: LayoutShellProps) {
  const { focused } = useFocusedTheme();
  // Below the touch breakpoint the rail is a disclosure so the preview + actions own
  // the viewport; this toggle is hidden on desktop, where the rail stays docked.
  const [railOpen, setRailOpen] = useState(false);

  return (
    <div className="layout-shell" data-expanded={expanded || undefined}>
      <TopBar onOpenPalette={onOpenPalette} />
      <div className="layout-shell__body">
        <button
          type="button"
          className="layout-shell__rail-toggle"
          aria-expanded={railOpen}
          aria-controls={RAIL_REGION_ID}
          onClick={() => setRailOpen((open) => !open)}
        >
          <ChevronDown className="layout-shell__rail-toggle-icon" aria-hidden="true" />
          Browse themes
        </button>
        {/* Delegation root, not an interactive control: rail rows inside are real
            <button>s, so keyboard activation already dispatches a bubbling click that
            this handler catches — a separate key handler would be redundant. */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: delegated close; inner rail rows are buttons whose keyboard activation bubbles a click here. */}
        <aside
          id={RAIL_REGION_ID}
          className="layout-shell__rail"
          aria-label="Themes"
          data-open={railOpen || undefined}
          // Activating a theme row collapses the disclosure so the preview returns to
          // view. On desktop the rail is always docked, so this close is a harmless
          // no-op (the toggle is hidden and never opens it).
          onClick={(event) => {
            if ((event.target as HTMLElement).closest(".rail-row")) {
              setRailOpen(false);
            }
          }}
        >
          {rail}
        </aside>
        <main className="layout-shell__pane" id="main-content">
          {pane}
        </main>
      </div>
      {bottomBar ?? <BottomBar entry={focused} onShowShortcuts={onShowShortcuts} />}
      {palette ? <Palette {...palette} /> : null}
    </div>
  );
}
