# Superset Theme Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, catalog-first React app for browsing, filtering, comparing, pairing, importing, generating, validating, editing, and exporting Superset-compatible themes.

**Architecture:** Use Vite + React + TypeScript as a static client app. Keep theme JSON export-clean, store catalog metadata separately, and share one preview system across catalog cards, theme detail, pair compare, Storybook, and the lab.

**Tech Stack:** `pnpm`, `biome`, Vite, React, TypeScript, TanStack Router, Vitest, Playwright, Storybook, Zod or Valibot, Culori.

---

## Testing Strategy

Use three complementary layers:

- **Vitest:** pure logic and component-level behavior that does not need a real browser workflow. Cover schema parsing, metadata parsing, filtering, pairing, import/export cleanup, contrast checks, and constrained generation.
- **Playwright:** end-to-end browser flows. Cover catalog filtering, detail route/drawer behavior, preview tab switching, pinned light/dark comparison, import errors, copy/download actions, keyboard navigation, responsive behavior, and static base-path routing.
- **Storybook:** preview-surface and component state development. Add stories for catalog cards, preview tabs, pair slots, lab states, validation warnings, and light/dark examples. Add Storybook interaction tests where isolated component states are easier to inspect than full app flows.

Do not treat Storybook as a replacement for Playwright. Storybook is for isolated UI states and review; Playwright is for complete app behavior.

## Resumability Rules

- Update this plan's checkboxes as tasks are completed.
- Update `docs/STATUS.md` after every meaningful checkpoint.
- Commit after coherent task groups.
- Keep commands in `COMMANDS.md` synchronized with `package.json`.
- Keep `AGENTS.md` and `CLAUDE.md` synchronized with process changes.

## File Structure

Planned structure after implementation:

```text
.
|- AGENTS.md
|- CLAUDE.md
|- COMMANDS.md
|- DESIGN.md
|- PRODUCT.md
|- README.md
|- biome.json
|- index.html
|- package.json
|- playwright.config.ts
|- pnpm-lock.yaml
|- tsconfig.json
|- vite.config.ts
|- vitest.config.ts
|- .storybook/
|   |- main.ts
|   |- preview.ts
|   `- vitest.setup.ts
|- docs/
|   |- STATUS.md
|   `- superpowers/
|       |- plans/
|       `- specs/
|- e2e/
|   |- catalog.spec.ts
|   |- lab.spec.ts
|   `- pairing.spec.ts
|- src/
|   |- app/
|   |   |- App.tsx
|   |   |- router.tsx
|   |   `- routes/
|   |       |- catalogRoute.tsx
|   |       |- labRoute.tsx
|   |       `- themeRoute.tsx
|   |- catalog/
|   |   |- CatalogPage.tsx
|   |   |- catalogFilters.ts
|   |   |- catalogFilters.test.ts
|   |   |- catalogSearch.ts
|   |   |- catalogSearch.test.ts
|   |   |- ThemeCard.tsx
|   |   |- ThemeCard.stories.tsx
|   |   `- ThemeDetail.tsx
|   |- compare/
|   |   |- PairCompare.tsx
|   |   |- pairing.ts
|   |   |- pairing.test.ts
|   |   `- PairSlot.tsx
|   |- data/
|   |   |- catalog.ts
|   |   |- fixtures.ts
|   |   `- themes/
|   |       |- aurora-dark.json
|   |       |- aurora-light.json
|   |       `- graphite-dark.json
|   |- lab/
|   |   |- LabPage.tsx
|   |   |- draftTheme.ts
|   |   |- draftTheme.test.ts
|   |   |- importTheme.ts
|   |   |- importTheme.test.ts
|   |   |- randomTheme.ts
|   |   `- randomTheme.test.ts
|   |- preview/
|   |   |- PreviewFrame.tsx
|   |   |- PreviewTabs.tsx
|   |   |- PreviewTabs.stories.tsx
|   |   |- surfaces.tsx
|   |   `- themeCssVars.ts
|   |- theme-core/
|   |   |- contrast.ts
|   |   |- contrast.test.ts
|   |   |- schema.ts
|   |   |- schema.test.ts
|   |   |- themeTypes.ts
|   |   `- exportTheme.ts
|   |- ui/
|   |   |- Button.tsx
|   |   |- Field.tsx
|   |   |- IconButton.tsx
|   |   |- SegmentedControl.tsx
|   |   `- Tabs.tsx
|   |- styles/
|   |   |- global.css
|   |   `- tokens.css
|   |- main.tsx
|   `- test/
|       `- setup.ts
`- scripts/
    |- check.mjs
    |- themes-check-contrast.mjs
    `- themes-validate.mjs
```

## Task 1: Scaffold Tooling and Static App Shell

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `biome.json`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/styles/global.css`
- Create: `src/styles/tokens.css`
- Create: `scripts/check.mjs`
- Modify: `COMMANDS.md`
- Modify: `docs/STATUS.md`

- [ ] **Step 1: Scaffold dependencies**

Run:

```bash
pnpm init
pnpm add @tanstack/react-router @vitejs/plugin-react culori lucide-react react react-dom zod
pnpm add -D @biomejs/biome @playwright/test @storybook/addon-a11y @storybook/addon-vitest @storybook/react-vite @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/node @types/react @types/react-dom jsdom playwright storybook typescript vite vitest
```

Expected: `package.json` and `pnpm-lock.yaml` are created, dependencies install successfully.

- [ ] **Step 2: Define scripts**

Set `package.json` scripts to:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "format": "biome format --write .",
    "lint": "biome check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:stories": "vitest --project=storybook --run",
    "storybook": "storybook dev -p 6006",
    "build:storybook": "storybook build",
    "themes:validate": "node scripts/themes-validate.mjs",
    "themes:check-contrast": "node scripts/themes-check-contrast.mjs",
    "themes:generate": "node scripts/themes-generate.mjs",
    "check": "node scripts/check.mjs"
  }
}
```

- [ ] **Step 3: Add app shell**

Create `src/app/App.tsx` with a small route host and an empty catalog shell. Use accessible landmarks and no marketing hero.

- [ ] **Step 4: Add `scripts/check.mjs`**

Make `pnpm check` run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use `child_process.spawnSync` so failures stop the sequence and preserve clear output.

- [ ] **Step 5: Verify scaffold**

Run:

```bash
pnpm check
```

Expected: format/lint/type/test/build pass with the minimal app.

- [ ] **Step 6: Update resumability docs and commit**

Update `docs/STATUS.md` with scaffold status and verification.

Run:

```bash
git add .
git commit -m "chore: scaffold static React app"
```

## Task 2: Define Theme Schema, Metadata, and Fixture Catalog

**Files:**
- Create: `src/theme-core/themeTypes.ts`
- Create: `src/theme-core/schema.ts`
- Create: `src/theme-core/schema.test.ts`
- Create: `src/theme-core/exportTheme.ts`
- Create: `src/theme-core/exportTheme.test.ts`
- Create: `src/data/themes/aurora-light.json`
- Create: `src/data/themes/aurora-dark.json`
- Create: `src/data/themes/graphite-dark.json`
- Create: `src/data/catalog.ts`
- Create: `src/data/fixtures.ts`
- Create: `scripts/themes-validate.mjs`
- Modify: `docs/STATUS.md`

- [ ] **Step 1: Write schema tests**

Test that fixture themes parse, exported themes exclude metadata, and invalid theme types fail.

- [ ] **Step 2: Implement schema and types**

Define `SupersetTheme`, `ThemeType`, `UiTokens`, `TerminalTokens`, and `CatalogThemeMeta`. Use `zod` for runtime validation.

- [ ] **Step 3: Add fixture themes**

Add one light/dark pair and one extra dark fixture. Keep palettes deliberately distinct enough to test filters and preview surfaces.

- [ ] **Step 4: Implement metadata catalog**

Create `catalogThemes` by pairing JSON themes with metadata. Include `pairGroup`, `source`, `family`, `variant`, `styleTags`, `accentHue`, `warmth`, `contrastTier`, `terminalPaletteQuality`, `license`, `upstreamUrl`, and `portStatus`.

- [ ] **Step 5: Add validation script**

Make `pnpm themes:validate` validate all catalog entries and fail on duplicate IDs, missing pairs, invalid metadata, or invalid theme JSON.

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm test:unit
pnpm themes:validate
pnpm check
git add .
git commit -m "feat: add theme schema and fixture catalog"
```

## Task 3: Build Theme Core Utilities

**Files:**
- Create: `src/theme-core/contrast.ts`
- Create: `src/theme-core/contrast.test.ts`
- Create: `src/preview/themeCssVars.ts`
- Create: `src/preview/themeCssVars.test.ts`
- Create: `scripts/themes-check-contrast.mjs`
- Modify: `docs/STATUS.md`

- [ ] **Step 1: Write contrast tests**

Cover foreground/background, card/cardForeground, primary/primaryForeground, destructive/destructiveForeground, terminal foreground/background, and selection contrast where present.

- [ ] **Step 2: Implement contrast checks**

Use Culori or an internal WCAG contrast helper. Return structured warnings with token paths, ratio, threshold, and severity.

- [ ] **Step 3: Implement CSS variable mapping**

Map theme UI and terminal tokens to preview CSS variables. Keep the mapping pure and testable.

- [ ] **Step 4: Add contrast script**

Make `pnpm themes:check-contrast` print a concise report and exit non-zero for failing required pairs.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm test:unit
pnpm themes:check-contrast
pnpm check
git add .
git commit -m "feat: add theme validation utilities"
```

## Task 4: Build Preview Surface System

**Files:**
- Create: `src/preview/PreviewFrame.tsx`
- Create: `src/preview/PreviewTabs.tsx`
- Create: `src/preview/surfaces.tsx`
- Create: `src/preview/PreviewTabs.stories.tsx`
- Create: `src/ui/Button.tsx`
- Create: `src/ui/IconButton.tsx`
- Create: `src/ui/SegmentedControl.tsx`
- Create: `src/ui/Tabs.tsx`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Modify: `docs/STATUS.md`

- [ ] **Step 1: Shape UI with Impeccable**

Run an Impeccable shape pass for the preview system before implementation. Record the result in `docs/STATUS.md`.

- [ ] **Step 2: Write component tests**

Test that preview tabs switch between `Workspace`, `Editor`, `Terminal`, `Diff`, `Command Palette`, and `Settings/Form`, and that tab controls have accessible names and selected state.

- [ ] **Step 3: Implement preview frame and tabs**

Use stable dimensions, semantic tab markup, and shared theme CSS variables.

- [ ] **Step 4: Implement surfaces**

Create focused surfaces for workspace, editor, terminal, diff, command palette, and settings/form. Include active, selected, disabled, warning, error, and focusable states where relevant.

- [ ] **Step 5: Add Storybook stories**

Add stories for each surface and for at least one light/dark pair. Stories should be useful for Impeccable critique and visual inspection.

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm test:unit
pnpm test:stories
pnpm check
git add .
git commit -m "feat: build theme preview surfaces"
```

## Task 5: Build Catalog Search, Filters, Cards, and Detail View

**Files:**
- Create: `src/catalog/catalogSearch.ts`
- Create: `src/catalog/catalogSearch.test.ts`
- Create: `src/catalog/catalogFilters.ts`
- Create: `src/catalog/catalogFilters.test.ts`
- Create: `src/catalog/CatalogPage.tsx`
- Create: `src/catalog/ThemeCard.tsx`
- Create: `src/catalog/ThemeCard.stories.tsx`
- Create: `src/catalog/ThemeDetail.tsx`
- Modify: `src/app/router.tsx`
- Modify: `src/app/routes/catalogRoute.tsx`
- Modify: `src/app/routes/themeRoute.tsx`
- Modify: `docs/STATUS.md`

- [ ] **Step 1: Write filter/search tests**

Cover text search, light/dark filter, source filter, family filter, paired/unpaired filter, tags, accent hue, warmth, contrast tier, terminal quality, and sorting.

- [ ] **Step 2: Implement pure search/filter helpers**

Use Set/Map lookups where repeated filtering benefits from indexing. Avoid unnecessary chained loops on the hot path.

- [ ] **Step 3: Build catalog page**

Create a dense but readable catalog page with search, filter controls, sort, empty state, compact cards, and keyboard-friendly actions.

- [ ] **Step 4: Build theme card and detail view**

Cards show compact composite previews. Detail view shows full preview tabs and actions: pin light, pin dark, edit in lab, copy JSON, download JSON.

- [ ] **Step 5: Add route/search-param handling**

Use TanStack Router search params for filter state where practical. Preserve shareable URLs for selected filters and theme detail routes.

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm test:unit
pnpm test:stories
pnpm check
git add .
git commit -m "feat: build catalog browsing experience"
```

## Task 6: Build Pair Compare Workflow

**Files:**
- Create: `src/compare/pairing.ts`
- Create: `src/compare/pairing.test.ts`
- Create: `src/compare/PairCompare.tsx`
- Create: `src/compare/PairSlot.tsx`
- Modify: `src/catalog/ThemeCard.tsx`
- Modify: `src/catalog/ThemeDetail.tsx`
- Modify: `src/app/router.tsx`
- Modify: `e2e/pairing.spec.ts`
- Modify: `docs/STATUS.md`

- [ ] **Step 1: Write pairing tests**

Cover pinning light themes into the light slot, dark themes into the dark slot, replacing existing pins, rejecting mismatched slot operations with a clear result, clearing slots, and syncing selected preview tab.

- [ ] **Step 2: Implement pairing state helpers**

Keep helpers pure. Persist only minimal state: light theme ID, dark theme ID, selected preview tab.

- [ ] **Step 3: Build pair UI**

Show light and dark slots side by side on desktop and stacked on mobile. Use the same selected preview tab for both slots.

- [ ] **Step 4: Add Playwright pairing flow**

Test pinning a light theme, pinning a dark theme, switching preview tabs, and preserving state through URL or local storage depending on the implementation decision.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm test:unit
pnpm test:e2e -- pairing.spec.ts
pnpm check
git add .
git commit -m "feat: add light dark pair comparison"
```

## Task 7: Build Lab Import, Clone, Edit, and Export

**Files:**
- Create: `src/lab/LabPage.tsx`
- Create: `src/lab/draftTheme.ts`
- Create: `src/lab/draftTheme.test.ts`
- Create: `src/lab/importTheme.ts`
- Create: `src/lab/importTheme.test.ts`
- Create: `src/app/routes/labRoute.tsx`
- Modify: `src/catalog/ThemeDetail.tsx`
- Modify: `e2e/lab.spec.ts`
- Modify: `docs/STATUS.md`

- [ ] **Step 1: Write import/export tests**

Cover valid JSON import, invalid JSON error, schema error, metadata exclusion on export, cloning from catalog theme, reset to source, and copy/download payload.

- [ ] **Step 2: Implement draft model**

Represent lab drafts separately from catalog themes. Include source type: `catalog`, `import`, or `generated`.

- [ ] **Step 3: Build lab page**

Include entry points for start from existing theme, import JSON, and generated draft. Use the shared preview tabs and show validation warnings inline.

- [ ] **Step 4: Add edit controls**

Start with grouped token editing for base UI, accent, terminal, charts, and highlights. Use visible labels and clear error messages.

- [ ] **Step 5: Add Playwright lab flow**

Test importing invalid JSON, importing valid JSON, editing a token, preview changing, and exporting clean JSON.

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm test:unit
pnpm test:e2e -- lab.spec.ts
pnpm check
git add .
git commit -m "feat: add theme lab import and export"
```

## Task 8: Build Constrained Random Theme Generator

**Files:**
- Create: `src/lab/randomTheme.ts`
- Create: `src/lab/randomTheme.test.ts`
- Create: `scripts/themes-generate.mjs`
- Modify: `src/lab/LabPage.tsx`
- Modify: `docs/STATUS.md`

- [ ] **Step 1: Write generator tests**

Cover deterministic seed output, light/dark mode selection, locked token groups, contrast rejection, hue constraints, and export-clean generated themes.

- [ ] **Step 2: Implement OKLCH-based generator**

Use Culori for perceptual color work. Generate coordinated surface ramps, accent ramps, terminal palette, chart colors, syntax colors, and highlights.

- [ ] **Step 3: Add lockable generator controls**

Allow rerolling base surfaces, accents, terminal ANSI, charts, syntax, and highlights independently.

- [ ] **Step 4: Add CLI generator**

Make `pnpm themes:generate` print or write one deterministic draft for local inspection.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm test:unit
pnpm themes:generate
pnpm check
git add .
git commit -m "feat: add constrained theme generator"
```

## Task 9: Add End-to-End, Accessibility, and Design QA

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/catalog.spec.ts`
- Create: `e2e/pairing.spec.ts`
- Create: `e2e/lab.spec.ts`
- Modify: `.storybook/main.ts`
- Modify: `.storybook/preview.ts`
- Modify: `docs/STATUS.md`

- [ ] **Step 1: Configure Playwright**

Use the dev server from `pnpm dev` or production preview from `pnpm preview`. Prefer role and label locators over CSS selectors.

- [ ] **Step 2: Add catalog E2E tests**

Cover load, search, filter, theme detail, preview tab switch, copy/download button availability, keyboard tab order, and responsive layout.

- [ ] **Step 3: Add Storybook a11y checks**

Configure accessibility checks for stories. Include representative light and dark states.

- [ ] **Step 4: Run Impeccable critique loops**

Critique catalog, detail, compare, and lab screens. Record findings in `docs/STATUS.md` and fix actionable issues.

- [ ] **Step 5: Run Web Interface Guidelines review**

Fetch latest guidelines and review actual UI files. Record findings and fixes in `docs/STATUS.md`.

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm test:stories
pnpm test:e2e
pnpm check
git add .
git commit -m "test: add browser and design quality coverage"
```

## Task 10: Polish Docs and Handoff

**Files:**
- Modify: `README.md`
- Modify: `COMMANDS.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Modify: `docs/STATUS.md`
- Modify: `docs/superpowers/plans/2026-05-27-superset-theme-catalog-implementation.md`

- [ ] **Step 1: Sync README with actual app**

Update stack, current features, setup, and verification commands.

- [ ] **Step 2: Sync COMMANDS with package scripts**

Every `package.json` script should either appear in `COMMANDS.md` or be intentionally internal.

- [ ] **Step 3: Update agent docs**

Ensure resumability, Browser preference, verification commands, and design QA requirements are current.

- [ ] **Step 4: Final verification**

Run:

```bash
pnpm format
pnpm check
pnpm test:e2e
pnpm build
```

- [ ] **Step 5: Final status and commit**

Update `docs/STATUS.md` with final state, verification output, and next theme-expansion work.

Run:

```bash
git add .
git commit -m "docs: update project handoff"
```

## Self-Review

- Spec coverage: covered tooling, catalog, preview tabs, pairing, lab import/clone/generate/export, metadata separation, validation, testing, design QA, docs, commands, and resumability.
- Red-flag scan: no incomplete markers or vague implementation-only notes should remain in this plan.
- Type consistency: planned core names are stable across tasks: `SupersetTheme`, `CatalogThemeMeta`, `catalogThemes`, `PreviewTabs`, `PairCompare`, `LabPage`, and `randomTheme`.
