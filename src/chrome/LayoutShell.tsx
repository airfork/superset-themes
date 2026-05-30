import type { ReactNode } from "react";
import { Palette } from "../palette/Palette";
import type { PaletteProps } from "../palette/usePalette";
import { useFocusedTheme } from "../theme/useFocusedTheme";
import { BottomBar } from "./BottomBar";
import { TopBar } from "./TopBar";

interface LayoutShellProps {
  rail: ReactNode;
  pane: ReactNode;
  onOpenPalette: () => void;
  palette?: PaletteProps;
  expanded?: boolean;
  bottomBar?: ReactNode;
}

export function LayoutShell({
  rail,
  pane,
  onOpenPalette,
  palette,
  expanded = false,
  bottomBar,
}: LayoutShellProps) {
  const { focused } = useFocusedTheme();

  return (
    <div className="layout-shell" data-expanded={expanded || undefined}>
      <TopBar onOpenPalette={onOpenPalette} />
      <div className="layout-shell__body">
        <aside className="layout-shell__rail" aria-label="Themes">
          {rail}
        </aside>
        <main className="layout-shell__pane" id="main-content">
          {pane}
        </main>
      </div>
      {bottomBar ?? <BottomBar entry={focused} />}
      {palette ? <Palette {...palette} /> : null}
    </div>
  );
}
