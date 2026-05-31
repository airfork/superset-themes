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

// A replacement never steals focus onto Undo (that would interrupt rapid pinning),
// so a keyboard/SR user has to navigate to it from the pin source. Its window runs
// longer than a clear's — which auto-focuses Undo and so needs no travel time.
export const REPLACED_UNDO_TIMEOUT_MS = 9000;

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
  // The auto-dismiss is held while the user is engaging with the recovery, so the
  // one Undo affordance can't vanish out from under them. Focus is tracked at the
  // whole header, not just Undo: a replacement never steals focus onto Undo, so a
  // keyboard user tabs in via "Back"; pausing the moment they reach the header lets
  // them finish the short hop to Undo without racing the clock. Hover stays on Undo
  // itself, and the two are tracked apart so releasing one keeps the other's hold.
  const [headerFocused, setHeaderFocused] = useState(false);
  const [undoHovered, setUndoHovered] = useState(false);
  const holdingUndo = headerFocused || undoHovered;
  // A replacement never auto-focuses Undo, so a keyboard/SR user tabs to it from an
  // out-of-header pin source. The header-focus hold only fires once they arrive, so
  // the whole journey races the clock. Each Tab bumps this tick to restart the
  // countdown, keeping the recovery reachable while they navigate; once tabbing goes
  // idle for a full window, it dismisses.
  const [navTick, setNavTick] = useState(0);
  const undoRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Track focus-within the header with native bubbling focusin/focusout (focus/blur
  // don't bubble), releasing the hold only when focus leaves the header entirely.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }
    const onFocusIn = () => setHeaderFocused(true);
    const onFocusOut = (event: FocusEvent) => {
      if (!header.contains(event.relatedTarget as Node | null)) {
        setHeaderFocused(false);
      }
    };
    header.addEventListener("focusin", onFocusIn);
    header.addEventListener("focusout", onFocusOut);
    return () => {
      header.removeEventListener("focusin", onFocusIn);
      header.removeEventListener("focusout", onFocusOut);
    };
  }, []);

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

  // Only a replacement needs the travel-time grace: its Undo isn't auto-focused, so
  // the user tabs in from outside the header. A clear auto-focuses Undo (handled by
  // the header-focus hold), so we leave its blur-to-dismiss behavior untouched.
  useEffect(() => {
    if (!notice || notice.kind !== "replaced") {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        setNavTick((tick) => tick + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [notice]);

  useEffect(() => {
    if (!notice) {
      setHeaderFocused(false);
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

  // The dismiss countdown. navTick is an intentional extra dependency, not read in the
  // body: each Tab bumps it to restart the timer so an actively-navigating keyboard/SR
  // user keeps the recovery within reach, and the window only elapses once tabbing has
  // been idle for its full duration.
  // biome-ignore lint/correctness/useExhaustiveDependencies: navTick is a deliberate re-trigger, not read in the effect body.
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
    const timeout = notice.kind === "replaced" ? REPLACED_UNDO_TIMEOUT_MS : UNDO_TIMEOUT_MS;
    const id = window.setTimeout(() => setNotice(null), timeout);
    return () => window.clearTimeout(id);
  }, [notice, state, holdingUndo, navTick]);

  const noticeName = notice ? (entryFor(notice.themeId)?.theme.name ?? notice.themeId) : null;

  return (
    <div className="compare-view" data-scene={scene}>
      <header className="compare-view__bar" ref={headerRef}>
        <button type="button" className="compare-view__back" onClick={onExit}>
          <ArrowLeft aria-hidden="true" />
          <span>Back to catalog</span>
          <kbd>Esc</kbd>
        </button>
        <p className="compare-view__status" role="status" aria-live="polite">
          {notice ? (
            <>
              {notice.kind === "replaced" ? (
                <>
                  {noticeName} replaced in Slot {notice.slot === "a" ? "A" : "B"}
                </>
              ) : (
                <>Slot {notice.slot === "a" ? "A" : "B"} cleared</>
              )}
              <span className="compare-view__status-sep" aria-hidden="true">
                ·
              </span>
              <button
                ref={undoRef}
                type="button"
                className="compare-view__undo"
                aria-label={`Undo, restore ${noticeName} to slot ${notice.slot === "a" ? "A" : "B"}`}
                onClick={() => onRestore(notice.slot, notice.themeId)}
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
