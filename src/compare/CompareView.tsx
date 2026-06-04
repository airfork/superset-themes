import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import { catalogThemes } from "../data/catalog";
import { type SceneId, SceneTabs } from "../pane/SceneTabs";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { CompareSlot } from "./CompareSlot";
import type { CompareState } from "./compareState";

interface CompareViewProps {
  state: CompareState;
  scene: SceneId;
  onSceneChange: (scene: SceneId) => void;
  onSwap: () => void;
  onClearCandidate: () => void;
  onExit: () => void;
}

function entryFor(themeId: string | null): CatalogThemeEntry | undefined {
  return themeId ? catalogThemes.find((candidate) => candidate.theme.id === themeId) : undefined;
}

function liveMessage(baseline?: CatalogThemeEntry, candidate?: CatalogThemeEntry): string {
  if (baseline && candidate) {
    return `Comparing ${baseline.theme.name} with ${candidate.theme.name}.`;
  }
  if (baseline) {
    return `${baseline.theme.name} is your baseline. Pick a theme to compare.`;
  }
  return "Pick a theme from the rail to start comparing.";
}

export function CompareView({
  state,
  scene,
  onSceneChange,
  onSwap,
  onClearCandidate,
  onExit,
}: CompareViewProps) {
  const baseline = entryFor(state.baseline);
  const candidate = entryFor(state.candidate);

  return (
    <div className="compare-view" data-scene={scene}>
      <header className="compare-view__bar">
        <button type="button" className="compare-view__back" onClick={onExit}>
          <ArrowLeft aria-hidden="true" />
          <span>Back to catalog</span>
          <kbd>Esc</kbd>
        </button>
        <p className="compare-view__status" role="status" aria-live="polite">
          {liveMessage(baseline, candidate)}
        </p>
      </header>
      <div className="compare-view__slots">
        <CompareSlot role="baseline" entry={baseline} scene={scene} />
        <button
          type="button"
          className="compare-view__swap"
          onClick={onSwap}
          disabled={state.candidate === null}
          aria-label="Swap baseline and candidate"
        >
          <ArrowLeftRight aria-hidden="true" />
        </button>
        <CompareSlot
          role="candidate"
          entry={candidate}
          scene={scene}
          onClear={onClearCandidate}
        />
      </div>
      <SceneTabs current={scene} onChange={onSceneChange} />
    </div>
  );
}
