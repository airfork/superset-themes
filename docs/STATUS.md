# Project Status

## Current State

The Superset Theme Catalog is a complete static React/Vite app for browsing, comparing, editing,
generating, validating, and exporting Superset-compatible themes. It currently ships 20 catalog
themes and is configured for GitHub Pages project hosting at `/superset-themes/`.

Previous committed checkpoint: `2a68fa2 refactor: align critical theme css mapping`.

Latest completed checkpoint:

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
- Critical first-paint theme CSS reads the same runtime default focused theme as the app.
- `global.css` now acts as an ordered import manifest for split surface CSS files; style contract
  tests read the full CSS import graph.

## Active Work

- None. The bundle/repo-structure cleanup opportunities tracked from the audit have been handled.

## Verification

Current slice verification passed (six-theme addition + nameplate pill removal):

- `rtk pnpm themes:validate` passed: 20 catalog themes from 20 JSON files.
- `rtk pnpm themes:check-contrast` passed for 20 themes; the only optional warnings are on the
  frozen `superset-*` baselines (the six new themes report zero warnings).
- `rtk pnpm check` passed: Biome clean, Vitest passed 52 files / 355 tests, script/metadata tests
  passed, and the production build inside `check` succeeded.
- `rtk pnpm test:e2e` passed: 31 passed, 1 skipped.
- `rtk pnpm test:stories` passed: 9 files / 31 stories.
- Visual spot-check via the dev server confirmed GitHub Light/Dark Dimmed, Catppuccin Latte, and
  Rosé Pine render correctly and that the nameplate no longer shows style-tag pills.

Launch deploy verification (still current):

- `rtk gh workflow enable pages.yml --repo airfork/superset-themes` enabled the deploy workflow
  after the public visibility flip.
- `rtk gh workflow run pages.yml --repo airfork/superset-themes --ref main` created run
  `26861786877`; `rtk gh run watch 26861786877 --repo airfork/superset-themes --exit-status`
  passed with successful `build` and `deploy` jobs.
- `rtk curl -I https://airfork.github.io/superset-themes/` returned `HTTP/2 200`.

## GitHub Pages And Bundle Baseline

- `pnpm build:pages` builds with the `/superset-themes/` base path.
- Vite emits `404.html` as a GitHub Pages SPA fallback and `.nojekyll`.
- `.github/workflows/pages.yml` verifies and deploys the Pages artifact from `main`.
- Public metadata now targets `https://airfork.github.io/superset-themes/`.
- Pages API reports `build_type: workflow`, `public: true`, and
  `html_url: https://airfork.github.io/superset-themes/`.
- Pages build output now resolves shell install assets under `/superset-themes/`:
  `/superset-themes/favicon.svg`, `/superset-themes/apple-touch-icon.svg`, and
  `/superset-themes/site.webmanifest`.
- Current initial JS baseline:
  - normal build: `368.66 kB` minified / `113.76 kB` gzip
  - Pages build: `368.69 kB` minified / `113.77 kB` gzip

## Remaining Opportunities

- Optionally add a `CODE_OF_CONDUCT.md` once the project owner chooses the governance policy.
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
