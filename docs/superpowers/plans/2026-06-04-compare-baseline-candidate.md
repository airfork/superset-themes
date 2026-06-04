# Compare Baseline/Candidate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace compare mode's confusing "alternating slot" pin behavior with a predictable baseline-vs-candidate model: the left slot is the baseline (and drives the chrome), the right slot always receives new picks, and a swap control exchanges them.

**Architecture:** `CompareState` becomes `{ baseline: string; candidate: string | null }`. Picking always writes `candidate`; `swap` exchanges the two; the chrome follows `baseline`. The entire Undo/notice subsystem and the `lastPinned`/`enteredFromThemeId`/`unpin`/`restore` machinery are deleted. The route resolves a default baseline from the focused theme on a bare visit.

**Tech Stack:** React 19, TanStack Router, Vitest + Testing Library (jsdom), Playwright (e2e), Biome (lint/format).

**Design doc:** `docs/design/2026-06-04-compare-baseline-candidate.md`

**Conventions:**
- Use `pnpm` for all commands.
- Single-test runs: `pnpm vitest run <path> -t "<name>"` (vitest is available via the `test` script; `pnpm exec vitest` also works).
- Commit after every green step. Use the configured git author only — no AI attribution trailers.
- After all tasks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, then e2e.

**New accessible-name vocabulary (used across all tasks — keep consistent):**
- Baseline slot region: `Baseline: <theme name>`
- Candidate slot region (filled): `Comparing: <theme name>`
- Candidate slot region (empty): `Comparing slot, empty`
- Candidate clear button: `Remove <theme name> from comparison`
- Swap button: `Swap baseline and candidate`
- Status (both): `Comparing <baseline> with <candidate>.`
- Status (candidate empty): `<baseline> is your baseline. Pick a theme to compare.`

---

### Task 1: Rewrite the compare state reducer

**Files:**
- Modify: `src/compare/compareState.ts`
- Test: `src/compare/compareState.test.ts`

**Step 1: Replace the test file**

Replace the entire contents of `src/compare/compareState.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { type CompareState, compareReducer, INITIAL_COMPARE_STATE } from "./compareState";

function entered(themeId: string): CompareState {
  return compareReducer(INITIAL_COMPARE_STATE, { type: "enter", themeId });
}

describe("compareReducer", () => {
  it("enter sets the baseline and clears the candidate", () => {
    expect(entered("tokyo-night")).toEqual({ baseline: "tokyo-night", candidate: null });
  });

  it("pick always fills the candidate", () => {
    const state = compareReducer(entered("tokyo-night"), {
      type: "pick",
      themeId: "solarized-light",
    });
    expect(state).toEqual({ baseline: "tokyo-night", candidate: "solarized-light" });
  });

  it("a second pick replaces the candidate, never the baseline", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pick", themeId: "solarized-light" });
    state = compareReducer(state, { type: "pick", themeId: "rose-pine-dawn" });
    expect(state).toEqual({ baseline: "tokyo-night", candidate: "rose-pine-dawn" });
  });

  it("picking the current baseline is a no-op (no comparing a theme with itself)", () => {
    const base = entered("tokyo-night");
    expect(compareReducer(base, { type: "pick", themeId: "tokyo-night" })).toBe(base);
  });

  it("swap exchanges baseline and candidate", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pick", themeId: "solarized-light" });
    state = compareReducer(state, { type: "swap" });
    expect(state).toEqual({ baseline: "solarized-light", candidate: "tokyo-night" });
  });

  it("swap is reversible", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pick", themeId: "solarized-light" });
    const swapped = compareReducer(state, { type: "swap" });
    expect(compareReducer(swapped, { type: "swap" })).toEqual(state);
  });

  it("swap is a no-op when there is no candidate", () => {
    const base = entered("tokyo-night");
    expect(compareReducer(base, { type: "swap" })).toBe(base);
  });

  it("clear empties the candidate but keeps the baseline", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pick", themeId: "solarized-light" });
    state = compareReducer(state, { type: "clear" });
    expect(state).toEqual({ baseline: "tokyo-night", candidate: null });
  });

  it("exit returns to the clean initial state", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pick", themeId: "solarized-light" });
    expect(compareReducer(state, { type: "exit" })).toEqual(INITIAL_COMPARE_STATE);
  });

  it("does not mutate the previous state", () => {
    const base = entered("tokyo-night");
    const next = compareReducer(base, { type: "pick", themeId: "solarized-light" });
    expect(base).toEqual({ baseline: "tokyo-night", candidate: null });
    expect(next).not.toBe(base);
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/compare/compareState.test.ts`
Expected: FAIL — current reducer uses `a`/`b`/`lastPinned`; new actions `pick`/`swap`/`clear` don't exist.

**Step 3: Replace the implementation**

Replace the entire contents of `src/compare/compareState.ts` with:

```ts
export interface CompareState {
  // Left slot — also drives the chrome. There is always exactly one baseline.
  baseline: string;
  // Right slot — the "audition" slot. Every pick lands here.
  candidate: string | null;
}

export type CompareAction =
  | { type: "enter"; themeId: string }
  | { type: "pick"; themeId: string }
  | { type: "swap" }
  | { type: "clear" }
  | { type: "exit" };

// The empty baseline is a sentinel for "not yet resolved" — the route fills it
// from the focused theme on mount, so a real baseline always reaches the view.
export const INITIAL_COMPARE_STATE: CompareState = {
  baseline: "",
  candidate: null,
};

export function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case "enter":
      return { baseline: action.themeId, candidate: null };
    case "pick":
      // Picking the theme that is already the baseline would compare it with
      // itself — ignore it so the candidate stays meaningful.
      if (action.themeId === state.baseline) {
        return state;
      }
      return { ...state, candidate: action.themeId };
    case "swap":
      if (state.candidate === null) {
        return state;
      }
      return { baseline: state.candidate, candidate: state.baseline };
    case "clear":
      return { ...state, candidate: null };
    case "exit":
      return INITIAL_COMPARE_STATE;
  }
}
```

**Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/compare/compareState.test.ts`
Expected: PASS (all cases).

**Step 5: Commit**

```bash
git add src/compare/compareState.ts src/compare/compareState.test.ts
git commit -m "feat(compare): baseline/candidate state reducer"
```

---

### Task 2: Update the compare route search serialization

**Files:**
- Modify: `src/app/routes/compareRouteSearch.ts`
- Test: `src/app/routes/compareRouteSearch.test.ts` (create if absent; otherwise rewrite)

**Step 1: Write the failing test**

Create `src/app/routes/compareRouteSearch.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  compareStateToSearch,
  parseCompareRouteSearch,
  seedCompareState,
} from "./compareRouteSearch";

describe("compareRouteSearch", () => {
  it("seeds baseline and candidate from the search params", () => {
    const state = seedCompareState({ a: "tokyo-night", b: "solarized-light" }, "fallback");
    expect(state).toEqual({ baseline: "tokyo-night", candidate: "solarized-light" });
  });

  it("falls back to the provided baseline when no a param is present", () => {
    const state = seedCompareState({ b: "solarized-light" }, "aurora-dark");
    expect(state).toEqual({ baseline: "aurora-dark", candidate: "solarized-light" });
  });

  it("serializes state back to a/b/scene without a from param", () => {
    const search = compareStateToSearch(
      { baseline: "tokyo-night", candidate: "solarized-light" },
      "workspace",
    );
    expect(search).toEqual({ a: "tokyo-night", b: "solarized-light", scene: "workspace" });
  });

  it("omits an absent candidate from the serialized search", () => {
    const search = compareStateToSearch({ baseline: "tokyo-night", candidate: null }, "settings");
    expect(search).toEqual({ a: "tokyo-night", b: undefined, scene: "settings" });
  });

  it("parse ignores a stale from param and an invalid scene", () => {
    expect(parseCompareRouteSearch({ a: "x", b: "y", from: "z", scene: "nope" })).toEqual({
      a: "x",
      b: "y",
      scene: undefined,
    });
  });
});
```

**Step 2: Run to verify it fails**

Run: `pnpm vitest run src/app/routes/compareRouteSearch.test.ts`
Expected: FAIL — `seedCompareState` has the wrong arity/shape and still emits `from`.

**Step 3: Replace the implementation**

Replace the entire contents of `src/app/routes/compareRouteSearch.ts` with:

```ts
import type { CompareState } from "../../compare/compareState";
import type { SceneId } from "../../pane/SceneTabs";

export interface CompareRouteSearch {
  a?: string;
  b?: string;
  scene?: SceneId;
}

const SCENE_VALUES = new Set<SceneId>(["workspace", "settings"]);

function stringParam(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function parseCompareRouteSearch(search: Record<string, unknown>): CompareRouteSearch {
  return {
    a: stringParam(search.a),
    b: stringParam(search.b),
    scene:
      typeof search.scene === "string" && SCENE_VALUES.has(search.scene as SceneId)
        ? (search.scene as SceneId)
        : undefined,
  };
}

// `a` is the baseline (also the chrome theme); `b` is the candidate. A bare visit
// has no `a`, so the caller supplies the focused theme as the fallback baseline.
export function seedCompareState(
  search: CompareRouteSearch,
  fallbackBaseline: string,
): CompareState {
  return {
    baseline: search.a ?? fallbackBaseline,
    candidate: search.b ?? null,
  };
}

export function compareStateToSearch(state: CompareState, scene: SceneId): CompareRouteSearch {
  return {
    a: state.baseline || undefined,
    b: state.candidate ?? undefined,
    scene,
  };
}
```

**Step 4: Run to verify it passes**

Run: `pnpm vitest run src/app/routes/compareRouteSearch.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/routes/compareRouteSearch.ts src/app/routes/compareRouteSearch.test.ts
git commit -m "feat(compare): a/b search seeding with fallback baseline"
```

---

### Task 3: Rework the compare slot component

**Files:**
- Modify: `src/compare/CompareSlot.tsx`
- (Tests for the slot run via `CompareView.test.tsx` in Task 4.)

**Step 1: Replace the implementation**

Replace the entire contents of `src/compare/CompareSlot.tsx` with:

```tsx
import { X } from "lucide-react";
import type { CSSProperties } from "react";
import { Nameplate } from "../pane/Nameplate";
import type { SceneId } from "../pane/SceneTabs";
import { SettingsScene } from "../pane/SettingsScene";
import { WorkspaceScene } from "../pane/WorkspaceScene";
import { getThemeCssVars } from "../preview/themeCssVars";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

export type CompareRole = "baseline" | "candidate";

interface CompareSlotProps {
  role: CompareRole;
  entry?: CatalogThemeEntry;
  scene: SceneId;
  // Only the candidate can be cleared; the baseline is always present (it is also
  // the chrome theme), so it carries no clear control.
  onClear?: () => void;
}

function roleLabel(role: CompareRole): string {
  return role === "baseline" ? "Baseline" : "Comparing";
}

export function CompareSlot({ role, entry, scene, onClear }: CompareSlotProps) {
  const label = roleLabel(role);

  if (!entry) {
    // Only the candidate is ever empty.
    return (
      <section className="compare-slot compare-slot--empty" aria-label="Comparing slot, empty">
        <p className="compare-slot__placeholder">Pick a theme from the rail to compare.</p>
      </section>
    );
  }

  // The slot scopes its own --preview-* vars so its descendants render in this
  // theme while the surrounding chrome keeps reading :root (the baseline theme).
  const scopedVars = getThemeCssVars(entry.theme) as CSSProperties;

  return (
    <section
      className="compare-slot"
      aria-label={`${label}: ${entry.theme.name}`}
      style={scopedVars}
      data-theme-type={entry.theme.type}
      data-role={role}
    >
      <div className="compare-slot__chrome">
        <span className="compare-slot__eyebrow">{label}</span>
        {role === "candidate" && onClear ? (
          <button
            type="button"
            className="compare-slot__unpin"
            onClick={onClear}
            aria-label={`Remove ${entry.theme.name} from comparison`}
          >
            <X aria-hidden="true" />
            <span>Clear</span>
          </button>
        ) : null}
      </div>
      <Nameplate entry={entry} compact />
      <div className="compare-slot__body">
        {scene === "workspace" ? <WorkspaceScene entry={entry} /> : <SettingsScene entry={entry} />}
      </div>
    </section>
  );
}
```

**Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: FAIL only in `CompareView.tsx` (it still imports the old slot API) — that is fixed in Task 4. No errors *inside* `CompareSlot.tsx`.

**Step 3: Commit**

```bash
git add src/compare/CompareSlot.tsx
git commit -m "feat(compare): baseline/candidate slot roles, candidate-only clear"
```

---

### Task 4: Rewrite the compare view (strip Undo, add swap)

**Files:**
- Modify: `src/compare/CompareView.tsx`
- Test: `src/compare/CompareView.test.tsx`

**Step 1: Replace the test file**

Replace the entire contents of `src/compare/CompareView.test.tsx` with:

```tsx
// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { SceneId } from "../pane/SceneTabs";
import { CompareView } from "./CompareView";
import { type CompareState, compareReducer } from "./compareState";

function Harness({
  initial,
  onExit,
}: {
  initial: CompareState;
  onExit?: () => void;
}) {
  const [state, setState] = useState(initial);
  const [scene, setScene] = useState<SceneId>("workspace");
  return (
    <CompareView
      state={state}
      scene={scene}
      onSceneChange={setScene}
      onSwap={() => setState((current) => compareReducer(current, { type: "swap" }))}
      onClearCandidate={() => setState((current) => compareReducer(current, { type: "clear" }))}
      onExit={onExit ?? (() => {})}
    />
  );
}

describe("CompareView", () => {
  it("renders the baseline and candidate in side-by-side slots", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    expect(screen.getByRole("region", { name: /baseline: tokyo night/i })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /comparing: solarized light/i }),
    ).toBeInTheDocument();
  });

  it("shows an empty placeholder for the candidate before a theme is picked", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: null }} />);

    expect(screen.getByRole("region", { name: /comparing slot, empty/i })).toHaveTextContent(
      /pick a theme/i,
    );
  });

  it("syncs the scene across both slots", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    await user.click(screen.getByRole("tab", { name: /settings/i }));

    const baseline = screen.getByRole("region", { name: /baseline/i });
    const candidate = screen.getByRole("region", { name: /comparing:/i });
    expect(within(baseline).getByRole("textbox", { name: /display name/i })).toBeInTheDocument();
    expect(within(candidate).getByRole("textbox", { name: /display name/i })).toBeInTheDocument();
  });

  it("announces the active comparison through a polite live region", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/comparing tokyo night with solarized light/i);
  });

  it("prompts to pick a candidate when only the baseline is set", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: null }} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/tokyo night is your baseline/i);
    expect(status).toHaveTextContent(/pick a theme to compare/i);
    expect(status).not.toHaveClass("sr-only");
  });

  it("renders a visible Back to catalog control that exits compare mode", async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<Harness initial={{ baseline: "tokyo-night", candidate: null }} onExit={onExit} />);

    await user.click(screen.getByRole("button", { name: /back to catalog/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("offers a clear control on the candidate only, not the baseline", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    const baseline = screen.getByRole("region", { name: /baseline: tokyo night/i });
    expect(
      within(baseline).queryByRole("button", { name: /remove .* from comparison/i }),
    ).not.toBeInTheDocument();

    const candidate = screen.getByRole("region", { name: /comparing: solarized light/i });
    expect(
      within(candidate).getByRole("button", { name: /remove solarized light from comparison/i }),
    ).toBeInTheDocument();
  });

  it("clears the candidate back to the empty placeholder", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    await user.click(
      screen.getByRole("button", { name: /remove solarized light from comparison/i }),
    );

    expect(screen.getByRole("region", { name: /comparing slot, empty/i })).toBeInTheDocument();
  });

  it("swaps the baseline and candidate via the swap control", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    await user.click(screen.getByRole("button", { name: /swap baseline and candidate/i }));

    expect(
      screen.getByRole("region", { name: /baseline: solarized light/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /comparing: tokyo night/i })).toBeInTheDocument();
  });

  it("disables the swap control when there is no candidate", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: null }} />);

    expect(screen.getByRole("button", { name: /swap baseline and candidate/i })).toBeDisabled();
  });
});
```

**Step 2: Run to verify it fails**

Run: `pnpm vitest run src/compare/CompareView.test.tsx`
Expected: FAIL — `CompareView` still exports `UNDO_TIMEOUT_MS` and uses the old prop API.

**Step 3: Replace the implementation**

Replace the entire contents of `src/compare/CompareView.tsx` with:

```tsx
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
```

**Step 4: Run to verify it passes**

Run: `pnpm vitest run src/compare/CompareView.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/compare/CompareView.tsx src/compare/CompareView.test.tsx
git commit -m "feat(compare): swap control, drop Undo subsystem"
```

---

### Task 5: Wire the compare route to the new model

**Files:**
- Modify: `src/app/routes/compareRoute.tsx`

**Step 1: Replace the route view body**

Replace the entire contents of `src/app/routes/compareRoute.tsx` with:

```tsx
import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { BottomBar } from "../../chrome/BottomBar";
import { LayoutShell } from "../../chrome/LayoutShell";
import { CompareView } from "../../compare/CompareView";
import { type CompareState, compareReducer } from "../../compare/compareState";
import { catalogThemes } from "../../data/catalog";
import { buildThemeCommands, type PaletteCommand } from "../../palette/commands";
import { usePalette } from "../../palette/usePalette";
import type { SceneId } from "../../pane/SceneTabs";
import { Rail } from "../../rail/Rail";
import { useFocusedTheme } from "../../theme/useFocusedTheme";
import {
  type CompareRouteSearch,
  compareStateToSearch,
  seedCompareState,
} from "./compareRouteSearch";

function entryFor(themeId: string | null) {
  return themeId ? catalogThemes.find((candidate) => candidate.theme.id === themeId) : undefined;
}

export interface CompareRouteViewProps {
  search: CompareRouteSearch;
  onChangeSearch: (search: CompareRouteSearch) => void;
  onExit: (themeId: string) => void;
  onOpenLab: (themeId: string) => void;
}

export function CompareRouteView({
  search,
  onChangeSearch,
  onExit,
  onOpenLab,
}: CompareRouteViewProps) {
  const { focused, setFocusedId } = useFocusedTheme();
  // Resolve the baseline once: a bare /compare visit has no `a`, so fall back to
  // the first-paint focused theme.
  const [state, setState] = useState<CompareState>(() =>
    seedCompareState(search, focused.theme.id),
  );
  const [scene, setScene] = useState<SceneId>(search.scene ?? "workspace");
  // Mirror of the rail's filter so ⌘K can seed itself with whatever's typed there.
  const [railFilter, setRailFilter] = useState("");

  // The chrome reads :root, which the provider sets to the baseline theme.
  const baselineId = state.baseline;
  useEffect(() => {
    if (baselineId && baselineId !== focused.theme.id) {
      setFocusedId(baselineId);
    }
  }, [baselineId, focused.theme.id, setFocusedId]);

  const commit = (next: CompareState) => {
    setState(next);
    onChangeSearch(compareStateToSearch(next, scene));
  };

  const pick = (themeId: string) => commit(compareReducer(state, { type: "pick", themeId }));
  const swap = () => commit(compareReducer(state, { type: "swap" }));
  const clearCandidate = () => commit(compareReducer(state, { type: "clear" }));

  // Esc exits compare mode back to the catalog at the current baseline.
  const exitRef = useRef(() => onExit(baselineId));
  exitRef.current = () => onExit(baselineId);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        exitRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const changeScene = (next: SceneId) => {
    setScene(next);
    onChangeSearch(compareStateToSearch(state, next));
  };

  // The baseline reads as the current theme; the candidate carries the pin marker.
  const pinnedThemeIds = useMemo(
    () => new Set([state.candidate].filter((id): id is string => id !== null)),
    [state.candidate],
  );

  const hint =
    state.candidate === null ? "Compare mode: click any theme to set the candidate." : undefined;

  const commands: PaletteCommand[] = [
    ...buildThemeCommands(pick),
    {
      id: "action-swap-slots",
      label: "Swap slots",
      section: "Actions",
      keys: ["swap slots", "swap", "exchange"],
      run: swap,
    },
    {
      id: "action-open-in-lab",
      label: "Open in Lab",
      section: "Actions",
      keys: ["open in lab", "lab", "editor"],
      run: () => onOpenLab(baselineId),
    },
    {
      id: "action-exit-compare",
      label: "Exit compare",
      section: "Actions",
      keys: ["exit compare", "close", "back"],
      run: () => onExit(baselineId),
    },
  ];
  const palette = usePalette(commands, { seedQuery: railFilter });

  return (
    <LayoutShell
      onOpenPalette={palette.open}
      palette={palette.paletteProps}
      bottomBar={
        <BottomBar
          variant="compare"
          baseline={entryFor(state.baseline)}
          candidate={entryFor(state.candidate)}
        />
      }
      rail={
        <Rail
          focusedThemeId={baselineId}
          pinnedThemeIds={pinnedThemeIds}
          hint={hint}
          onSelect={pick}
          onFilterChange={setRailFilter}
        />
      }
      pane={
        <CompareView
          state={state}
          scene={scene}
          onSceneChange={changeScene}
          onSwap={swap}
          onClearCandidate={clearCandidate}
          onExit={() => onExit(baselineId)}
        />
      }
    />
  );
}

export type { CompareRouteSearch } from "./compareRouteSearch";
export {
  compareStateToSearch,
  parseCompareRouteSearch,
  seedCompareState,
} from "./compareRouteSearch";
```

**Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: FAIL only in `BottomBar.tsx` usage (compare variant props) and `router.tsx` (entry navigates pass `from`) and `commands.ts` if `nextThemeId` becomes unused — all fixed in Tasks 6–8. No errors inside `compareRoute.tsx` itself once those land. (Order: continue to Task 6–8 before re-running typecheck.)

**Step 3: Commit**

```bash
git add src/app/routes/compareRoute.tsx
git commit -m "feat(compare): wire route to pick/swap/clear with baseline chrome"
```

---

### Task 6: Update compare entry points in the router

**Files:**
- Modify: `src/app/router.tsx` (lines ~77, ~153, ~191 — the three `navigate({ to: "/compare", ... })` calls)

**Step 1: Drop the `from` param from all three entry navigations**

Change each occurrence of:

```ts
search: { a: id, from: id }
```
to:
```ts
search: { a: id }
```

And the ⌘K command at ~line 153:
```ts
run: () => void navigate({ to: "/compare", search: { a: focusedId, from: focusedId } }),
```
to:
```ts
run: () => void navigate({ to: "/compare", search: { a: focusedId } }),
```

And the rail/select path at ~line 191:
```ts
void navigate({ to: "/compare", search: { a: themeId, from: themeId } });
```
to:
```ts
void navigate({ to: "/compare", search: { a: themeId } });
```

Also update the comment at ~line 73 ("...as slot a and entry-state.") to read "...as the baseline." Leave the rest of the handler untouched.

**Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: remaining failures only in `BottomBar.tsx` (Task 7) and possibly `commands.ts` unused export (Task 8).

**Step 3: Commit**

```bash
git add src/app/router.tsx
git commit -m "feat(compare): enter compare with baseline-only search param"
```

---

### Task 7: Update the BottomBar compare variant

**Files:**
- Modify: `src/chrome/BottomBar.tsx`

**Step 1: Rename the compare variant props and labels**

In `src/chrome/BottomBar.tsx`:

1. Change the `CompareBottomBarProps` interface:
```ts
interface CompareBottomBarProps {
  variant: "compare";
  baseline?: CatalogThemeEntry;
  candidate?: CatalogThemeEntry;
}
```

2. Update the dispatch in `BottomBar`:
```ts
  if (props.variant === "compare") {
    return <CompareBottomBar baseline={props.baseline} candidate={props.candidate} />;
  }
```

3. Replace `CompareSlotFact` and `CompareBottomBar`:
```tsx
function CompareSlotFact({ label, entry }: { label: string; entry?: CatalogThemeEntry }) {
  return (
    <span className="chrome-bottombar__slot">
      <span className="chrome-bottombar__slot-label" aria-hidden="true">
        {label}
      </span>
      {entry ? (
        <>
          <span className="chrome-bottombar__name">{entry.theme.name}</span>
          <span className="chrome-bottombar__contrast">{formatContrast(entry.theme)}</span>
        </>
      ) : (
        <span className="chrome-bottombar__empty">empty</span>
      )}
    </span>
  );
}

function CompareBottomBar({
  baseline,
  candidate,
}: {
  baseline?: CatalogThemeEntry;
  candidate?: CatalogThemeEntry;
}) {
  return (
    <footer className="chrome-bottombar">
      <div className="chrome-bottombar__facts">
        <CompareSlotFact label="Baseline" entry={baseline} />
        <Sep />
        <CompareSlotFact label="Comparing" entry={candidate} />
      </div>
      <div className="chrome-bottombar__hints">
        <KeyHint keyLabel="⌘K" />
        <Sep />
        <KeyHint keyLabel="Esc" action="exit" />
      </div>
    </footer>
  );
}
```

**Step 2: Check for a BottomBar test**

Run: `pnpm vitest run src/chrome/BottomBar.test.tsx`
Expected: it may reference slot "A"/"B" text. If it fails, update those assertions to "Baseline"/"Comparing" and pass `baseline=`/`candidate=` props. Re-run to PASS.

**Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: PASS, unless `nextThemeId` in `commands.ts` is now unused (Task 8).

**Step 4: Commit**

```bash
git add src/chrome/BottomBar.tsx src/chrome/BottomBar.test.tsx
git commit -m "feat(compare): bottom bar baseline/candidate labels"
```

---

### Task 8: Remove the dead "next theme" command helper

**Files:**
- Modify: `src/palette/commands.ts`
- Modify: `src/palette/commands.test.ts` (if it tests `nextThemeId`)

**Step 1: Check usages**

Run: `git grep -n "nextThemeId"`
Expected: now only `commands.ts` (definition) and possibly `commands.test.ts`. The compareRoute no longer imports it.

**Step 2: Delete `nextThemeId`**

Remove the `nextThemeId` function (lines ~55-60) and the now-unused `catalogThemes` import if nothing else in the file uses it (verify with `git grep -n "catalogThemes" src/palette/commands.ts`). If `commands.test.ts` has a `nextThemeId` test block, delete that block.

**Step 3: Run the palette command tests**

Run: `pnpm vitest run src/palette/commands.test.ts`
Expected: PASS.

**Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: PASS across the project.

**Step 5: Commit**

```bash
git add src/palette/commands.ts src/palette/commands.test.ts
git commit -m "chore(compare): drop unused next-theme command helper"
```

---

### Task 9: Restyle the compare CSS (swap button, labels, remove Undo/attention)

**Files:**
- Modify: `src/styles/compare.css`

**Step 1: Delete the Undo and attention styling**

Remove these blocks entirely:
- `.compare-view__status-sep` (no longer rendered)
- `.compare-view__undo` and its `:hover` / `:focus-visible` rules
- `@keyframes compare-undo-attention`
- `.compare-slot[data-attention="true"]` and `@keyframes compare-slot-attention` (both the base and the `prefers-reduced-motion` override)

**Step 2: Add the swap button styling**

The slots grid currently is two columns. The swap button sits on the seam. Update `.compare-view__slots` to keep two equal columns and overlay the swap button on the divider. Add:

```css
.compare-view__slots {
  position: relative;
}

/* Circular control on the seam between the two slots. Styled from --chrome-*
   tokens (it straddles two themed panels, so it must not read as belonging to
   either). Absolutely centered on the divider; pointer-events stay on the button
   only so it never blocks slot scrolling. */
.compare-view__swap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--chrome-border, var(--preview-ui-border));
  border-radius: 999px;
  background: var(--chrome-surface);
  color: var(--chrome-muted-foreground);
  cursor: pointer;
  touch-action: manipulation;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.18);
  transition: color 120ms ease, border-color 120ms ease;
}

.compare-view__swap svg {
  width: 16px;
  height: 16px;
}

.compare-view__swap:hover:not(:disabled) {
  color: var(--chrome-foreground, var(--preview-ui-foreground));
  border-color: color-mix(in srgb, currentColor 40%, transparent);
}

.compare-view__swap:focus-visible {
  outline: 2px solid var(--preview-focus-ring);
  outline-offset: 2px;
}

.compare-view__swap:disabled {
  opacity: 0.4;
  cursor: default;
}

@media (max-width: 640px) {
  /* Stacked layout: move the control to the horizontal divider. */
  .compare-view__swap {
    top: 50%;
    left: 50%;
  }
}
```

> Note: confirm the exact chrome token names against `src/theme-core/chromeTokens.ts` / `src/styles/*.css` while implementing — use whatever the existing chrome surfaces use (e.g. `--chrome-surface`, `--chrome-foreground`, `--chrome-muted-foreground`, `--chrome-border`). Adjust the fallbacks above to match real tokens; do not invent ones that don't exist.

**Step 3: Verify the candidate transition (gentle, not hard-cut)**

The candidate panel swaps theme on a pick. Confirm `.compare-slot` keeps the entry animation feel; if there's a hard cut, add a short `transition` on `background`/`color` to `.compare-slot`. Keep it subtle and respect `prefers-reduced-motion`.

**Step 4: Visual smoke check**

Run: `pnpm dev`, open `/compare`, confirm: swap button is a styled circle on the seam, disabled (dimmed) until a candidate is picked, and there is no leftover unstyled Undo link. (See Task 11 for the scripted e2e.)

**Step 5: Commit**

```bash
git add src/styles/compare.css
git commit -m "style(compare): swap button, remove Undo/attention styling"
```

---

### Task 10: Update the cross-cutting tests (App + e2e + stories)

**Files:**
- Modify: `src/app/App.test.tsx`
- Modify: `e2e/compare.spec.ts`
- Check: `src/pane/*.stories.tsx`, `src/compare/*` story usages, `e2e/catalog.spec.ts`, `e2e/shell.spec.ts`

**Step 1: Update `App.test.tsx`**

The deep-link case at ~line 45 uses `?a=aurora-light&b=aurora-dark&from=graphite-dark&scene=workspace` and asserts `compare slot a: aurora light` / `compare slot b: aurora dark`. Update to:
- URL: `/compare?a=aurora-light&b=aurora-dark&scene=workspace` (drop `from`).
- Assertions: `region` named `/baseline: aurora light/i` and `/comparing: aurora dark/i`.
- The chrome now themes to the baseline (aurora-light), not graphite-dark — if the test asserts a chrome theme, update it accordingly.

Run: `pnpm vitest run src/app/App.test.tsx` → PASS.

**Step 2: Update `e2e/compare.spec.ts`**

Rework to the new model. Key changes:
- `ENTRY_URL = "/compare?a=tokyo-night&b=solarized-light"` (drop `from`).
- Slot locators: `getByRole("region", { name: /baseline: tokyo night/i })` and `/comparing: solarized light/i`.
- Empty candidate: `/comparing slot, empty/i`.
- Replace any "third pin replaces a slot / Undo" flow with: picking a rail theme always updates the **candidate** (baseline unchanged); a `Swap baseline and candidate` button exchanges them; `Clear`/the candidate remove button empties the candidate.
- Exit returns to the catalog at the **baseline** theme.

Add an explicit assertion of the fix: with both slots full, click several different rail rows in sequence and assert the **baseline region never changes** while the candidate region updates each time.

Run: `pnpm test:e2e -- compare` (or `pnpm exec playwright test e2e/compare.spec.ts`). Install browsers first if needed: `pnpm browsers:install`.

**Step 3: Update any other specs/stories that reference old names**

Run: `git grep -nE "compare slot [ab]|lastPinned|enteredFromThemeId|REPLACED_UNDO|UNDO_TIMEOUT|data-attention|Undo"` across `src/` and `e2e/`.
Fix every remaining hit (stories, catalog/shell specs). There should be zero matches when done (the design intentionally removes all of these).

**Step 4: Commit**

```bash
git add -A
git commit -m "test(compare): update app/e2e/story coverage to baseline-candidate"
```

---

### Task 11: Full verification

**Step 1: Lint, typecheck, unit tests**

Run, in order:
- `pnpm lint` → no errors (run `pnpm format` if formatting drifts, then re-lint).
- `pnpm typecheck` → clean.
- `pnpm test` → all unit tests green.

**Step 2: Story tests (if affected)**

Run: `pnpm test:stories` → green (compare/pane stories).

**Step 3: E2E**

Run: `pnpm browsers:install` (once), then `pnpm test:e2e` → green.

**Step 4: Manual smoke (`@superpowers:verification-before-completion`)**

`pnpm dev`, then in `/compare`:
1. Enter compare from a theme → baseline fills left, chrome matches it, candidate empty + swap disabled.
2. Click several rail themes in a row → **only the right (candidate) ever changes.** This is the core fix; confirm it explicitly.
3. Swap → left/right exchange, chrome re-themes to the new baseline; swap again → back to start.
4. Clear the candidate → right returns to the placeholder, swap disables.
5. Esc / Back → returns to catalog at the current baseline.
6. No unstyled Undo link anywhere; swap button is a styled circle.

**Step 5: Final commit (if any verification fixups)**

```bash
git add -A
git commit -m "chore(compare): verification fixups"
```

---

## Notes for the implementer

- **DRY:** `liveMessage` and `entryFor` already exist; reuse, don't duplicate.
- **YAGNI:** Do not add an Undo for swap/clear — swap is self-reversing and clear is trivially redoable by re-picking. That restraint is the whole point of the redesign.
- **Token discipline:** the swap button lives in chrome context — use `--chrome-*` tokens only, never `--preview-*` (the original Undo bug was exactly this leak).
- **Accessible names are contract:** many tests key off the region/button names in the vocabulary table at the top. Keep them identical across component, App test, and e2e.
```
