# Contributing

Thanks for taking a look at Superset Theme Catalog. This project is a static React/Vite app for browsing, comparing, editing, and exporting Superset-compatible themes.

## Development

Use the command reference in [COMMANDS.md](COMMANDS.md) for setup, local development, tests, and builds.

Common local checks:

```bash
pnpm check
pnpm test:e2e
pnpm test:stories
pnpm build
```

## Pull Requests

- Keep changes scoped to one user-visible behavior or maintenance task.
- Update docs when behavior, commands, or public metadata changes.
- Add or update tests for bug fixes and behavior changes.
- Avoid committing generated output, local screenshots, caches, or environment files.

## Themes

- Keep app-specific metadata outside exported theme JSON.
- Run `pnpm themes:validate` after changing catalog themes.
- Run `pnpm themes:check-contrast` after changing theme tokens.
