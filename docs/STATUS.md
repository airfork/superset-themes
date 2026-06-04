# Project Status

## Current State

The Superset Theme Catalog is a complete static React/Vite app for browsing, comparing, editing,
generating, validating, and exporting Superset-compatible themes. It currently ships 23 catalog
themes and is configured for GitHub Pages project hosting at `/superset-themes/`.

Previous committed checkpoint: `b26706c chore(deps): bump react and @types/react (#13)`.

Latest completed checkpoint — visible command-palette focus/hover on every theme:

- Fixed the command palette's active (keyboard-focused) and hover row bands vanishing on themes that
  ship `ui.accent == ui.popover` (or near it). The bands used raw `--preview-ui-accent`, so on
  `gruvbox-light`, both `solarized` variants, and `github-dark-dimmed` (ΔE 0 accent-vs-popover) the
  focused/hovered row was indistinguishable from the surface; `github-dark` was borderline.
- New `src/theme-core/paletteTokens.ts` `getPaletteActiveSurface(theme)` derives the band via CIEDE2000
  ΔE (culori): it keeps the theme's own accent when it already reads as a distinct band (GitHub Light's
  `#ddf4ff` is untouched), and otherwise synthesizes a neutral tonal step by fading the popover toward
  its foreground until it clears a guaranteed-visible delta — the same "state is a neutral tint"
  approach the rail already uses. WCAG contrast is deliberately not the gate (GitHub Light's blue band
  is ~1.1:1 yet clearly visible by hue); the gap that matters is perceptual.
- Superset Light/Dark stay on their real app accent (Fidelity Exception Rule). Only 5 themes change
  (`gruvbox-light`, `solarized-light`, `solarized-dark`, `github-dark-dimmed`, `github-dark`); the
  other 18 are byte-identical. `themeCssVars` now emits `--preview-popover-active`,
  `--preview-popover-active-foreground`, `--preview-popover-hover`, consumed by `.palette__option`.
- Same treatment extended to the workspace session tab's close-button hover (`workspace-scene.css`),
  which had the same raw-accent collapse over the app background (worst on the active tab, ΔE ~1). The
  derivation was generalized to be surface-parametric (`deriveActiveSurface`); `getWorkspaceControlSurface`
  derives against `ui.background` and emits `--preview-background-active(-foreground)`. The close glyph is
  a non-text control, so its synthesized band is gated at the 3:1 icon threshold (Solarized's low-contrast
  foreground lands ~3.9–4.2 there, fine for an icon and already the shipped color).
- Tests: `paletteTokens.test.ts` (accent-kept vs synthesized, Superset exempt, every non-Superset theme
  ≥ min-visible ΔE, synthesized text stays AA), plus additions to `themeCssVars.test.ts` and the
  `focusContracts` palette contract. Verified live in-app (gruvbox-light band visible, github-light
  unchanged). `pnpm check` green (lint, typecheck, unit, build). Committed as `a5ddbab`.

Prior checkpoint — light-theme balance batch:

- Added three upstream-port light themes to fix the catalog's dark/light imbalance, bringing it from
  14 dark / 6 light to 14 dark / 9 light: `gruvbox-light` (Gruvbox Light, MIT/X11), `tokyo-night-light`
  (Tokyo Night Light, Enkia, MIT), and `alucard` (Alucard, Dracula's official light theme, MIT). All
  are faithful ports built to the solarized-light quality bar (5-hue chart palette with red reserved
  for `destructive`, a rising highlight ramp, real muted/tertiary steps) and pass the contrast gate
  with no errors.
- Each completes a `pairGroup` for an existing dark family: `gruvbox` (gruvbox-light/dark),
  `tokyo-night` (tokyo-night-light/tokyo-night), and `dracula` (alucard/dracula). The `pairGroup`
  field was added to the three existing dark entries so each group validates with one light + one dark.
- Light variants follow the catalog's light convention (pale-tint accent + dark accentForeground,
  white/cream button foregrounds on the primary/destructive accents) so the required pairs clear 4.5;
  faded/darker accent variants are used where the upstream's brighter hue would fail on the light
  surface (e.g. Gruvbox's faded orange/red).
- Tokyo Night's light sibling is Enkia's own "Tokyo Night Light" (same upstream as the dark) rather
  than folke's nvim "Day", keeping the pair on one source.
- Test fixups: `schema.test.ts` upstream-port id list + license map extended for the three ids; the
  command palette's two `/tokyo night/i` assertions were pinned to the exact `"Tokyo Night"` name so
  the new "Tokyo Night Light" option no longer makes them ambiguous.
- Review remediation: command-palette fuzzy ranking now uses key order as the final match tie-breaker,
  so canonical theme id/name keys beat later metadata aliases. The regression test covers `dracula`
  selecting Dracula instead of Alucard.

Prior checkpoint — time-of-day default theme:

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

Prior checkpoint — command palette family + focus styling:

- Command Palette theme rows now always populate the Family column from catalog metadata. This
  fixes canonical variants such as Tokyo Night and Dracula rendering with a blank family cell when
  the theme name matches the family name.
- Command Palette search input focus now matches Superset's live palette: the input remains
  visually borderless with no inner focus rectangle while the search row divider stays unchanged.
- `src/palette/commands.test.ts` now covers Tokyo Night, Dracula, and Rosé Pine Dawn family hints.
- `src/styles/focusContracts.test.ts` now covers the Superset-style borderless focused palette
  input.

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

- Compare baseline/candidate review remediation is implemented and verified. It validates compare
  route theme IDs before state seeding, so stale candidate query values render as an empty
  candidate and cannot be swapped into the required baseline. Regression coverage now exists in
  route-search unit tests and compare e2e.

## Verification

Current compare review-remediation verification passed:

- `rtk pnpm test -- src/app/routes/compareRouteSearch.test.ts` passed after the expected red run:
  Vitest 55 files / 384 tests.
- `rtk pnpm exec playwright test e2e/compare.spec.ts` passed: 9 passed.
- `rtk pnpm check` passed: Biome checked 203 files, typecheck clean, Vitest 55 files / 384 tests,
  script test-suites passed, and the production build inside `check` succeeded.
- `rtk pnpm test:e2e` passed: 38 passed, 1 skipped.
- `rtk pnpm test:stories` passed: 9 files / 31 stories.
- `rtk pnpm build` passed; initial JS `436.33 kB` minified / `133.83 kB` gzip.
- `rtk git diff --check origin/main...HEAD` passed.

Current slice verification passed (light-theme balance batch):

- `rtk pnpm themes:validate` passed: validated 23 catalog themes from 23 JSON files.
- `rtk pnpm themes:check-contrast` passed: 23 themes, 3 optional warnings (only the frozen
  `superset-light`/`superset-dark` fidelity exceptions); the three new themes clear all 7 pairs.
- `rtk pnpm check` passed: Biome clean, typecheck clean, Vitest 53 files / 365 tests, script
  test-suites passed, and the production build succeeded.
- `rtk pnpm test:stories` passed: 9 files / 31 stories.
- `rtk pnpm test:e2e` passed: 34 passed, 1 skipped.

Prior slice verification passed (time-of-day default theme):

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

Prior slice verification passed (command palette family + focus styling):

- RED: focused palette command coverage failed before the family fix with `tokyo-night` hint
  `undefined` instead of `Tokyo Night`.
- GREEN: `rtk env PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm test:unit
  src/palette/commands.test.ts` passed: 1 file / 5 tests.
- `rtk env PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm test:unit
  src/palette/Palette.test.tsx src/palette/commands.test.ts src/palette/paletteEntries.test.ts`
  passed: 3 files / 25 tests.
- `rtk env PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm check` passed: Biome checked 193 files,
  Vitest passed 52 files / 348 tests, script tests passed, and the production build inside
  `check` succeeded.
- `rtk env PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm test:e2e` passed: 31 passed, 1 skipped.
- `rtk env PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm test:stories` passed: 9 files / 31
  stories.
- `rtk env PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm build` passed; initial JS `368.55 kB`
  minified / `113.70 kB` gzip.
- Local preview smoke via `rtk env PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm exec tsx --eval
  ...` returned `{"tokyo":"Tokyo Night","dracula":"Dracula","rosePine":"Rosé Pine"}` for rendered
  palette family cells.
- Superset reference check through `http://127.0.0.1:9222/json/list` found the active live command
  input uses `outlineStyle: none`, `outlineWidth: 0px`, `boxShadow: none`, and `border: 0px`.
- RED: focused style contract coverage failed before the focus fix because
  `.palette__input:focus-visible` was still present, then failed again when the contract was
  tightened from `outline: none` to `outline: 0`.
- GREEN: `rtk env PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm test:unit
  src/styles/focusContracts.test.ts` passed: 1 file / 4 tests.
- Local preview smoke via `rtk env PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm exec tsx --eval
  ...` returned
  `{"active":true,"outlineStyle":"none","outlineWidth":"0px","boxShadow":"none","border":"0px none rgb(192, 202, 245)"}`.
- Dependency-policy note added to `COMMANDS.md`: keep pnpm v11's release-age gate enabled by
  default, and use `PNPM_CONFIG_MINIMUM_RELEASE_AGE=0` only as a one-command local verification
  override when a known expected dependency update is too fresh.
- Current verification uses `PNPM_CONFIG_MINIMUM_RELEASE_AGE=0`, so pnpm still runs its pre-run
  dependency check while only relaxing the release-age cutoff for these commands.

Verification caveat:

- Plain `rtk pnpm test:unit src/palette/commands.test.ts` did not reach Vitest because pnpm's
  supply-chain policy rejected two recent lockfile entries:
  `@tanstack/react-router@1.170.11` and `@tanstack/router-core@1.171.9`.
- Plain `rtk pnpm check` failed the same policy pre-run while those entries were still inside the
  24-hour cutoff. This is expected for unusually fresh Dependabot lockfile entries, not a test
  failure.

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

- Light/dark balance: improved from 14 dark / 6 light to 14 dark / 9 light via the light-theme batch
  (Gruvbox Light, Tokyo Night Light, Alucard). Further light additions (e.g. One Light, Ayu Light,
  Everforest Light) remain optional if a tighter balance or a deeper daytime pool is wanted.
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
