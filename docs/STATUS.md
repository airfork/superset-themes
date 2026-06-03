# Project Status

## Current State

The Superset Theme Catalog is a complete static React/Vite app for browsing, comparing, editing,
generating, validating, and exporting Superset-compatible themes. It currently ships 14 catalog
themes and is configured for GitHub Pages project hosting at `/superset-themes/`.

Previous committed checkpoint: `b437ae8 Record public Pages launch`.

Latest completed checkpoint:

- Public repo maintenance added PR CI, Dependabot update config, a code of conduct, and README
  live-app/current-control copy.
- GitHub settings now have Issues, Dependabot vulnerability alerts/security updates, private
  vulnerability reporting, secret scanning, and push protection enabled.
- GitHub Pages builds now emit direct app-shell artifacts for `/compare` and `/lab` in addition
  to the SPA `404.html` fallback.
- The tracked `.superset/config.json` hidden tool config was removed and `.superset/` is ignored,
  avoiding confusion with user-level Superset app state.
- Stale local branches `airfork/critique-lab-page`, `airfork/gh-pages-bundle-audit`, and
  `airfork/superset-dark-mode` were deleted after confirming no matching remote branches remain.
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

Current slice verification passed:

- `rtk git diff --check`
- `rtk pnpm check` passed: Biome checked 193 files with no warnings, Vitest passed 52 files /
  348 tests, script tests passed, 5 metadata/community tests passed, 3 critical-theme/Pages
  plugin tests passed, and the production build
  inside `check` succeeded.
- `rtk pnpm test:e2e` passed: 31 passed, 1 skipped.
- `rtk pnpm test:stories` passed: 9 files / 31 stories.
- `rtk pnpm build` passed; initial JS `368.66 kB` minified / `113.76 kB` gzip.
- `rtk pnpm build:pages` passed; Pages initial JS `368.69 kB` minified / `113.77 kB` gzip.
- `test -f dist/compare.html`, `test -f dist/compare/index.html`, `test -f dist/lab.html`,
  and `test -f dist/lab/index.html` passed after the Pages build.
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
  - normal build: `368.66 kB` minified / `113.76 kB` gzip
  - Pages build: `368.69 kB` minified / `113.77 kB` gzip

## Remaining Opportunities

- Optionally add a branch protection rule after the new PR CI workflow is pushed and visible to
  GitHub.
- The successful Pages workflow run emitted a GitHub Actions warning that several current
  JavaScript actions are Node 20-based; watch for upstream action updates or set the runner env
  override once GitHub's Node 24 transition becomes actionable.
- `airfork/remove-theme-pills` remains checked out in
  `/Users/tunji/conductor/workspaces/superset-themes/lyon` with uncommitted changes, so it was not
  removed during stale branch cleanup.

## Blockers

None.

## References

- Product context: `PRODUCT.md`
- Design direction: `DESIGN.md`
- Catalog redesign design record: `docs/design/2026-05-27-catalog-redesign.md`
- Theme attributions: `docs/THEME_ATTRIBUTIONS.md`
- Command reference: `COMMANDS.md`
- Historical status log before cleanup: `b7574e9:docs/STATUS.md`
