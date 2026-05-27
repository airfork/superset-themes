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

## Development

```bash
pnpm dev
```

Start the Vite dev server.

```bash
pnpm storybook
```

Open component and preview-surface stories.

## Quality

```bash
pnpm check
```

Run the full local verification suite.

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

## Build

```bash
pnpm build
```

Build the static app.

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
pnpm themes:generate
```

Generate a constrained draft theme for local inspection.

```bash
pnpm themes:generate -- --seed atlas --mode dark
```

Generate a deterministic dark draft from a named seed.
