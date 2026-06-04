# Compare mode: baseline vs. candidate

**Date:** 2026-06-04
**Status:** Designed, pending implementation

## Problem

Compare mode's "pin to compare" interaction is confusing and inconsistent. Three
distinct problems are tangled together:

1. **The replacement lottery.** Clicking any rail row in compare mode calls
   `pin()`. When both slots are full, the reducer replaces "whichever slot was
   *not* pinned most recently" (`compareState.ts:40-45`). This makes the target
   slot alternate A, B, A, B… on every click. With nothing on screen indicating
   which side is "next," it reads as random — the user's "sometimes left,
   sometimes right, completely inconsistent" complaint.

2. **Three themes on one screen.** The chrome (rail, top bar) stays pinned to
   `enteredFromThemeId`, while slots A and B hold two *other* themes. So three
   themes render at once and the chrome never matches either thing being
   compared.

3. **The unstyled Undo button.** Undo lives in the header (scoped to `--chrome-*`
   tokens) but is colored with `--preview-*` tokens, which only exist inside
   `.compare-slot`. The vars resolve to nothing, so the button falls back to
   default browser link styling — "looks like unstyled HTML."

## Decision

Adopt a **baseline vs. candidate** model.

- **Left slot = baseline.** Also drives the chrome. There is always exactly one
  baseline.
- **Right slot = candidate.** The "audition" slot. Picking *any* theme always
  replaces the candidate. This is the entire fix for problem #1 — picks are
  predictable and local.
- **Chrome follows the baseline.** Only ever two themes on screen (baseline =
  chrome + left; candidate = right). Fixes problem #2.
- **Swap (⇄).** A control on the seam between the slots exchanges baseline and
  candidate; the chrome re-themes to the new baseline. Reversible — click twice
  to return. This recovers the flexibility of comparing two themes neither of
  which is the original "current" theme, by letting the user "walk" comparisons.
- **No Undo.** The entire notice/Undo apparatus existed to soften the
  unpredictable, off-screen swaps of problem #1. With every change now
  predictable and on-screen, it is deleted — taking problem #3 with it.

### Alternatives considered

- **Explicit active/target slot** (new picks land in a highlighted slot, click to
  retarget): predictable and flexible, but adds a concept to learn. Rejected in
  favor of the simpler baseline/candidate roles plus swap.
- **Visible, sticky "next slot" indicator** over two free slots: still two
  free-floating slots; more state to communicate. Rejected.
- **Promote** instead of swap (candidate → baseline, candidate clears, old
  baseline dropped): reintroduces a small "where did my theme go?" problem on
  every step. Rejected in favor of swap, which loses nothing.

## State model

```ts
interface CompareState {
  baseline: string;          // left slot — also drives the chrome
  candidate: string | null;  // right slot — the audition slot
}

type CompareAction =
  | { type: "enter"; themeId: string }   // baseline = themeId, candidate = null
  | { type: "pick"; themeId: string }    // candidate = themeId (always the right slot)
  | { type: "swap" }                     // exchange baseline ⇄ candidate (no-op if no candidate)
  | { type: "clear" }                    // candidate = null (back to solo baseline)
  | { type: "exit" };
```

Removed: `lastPinned` (caused problem #1), `enteredFromThemeId` (redundant — the
baseline *is* the chrome theme), and the `unpin` / `restore` actions.

Rules:
- `pick` always writes the candidate.
- Picking the theme that is already the baseline is a no-op (no comparing a theme
  with itself).
- `swap` only fires when a candidate exists.
- On entry from theme T: `{ baseline: T, candidate: null }`.

URL search state simplifies to `baseline` + `candidate` + `scene`. A deep link
with both slots fills both and themes the chrome to `baseline`.

## Interactions

- **Picking (rail / ⌘K):** always fills the candidate. The baseline row reads as
  current/selected; picking it is a no-op.
- **Swap (⇄):** exchanges the slots, re-themes chrome to the new baseline,
  disabled when there is no candidate.
- **Clear (×) on candidate:** returns the right slot to the empty placeholder.
  The baseline has no clear/unpin — there is always a frame of reference.
- **Exit (Esc / Back):** returns to the catalog at the current `baseline`.
- **Rail indicators:** baseline → `aria-current` (current); candidate → pin
  marker. Two distinct states instead of two identical pins.
- **⌘K commands:** theme commands run `pick`; add "Swap slots"; drop "Toggle
  next theme."

## Visual & layout

- **Slot eyebrows:** "Baseline" (left) and "Comparing" (right).
- **Swap control:** circular `⇄` button on the vertical seam between slots,
  styled with `--chrome-*` tokens (it lives on the chrome seam, not inside a
  themed slot). On the stacked mobile layout (`max-width: 640px`) it moves to the
  horizontal divider. `aria-label="Swap baseline and candidate"`.
- **Status line:** collapses to the live message only ("Comparing X with Y" /
  "X is your baseline — pick a theme to compare").
- **Undo button + ripple + `data-attention` framing:** all deleted. A gentle
  transition stays when the candidate's theme changes so a replace doesn't hard
  cut.
- **Candidate clear (×):** reuses `.compare-slot__unpin` styling, candidate only.

## File-by-file plan

**Core logic**
- `src/compare/compareState.ts` — rewrite to the new shape and reducer.
- `src/compare/compareState.test.ts` — rewrite; add "pick always fills
  candidate" and "swap is reversible" cases.

**View**
- `src/compare/CompareView.tsx` — strip the notice/Undo system (`navTick`,
  `headerFocused`, `undoHovered`, the timeout effects, the diff-detection
  effect); add the seam `⇄` button and simplified status line.
- `src/compare/CompareSlot.tsx` — "Baseline"/"Comparing" eyebrows; render the `×`
  clear on the candidate only; drop the `attention` prop.
- `src/compare/CompareView.test.tsx` / CompareSlot tests — rewrite.

**Wiring**
- `src/app/routes/compareRoute.tsx` — chrome follows `state.baseline` (drop the
  `enteredFromThemeId` effect); handlers become `pick`/`swap`/`clear`; exit
  returns to `baseline`.
- `src/app/routes/compareRouteSearch.ts` (+ test) — serialize
  `baseline`/`candidate`/`scene`.

**Chrome & commands**
- `src/styles/compare.css` — delete `.compare-view__undo` + undo keyframes +
  `data-attention` keyframes; add `.compare-view__swap`; update eyebrow labels.
- `src/palette/commands.ts` — theme commands run `pick`; add "Swap slots"; drop
  "Toggle next theme."
- `src/chrome/BottomBar.tsx` — relabel the compare variant's a/b to
  baseline/candidate if it labels them.

**E2E**
- `e2e/compare.spec.ts` — update to the pick-always-right + swap + exit-to-baseline
  flows.

Rail indicators fall out for free: `baseline → focusedThemeId` (current),
`candidate → pinnedThemeIds` (pin marker) — no Rail changes needed.
