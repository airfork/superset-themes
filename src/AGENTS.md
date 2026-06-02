# src/ Module Map

Agent navigation guide for the source tree. Read the root [AGENTS.md](../AGENTS.md) first for
working style, constraints, and verification. Product/design context lives in
[PRODUCT.md](../PRODUCT.md) and [DESIGN.md](../DESIGN.md).

## How the app fits together

The site is a Superset-adjacent **master/detail shell** that morphs into the focused theme. A
single mapping turns a theme into CSS variables, which are written to `:root`; every surface reads
those variables, so changing the focused theme re-skins the whole site.

- `theme-core/themeCssVars` produces two namespaces from one theme:
  - `--preview-*` — preview surfaces (workspace, settings, terminal, compare slots).
  - `--chrome-*` — persistent app chrome (rail, top/bottom bar, palette), derived for stable
    contrast rather than copied raw.
- `theme/applyTheme` writes those variables plus `data-theme-id` / `data-theme-type` to a root
  element; `FocusedThemeProvider` / `useFocusedTheme` own the focused-theme React state.

## Modules

- `app/` — TanStack Router setup (`router.tsx`, `routes/`) and the root `App`. Catalog, `/compare`,
  and `/lab` are sibling routes sharing the shell.
- `chrome/` — persistent app chrome: `TopBar`, `BottomBar`, `LayoutShell`, `ShortcutsOverlay`.
- `rail/` — left master rail: `RailRow`, `RailSection`, `RailSearch`, and `useRailKeyboard`
  (arrow/Home/End/`/` navigation, roving tabindex).
- `pane/` — detail pane: `Nameplate`, `WorkspaceScene`, `SettingsScene`, `SceneTabs`. Scenes are
  Superset-shaped previews driven by `--preview-*` tokens.
- `compare/` — compare mode: pure `compareState` reducer (LRU two-slot pinning) + `CompareView` /
  `CompareSlot` (each slot scopes its own theme vars).
- `palette/` — ⌘K command palette: pure `fuzzy` matcher, `paletteState` reducer, `commands` /
  `paletteEntries` builders, `usePalette` hook, presentational `Palette`.
- `lab/` — theme lab: import (`importTheme`), live edit (`draftTheme`, `ColorField`,
  `TokensSection`), constrained random generation (`randomTheme`), `ContrastSummary`, export.
- `theme/` — runtime theme application: `applyTheme`, `FocusedThemeProvider`, `useFocusedTheme`.
- `theme-core/` — pure theme logic (no React/DOM): Zod `schema`, `themeTypes`, `contrast`,
  `exportTheme` (export-clean Superset JSON), `chromeTokens`, `focusRingContrast`.
- `preview/` — `themeCssVars`: the theme → CSS-variable mapping consumed by `theme/applyTheme`.
- `data/` — `catalog`, `featured`, `baseline` (Superset defaults), `fixtures`, and `themes/`
  (one JSON per catalog theme). Catalog metadata stays out of exported theme JSON.
- `styles/` — `tokens.css`, `global.css` as the ordered surface-style import manifest, split
  surface CSS files, plus `*Contracts.test.ts` style-invariant tests (focus rings, rail, theme
  transitions, workspace scene).
- `text/` — `foldForMatch` text normalization shared by search/fuzzy.

## Conventions

- Tests are colocated: `*.test.ts(x)` (Vitest) and `*.stories.tsx` (Storybook + a11y).
- Keep pure logic in `theme-core/` (and other `*State`/`*.ts` helpers) testable without a DOM.
- `styles/*Contracts.test.ts` lock visual/accessibility invariants and read the full CSS import
  graph through `styleTestUtils.ts` — extend them rather than silently relaxing them.
- Exported theme JSON must stay Superset-compatible and free of app-only metadata.
- Superset Light/Dark are deliberate live-app fidelity baselines; some of their tokens
  intentionally bypass the contrast-safe derivations other catalog themes use.
