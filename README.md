# Superset Theme Catalog

A clean-slate, catalog-first static app for browsing, filtering, comparing, pairing, editing, importing, generating, validating, and exporting Superset-compatible themes.

The existing `itsbariscan/superset-themes` repo and GitHub Pages site are reference material only. This repo is its own React/Vite implementation with a richer catalog interface and a client-side theme lab.

## Current App

- Catalog browsing with search, light/dark filters, metadata filters, sort controls, and shareable URL state.
- URL-addressable focused themes with export-clean copy/download actions and full preview tabs.
- Side-by-side light/dark comparison at `/compare` with synchronized preview tabs.
- Theme lab at `/lab` for starting from catalog themes, importing JSON, editing tokens, validating contrast, generating constrained random themes, rerolling token groups, and exporting clean JSON.
- Preview surfaces for workspace/file tree, editor, terminal, diff, command palette, settings/forms, selections, focus states, and warnings.

## Stack

- `pnpm`
- Biome
- Vite
- React
- TypeScript
- TanStack Router
- Zod
- Culori
- Vitest
- Playwright
- Storybook

## Setup

```bash
pnpm install
pnpm browsers:install
```

## Development

```bash
pnpm dev
```

```bash
pnpm storybook
```

## Verification

```bash
pnpm check
pnpm test:e2e
pnpm test:stories
pnpm build
```

`pnpm check` runs Biome, TypeScript, Vitest, and the production build. See [COMMANDS.md](COMMANDS.md) for the full command reference.

## GitHub Pages

```bash
pnpm build:pages
```

`pnpm build:pages` builds the app for the `/superset-themes/` project-page base path and emits a `404.html` SPA fallback plus `.nojekyll`. The Pages deploy workflow lives at `.github/workflows/pages.yml`.

## Theme Utilities

```bash
pnpm themes:validate
pnpm themes:check-contrast
pnpm themes:generate -- --seed atlas --mode dark
```

Generated themes are draft JSON for inspection or lab import. Catalog metadata stays outside exported theme JSON.

## Project Docs

- [Product context](PRODUCT.md)
- [Design direction](DESIGN.md)
- [Catalog redesign design record](docs/design/2026-05-27-catalog-redesign.md)
- [Theme attributions](docs/THEME_ATTRIBUTIONS.md)
- [Status and handoff](docs/STATUS.md)

Private GitHub remote:

- `git@github.com:airfork/superset-themes.git`

## Resumability

This repo treats resumability as a first-class concern. Agents should update [docs/STATUS.md](docs/STATUS.md) and the active implementation plan after meaningful checkpoints.
