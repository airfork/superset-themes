# Command Reference

Commands in this file are for humans and should be run from the repo root.

## Setup

```bash
pnpm install
```

Install dependencies.

```bash
pnpm browsers:install
```

Install the Chromium browser used by Playwright and Storybook tests.

```bash
pnpm archive:clean:dry-run
```

Preview the generated, cached, and local-only files that archive cleanup would remove.

```bash
pnpm archive:clean
```

Remove dependency folders, build/test outputs, logs, local env files, and agent scratch files
before archiving a workspace.

```bash
pnpm archive:clean:test
```

Run the archive cleanup script's Node test suite.

## Development

```bash
pnpm dev
```

Start the Vite dev server.

```bash
pnpm storybook
```

Open component and preview-surface stories.

```bash
pnpm build:storybook
```

Build the static Storybook output.

## Quality

```bash
pnpm check
```

Run the full local verification suite.

### Pnpm Release-Age Gate

pnpm v11 may reject very recent lockfile entries before running scripts. Keep the age gate enabled
by default. If a known, expected dependency update is too fresh and immediate local verification is
needed, relax the gate for that one command:

```bash
PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm check
```

Prefer this one-command override over disabling pre-run dependency verification, because it keeps
pnpm's dependency check active while only relaxing the release-age cutoff.

```bash
pnpm format
```

Format files with Biome.

```bash
pnpm lint
```

Run Biome lint checks.

```bash
pnpm typecheck
```

Run TypeScript checks.

## Tests

```bash
pnpm test
```

Run unit and component tests.

```bash
pnpm test:unit
```

Run Vitest tests for theme logic, filtering, pairing, import/export, and generation.

```bash
pnpm test:e2e
```

Run Playwright browser workflow tests.

```bash
pnpm test:stories
```

Run Storybook interaction/component tests.

```bash
pnpm site:metadata:test
```

Check the static shell, favicon/app metadata assets, manifest, robots file, and sitemap.

## Build

```bash
pnpm build
```

Build the static app.

```bash
pnpm build:pages
```

Build the static app for the GitHub Pages project site at `/superset-themes/`.
The output includes a `404.html` SPA fallback for deep links and `.nojekyll`.

```bash
pnpm preview
```

Preview the production build locally.

## Theme Utilities

```bash
pnpm themes:validate
```

Validate catalog theme JSON and metadata.

```bash
pnpm themes:check-contrast
```

Check required contrast pairs.

```bash
pnpm themes:research
```

Rank verified candidate themes using Marketplace installs and GitHub star signals.

```bash
pnpm themes:research:test
```

Run the research script's Node test suite.

```bash
pnpm themes:generate
```

Generate a constrained draft theme for local inspection.

```bash
pnpm themes:generate -- --seed atlas --mode dark
```

Generate a deterministic dark draft from a named seed.

```bash
pnpm themes:uninstall
```

Remove imported custom themes from the installed Superset desktop app (the app
has no in-app delete for imported themes). Shows a checkbox list of installed
custom themes — use `↑`/`↓` to move, `space` to select, `enter` to confirm —
then, after a `y/N` prompt, backs up `~/.superset/app-state.json`, quits
Superset, removes the selected themes, and relaunches. If Superset prompts you
to confirm quitting, accept it; the script waits for the app to fully exit
before editing. Requires an interactive terminal.
