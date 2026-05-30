import { memo, type ReactNode, useEffect } from "react";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { Nameplate } from "./Nameplate";
import { WorkspaceScene } from "./WorkspaceScene";

interface PaneProps {
  entry: CatalogThemeEntry;
  // Catalog supplies onPin for the default nameplate; Lab supplies its own
  // `nameplate` node, so both are optional.
  onPin?: (themeId: string) => void;
  nameplate?: ReactNode;
  expanded?: boolean;
  onExpandToggle?: () => void;
}

export const Pane = memo(function Pane({
  entry,
  onPin,
  nameplate,
  expanded = false,
  onExpandToggle,
}: PaneProps) {
  useEffect(() => {
    if (!onExpandToggle) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      // Ignore `f` while typing into form controls or contenteditable surfaces.
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      if (event.key === "f" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        onExpandToggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExpandToggle]);

  return (
    <div className="pane" data-expanded={expanded || undefined}>
      {nameplate ?? (
        <Nameplate
          entry={entry}
          onPin={onPin ?? (() => {})}
          expanded={expanded}
          onExpandToggle={onExpandToggle}
        />
      )}
      <div className="pane__body">
        <WorkspaceScene entry={entry} />
      </div>
    </div>
  );
});
