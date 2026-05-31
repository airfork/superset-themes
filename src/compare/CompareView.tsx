import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { catalogThemes } from "../data/catalog";
import { type SceneId, SceneTabs } from "../pane/SceneTabs";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { CompareSlot } from "./CompareSlot";
import type { CompareSlotId, CompareState } from "./compareState";

// How long the "Slot X cleared · Undo" notice lingers before reverting to the
// live comparison status, giving a misclick a short window to be recovered.
export const UNDO_TIMEOUT_MS = 6000;

interface CompareViewProps {
  state: CompareState;
  scene: SceneId;
  onSceneChange: (scene: SceneId) => void;
  onUnpin: (slot: CompareSlotId) => void;
  onPin: (themeId: string) => void;
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

export function CompareView({
  state,
  scene,
  onSceneChange,
  onUnpin,
  onPin,
  onExit,
}: CompareViewProps) {
  const a = entryFor(state.a);
  const b = entryFor(state.b);

  // Remember the just-cleared slot so the status line can offer an Undo. The
  // notice clears itself once the slot is refilled (by Undo or a fresh pin) or
  // after a short timeout.
  const [cleared, setCleared] = useState<{ slot: CompareSlotId; themeId: string } | null>(null);
  // The auto-dismiss is held while the user is on the Undo control, so the one
  // recovery affordance can't vanish out from under them. Hover and focus are
  // tracked apart so leaving one doesn't release the hold the other still has.
  const [undoFocused, setUndoFocused] = useState(false);
  const [undoHovered, setUndoHovered] = useState(false);
  const holdingUndo = undoFocused || undoHovered;
  const undoRef = useRef<HTMLButtonElement>(null);

  const handleUnpin = (slot: CompareSlotId) => {
    const themeId = state[slot];
    if (themeId) {
      setCleared({ slot, themeId });
    }
    onUnpin(slot);
  };

  // Land focus on Undo when a slot clears so keyboard/SR users reach the
  // recovery instead of dropping to <body>. Reset the hold when it dismisses.
  useEffect(() => {
    if (cleared) {
      undoRef.current?.focus();
    } else {
      setUndoFocused(false);
      setUndoHovered(false);
    }
  }, [cleared]);

  useEffect(() => {
    if (!cleared) {
      return;
    }
    // The slot was refilled, so the recovery notice is stale.
    if (state[cleared.slot] !== null) {
      setCleared(null);
      return;
    }
    // Don't run down the clock while the user is reaching for Undo.
    if (holdingUndo) {
      return;
    }
    const id = window.setTimeout(() => setCleared(null), UNDO_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [cleared, state, holdingUndo]);

  const clearedName = cleared ? (entryFor(cleared.themeId)?.theme.name ?? cleared.themeId) : null;

  return (
    <div className="compare-view" data-scene={scene}>
      <header className="compare-view__bar">
        <button type="button" className="compare-view__back" onClick={onExit}>
          <ArrowLeft aria-hidden="true" />
          <span>Back to catalog</span>
          <kbd>Esc</kbd>
        </button>
        <p className="compare-view__status" role="status" aria-live="polite">
          {cleared ? (
            <>
              Slot {cleared.slot === "a" ? "A" : "B"} cleared
              <span className="compare-view__status-sep" aria-hidden="true">
                ·
              </span>
              <button
                ref={undoRef}
                type="button"
                className="compare-view__undo"
                aria-label={`Undo, restore ${clearedName} to slot ${cleared.slot === "a" ? "A" : "B"}`}
                onClick={() => onPin(cleared.themeId)}
                onFocus={() => setUndoFocused(true)}
                onBlur={() => setUndoFocused(false)}
                onMouseEnter={() => setUndoHovered(true)}
                onMouseLeave={() => setUndoHovered(false)}
              >
                Undo
              </button>
            </>
          ) : (
            liveMessage(a, b)
          )}
        </p>
      </header>
      <div className="compare-view__slots">
        <CompareSlot slot="a" entry={a} scene={scene} onUnpin={handleUnpin} />
        <CompareSlot slot="b" entry={b} scene={scene} onUnpin={handleUnpin} />
      </div>
      <SceneTabs current={scene} onChange={onSceneChange} />
    </div>
  );
}
