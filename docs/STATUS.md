# Project Status

## Current State

The Superset Theme Catalog is a complete static React/Vite app for browsing, comparing, editing,
generating, validating, and exporting Superset-compatible themes. It currently ships 14 catalog
themes and is configured for GitHub Pages project hosting at `/superset-themes/`.

Previous committed checkpoint: `2a68fa2 refactor: align critical theme css mapping`.

Latest completed checkpoint:

- Catalog assembly now joins theme metadata to theme JSON by `themeId` instead of array position.
- Featured and baseline theme IDs derive from catalog `featuredRank` / `baselineRank` metadata.
- Critical first-paint theme CSS reads the same runtime default focused theme as the app.
- `global.css` now acts as an ordered import manifest for split surface CSS files; style contract
  tests read the full CSS import graph.

## Active Work

- None. The bundle/repo-structure cleanup opportunities tracked from the audit have been handled.

## Verification

Current slice verification passed:

- `rtk git diff --check`
- `rtk pnpm check` passed: Biome checked 179 files with no warnings, Vitest passed 48 files /
  311 tests, script tests passed, and the production build inside `check` succeeded.
- `rtk pnpm test:e2e` passed: 29 passed, 1 skipped.
- `rtk pnpm test:stories` passed: 9 files / 31 stories.
- `rtk pnpm build` passed; initial JS `368.60 kB` minified / `113.73 kB` gzip.
- `rtk pnpm build:pages` passed; Pages initial JS `368.63 kB` minified / `113.74 kB` gzip.

## GitHub Pages And Bundle Baseline

- `pnpm build:pages` builds with the `/superset-themes/` base path.
- Vite emits `404.html` as a GitHub Pages SPA fallback and `.nojekyll`.
- `.github/workflows/pages.yml` verifies and deploys the Pages artifact from `main`.
- Current initial JS baseline:
  - normal build: `368.60 kB` minified / `113.73 kB` gzip
  - Pages build: `368.63 kB` minified / `113.74 kB` gzip

## Remaining Opportunities

None currently tracked from the bundle/repo-structure audit.

## Blockers

None.

## References

- Product context: `PRODUCT.md`
- Design direction: `DESIGN.md`
- Catalog redesign design record: `docs/design/2026-05-27-catalog-redesign.md`
- Theme attributions: `docs/THEME_ATTRIBUTIONS.md`
- Command reference: `COMMANDS.md`
- Historical status log before cleanup: `b7574e9:docs/STATUS.md`
