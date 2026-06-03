# Project Status

## Current State

The Superset Theme Catalog is a complete static React/Vite app for browsing, comparing, editing,
generating, validating, and exporting Superset-compatible themes. It currently ships 20 catalog
themes and is configured for GitHub Pages project hosting at `/superset-themes/`.

Previous committed checkpoint: `b437ae8 Record public Pages launch`.

Latest completed checkpoint — time-of-day default theme:

- A bare `/` visit now seeds a random *featured* theme matching the OS `prefers-color-scheme`
  (dark->dark, light->light), pins the pick into `?theme=` (replace) so refresh/back/share stay
  stable, and an explicit `?theme=` deep link always wins. Design:
  `docs/design/2026-06-03-time-of-day-default-theme.md`; plan:
  `docs/superpowers/plans/2026-06-03-time-of-day-default-theme.md`.
- First paint is flash-free: `vite-plugin-critical-theme` now bakes one critical block per featured
  theme keyed by `data-theme-id` plus a no-attribute fallback, and injects an inline `<head>` script
  that resolves the theme before paint. React seeds `FocusedThemeProvider` from the painted
  `data-theme-id` (`App.tsx`); the catalog route pins the chosen theme. The picker is a pure,
  unit-tested `pickThemeIdForScheme` in `src/theme/defaultThemeSelection.ts`.
- Review remediation: the inline first-paint script now gates random featured selection to the
  configured Vite catalog root only, so compare/lab deep links keep their route state untouched
  before React applies the route seed.
- Featured set rebalanced: GitHub Light promoted to rank 5, One Dark retired to `featuredRank: null`,
  giving a 3-light / 2-dark featured pool. `getDefaultFocusedTheme()` stays rank-1 Tokyo Night as the
  deterministic fallback. (Note: catalog overall is still dark-heavy at 14 dark / 6 light; a
  light-only theme batch is the open follow-up to fix balance.)
- The baked critical CSS grew `index.html` to about 19.1 kB (gzip about 3.1 kB); acceptable,
  trimmable to essential vars later if needed.

Prior checkpoint — public repo maintenance:

- Public repo maintenance added PR CI, Dependabot update config, a code of conduct, and README
  live-app/current-control copy.
- GitHub settings now have Issues, Dependabot vulnerability alerts/security updates, private
  vulnerability reporting, secret scanning, and push protection enabled.
- GitHub also deletes merged PR branches automatically, lets maintainers update PR branches, and
  protects `main` with required `verify` CI, linear history, conversation resolution, and force
  push/deletion blocks.
- GitHub Pages builds now emit direct app-shell artifacts for `/compare` and `/lab` in addition to
  the SPA `404.html` fallback.
- The tracked `.superset/config.json` hidden tool config was removed and `.superset/` is ignored,
  avoiding confusion with user-level Superset app state.
- Stale local branches `airfork/critique-lab-page`, `airfork/gh-pages-bundle-audit`, and
  `airfork/superset-dark-mode` were deleted after confirming no matching remote branches remain.

Prior checkpoint — nameplate pills + six catalog themes:

- Removed the style-tag pills from the pane nameplate (`Nameplate.tsx` plus its CSS and tests);
  `styleTags` metadata is retained in the catalog/schema (still stripped from exported JSON).
- Added six post-launch catalog themes: GitHub Light/Dark/Dark Dimmed, Catppuccin Latte, and
  Rosé Pine (main) + Rosé Pine Moon. All MIT, ported from upstream palettes, passing the contrast
  gate with no warnings. Dark variants follow the catalog's light-accent/dark-foreground pattern
  so the required primary/destructive pairs clear 4.5; GitHub Light/Dark form a `github` pair group.
- The command palette's `rose` query now ties across the three Rosé Pine variants and resolves to
  the shortest id (`rose-pine`); Enter-applies tests switched to the unique `dawn` query.
- Pre-public readiness now uses Vite's `%BASE_URL%` placeholder for static shell install assets,
  so GitHub Pages builds resolve favicon, apple-touch icon, and manifest links under
  `/superset-themes/`.
- Public-facing repository docs no longer include the private SSH remote, and the repo now has
  contribution guidance, a security policy, issue templates, and a pull request template.
- Repository visibility is public, the MIT license is attached on GitHub, and GitHub Pages is
  configured for workflow deploys at `https://airfork.github.io/superset-themes/`.
- Public launch polish added favicon/app/social-card SVG assets, web app manifest, robots/sitemap
  hints, and Open Graph/Twitter/canonical metadata in the static shell.
- Catalog assembly now joins theme metadata to theme JSON by `themeId` instead of array position.
- Featured and baseline theme IDs derive from catalog `featuredRank` / `baselineRank` metadata.
- Critical first-paint theme CSS now bakes a block per featured theme plus a no-attribute fallback
  (see the time-of-day checkpoint above) rather than a single default block.
- `global.css` now acts as an ordered import manifest for split surface CSS files; style contract
  tests read the full CSS import graph.

## Active Work

- None. The bundle/repo-structure cleanup opportunities tracked from the audit have been handled.

## Verification

Current slice verification passed (time-of-day default theme):

- Merge refresh note: `origin/main` brought a dependency refresh whose TanStack 1.170.11 lockfile
  entries were still inside pnpm's active minimum-release-age policy. The merged branch keeps the
  direct `@tanstack/react-router` range at `^1.170.8`; after `rtk pnpm clean --lockfile` and
  `rtk pnpm install`, pnpm resolved policy-compliant `@tanstack/react-router@1.170.10`.
- `rtk pnpm check` passed: Biome clean, Vitest passed 53 files / 361 tests, metadata/community
  tests passed 5 tests, critical-theme/Pages plugin tests passed 7 tests, archive-clean tests
  passed 3 tests, and the production build succeeded.
- `rtk pnpm test:e2e` passed: 34 passed, 1 skipped, including `e2e/default-theme.spec.ts`
  (dark->dark, light->light via `emulateMedia({ colorScheme })`, and `?theme=` override) plus the
  pinning assertions, with existing catalog/rail/shell specs re-pinned to `?theme=tokyo-night` for
  determinism.
- `rtk pnpm test:stories` passed: 9 files / 31 stories.
- `rtk pnpm build` passed; initial JS `382.34 kB` minified / `116.06 kB` gzip.
- `rtk pnpm build:pages` passed; Pages initial JS `382.37 kB` minified / `116.07 kB` gzip.
- `rtk sh -c 'test -f ...'` passed for `dist/compare.html`, `dist/compare/index.html`,
  `dist/lab.html`, and `dist/lab/index.html`.
- `rtk git diff --check origin/main...HEAD` passed.
- TDD throughout: each task wrote a failing test first, then the minimal implementation.

Launch deploy verification (still current):

- `rtk git diff --check`
- `rtk pnpm check` passed: Biome checked 193 files with no warnings, Vitest passed 52 files /
  348 tests, script tests passed, 5 metadata/community tests passed, 3 critical-theme/Pages plugin
  tests passed, and the production build inside `check` succeeded.
- `rtk pnpm test:e2e` passed: 31 passed, 1 skipped.
- `rtk pnpm test:stories` passed: 9 files / 31 stories.
- `rtk pnpm build` passed; initial JS `368.66 kB` minified / `113.76 kB` gzip.
- `rtk pnpm build:pages` passed; Pages initial JS `368.69 kB` minified / `113.77 kB` gzip.
- `test -f dist/compare.html`, `test -f dist/compare/index.html`, `test -f dist/lab.html`, and
  `test -f dist/lab/index.html` passed after the Pages build.
- `rtk gh workflow enable pages.yml --repo airfork/superset-themes` enabled the deploy workflow
  after the public visibility flip.
- `rtk gh workflow run pages.yml --repo airfork/superset-themes --ref main` created run
  `26861786877`; `rtk gh run watch 26861786877 --repo airfork/superset-themes --exit-status`
  passed with successful `build` and `deploy` jobs.
- `rtk curl -I https://airfork.github.io/superset-themes/` returned `HTTP/2 200`.

## GitHub Pages And Bundle Baseline

- `pnpm build:pages` builds with the `/superset-themes/` base path.
- Vite emits `404.html` as a GitHub Pages SPA fallback, `.nojekyll`, and direct route copies for
  `compare` and `lab`.
- `.github/workflows/pages.yml` verifies and deploys the Pages artifact from `main`.
- Public metadata now targets `https://airfork.github.io/superset-themes/`.
- Pages API reports `build_type: workflow`, `public: true`, and
  `html_url: https://airfork.github.io/superset-themes/`.
- Pages build output now resolves shell install assets under `/superset-themes/`:
  `/superset-themes/favicon.svg`, `/superset-themes/apple-touch-icon.svg`, and
  `/superset-themes/site.webmanifest`.
- Current initial JS baseline:
  - normal build: `382.34 kB` minified / `116.06 kB` gzip
  - Pages build: `382.37 kB` minified / `116.07 kB` gzip

## Remaining Opportunities

- Light/dark balance: the catalog is still dark-heavy (14 dark / 6 light). A light-only theme batch
  (e.g. One Light, Gruvbox Light, Tokyo Night Day, Ayu Light, Everforest Light) would both fix the
  balance and deepen the daytime pool for the time-of-day default.
- The successful Pages workflow run emitted a GitHub Actions warning that several current
  JavaScript actions are Node 20-based; watch for upstream action updates or set the runner env
  override once GitHub's Node 24 transition becomes actionable.

## Blockers

None.

## References

- Product context: `PRODUCT.md`
- Design direction: `DESIGN.md`
- Catalog redesign design record: `docs/design/2026-05-27-catalog-redesign.md`
- Theme attributions: `docs/THEME_ATTRIBUTIONS.md`
- Command reference: `COMMANDS.md`
- Historical status log before cleanup: `b7574e9:docs/STATUS.md`
