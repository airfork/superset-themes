# Project Status

## Current State

The repo contains a completed Task 10 Vite/React/TypeScript static app checkpoint on branch
`feature/theme-catalog-app`. Catalog browsing, URL-backed theme detail routes,
light/dark pair comparison, and the first theme lab import/edit/export workflow
are implemented. The lab also has deterministic constrained random generation.
Browser, Storybook, accessibility, and design QA coverage has been expanded.
README, command reference, and agent handoff docs are synced with the current app. The first
post-Task 10 theme expansion checkpoint adds schema-clean upstream ports for Solarized Light,
Solarized Dark, and Nord.

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
- Design spec committed in `8b05d03`.
- Implementation planning and handoff docs drafted after that checkpoint.
- Private GitHub repo created at `git@github.com:airfork/superset-themes.git`.

## Active Plan

- [docs/superpowers/plans/2026-05-27-superset-theme-catalog-implementation.md](superpowers/plans/2026-05-27-superset-theme-catalog-implementation.md)

## Next Step

The next recommended work is follow-up accessibility remediation for the simulated preview
surfaces so more Storybook stories can move from `a11y.test: "todo"` to `a11y.test: "error"`.
Further theme expansion should continue in small licensed batches, with attribution captured
outside exported theme JSON.

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

## Blockers

None.
