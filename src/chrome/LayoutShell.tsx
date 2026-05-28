import type { ReactNode } from "react";
import { useFocusedTheme } from "../theme/useFocusedTheme";
import { BottomBar } from "./BottomBar";
import { TopBar } from "./TopBar";

interface LayoutShellProps {
  rail: ReactNode;
  pane: ReactNode;
  onOpenPalette: () => void;
  expanded?: boolean;
}

export function LayoutShell({ rail, pane, onOpenPalette, expanded = false }: LayoutShellProps) {
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
      <BottomBar entry={focused} />
    </div>
  );
}
