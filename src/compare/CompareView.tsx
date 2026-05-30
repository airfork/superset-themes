import { ArrowLeft } from "lucide-react";
import { catalogThemes } from "../data/catalog";
import { type SceneId, SceneTabs } from "../pane/SceneTabs";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { CompareSlot } from "./CompareSlot";
import type { CompareSlotId, CompareState } from "./compareState";

interface CompareViewProps {
  state: CompareState;
  scene: SceneId;
  onSceneChange: (scene: SceneId) => void;
  onUnpin: (slot: CompareSlotId) => void;
  onExit: () => void;
}

function entryFor(themeId: string | null): CatalogThemeEntry | undefined {
  return themeId ? catalogThemes.find((candidate) => candidate.theme.id === themeId) : undefined;
}

function liveMessage(a?: CatalogThemeEntry, b?: CatalogThemeEntry): string {
  if (a && b) {
    return `Comparing ${a.theme.name} with ${b.theme.name}.`;
  }
  if (a || b) {
    const pinned = (a ?? b) as CatalogThemeEntry;
    return `${pinned.theme.name} pinned. Pin a second theme to compare.`;
  }
  return "Pin a theme from the rail to start comparing.";
}

export function CompareView({ state, scene, onSceneChange, onUnpin, onExit }: CompareViewProps) {
  const a = entryFor(state.a);
  const b = entryFor(state.b);

  return (
    <div className="compare-view" data-scene={scene}>
      <header className="compare-view__bar">
        <button type="button" className="compare-view__back" onClick={onExit}>
          <ArrowLeft aria-hidden="true" />
          <span>Back to catalog</span>
          <kbd>Esc</kbd>
        </button>
        <p className="compare-view__status" role="status" aria-live="polite">
          {liveMessage(a, b)}
        </p>
      </header>
      <div className="compare-view__slots">
        <CompareSlot slot="a" entry={a} scene={scene} onUnpin={onUnpin} />
        <CompareSlot slot="b" entry={b} scene={scene} onUnpin={onUnpin} />
      </div>
      <SceneTabs current={scene} onChange={onSceneChange} />
    </div>
  );
}
