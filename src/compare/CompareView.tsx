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
  onRestore: (slot: CompareSlotId, themeId: string) => void;
  onExit: () => void;
}

// A slot lost the theme it was showing and the user might want it back. "cleared"
// comes from an explicit unpin (slot now empty); "replaced" comes from a third pin
// bumping the least-recent slot (slot now holds the newcomer). Either way `themeId`
// is the outgoing theme, and Undo restores it to `slot`.
type CompareNotice = { kind: "cleared" | "replaced"; slot: CompareSlotId; themeId: string };

const SLOTS = ["a", "b"] as const;

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
  onRestore,
  onExit,
}: CompareViewProps) {
  const a = entryFor(state.a);
  const b = entryFor(state.b);

  // Remember the slot that just lost its theme so the status line can offer an
  // Undo. The notice clears itself once recovered or after a short timeout.
  const [notice, setNotice] = useState<CompareNotice | null>(null);
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
      setNotice({ kind: "cleared", slot, themeId });
    }
    onUnpin(slot);
  };

  // A pin from outside this view (rail row, ⌘K command) can bump the least-recent
  // slot. We never see that pin, only the resulting state, so detect the swap by
  // diffing: a slot trading one pinned theme for a different one means the outgoing
  // theme vanished silently and deserves an Undo.
  const prevStateRef = useRef(state);
  useEffect(() => {
    const prev = prevStateRef.current;
    if (prev === state) {
      return;
    }
    prevStateRef.current = state;
    for (const slot of SLOTS) {
      const before = prev[slot];
      const after = state[slot];
      if (before && after && before !== after) {
        // When Undo lands the displaced theme back in its slot, that same diff fires;
        // treat the recovery completing as a dismissal rather than a fresh notice.
        setNotice((current) =>
          current && current.slot === slot && after === current.themeId
            ? null
            : { kind: "replaced", slot, themeId: before },
        );
      }
    }
  }, [state]);

  useEffect(() => {
    if (!notice) {
      setUndoFocused(false);
      setUndoHovered(false);
      return;
    }
    // An unpin destroys its trigger, so land focus on Undo or it falls to <body>.
    // A replacement leaves its trigger (rail row / ⌘K) in place; the notice is still
    // announced politely, but stealing focus there would interrupt rapid pinning.
    if (notice.kind === "cleared") {
      undoRef.current?.focus();
    }
  }, [notice]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    // An unpinned slot that has been refilled (by Undo or a fresh pin) is stale.
    // A "replaced" slot is never empty, so it dismisses only on timeout/recovery.
    if (notice.kind === "cleared" && state[notice.slot] !== null) {
      setNotice(null);
      return;
    }
    // Don't run down the clock while the user is reaching for Undo.
    if (holdingUndo) {
      return;
    }
    const id = window.setTimeout(() => setNotice(null), UNDO_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [notice, state, holdingUndo]);

  const noticeName = notice ? (entryFor(notice.themeId)?.theme.name ?? notice.themeId) : null;

  return (
    <div className="compare-view" data-scene={scene}>
      <header className="compare-view__bar">
        <button type="button" className="compare-view__back" onClick={onExit}>
          <ArrowLeft aria-hidden="true" />
          <span>Back to catalog</span>
          <kbd>Esc</kbd>
        </button>
        <p className="compare-view__status" role="status" aria-live="polite">
          {notice ? (
            <>
              Slot {notice.slot === "a" ? "A" : "B"}{" "}
              {notice.kind === "replaced" ? "replaced" : "cleared"}
              <span className="compare-view__status-sep" aria-hidden="true">
                ·
              </span>
              <button
                ref={undoRef}
                type="button"
                className="compare-view__undo"
                aria-label={`Undo, restore ${noticeName} to slot ${notice.slot === "a" ? "A" : "B"}`}
                onClick={() => onRestore(notice.slot, notice.themeId)}
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
        <CompareSlot
          slot="a"
          entry={a}
          scene={scene}
          onUnpin={handleUnpin}
          attention={notice?.kind === "replaced" && notice.slot === "a"}
        />
        <CompareSlot
          slot="b"
          entry={b}
          scene={scene}
          onUnpin={handleUnpin}
          attention={notice?.kind === "replaced" && notice.slot === "b"}
        />
      </div>
      <SceneTabs current={scene} onChange={onSceneChange} />
    </div>
  );
}
