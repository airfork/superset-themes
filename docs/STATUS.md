# Project Status

## Current State

The Superset Theme Catalog is a complete static React/Vite app for browsing, comparing, editing,
generating, validating, and exporting Superset-compatible themes. It currently ships 14 catalog
themes and is configured for GitHub Pages project hosting at `/superset-themes/`.

Previous committed checkpoint: `b7574e9 feat: optimize GitHub Pages bundle`.

Latest completed checkpoint:

- Critical first-paint theme CSS now uses the runtime `getThemeCssVars()` mapper instead of a
  separate hand-built variable loop. This keeps `--chrome-*`, `--preview-focus-ring`, selection,
  and terminal selection variables aligned between first paint and runtime theme application.
- `docs/STATUS.md` has been trimmed to current state, active work, verification, blockers, and
  references. The old phase-by-phase historical log remains recoverable from
  `b7574e9:docs/STATUS.md`.

## Active Work

- Commit the cleanup slice after verification.

## Verification

Last full verification for `b7574e9` passed:

- `rtk git diff --check`
- `rtk pnpm check`
- `rtk pnpm test:e2e`
- `rtk pnpm test:stories`
- `rtk pnpm build`
- `rtk pnpm build:pages`

Current slice verification passed:

- `rtk git diff --check`
- `rtk pnpm check`
- `rtk pnpm exec tsx --test scripts/vite-plugin-critical-theme.test.mjs` passed.
- `rtk pnpm test:e2e` passed: 29 passed, 1 skipped.
- `rtk pnpm test:stories` passed: 9 files / 31 stories.
- `rtk pnpm build`
- `rtk pnpm build:pages`
- Pages artifact inspection confirmed `--chrome-surface`, `--chrome-muted-foreground`, and
  `--preview-focus-ring` in both `dist/index.html` and `dist/404.html`.

## GitHub Pages And Bundle Baseline

- `pnpm build:pages` builds with the `/superset-themes/` base path.
- Vite emits `404.html` as a GitHub Pages SPA fallback and `.nojekyll`.
- `.github/workflows/pages.yml` verifies and deploys the Pages artifact from `main`.
- Current initial JS baseline from `b7574e9`:
  - normal build: `368.34 kB` minified / `113.60 kB` gzip
  - Pages build: `368.38 kB` minified / `113.61 kB` gzip
- Current critical CSS adds the shared chrome/focus variables; initial JS remains unchanged.

## Remaining Opportunities

- Reduce manual catalog registration duplication in `src/data/catalog.ts`.
- Split `src/styles/global.css` by app surface while keeping the existing style contract tests.

## Blockers

None.

## References

- Product context: `PRODUCT.md`
- Design direction: `DESIGN.md`
- Catalog redesign design record: `docs/design/2026-05-27-catalog-redesign.md`
- Theme attributions: `docs/THEME_ATTRIBUTIONS.md`
- Command reference: `COMMANDS.md`
- Historical status log before cleanup: `b7574e9:docs/STATUS.md`
