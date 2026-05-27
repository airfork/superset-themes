# Superset Theme Catalog

A clean-slate, catalog-first web app for browsing, filtering, comparing, pairing, editing, importing, generating, validating, and exporting Superset-compatible themes.

The existing `itsbariscan/superset-themes` repo is reference material only. This project is intended to grow into its own React/Vite static app with a richer catalog and a secondary client-side theme lab.

## Current State

Planning is complete enough to begin scaffolding. The main design spec is:

- [Clean-slate design spec](docs/superpowers/specs/2026-05-27-superset-theme-catalog-design.md)
- [Implementation plan](docs/superpowers/plans/2026-05-27-superset-theme-catalog-implementation.md)
- [Status and handoff](docs/STATUS.md)

## Planned Stack

- `pnpm`
- `biome`
- Vite
- React
- TypeScript
- TanStack Router
- Zod or Valibot for schema validation
- Culori for color work
- Vitest
- Playwright
- Storybook

## Planned Commands

These commands become active after the app is scaffolded:

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm test:e2e
pnpm storybook
pnpm build
```

See [COMMANDS.md](COMMANDS.md) for the fuller command reference.

## Working Notes

This repo treats resumability as a first-class concern. Agents should update [docs/STATUS.md](docs/STATUS.md) and the active implementation plan after meaningful checkpoints.

