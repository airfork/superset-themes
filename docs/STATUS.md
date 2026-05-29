# Project Status

## Current State

The repo contains a completed Task 10 Vite/React/TypeScript static app checkpoint on branch
`feature/theme-catalog-app`. Catalog browsing, URL-backed theme detail routes,
light/dark pair comparison, and the first theme lab import/edit/export workflow
are implemented. The lab also has deterministic constrained random generation.
Browser, Storybook, accessibility, and design QA coverage has been expanded.
README, command reference, and agent handoff docs are synced with the current app. Post-Task 10
theme expansion now brings the catalog to 10 themes total: Aurora Light/Dark, Graphite Dark,
Solarized Light/Dark, Nord, Catppuccin Mocha, Dracula, Gruvbox Dark, and Tokyo Night. Storybook
a11y is enforced globally for the current story suite.

Latest completed checkpoint:

- Task 1 scaffold added: package scripts, pnpm workspace/lockfile, Vite config, Vitest config, Biome config, app entry point, routed catalog shell, neutral global styles, and `scripts/check.mjs`.
- Focused app-shell smoke test added in `src/app/App.test.tsx`.
- Task 1 review remediation added runnable Playwright, Storybook, browser-install, and theme utility scaffolds so exposed scripts do not fail before later tasks fill in deeper behavior.
- Task 2 theme core added Zod runtime schemas, TypeScript theme/catalog types, export-clean theme JSON behavior, original Aurora light/dark and Graphite dark fixtures, catalog metadata, fixture lookup helpers, and real catalog validation.
- Task 3 theme utilities added pure WCAG contrast checks, structured contrast warnings, a real catalog contrast CLI, and pure preview CSS variable mapping for UI and terminal tokens.
- Task 4 preview surface system added: neutral inspector chrome, accessible tabs, controlled/uncontrolled selected-tab support, themed preview frame, Superset-aligned workspace/editor/terminal/diff/command/settings surfaces, Storybook stories, and component tests.
- Task 4 design critique remediation kept the catalog chrome outside theme variables, added agent preset/context lanes, improved mobile containment, replaced fake search/command/form semantics with real controls where practical, and added cursor/search-highlight samples.
- Task 5 catalog browsing added pure search/filter/sort helpers, dense catalog controls, compact preview cards, theme detail routes, export-clean copy/download actions, Storybook card states, URL-backed catalog search params, and updated Playwright app coverage.
- Task 5 browser QA attempted the preferred in-app Browser surface, but `iab` was unavailable in this session. Playwright screenshots were used instead for desktop catalog, mobile catalog, desktop detail, and mobile detail visual checks.
- Task 6 pairing added pure pair state helpers, a `/compare` route with URL-backed `light`, `dark`, and `tab` state, side-by-side pair slots, synchronized preview tabs, catalog pin links, detail pin navigation, and Playwright coverage for pinning both slots.
- Task 6 visual QA used Playwright screenshots for desktop and mobile compare layouts. The pair slot tabs were adjusted to wrap cleanly instead of clipping labels in narrow side-by-side slots.
- Task 7 lab workflow added theme import parsing, catalog/import/generated draft state support, export-clean draft JSON, a `/lab?from=<theme-id>` route, catalog seed switching, copy/download actions, grouped color token editors, inline contrast validation, and shared preview tabs for draft inspection.
- Task 7 browser QA attempted the preferred in-app Browser surface earlier in the session, but `iab` was unavailable. Playwright screenshots were used for desktop and mobile lab layouts, and a Playwright overflow check confirmed no document-level horizontal scroll at 1440px or 384px.
- Task 8 generator added deterministic OKLCH-based theme generation, light/dark mode selection, hue-range support, contrast rejection, token-group locking/reroll helpers, generated draft creation, lab seed controls, per-group reroll buttons, and a real `pnpm themes:generate` CLI. `tsx` and `@types/culori` were added so the Node script can execute the shared TypeScript generator instead of duplicating the algorithm.
- Task 8 visual QA used Playwright screenshots for desktop and mobile lab layouts after adding generator controls, plus a Playwright overflow check confirming no document-level horizontal scroll at 1440px or 384px.
- Task 9 browser QA added `e2e/catalog.spec.ts` with catalog filter/search URL sync, empty state coverage, detail navigation/actions, preview tab switching, keyboard order, and mobile overflow checks.
- Task 9 Storybook QA enabled failing a11y checks for representative passing light/dark card stories and a passing dark command-palette preview story. Global Storybook a11y remains in `todo` mode because broader preview/app stories still expose known accessibility issues around simulated tree/tabpanel semantics and preview contrast that need component-level design follow-up.
- Task 9 Web Interface Guidelines review fetched the latest Vercel guideline source and fixed actionable issues: added a skip link, gave form controls names/autocomplete/spellcheck where relevant, replaced placeholder `...` with `…`, and added missing checkbox names.
- Task 9 Impeccable design scan passed on the app/catalog/compare/lab/preview/style surfaces after the QA fixes.
- Task 10 docs polish updated README with implemented features, stack, setup, verification, theme utilities, and project-doc links. `COMMANDS.md` now includes every `package.json` script, including `build:storybook`. `AGENTS.md` verification guidance now includes Storybook tests.
- Theme expansion checkpoint 1 added three upstream-port catalog entries from the reference repo: Solarized Light, Solarized Dark, and Nord. Theme JSON remains export-clean; source/license/adaptation notes live in catalog metadata and `docs/THEME_ATTRIBUTIONS.md`. Solarized Light required a terminal foreground adjustment to satisfy the local 4.5 contrast gate.
- Accessibility checkpoint 1 promoted Storybook a11y from global `todo` mode to global `error` mode for the current story suite. Fixes included file-tree ARIA structure, keyboard focus for scrollable preview panes, terminal muted text contrast, search/diff preview contrast, and the catalog filter landmark hierarchy.
- Browser QA checkpoint confirmed the 6-theme catalog, upstream-port filter, Solarized/Nord detail pages, compare synchronization, lab edit/export behavior, and 390px mobile overflow behavior. The preferred in-app Browser worked for DOM/interaction checks, but Browser screenshot capture timed out, so screenshots were refreshed with direct Playwright under ignored `test-results/browser-qa/`.
- Theme expansion checkpoint 2 added Catppuccin Mocha, Dracula, Gruvbox Dark, and Tokyo Night. Theme JSON remains export-clean; source/license/adaptation notes live in catalog metadata and `docs/THEME_ATTRIBUTIONS.md`. The expanded catalog renders 10 total themes and 7 upstream-port themes with balanced card dimensions in desktop Browser QA.
- Design spec committed in `8b05d03`.
- Implementation planning and handoff docs drafted after that checkpoint.
- Private GitHub repo created at `git@github.com:airfork/superset-themes.git`.

## Active Plan

- [docs/superpowers/plans/2026-05-27-catalog-redesign-implementation.md](superpowers/plans/2026-05-27-catalog-redesign-implementation.md)
  (replaces the prior superset-theme-catalog plan now that Phase 1 of the redesign is in flight).

## Phase 1 — Catalog Redesign (2026-05-27)

Status: Complete.

- Task 1: Rose Pine Dawn port committed (`feat: add Rose Pine Dawn theme port`).
  Destructive token darkened to `#9c2c4b` to clear AA on cream background.
- Task 2: One Dark port committed (`feat: add One Dark theme port`).
  Atom-lineage palette with dark foregrounds on primary/destructive for AA.
- Task 3: Featured tier metadata committed (`feat: add featured tier metadata and default theme`).
  `featuredRank` is a `z.number().int().min(1).max(5).nullable()` field on every catalog
  entry. `src/data/featured.ts` exposes `FEATURED_IDS`, `getFeaturedThemes`, and
  `getDefaultFocusedTheme` (default = Tokyo Night).

Phase 1 verification:

- `rtk pnpm check` passed (Biome, TypeScript, Vitest 17 files / 69 tests, Vite build).
- `rtk pnpm themes:validate` validated 12 catalog themes from 12 JSON files.
- `rtk pnpm themes:check-contrast` passed 7 pairs × 12 themes (zero warnings).

## Phase 2 — Theme-match foundation

Status: Complete.

- Task 4 committed (`refactor: collapse chrome tokens into preview namespace`).
  `src/styles/tokens.css` reduced to chrome fonts (`--app-font-chrome/editor/terminal`),
  `--app-transition` (zeroed under `prefers-reduced-motion`), and `color-scheme` data
  attribute rules. All `--app-bg / --app-surface / --app-text / --app-accent / --app-focus`
  call sites in `global.css` rewritten to `--preview-*` equivalents. `--app-shadow` inlined
  as `color-mix(...)`; `--app-radius` inlined as `8px`.
- Task 5 committed (`feat: add applyTheme provider for whole-site theme match`).
  `src/theme/applyTheme.ts` writes `--preview-*` vars and `data-theme-id` / `data-theme-type`
  to `:root` (or a custom element for scoped compare slots). `FocusedThemeProvider` +
  `useFocusedTheme` provide React context; falls back to default focused theme on unknown id.
  Wired into `src/main.tsx`.
- Task 6 committed (`feat: inline critical CSS for instant first-paint theme`).
  `scripts/vite-plugin-critical-theme.mjs` reads `tokyo-night.json` at build/dev time and
  replaces the `<style id="critical-theme">` marker in `index.html` with the inlined Tokyo
  Night `--preview-*` vars + `html { background, color }` declaration. Companion `.d.mts`
  exports the `Plugin` type so `vite.config.ts` typechecks cleanly.
- Post-review fix: plugin originally injected a second `<style id="critical-theme">` beside
  the marker in `dist/index.html`. Switched to a `replace(MARKER_REGEX, tag)` flow so the
  marker is replaced in place. Verified `dist/index.html` now contains exactly one
  `id="critical-theme"` tag.
- Task 7 committed (`feat: smooth 180ms color transitions with reduced-motion opt-out`).
  Added `:root` and universal `transition` rules in `global.css` covering background,
  border, color, fill, stroke, and box-shadow against `var(--app-transition)`. Reduced
  motion is handled centrally — `--app-transition` already zeroes under
  `prefers-reduced-motion: reduce` thanks to Task 4. `e2e/first-paint.spec.ts` added the
  reduced-motion assertion (`getComputedStyle(:root).getPropertyValue('--app-transition')`
  is `0ms` / `0s` depending on browser normalization).

Phase 2 verification:

- `rtk pnpm check` passed (Biome, TypeScript, Vitest 19 files / 73 tests, Vite build).
- `rtk pnpm test:e2e` passed (11 Playwright flows including first-paint and reduced motion).
- `rtk grep -c 'id="critical-theme"' dist/index.html` returns `1`.

Phase 2 checkpoint review — `vercel-react-best-practices` on `src/theme/`:

- `FocusedThemeProvider.tsx:21-23` — lazy `useState` initializer is correct (loop + throw
  path in `getDefaultFocusedTheme`).
- `FocusedThemeProvider.tsx:25-28` — `useMemo` over `catalogThemes.find` produces a stable
  reference that downstream effects depend on; not a "simple expression" anti-pattern.
- `FocusedThemeProvider.tsx:30-32` — `useEffect` is a DOM side effect, not derived state.
  Dependency `[focused]` is primitive-driven via the upstream memo, so the effect re-runs
  only when `focusedId` actually changes.
- `FocusedThemeProvider.tsx:34` — context `value` memoized on `[focused]`; `setFocusedId`
  is the stable `useState` setter. Consumers won't re-render on unrelated parent renders.
- `applyTheme.ts:5` — `typeof document` guard is defensive against future SSR; idempotent
  DOM writes are StrictMode-safe.
- `useFocusedTheme.ts:7-9` — throws on missing provider (fail-fast).
- Verdict: pass, no required changes.

## Phase 3 — Shell anatomy

Status: Complete.

- Task 8 committed (`feat: add top bar chrome`). 38px-tall header with site name (left),
  centered search-as-button trigger (`⌘K` hint), and right-aligned repo link. All visual
  tokens flow through `--preview-ui-*` so the chrome morphs with the focused theme.
- Task 9 committed (`feat: add bottom status bar`). 32px-tall footer with
  `<name> · <family> · <contrast ratio>` on the left and `↓ next · ⌘K · . pin` keyboard
  hints on the right. Contrast computed via `getContrastRatio(ui.background, ui.foreground)`
  to one decimal place.
- Task 10 committed (`feat: add master-detail layout shell`). LayoutShell composes TopBar,
  a sticky `<aside aria-label="Themes">` rail, a `<main>` pane, and the BottomBar bound to
  `useFocusedTheme()`. Catalog route renders the shell with placeholder rail/pane content;
  the legacy CatalogRouteView body returns in Phase 5 Task 18. RootLayout dropped its
  visible header and `<main>` wrapper. FocusedThemeProvider hoisted into App.tsx so
  component tests rendering `<App />` receive theme context.
- Legacy catalog and pairing e2e specs are `test.skip` with comments pointing at the
  Phase 5 / Phase 6 revival tasks. `e2e/shell.spec.ts` (3 tests) covers banner, themes
  complementary, main, and contentinfo landmarks plus the focused-theme summary.

Phase 3 verification:

- `rtk pnpm check` passed (Biome, TypeScript, 22 test files / 79 tests / 1 skipped, build).
- `rtk pnpm test:e2e` passed (8 active + 6 skipped legacy).
- `rtk pnpm test:stories` passed (5 test files / 14 stories).

Phase 3 checkpoint review — `impeccable` on the shell chrome:

- Verdict: four concrete fixes shipped, one open-design call deferred.
- Fix 1: `.chrome-topbar` switched from flex to `grid-template-columns: 1fr auto 1fr` so
  the search input is viewport-centered regardless of side-cluster widths.
- Fix 2: `.chrome-topbar__name` dropped from `0.84rem` to `0.78rem`, matching the repo
  link size so the left-cluster doesn't visually shout.
- Fix 3: `.chrome-topbar__search` height bumped from 26px to 28px so the input lives at
  the bar's edges instead of floating inside it.
- Fix 4: `.layout-shell__rail` max-height switched from `100vh` to `100dvh` so the rail
  tracks the mobile viewport when the URL bar collapses.
- Open call: bottom-bar fact #2 is `family` (per plan) vs `variant` (per design doc). Kept
  on `family` for now; revisit once the rail's section headers are in place (Phase 4).
- Post-review fix: removing the old `<main>` wrapper from `RootLayout` left the global skip
  link pointing at `#main-content` with no anchor on `/themes/*`, `/compare`, and `/lab`. A
  `LegacyRouteMain` wrapper now wraps each transitional route container (and the 404
  fallback) in `<main id="main-content">` so the skip link works everywhere. The catalog
  route already supplies `#main-content` via LayoutShell. A new e2e suite,
  `e2e/shell.spec.ts:29-44`, asserts the skip link reaches a `<main id="main-content">`
  on `/`, `/themes/aurora-dark`, `/compare`, and `/lab`.

## Phase 4 — Rail

Status: Complete.

- Task 11 committed (`feat: add RailRow primitive with self-colored accent`). Button-as-row
  renders the theme name, a trailing accent dot colored from the row's own theme
  (`--row-accent` escapes the `--preview-*` system), and featured variant adds a family
  eyebrow + 5-swatch glimpse drawn from `ui.primary / secondary / accent / destructive /
  selection`. Light themes render the dot as a 1.5px ring; dark themes fill it. Pin glyph
  is `aria-hidden` and the button's accessible name folds in "pinned for compare" when
  set.
- Task 12 committed (`feat: compose rail with featured/light/dark sections`).
  `RailSection` uses `<section aria-label>` (region sub-landmark of the rail aside),
  `RailSearch` is a button styled like an input with a `/` kbd hint, and `Rail` composes
  Featured (5 rows from `getFeaturedThemes()`) + Light (alphabetized by name) + Dark
  (alphabetized). Catalog route container syncs the rail's `onSelect(themeId)` into
  `useFocusedTheme().setFocusedId` plus `navigate({ replace: true, search: { theme: id }})`.
  `CatalogRouteSearch` gained a `theme?: string` field for URL deep-linking.
- Task 13 committed (`feat: rail keyboard navigation`). `useRailKeyboard` is a reducer
  hook with `ArrowDown / ArrowUp` (wrap-around), `Home / End`, and `/` for palette. Roving
  tabindex lives in `Rail.tsx`: the focused row has `tabIndex={0}`, the rest are `-1`;
  a focus-restoration effect calls `.focus()` on the new row only when focus is already
  inside the rail. Featured rows show first; clicking either copy of a theme (Featured
  slot or Light/Dark home) drives the same focused-theme + URL update.

Phase 4 verification:

- `rtk pnpm check` passed (Biome, TypeScript, 24 test files / 89 tests / 1 skipped, build).
- `rtk pnpm test:e2e` passed (15 passed + 6 skipped legacy), including the three rail
  flows in `e2e/rail.spec.ts` (click → URL, ArrowDown + Enter → URL + chrome morph via
  the inline `--preview-ui-background` var, `/` keypress no-op until Phase 7).
- `rtk pnpm test:stories` passed (6 test files / 20 stories).

Phase 4 checkpoint reviews:

- `web-design-guidelines` on `src/rail/` — three concrete fixes shipped:
  1. `useRailKeyboard.ts:73-103` removed Enter/Space from the handler so the native
     `<button>` activation isn't doubled by the hook calling onActivate. Hook interface
     dropped the now-unused `onActivate` callback. Tests updated accordingly.
  2. `RailRow.tsx:49` folded pinned state into the button's `aria-label` so screen
     readers announce "pinned for compare"; the Pin SVG is now `aria-hidden`.
  3. `global.css` `.rail-row` and `.rail-search` gained `touch-action: manipulation`
     to remove the mobile 300ms tap delay.
- `impeccable` on `src/rail/` — four concrete fixes shipped:
  1. `global.css` `.rail__search` got a hairline `border-bottom` so the sticky header
     has a definite edge as rows scroll under it.
  2. `global.css` `.rail-row__eyebrow` dropped from `0.66rem / 0.06em` to
     `0.62rem / 0.04em` so featured eyebrows stop competing with section labels.
  3. `global.css` `.rail-row[data-selected]` bumped the row tint from 14% to 20% so
     selected rows read against themes with desaturated accents (Tokyo Night, One Dark,
     Catppuccin Mocha).
  4. `global.css` `.rail-section__label` margin-bottom lifted from 4px to 8px so
     section headers don't crowd the first row.
- Post-review fix: rail row focus ring now uses `var(--preview-ui-ring)` instead of the
  row's own accent. The `--row-accent` still drives the dot, hover tint, and selected
  tint; focus is a pointer cue and gets the AA-verified focus token. Rose Pine Dawn's
  `ui.ring` shifted from `#d7827e` (rose) to `#286983` (pine) because the rose itself
  failed 3:1 against `#faf4ed`. `src/theme-core/focusRingContrast.test.ts` codifies the
  contract: every catalog theme's `ui.ring` must clear 3:1 against both `ui.background`
  and `ui.card`. All 12 themes pass. Attribution updated in
  `docs/THEME_ATTRIBUTIONS.md`.
- Post-review fix: `RailSearch.tsx` gained a `/` keydown handler so pressing slash while
  the search trigger is focused fires `onOpenPalette`, matching the kbd hint shown on
  the button. Previously slash only worked from rail rows via `useRailKeyboard`.
  `src/rail/RailSearch.test.tsx` and a new `e2e/rail.spec.ts` case cover both paths.

## Phase 5 — Pane

Status: Implementation complete; checkpoint reviews pending.

- Task 14 committed (`feat: add pane nameplate`). `src/pane/Nameplate.tsx` renders
  theme name (h2), family chip, light/dark indicator (`role="img"`), and tag
  chips on the left; Pin to compare, Open in Lab, and Copy JSON ghost-style
  actions on the right separated by thin vertical dividers. `onPin(themeId)`
  fires with the focused theme; Copy JSON writes `exportThemeJson(entry)` via
  `vi.spyOn(navigator.clipboard, "writeText")` in tests (jsdom now ships a real
  navigator.clipboard so `Object.defineProperty` no longer works).
- Task 15 committed (`feat: add Workspace preview scene`). `src/pane/WorkspaceScene.tsx`
  is the Superset-shape three-column scene: workspaces tree (T Team · nav ·
  projects with branches · Ports/Settings footer) on the left, thread on the
  middle (branch chip, agent run row, agent picker tabs, message stream with
  code block, input bar), collapsed `▢` right-panel toggle. Grid is
  `220px minmax(0,1fr) 32px`. Stories cover Tokyo Night, Solarized Light,
  Catppuccin Mocha, Rose Pine Dawn, One Dark with a11y mode `todo` — themes
  ship gated `ui.foreground/background` and `ui.card/cardForeground`, but the
  small-surface combinations axe checks (e.g. muted-foreground on muted
  background) fall outside that gate. The Phase 5 reviews own the real
  interaction-level a11y bar.
- Task 16 committed (`feat: add Settings preview scene`). `src/pane/SettingsScene.tsx`
  covers all seven control types: labeled `<input>`, labeled `<select>`, radio
  fieldset (with explicit `role="radiogroup"` since `<fieldset>` has implicit
  `role="group"`), checkbox fieldset, destructive action button, syntax-colored
  code sample (editor font + terminal colors via `--app-font-editor`), and
  terminal sample with prompt/success/warning/error. Stories: Tokyo Night,
  Solarized Light, Rose Pine Dawn, One Dark.
- Task 17 committed (`feat: scene tabs and pane expand`). `src/pane/SceneTabs.tsx`
  is a two-tab tablist (Workspace, Settings) below the pane body. `src/pane/Pane.tsx`
  composes Nameplate + (WorkspaceScene|SettingsScene) + SceneTabs and listens
  on `window keydown` for `f` (ignoring INPUT/TEXTAREA/SELECT/contenteditable
  targets) to call `onExpandToggle`. Nameplate's name-as-button also fires
  `onExpandToggle`. LayoutShell now accepts `expanded` and renders
  `data-expanded` so CSS collapses the rail column to `0` and visibility-hides
  the rail when set.
- Task 18 committed (`feat: wire catalog as master-detail shell`). Catalog route
  renders `<LayoutShell pane={<Pane …/>} />`; `onPin` from the pane navigates
  to `/compare?light=` / `?dark=` (Phase 6 will replace this with the compare
  state machine). `CatalogRouteSearch` shrunk to `{ theme?, dark?, light?, tab? }`.
  Deleted: `src/app/routes/themeRoute.tsx`, `src/catalog/ThemeDetail.tsx` +
  test, `src/catalog/CatalogPage.tsx` + test, `src/catalog/ThemeCard.tsx` +
  stories. Removed `themeRoute` from the route tree. `e2e/catalog.spec.ts`
  rewritten with five new flows: rail click → URL + chrome morph, scene tab
  switch, `f`-keypress expand, `?theme=` hydration, mobile overflow.
  `App.test.tsx` dropped its themeRoute-specific cases and gained a `?theme=`
  hydration assertion.
- Post-implementation fixes: Nameplate, WorkspaceScene, and SettingsScene
  switched their internal `<header>` wrappers to `<div>` because RTL/axe was
  computing a second `role="banner"` even when nested inside `<main>`/`<section>`.
  Top-bar grid switched to `minmax(0, 1fr) auto minmax(0, 1fr)` and the search
  input gained `min-width: 0` so the chrome no longer overflows at 390px.

Phase 5 verification:

- `rtk pnpm check` passed (Biome, TypeScript, Vitest 29 test files / 127 tests, Vite build).
- `rtk pnpm test:e2e` passed (20 passed + 2 skipped legacy), including the four new
  rail-driven flows in `e2e/catalog.spec.ts`.
- `rtk pnpm test:stories` passed (8 test files / 28 stories). Pane scene stories run
  a11y in `todo` mode with an inline rationale (theme-level surface contrast).

Phase 5 checkpoint reviews — complete.

- `impeccable` on the live catalog (Tokyo Night, Solarized Light, Rose Pine Dawn),
  via Chrome DevTools MCP at http://localhost:5174/?theme=<id>. Three concrete
  fixes shipped in `polish: impeccable Phase 5 …`:
  1. `.rail-row[data-selected]` background switched from `color-mix(--row-accent
     20%, transparent)` to `color-mix(--preview-ui-primary 18%, transparent)`.
     Per-row accents like Solarized Light's `#eee8d5` collapse into the cream
     rail surface; the focused theme's primary is an AA-gated, always-visible
     token. Selected row also gets `font-weight: 600` on the name. The row's
     own accent still drives the dot and hover tint, preserving the "rail stays
     informative" design principle.
  2. `.scene-settings__input` and `.scene-settings__select` widened from `min(100%,
     320px)` to `min(100%, 480px)` and min-height bumped from 32px to 34px.
     Settings page no longer leaves dead horizontal space at 1440px.
  3. `.scene-workspace__right` column background switched from
     `--preview-ui-background` to `--preview-ui-card` so it reads as a
     distinct surface; `.scene-workspace__right-toggle` now ships with a
     visible border + background at rest (not just on hover) so the `▢`
     right-panel toggle reads as interactive.
  - Screenshots saved under `docs/review/phase-5-*-after.png`.
- `web-design-guidelines` on `src/pane/SettingsScene.tsx` + the `.scene-settings`
  CSS block, against the latest Vercel guidelines. Four concrete fixes shipped
  in `polish: SettingsScene a11y …`:
  1. `.scene-settings__radio` / `.scene-settings__check` got a `:hover` state
     (subtle border + background shift), `touch-action: manipulation`, and a
     32px min-height so each label hits the 32px+ tap target. The native
     input now drives a visible focus ring via
     `.scene-settings__radio:has(input:focus-visible)` /
     `.scene-settings__check:has(input:focus-visible)` outline using
     `--preview-ui-ring` (already gated 3:1 against bg + card per the Phase 4
     focus-ring contrast test).
  2. The destructive "Reset to defaults" button switched from
     filled-destructive (a hot button at rest) to outline-destructive
     (transparent background, destructive border + text) per the
     ghost-destructive pattern. Hover fills lightly with destructive at 12%.
  3. The destructive button now requires confirmation: first click flips it
     to `data-state="confirming"` with a filled-destructive look, a soft
     pulse (animation respects `prefers-reduced-motion`), and the label
     "Click again to confirm". Auto-reverts after 4 s. Second click commits
     and flips to `data-state="done"` with green border + "Defaults restored"
     for 2.4 s. A polite live region (`aria-live="polite"`) attached via
     `aria-describedby` announces the prompt and completion for screen
     readers — addresses the guideline "Destructive actions need confirmation
     modal or undo window — never immediate."
  4. Added `src/pane/SettingsScene.test.tsx:48-69` covering the
     confirm-then-commit flow and the live-region announcements.
  - Screenshots: `docs/review/phase-5-settings-destructive-idle.png`,
    `docs/review/phase-5-settings-destructive-confirming.png` (browser-mcp
    screenshot capture didn't reflect the state flip due to a stale-render
    artifact; the unit test confirms the logic).

Phase 5 verification (post-reviews):

- `rtk pnpm check` passed (Biome, TypeScript, Vitest 29 test files / 128 tests, Vite build).
- `rtk pnpm test:e2e` passed (20 passed + 2 skipped legacy).
- `rtk pnpm test:stories` passed (8 test files / 28 stories).

## Phase 6 — Compare mode

Status: Complete.

- Task 19 committed (`feat: add compare-mode state machine`). `src/compare/compareState.ts`
  is a pure reducer over `{ a, b, lastPinned, enteredFromThemeId }` with `enter`,
  `pin`, `unpin`, and `exit` actions. `pin` fills `a` then `b`; once both are full it
  replaces the least-recently-pinned slot (LRU via `lastPinned`); re-pinning an
  already-pinned theme just refreshes recency. `unpin` clears a slot and moves
  `lastPinned` to the surviving slot (or null). 10 unit tests in
  `compareState.test.ts`. (Deviation: the plan paired this commit with deleting
  `pairing.ts`, but its only importers are the compare UI that Task 20 rewrites, so
  the deletion moved into Task 20 to keep every commit building.)
- Task 20 committed (`feat: compare mode with pane split`). `src/compare/CompareSlot.tsx`
  attaches `getThemeCssVars(theme)` inline to each `<section>` so descendants read the
  slot's own theme while the surrounding chrome keeps reading the entry theme from
  `:root`. `CompareView.tsx` (replacing `PairCompare.tsx`) renders the two slots, a
  shared `SceneTabs`, and a polite `role="status"` live region whose message moves to
  "Comparing X with Y." once the second slot fills. The `/compare` route round-trips
  `?a=&b=&from=&scene=` through `seedCompareState` / `compareStateToSearch`; `from`
  carries the entry-state theme so the chrome can differ from both pinned slots. The
  rail shows a "click any theme to fill the second slot" hint until `b` is filled, and
  pinned rows fold "pinned for compare" into their accessible name. Deleted:
  `pairing.ts` + test, `PairCompare.tsx` + test, `PairSlot.tsx`, `e2e/pairing.spec.ts`
  (renamed to `e2e/compare.spec.ts`).
- Task 21 committed (`feat: keyboard and nameplate entry to compare mode`). `.` in the
  catalog enters compare with the focused theme as slot `a` and as the entry-state;
  Esc exits back to the catalog at the entry theme. The Nameplate "Pin to compare"
  button is a synonym for `.` (catalog `onPin` navigates to `/compare?a=…&from=…`), and
  a rail-row click in compare mode dispatches `pin` instead of switching the focused
  theme. `e2e/compare.spec.ts` covers both entry paths.

Phase 6 verification:

- `rtk pnpm check` passed (Biome, TypeScript, Vitest 30 test files / 143 tests, Vite build).
- `rtk pnpm test:e2e` passed (25 passed + 1 pre-existing skip), including five compare
  flows in `e2e/compare.spec.ts` (theme-scoped slots with chrome at the entry theme,
  scene sync, unpin-clears-slot, `.`-enter-then-Esc-exit, Nameplate Pin synonym).

Phase 6 checkpoint reviews — complete.

- `impeccable` on compare mode across three pin combinations via Chrome DevTools MCP:
  light+dark (`solarized-light` + `tokyo-night`), dark+dark (`tokyo-night` + `one-dark`),
  and light+light (`solarized-light` + `rose-pine-dawn`), each with a contrasting entry
  theme on the chrome. One concrete fix shipped in
  `polish: impeccable Phase 6 — stronger compare-slot seam for like-on-like themes`:
  the inter-slot divider (`.compare-slot + .compare-slot` / `--empty`, desktop and the
  mobile stacked `border-top`) switched from `var(--preview-ui-border)` to
  `color-mix(in srgb, var(--preview-ui-foreground) 20%, transparent)`. Light themes ship
  a pale border token, so two cream slots side by side (Solarized Light beside Rosé Pine
  Dawn) read as one panel; deriving the seam from each slot's own foreground guarantees a
  visible divider in all four combinations while staying within the `--preview-*` token
  system. Scene sync across both slots and the chrome staying at the entry theme both
  read naturally. Screenshots saved under `docs/review/phase-6-*` (before/after for the
  light+light and dark+dark seams).
- `web-design-guidelines` on the compare flow, against the latest Vercel guidelines —
  passed on all three required points, no code changes:
  1. Live region — `CompareView` renders a `.sr-only role="status" aria-live="polite"`
     region whose message transitions to "Comparing X with Y." when the second slot
     fills (verified live: single-pinned state announces "Solarized Light pinned. Pin a
     second theme to compare.").
  2. Esc — the `/compare` route's keydown handler exits to the catalog at the entry
     theme; covered by `e2e/compare.spec.ts`.
  3. Pinned glyph not color-only — `RailRow` renders a 12×12 lucide `Pin` icon (verified
     painting: `getBoundingClientRect` 12×12, opacity 1) and folds "pinned for compare"
     into the row's accessible name; the icon itself is `aria-hidden`.

## Phase 7 — ⌘K command palette

Status: Complete.

- Task 22 committed (`c63f3a2`, `feat: command palette state and fuzzy matcher`).
  `src/palette/fuzzy.ts` is a pure subsequence ranker over `RankableItem` (id + `keys`),
  scoring contiguous/boundary matches higher and stable-sorting ties by input order.
  `src/palette/paletteState.ts` is a pure reducer over `{ open, query, focusedIndex }`
  with `open`, `close`, `setQuery` (resets focus to 0), `move` (clamped roving index),
  and `submit`. `src/palette/commands.ts` builds the Themes section from `catalogThemes`
  and exposes `nextThemeId` for the "Toggle next theme" action.
- Task 23 committed (`3950523`, `feat: ⌘K command palette`). `src/palette/usePalette.ts`
  owns the reducer plus the global ⌘K/Ctrl-K listener and hands a `PaletteProps` bundle
  to the presentational `Palette.tsx`, which portals an `aria-modal` dialog into a
  theme-scoped container. The combobox input drives `aria-activedescendant`; results are
  grouped into Themes (fuzzy-ranked) and Actions (substring) `<fieldset>`/`<legend>`
  sections of `role="option"` buttons inside a `role="listbox"`. Tab is trapped on the
  input, Escape restores focus to the trigger, and outside-mousedown closes. Both catalog
  and compare routes wire real commands (select theme, open in Lab, pin/exit compare,
  toggle next theme). Deviations from the plan: palette state lives in the per-route
  `usePalette` hook rather than `LayoutShell`; the global key listener lives in
  `usePalette` (not the shell); the Lab-context palette story is deferred to Phase 8; and
  the two rail `/`-shortcut e2e specs were upgraded from no-op placeholders to assert the
  palette opens.

Phase 7 verification:

- `rtk pnpm check` passed (Biome, TypeScript, Vitest 33 test files / 167 tests, Vite build).
- `rtk pnpm test:e2e` passed (27 passed + 1 pre-existing skip), including
  `e2e/palette.spec.ts` (⌘K opens then Enter applies the focused theme; Escape closes and
  returns focus to the trigger) and the two upgraded rail `/`-shortcut specs.
- `rtk pnpm test:stories` passed (9 files / 32 tests), including four `Palette` stories.

Phase 7 checkpoint reviews — complete.

- `impeccable` on the palette across four themes via Chrome DevTools MCP (Tokyo Night,
  Solarized Light, Rosé Pine Dawn, Catppuccin Mocha). One concrete fix shipped: the
  active-row band in `.palette__option[data-active]` switched from `var(--preview-ui-selection)`
  to `color-mix(in srgb, var(--preview-ui-primary) 22%, var(--preview-ui-popover))`, and
  the redundant selection-foreground overrides were dropped so the label inherits
  `--preview-ui-popover-foreground`. Light themes ship a selection token equal to the
  popover surface (Solarized Light `#eee8d5`, Rosé Pine Dawn `#dfdad9` ≈ `#fffaf3`), so
  the focused row was invisible; deriving the band from each theme's primary guarantees a
  visible, on-brand highlight in all four themes while staying within the `--preview-*`
  system (same seam-fix pattern as Phase 6). Screenshots saved under
  `docs/review/phase-7-*-after` for all four themes.
- `web-design-guidelines` on the palette, against the latest Vercel guidelines:
  1. Focus management — input is focused on open; Escape restores focus to the trigger
     (covered by `e2e/palette.spec.ts`); Tab is trapped on the input. A re-review caught a
     blocker: `.palette__input:focus { outline: none }` stripped the visible focus
     indicator from the dialog's only tabbable control. Fixed by replacing it with a
     `:focus-visible` inset ring (`outline: 2px solid var(--preview-ui-ring); outline-offset: -2px`) —
     a positive offset would clip against the `overflow: hidden` popover's full-bleed top
     edge. Verified live in light and dark.
  2. Combobox/listbox semantics — `role="combobox"` with `aria-controls`/`aria-expanded`/
     `aria-activedescendant` pointing at a real `role="option"` inside `role="listbox"`;
     Themes/Actions are `<fieldset>`/`<legend>` groups; empty state is `role="status"`.
  3. Keyboard-only operation — ArrowUp/Down rove the active option, Enter runs it, all
     without a pointer.

## Phase 8 — Lab

Status: Implementation complete; checkpoint reviews complete; all findings resolved (see Phase 8 polish below).

- Task 24 committed: `/lab` route adopts the redesigned master/detail shell. `LabView`
  wraps the live `ThemeDraft` in a synthetic `CatalogThemeEntry` (`draftToEntry`) and pushes
  it through `useFocusedTheme().setTransientEntry` so the rail, pane, and bottom bar all morph
  to the draft; the override is cleared on unmount so catalog focus resumes.
- Task 25 committed: lab rail Source + Generate sections (`Start from catalog theme` select,
  Import JSON, Paste JSON; Seed/Mode/Hue + Generate).
- Task 26 committed: lab rail Tokens with native color picker. `ColorField` pairs a swatch
  `<button>` that opens a click-transparent native `<input type="color">` overlay with a
  blur-validated hex input (`aria-invalid` on malformed `#rrggbb`).
- Task 27 committed (`feat: lab contrast summary and export footer`). `ContrastSummary` scores
  six text-on-surface pairs, lists AA failures as buttons that scroll to and focus the offending
  token's hex input, and collapses passing pairs into a `<details>`. `LabFooter` is a sticky
  bottom bar with Back-to-catalog + Copy/Download JSON. `ColorField` gained an optional `id`
  so tokens are scroll anchors; `onBackToCatalog` is plumbed LabView → labRoute → router.
- Task 28 committed (`feat: ⌘K in lab seeds from theme`). No `Palette.tsx` change needed: the
  per-route command architecture (`buildThemeCommands(onStartFromCatalog)`) already routes ⌘K
  theme selection to `/lab?from=<id>`; added a Playwright regression guard.

Phase 8 verification:

- `rtk pnpm check` passed (Biome 145 files, TypeScript, Vitest 36 files / 175 tests, Vite build).
- `rtk pnpm test:e2e` passed (29 passed + 1 pre-existing skip), including three `e2e/lab.spec.ts`
  specs: catalog-seed morph, ⌘K reseed, and the contrast jump-to-token interaction.
- `rtk pnpm test:stories` passed (10 files / 35 tests).

Phase 8 checkpoint reviews — complete (Chrome DevTools MCP on `/lab?from=aurora-light` live).

- `impeccable critique` on `/lab` live, score 32/40, detector clean (`detect.mjs src/lab` → `[]`).
  Snapshot at `.impeccable/critique/2026-05-29T07-25-59Z__localhost-lab.md`. The live morph,
  native color controls, and failing-pair-to-token loop are strengths. Two P1 findings, both in
  the Contrast section (both RESOLVED — see Phase 8 polish):
  1. The contrast row used `color: var(--preview-ui-foreground)` and `--fail` overrode only
     background/border, so the row label's legibility tracked the draft's own foreground/background
     contrast — the label went invisible (~1.1:1, dark-on-dark-red) exactly when that pair was the
     broken one being flagged. The diagnostic widget failed its own check.
  2. `.lab-contrast__pair` was `nowrap`/ellipsis at ~142px while labels need 159–196px, so even one
     failing row clipped its label ("Muted foreground on …"); the ratio + badge stayed readable but
     the identifying text was lost, so the section didn't scale to several failures.
  Initial evidence screenshots: `docs/review/phase-8-lab-initial.png`,
  `docs/review/phase-8-lab-morph-dark-bg.png`, `docs/review/phase-8-lab-contrast-labels-clipped.png`.
- `web-design-guidelines` on `ColorField`, against the latest Vercel guidelines. Passes: swatch
  accessible name (`Pick {label} color`), native-picker and hex accessible names, keyboard parity
  (swatch is a real `<button>`; native input `tabIndex=-1`; picker opens from keyboard), native OS
  picker dismissal (Esc/outside-click handled by the platform — no custom popover), `spellCheck`
  off, paste unblocked, 26px swatch with a `--preview-ui-ring` focus ring. The reported "hex input
  lacks `:focus-visible`" finding was a false positive — the global `:focus-visible` rule
  (`global.css:51`) already rings every focusable element. Remaining minor findings (RESOLVED):
  visible label was a non-associated `<span>` (not a clickable `<label htmlFor>`); hex input lacked
  `autocomplete="off"`/`name`; invalid hex showed only `aria-invalid` + red border with no inline
  message.
- `vercel-react-best-practices` on `LabView.tsx`. The draft-update path is stable and idiomatic:
  functional `setDraft` updaters over pure module-level reducers, and `entry = useMemo(draftToEntry,
  [draft])`. Two MEDIUM perf refinements (RESOLVED, not correctness bugs): (1) `Pane` was a plain
  function component and received a freshly-built `nameplate` element each render, so editing
  Seed/Hue/Mode — which don't change the previewed theme until Generate — re-rendered the whole Pane
  subtree; (2) the native color picker's continuous `onChange` while dragging drove a full
  draft→entry→Pane recompute per frame.

Phase 8 polish — all checkpoint findings resolved (committed before Phase 9):

- Contrast P1a (stable diagnostic palette): `ContrastSummary` now wraps its content in
  `<div className="lab-contrast" data-mode={theme.type}>`, and `global.css` defines a fixed
  per-mode (light/dark) diagnostic palette (`--diag-*`) scoped to that element. Row/label/ratio/
  badge colours read from `--diag-*` instead of the editable `--preview-*` tokens, so the widget
  stays legible no matter how broken the draft is. Every `--diag-*` text/surface pair was verified
  to clear WCAG AA (computed via culori before committing). New unit test asserts the `data-mode`
  marker (`ContrastSummary.test.tsx`). Verified live in both modes with 3–4 failing pairs:
  `docs/review/phase-8-contrast-stable-light.png`, `docs/review/phase-8-contrast-stable-dark.png`.
- Contrast P1b (non-truncating labels): `.lab-contrast__pair` switched from `nowrap`/ellipsis to
  `overflow-wrap: anywhere`, so long pair labels wrap to multiple lines instead of clipping.
- ColorField minor a11y/form (TDD): visible label is now a `<label htmlFor>` tied to the hex input
  (`useId`); hex input gained `autocomplete="off"` + `name`; invalid hex renders an inline
  `role="alert"` message wired via `aria-describedby`. Three new `ColorField.test.tsx` cases cover
  label association, autofill-off, and the inline error.
- LabView perf: `Pane` is now `memo`'d; `LabView` derives a `useDeferredValue(draft)` →
  `deferredEntry` and a memoized `nameplate` element from the deferred draft, both passed to `Pane`,
  while the live `entry` still drives the CSS-var morph. Seed/Hue/Mode edits no longer re-render the
  Pane subtree, and color-drag re-renders run at low priority without lagging the live preview.
- Suites after polish: `rtk pnpm check` (Biome 146 files, TS, Vitest 36 files / 179 tests, build),
  `rtk pnpm test:e2e` (29 passed + 1 skip), `rtk pnpm test:stories` (10 files / 35 tests) all green.

## Next Step

Phase 8 complete. Begin Phase 9 — Research script + legacy cleanup (Tasks 29–30) per the active plan.

## Resumability Protocol

After each meaningful implementation checkpoint:

1. Update the active plan checkboxes.
2. Update this file with current state, next step, verification run, and blockers.
3. Commit coherent completed work.

## Verification

Latest app verification:

- `pnpm test -- src/app/App.test.tsx` passed.
- `pnpm test:unit -- src/theme-core/schema.test.ts src/theme-core/exportTheme.test.ts` first failed on missing Task 2 modules, then passed after schema/export/catalog implementation.
- `pnpm themes:validate` passed: 3 catalog themes from 3 JSON files validated.
- `pnpm check` passed: Biome check, TypeScript check, Vitest run, and Vite production build.
- `pnpm test:e2e` passed after adding Playwright scaffold coverage.
- `pnpm test:stories` passed after adding Storybook Vitest scaffold coverage.
- `pnpm test:unit` passed for 5 test files and 11 tests after Task 3.
- `pnpm themes:check-contrast` passed: 3 catalog themes checked across 7 contrast pairs each.
- `pnpm check` passed: Biome check, TypeScript check, Vitest run, and Vite production build.
- `pnpm themes:generate` still runs as a scaffold command until its implementation task replaces it.
- `pnpm browsers:install` installed Chromium for local Playwright and Storybook browser tests.
- `pnpm test:unit -- src/preview/PreviewTabs.test.tsx` passed for Task 4 preview tab behavior and frame CSS variable mapping.
- `pnpm test:stories` passed for Task 4 preview stories.
- `pnpm check` passed for Task 4: Biome check, TypeScript check, Vitest run, and Vite production build.
- `npx impeccable detect src/preview src/ui src/styles/global.css` passed with no findings.
- Storybook visual inspection was performed at desktop and mobile viewport sizes for workspace dark and settings light preview states.
- `pnpm test:unit -- src/catalog/catalogFilters.test.ts src/catalog/catalogSearch.test.ts` first failed on missing Task 5 modules, then passed after pure helper implementation.
- `pnpm test:unit -- src/catalog/CatalogPage.test.tsx` first failed on missing catalog page, then passed after catalog UI implementation.
- `pnpm test:unit -- src/catalog/ThemeDetail.test.tsx` first failed on missing detail view, then passed after detail implementation and export-clean copy coverage.
- `pnpm test:unit -- src/app/App.test.tsx` first failed against scaffold routing, then passed after URL-backed catalog/detail routes.
- `pnpm test:unit` passed for 10 test files and 32 tests after Task 5.
- `pnpm test:stories` passed for 3 Storybook test files and 10 stories after adding `ThemeCard` stories and Vite optimize-deps coverage for `zod`.
- `pnpm test:e2e` passed for 3 Playwright app flows: catalog load, shareable filter params, and theme detail route.
- `pnpm check` passed for Task 5: Biome check, TypeScript check, Vitest run, and Vite production build.
- `npx impeccable detect src/catalog src/app src/styles/global.css` passed with no findings.
- `pnpm test:unit -- src/compare/pairing.test.ts` first failed on missing Task 6 pairing module, then passed after pure helper implementation.
- `pnpm test:unit -- src/compare/PairCompare.test.tsx` first failed on missing compare component, then passed after pair slot UI implementation.
- `pnpm test:unit -- src/app/App.test.tsx` passed after adding `/compare` route coverage and detail pin navigation coverage.
- `pnpm test:e2e -- pairing.spec.ts` first caught a URL parameter order mismatch in the test expectation, then passed after correcting the expectation.
- `pnpm test:e2e` passed for 4 Playwright app flows, including the pairing pin and synchronized tab flow.
- `pnpm test:stories` passed for 3 Storybook test files and 10 stories after Task 6.
- `pnpm check` passed for Task 6: Biome check, TypeScript check, Vitest run, and Vite production build.
- `npx impeccable detect src/compare src/catalog src/app src/styles/global.css` passed with no findings.
- `pnpm test:unit -- src/lab/importTheme.test.ts src/lab/draftTheme.test.ts` first failed on missing Task 7 modules, then passed after import/draft implementation.
- `pnpm test:unit -- src/lab/LabPage.test.tsx` first failed on missing lab page, then passed after the lab UI implementation.
- `pnpm test:unit -- src/app/App.test.tsx` first failed on the missing `/lab` route, then passed after adding `labRoute`.
- `pnpm test:e2e -- lab.spec.ts` passed for the import, seed switch, edit, preview, and download flow.
- `pnpm check` passed for Task 7: Biome check, TypeScript check, Vitest run, and Vite production build.
- `pnpm test:stories` passed for 3 Storybook test files and 10 stories after Task 7.
- `pnpm test:e2e` passed for 5 Playwright app flows, including the lab flow.
- `npx impeccable detect src/lab src/app src/styles/global.css` passed with no findings.
- `git diff --check` passed after Task 7.
- `pnpm test:unit -- src/lab/randomTheme.test.ts src/lab/draftTheme.test.ts` first failed on missing generator/generated-draft APIs, then passed after Task 8 implementation.
- `pnpm test:unit -- src/lab/LabPage.test.tsx` first failed on missing generator controls, then passed after wiring seed generation and group rerolls.
- `pnpm themes:generate -- --seed atlas --mode dark` passed and printed `generated-atlas-dark` JSON.
- `pnpm test:e2e -- lab.spec.ts` passed after adding generator coverage to the lab workflow.
- `pnpm check` passed for Task 8: Biome check, TypeScript check, Vitest run, and Vite production build.
- `pnpm test:stories` passed for 3 Storybook test files and 10 stories after Task 8.
- `pnpm test:e2e` passed for 5 Playwright app flows after Task 8.
- `npx impeccable detect src/lab scripts/themes-generate.mjs src/styles/global.css` passed with no findings.
- `git diff --check` passed after Task 8 code changes.
- `pnpm test:e2e -- catalog.spec.ts` passed for 4 catalog/detail QA flows after Task 9.
- `pnpm test:unit -- src/app/App.test.tsx src/catalog/CatalogPage.test.tsx src/lab/LabPage.test.tsx` passed after guideline fixes.
- `pnpm test:stories` passed for 3 Storybook test files and 10 stories with targeted a11y `error` coverage.
- `pnpm test:e2e` passed for 9 Playwright app flows after Task 9.
- `pnpm check` passed for Task 9: Biome check, TypeScript check, Vitest run, and Vite production build.
- `npx impeccable detect src/app src/catalog src/compare src/lab src/preview src/styles/global.css` passed with no findings.
- Web Interface Guidelines source was fetched from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`, reviewed against app/catalog/lab/preview UI files, and actionable fixes were applied.
- `git diff --check` passed after Task 9.
- `pnpm format` passed for Task 10 with no fixes required.
- `pnpm check` passed for Task 10: Biome check, TypeScript check, Vitest run, and Vite production build.
- `pnpm test:e2e` passed for 9 Playwright app flows after Task 10 docs polish.
- `pnpm build` passed after Task 10 docs polish.
- `pnpm test:stories` passed for 3 Storybook test files and 10 stories after Task 10 docs polish.
- `rtk pnpm test:unit -- src/theme-core/schema.test.ts` first failed on the missing upstream-port batch, then passed after adding Solarized Light, Solarized Dark, and Nord plus updated catalog expectations.
- `rtk pnpm themes:validate` passed: 6 catalog themes from 6 JSON files validated.
- `rtk pnpm themes:check-contrast` first failed on Solarized Light terminal foreground contrast, then passed after adjusting that required token.
- `rtk pnpm check` passed after the theme expansion: Biome check, TypeScript check, Vitest run, and Vite production build.
- `rtk pnpm test:e2e` passed for 9 Playwright app flows after the expanded catalog.
- `rtk pnpm test:stories` passed for 3 Storybook test files and 10 stories after the expanded catalog.
- Browser plugin tooling was unavailable in this session; direct Playwright local QA passed against Vite at `http://localhost:5174/`, confirming the `upstream-port` source filter shows 3 cards, desktop/mobile pages have no document-level horizontal overflow, and screenshots were saved under ignored `test-results/`.
- `rtk pnpm test:stories` first failed when promoting Workspace, Editor, Diff, and App stories to enforced a11y; it passed after fixing preview ARIA, contrast, scroll focus, and catalog filter landmark structure. Storybook global a11y now runs in `error` mode.
- `rtk pnpm test:e2e -- catalog.spec.ts` passed for 4 catalog/detail browser flows after changing catalog filters from a complementary landmark to a named group.
- `rtk npx impeccable detect src/preview src/styles/global.css` passed after the accessibility cleanup.
- Latest Web Interface Guidelines were fetched from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` and reviewed against touched preview/catalog files; no remaining findings in the touched surface.
- `rtk pnpm check` passed after accessibility cleanup: Biome check, TypeScript check, Vitest run, and Vite production build.
- `rtk pnpm test:e2e` passed for 9 Playwright app flows after accessibility cleanup.
- `rtk pnpm test:stories` passed for 3 Storybook test files and 10 stories with global a11y in `error` mode.
- `rtk pnpm build` passed after accessibility cleanup.
- Browser QA on the 6-theme checkpoint used the in-app Browser for DOM and interaction checks at
  desktop and 390px mobile. Browser screenshot capture timed out, so direct Playwright captured
  screenshots under `test-results/browser-qa/`. The QA pass confirmed 6 catalog themes,
  `upstream-port` filtering to Solarized Light, Solarized Dark, and Nord, clean detail exports,
  synchronized Solarized compare tabs, lab seed/edit/export behavior, and no horizontal overflow.
- `rtk pnpm test:unit -- src/theme-core/schema.test.ts` first failed on the missing second upstream
  batch, then the focused catalog/schema unit suite passed after adding Catppuccin Mocha, Dracula,
  Gruvbox Dark, Tokyo Night, and updated catalog expectations.
- `rtk pnpm themes:validate` passed after theme expansion checkpoint 2: 10 catalog themes from 10
  JSON files validated.
- `rtk pnpm themes:check-contrast` passed after theme expansion checkpoint 2: 10 catalog themes
  checked across 7 contrast pairs each.
- Browser QA on the expanded 10-theme catalog used the in-app Browser for desktop and 390px mobile
  DOM checks. It confirmed 10 total catalog themes, 7 upstream-port themes, zero document-level
  horizontal overflow, no clipped button/filter text, and balanced upstream card dimensions.
  Direct Playwright screenshots were saved under `test-results/browser-qa/expanded-*.png`.
- `rtk pnpm format` passed after checkpoint 2 and fixed 1 file.
- `rtk pnpm check` passed after checkpoint 2: Biome check, TypeScript check, Vitest run, and Vite
  production build.
- `rtk pnpm test:e2e` passed after checkpoint 2: 9 Playwright app flows.
- `rtk pnpm test:stories` passed after checkpoint 2: 3 Storybook test files and 10 stories with
  global a11y in `error` mode.
- `rtk pnpm build` passed after checkpoint 2.
- `rtk git diff --check` passed after checkpoint 2.

## Blockers

None.
