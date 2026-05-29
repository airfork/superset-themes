import { type ReactNode, useEffect, useState } from "react";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { Nameplate } from "./Nameplate";
import { type SceneId, SceneTabs } from "./SceneTabs";
import { SettingsScene } from "./SettingsScene";
import { WorkspaceScene } from "./WorkspaceScene";

interface PaneProps {
  entry: CatalogThemeEntry;
  // Catalog supplies onPin for the default nameplate; Lab supplies its own
  // `nameplate` node, so both are optional.
  onPin?: (themeId: string) => void;
  nameplate?: ReactNode;
  expanded?: boolean;
  onExpandToggle?: () => void;
  initialScene?: SceneId;
}

export function Pane({
  entry,
  onPin,
  nameplate,
  expanded = false,
  onExpandToggle,
  initialScene = "workspace",
}: PaneProps) {
  const [scene, setScene] = useState<SceneId>(initialScene);

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
    <div className="pane" data-scene={scene} data-expanded={expanded || undefined}>
      {nameplate ?? (
        <Nameplate
          entry={entry}
          onPin={onPin ?? (() => {})}
          expanded={expanded}
          onExpandToggle={onExpandToggle}
        />
      )}
      <div className="pane__body">
        {scene === "workspace" ? <WorkspaceScene entry={entry} /> : <SettingsScene entry={entry} />}
      </div>
      <SceneTabs current={scene} onChange={setScene} />
    </div>
  );
}
