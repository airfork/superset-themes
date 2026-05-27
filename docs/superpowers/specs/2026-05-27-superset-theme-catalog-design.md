# Superset Theme Catalog Clean-Slate Design

## Status

Approved brainstorm design, pending implementation plan.

## Context

The existing `itsbariscan/superset-themes` repo and GitHub Pages site are references only. The new project should not preserve the existing code, app architecture, or release framing. The current reference site proves useful ideas, but it has major product gaps:

- Catalog browsing is limited.
- Light and dark themes cannot be filtered and compared comfortably.
- Theme detail links can break under the GitHub Pages base path.
- Preview tabs and full-view samples do not provide enough working interaction.
- Preview surfaces do not show enough of a real editor workspace.
- Theme pairing is not supported.
- Theme expansion needs a more systematic metadata and porting workflow.

This project should be a private, iterative clean-slate build until the catalog and UI feel strong. There is no artificial public-release gate.

## Product Direction

Build a static, catalog-first web app with a secondary client-side lab.

The first screen is the working catalog: search, filters, compact theme cards, and a persistent pairing area. It is not a landing page. The primary job is to help someone quickly browse themes, inspect surfaces, and decide which light/dark combination works for daily use.

The lab exists to support theme work: clone an existing catalog theme, import Superset JSON, generate a constrained draft, validate it, tweak values, preview it, and export clean JSON.

## Recommended Approach

Use the "Catalog + Local Theme Lab" approach:

- Static web app, no backend requirement.
- Client-side catalog filtering, comparison, import, generation, validation, editing, and export.
- Theme JSON and catalog metadata stored locally in the repo.
- Rich enough state management for filters, pinned pairs, selected preview tab, and lab drafts.

This avoids the weight of a full theme studio while leaving room for serious authoring tools.

## Technical Constraints

- Use a Node-based stack.
- Use `pnpm` for package management.
- Use `biome` for formatting and linting.
- Prefer TypeScript throughout.
- Keep the app statically deployable.
- Keep exported theme JSON free of app-specific metadata.

A Vite + React + TypeScript app is the default recommendation because the UI is stateful: filters, drawers/routes, preview tabs, pair slots, imported drafts, generated drafts, validation state, and export flows. Astro remains viable only if implementation intentionally keeps most behavior in islands, but the clean-slate direction favors a richer client app.

## Information Architecture

Top-level areas:

- `Catalog`: main browsing surface.
- `Compare`: persistent or expandable light/dark pairing panel.
- `Lab`: secondary workspace for cloning, importing, generating, validating, editing, and exporting themes.

The catalog remains the main entry point. Lab actions are reachable from theme detail views and from a dedicated lab entry.

## Catalog Experience

The catalog should support:

- Text search by name, family, source, author, description, and tags.
- Objective filters: light/dark, source, family, paired/unpaired, contrast tier, accent hue, warm/cool/neutral, terminal palette quality.
- Curated vibe filters: minimal, high contrast, pastel, retro, material, paper, neon, muted, and similar restrained tags.
- Sorting by name, family, recently added, light/dark grouping, contrast tier, and saved or curated status when those signals exist.
- Compact composite theme cards.
- A detail drawer or route for deeper inspection.
- Direct actions: pin as light, pin as dark, edit in lab, copy JSON, download JSON.

Metadata should be structured enough to make filters useful without becoming tag soup.

## Preview Model

Use two preview levels.

Catalog cards use compact composite previews. Each card should show enough of the workspace to support fast triage:

- File tree.
- Editor tabs.
- Code lines with syntax colors.
- Terminal strip or mini terminal.
- Buttons or controls.
- A few token swatches or chart colors.

Theme detail views use real preview tabs:

- `Workspace`: sidebar, tabs, editor, status/agent area, and terminal context together.
- `Editor`: code surface, active line, selection, cursor, search highlight, gutter, syntax.
- `Terminal`: ANSI palette, cursor, selection, prompt, success/warn/error lines.
- `Diff`: addition, deletion, modification, inline and block states.
- `Command Palette`: popover, input, highlighted row, shortcut labels, empty/error states.
- `Settings/Form`: inputs, selects, toggles, buttons, disabled states, validation messages, destructive action.

Preview tabs must actually switch content. They are part of the inspection model, not decoration.

## Pairing Model

Pairing is optional but always nearby.

The app should provide one pinned light slot and one pinned dark slot. Any theme can be pinned from a card or detail view. The compare panel shows both pinned themes side by side using the same selected preview tab. If the user selects `Terminal`, both slots show terminal. If the user selects `Workspace`, both slots show workspace.

This keeps browsing simple while making light/dark pairing a first-class workflow.

## Lab Model

The lab has three entry paths:

1. `Edit in Lab` from any catalog theme. This clones the selected theme into an unsaved draft.
2. `Import JSON` from the lab. This accepts Superset theme JSON, validates it, shows understandable errors, and previews whatever can be previewed.
3. `Generate Draft` from the lab. This creates a constrained random theme candidate.

The lab should reuse the same preview components as the catalog. It should not be a separate visual system.

Core lab capabilities:

- Clone selected catalog theme into a draft.
- Import theme JSON.
- Edit token groups.
- Validate schema.
- Validate important contrast pairs.
- Show token coverage and warnings.
- Export clean Superset-compatible JSON.
- Copy JSON to clipboard.
- Reset draft to source.

## Random Theme Generation

Do not use pure random RGB generation. It will produce mostly unusable themes.

Use constrained generation:

- User chooses light or dark.
- Optional controls for vibe, hue family, warmth, chroma, and contrast target.
- Generate in a perceptual color space such as OKLCH.
- Clamp colors to displayable gamut.
- Reject or revise candidates that fail baseline contrast checks.
- Derive foreground, surface, border, focus, selection, terminal, syntax, and chart colors from coordinated ramps.
- Provide lockable groups: base surfaces, accents, terminal ANSI, charts, syntax, and highlights.
- Store a seed so a generated draft can be reproduced.

Culori is the leading candidate for this because it supports modern color spaces, interpolation, constrained random generation, gamut clamping, and WCAG contrast utilities. Color.js is a strong alternative or supplement if APCA contrast becomes important. Chroma.js is useful for scales and palette references but should not be the core generator unless implementation proves otherwise.

## Data Model

Separate exported theme JSON from app metadata.

Theme JSON contains only Superset-compatible fields:

- `id`
- `name`
- `type`
- `author`
- `version`
- `description`
- `ui`
- `terminal`
- optional editor overrides if supported by the target schema

Catalog metadata lives beside the theme:

- `themeId`
- `source`
- `family`
- `variant`
- `pairGroup`
- `styleTags`
- `accentHue`
- `warmth`
- `contrastTier`
- `terminalPaletteQuality`
- `license`
- `upstreamUrl`
- `portStatus`
- `notes`

Pairing should be explicit through `pairGroup`, not guessed from names.

## Theme Source Strategy

Start interface work with a tiny fixture catalog:

- One strong light/dark pair.
- One additional theme with a different personality to stress filters and previews.

After the interface feels right, expand themes through a content pipeline:

1. Identify candidate family and variants.
2. Verify license and attribution.
3. Capture upstream palette/source.
4. Map palette into Superset UI, terminal, and editor tokens.
5. Validate schema and contrast.
6. Inspect every preview tab.
7. Add metadata.
8. Mark catalog-ready.

Candidate families include Solarized, Material/Atom-style themes, Bearded themes, JetBrains plugin themes, and selected existing ports from the reference repo when licensing is clean.

## Design Process Requirements

Impeccable use is required for UI design and refinement:

- Create and maintain `PRODUCT.md` and `DESIGN.md` context.
- Use Impeccable shaping before substantial UI implementation.
- Run Impeccable critique loops for major catalog, detail, compare, and lab screens.
- Critique both light and dark preview states.
- Apply Impeccable polish before considering a UI flow done.

Web Interface Guidelines review is required when UI files exist:

- Fetch the latest guidelines at review time.
- Review actual UI files, not abstract descriptions.
- Record actionable findings with file and line references.

UI/UX Pro Max may be used as a secondary design intelligence source:

- Accessibility and interaction checks.
- Responsive layout checks.
- Animation and motion sanity checks.
- Typography, color, and density guidance.

The initial UI/UX Pro Max query suggested a dark developer-tool bias. Do not adopt that blindly. The catalog app must support accurate judgment of both light and dark themes, so its own chrome should be restrained and preview-neutral.

## Accessibility and Interaction Requirements

- Full keyboard support for filters, cards, preview tabs, pair slots, drawers/routes, and lab controls.
- Visible focus states.
- No hover-only primary actions.
- Touch targets at least 44px where practical.
- Text contrast at least WCAG AA for app chrome.
- Theme preview warnings where selected theme tokens fail important contrast pairs.
- Reduced motion support.
- No horizontal overflow at mobile widths.
- Deep links or shareable routes for theme details and, if practical, comparison state.
- Clear import validation errors with recovery paths.

## Testing and Verification

Required verification should include:

- Type checking.
- `biome` format and lint checks.
- Unit tests for schema validation, metadata parsing, filtering, pairing rules, contrast checks, generation constraints, and import/export cleanup.
- Browser tests for catalog filtering, detail routes/drawers, preview tab switching, pinned light/dark comparison, import errors, copy/download actions, and base-path-safe routes.
- Visual or screenshot checks for representative light and dark preview states.
- Accessibility checks for keyboard navigation and focus visibility.

Before claiming implementation work is complete, run relevant verification commands and report the exact commands.

## Open Implementation Decisions

- Final framework choice, with Vite + React + TypeScript as the current default recommendation.
- State management library, if any.
- Whether theme detail is a route, drawer, or responsive hybrid.
- Exact schema target for Superset theme JSON.
- Whether APCA is added alongside WCAG contrast checks.
- Whether generated themes are persisted only in local browser state or also as downloadable draft files.

## Non-Goals for the First Build Iterations

- Backend persistence.
- User accounts.
- Public marketplace workflows.
- GitHub sync.
- Theme popularity metrics.
- A marketing landing page.
- A full professional theme IDE before catalog browsing feels good.
