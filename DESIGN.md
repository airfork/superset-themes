---
name: Superset Theme Catalog
description: A dense theme-comparison workbench with Superset-shaped chrome and token-first previews.
colors:
  chrome-surface: "#f5f5f5"
  app-background: "#ffffff"
  app-foreground: "#0a0a0a"
  primary-ink: "#171717"
  muted-text: "#737373"
  border-subtle: "#e5e5e5"
  active-row: "#e8e8e8"
  focus-ring: "#a1a1a1"
  popover-surface: "#f5f5f5"
  terminal-accent: "#d97757"
  destructive: "#e7000b"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.7rem, 1.45rem + 0.9vw, 2.4rem)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "0"
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "0"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
  terminal:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: "4px"
  sm: "5px"
  md: "6px"
  lg: "8px"
  dialog: "10px"
  pill: "999px"
spacing:
  xxs: "4px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-chrome:
    backgroundColor: "{colors.chrome-surface}"
    textColor: "{colors.app-foreground}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "34px"
    typography: "{typography.body}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-text}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
    height: "28px"
    typography: "{typography.label}"
  rail-row:
    backgroundColor: "transparent"
    textColor: "{colors.app-foreground}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    typography: "{typography.body}"
  rail-row-selected:
    backgroundColor: "{colors.active-row}"
    textColor: "{colors.app-foreground}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    typography: "{typography.body}"
  palette-dialog:
    backgroundColor: "{colors.popover-surface}"
    textColor: "{colors.app-foreground}"
    rounded: "{rounded.dialog}"
    width: "720px"
  palette-option-active:
    backgroundColor: "{colors.active-row}"
    textColor: "{colors.primary-ink}"
    rounded: "0"
    padding: "12px 8px"
    height: "44px"
  workspace-thread-active:
    backgroundColor: "{colors.chrome-surface}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.md}"
    padding: "6px 12px 6px 24px"
    typography: "{typography.body}"
  input-field:
    backgroundColor: "{colors.app-background}"
    textColor: "{colors.app-foreground}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "34px"
---

# Design System: Superset Theme Catalog

## 1. Overview

**Creative North Star: "The Theme Bench"**

This is a working bench for people comparing visual systems, not a gallery. The interface borrows Superset's real product idioms: restrained chrome, compact rows, command-palette density, token-driven previews, and terminal/editor surfaces that make theme problems obvious fast.

The system is deliberately product-register. Use familiar app patterns, stable alignment, and small but exact type. The design should feel like a careful utility for developers and theme authors who need to inspect surfaces repeatedly. It should not feel like a SaaS landing page, a decorative palette wall, or a generic color-card gallery.

Every visible surface is theme-aware. Persistent chrome reads semantic `--chrome-*` values derived from the focused theme, while previews read `--preview-*` values from the theme JSON. New UI must preserve that split: app chrome stays legible and consistent, preview content shows the theme as honestly as possible.

**Key Characteristics:**

- Dense, task-first master/detail layout with docked rail, pane, top bar, and bottom bar.
- Superset-shaped preview scenes, especially workspace, command palette, settings, terminal, and compare slots.
- Restrained neutrals, thin borders, 6px practical radii, and light tonal layers instead of decoration.
- System-font UI with 12px to 14px operational text; terminal and code use monospace.
- Theme JSON stays export-clean; catalog metadata and app-specific chrome live outside exported files.

## 2. Colors

The palette is semantic and theme-morphing; the frontmatter values above document the Superset Light representative state, not hard-coded app colors.

### Primary

- **Primary Ink**: The default command/action text and strongest neutral. Use through `--preview-ui-primary` or `--preview-ui-foreground`, never as a decorative fill.
- **Terminal Clay Accent**: The Claude activity accent used in the terminal preview. Reserve it for terminal activity and agent identity moments, not general app actions.

### Secondary

- **Active Row Gray**: The selected or focused row layer used by the command palette, light rail selection, and workspace thread row. It should read as state, not as brand color.
- **Focus Ring Gray**: The Superset Light focus/fidelity ring. Superset Light and Dark intentionally keep live-app subtle focus values; non-Superset themes may use contrast-raised derived rings.

### Tertiary

- **Destructive Red**: The delete/error/action-danger role. Use only for destructive controls, validation failures, and contrast diagnostics.

### Neutral

- **Chrome Surface**: The docked app shell surface for top bar, rail, nameplate, and palette in Superset Light.
- **App Background**: The page and preview canvas.
- **Muted Text**: Secondary labels, section headers, key hints, and trailing metadata.
- **Subtle Border**: One-pixel dividers, input strokes, rail separators, palette edges, and split-pane seams.
- **Popover Surface**: Command palette surface. It matches chrome in Superset Light and becomes a warm raised surface in Superset Dark.

### Named Rules

**The Semantic Token Rule.** New UI must use `--preview-*` for theme preview content and `--chrome-*` for persistent app chrome. Hard-coded colors are allowed only for fixed diagnostic widgets and documented Superset fidelity exceptions.

**The State Is Neutral Rule.** Selected and active rows are neutral tonal layers. Do not introduce saturated inactive states or decorative accent washes.

**The Fidelity Exception Rule.** Superset Light and Superset Dark can keep live-app values even when they are subtler than local accessibility derivations. Do not "fix" those modes away from Superset.

## 3. Typography

**Display Font:** system sans stack with native platform fallback.
**Body Font:** system sans stack with native platform fallback.
**Label/Mono Font:** JetBrains Mono for terminal, Menlo/SF Mono stack for code.

**Character:** Product-native and compact. The system should feel like Superset, Raycast, Linear, or a serious editor side panel: familiar, quiet, and exact.

### Hierarchy

- **Display** (650, responsive `clamp(1.7rem, 1.45rem + 0.9vw, 2.4rem)`, 1.1): Root-level app title only. Do not use display type inside panels.
- **Headline** (650, 1.45rem, 1.15): Lab and major route headers.
- **Title** (650, 0.98rem, 1.2): Pane nameplate theme titles and compact section identities.
- **Body** (400, 0.84rem, 1.5): General product UI text, row labels, hints, and controls.
- **Label** (700, 0.72rem, 0.08em tracking when uppercase): Section labels, eyebrows, small metadata, and validation labels.
- **Workspace Chrome** (500/400, 14px, 20px): Superset workspace rail rows. Team, top-level nav, and project labels use 500; nested thread labels use 400.
- **Terminal** (400, 14px, 1.5): Claude Code output and terminal samples.

### Named Rules

**The Panel Scale Rule.** Inside compact panels, command palettes, rails, and preview chrome, use 12px to 14px text with 20px row rhythm. Oversized type makes the product feel like a mockup.

**The One Family Rule.** Use the system sans stack for product UI. Do not add display fonts, novelty fonts, or decorative font pairings.

## 4. Elevation

Depth is mostly tonal and structural. One-pixel borders, separated chrome bands, muted row fills, and fixed-height bars do most of the work. Shadows are rare and belong to true overlays or placeholder cards, not everyday panels.

### Shadow Vocabulary

- **Overlay Lift** (`0 10px 15px -3px color-mix(in srgb, oklch(0 0 0) 18%, transparent), 0 4px 6px -4px color-mix(in srgb, oklch(0 0 0) 18%, transparent)`): Command palette only.
- **Card Placeholder Lift** (`0 18px 50px color-mix(in srgb, var(--preview-ui-foreground) 12%, transparent)`): Rare placeholder and lab-panel framing. Do not apply to ordinary app sections.

### Named Rules

**The Flat-By-Default Rule.** Docked chrome, preview panes, rows, rails, cards, and settings groups are flat at rest. Use borders and tonal layers before shadows.

**The Overlay Only Rule.** Shadows indicate a floating surface that covers other content, such as the command palette. If the element is docked in the layout, it should not cast a shadow.

## 5. Components

### Buttons

- **Shape:** practical rounded rectangles (6px radius) with 30px to 34px heights in dense chrome.
- **Primary:** this system rarely uses heavy filled primary buttons. Strong actions usually look like compact bordered buttons on the current surface.
- **Hover / Focus:** hover changes border color or adds a 5-8 percent foreground tint; focus uses `--preview-focus-ring` with a 2px outline.
- **Ghost:** toolbar and nameplate actions are transparent with muted text, then brighten on hover.
- **Destructive:** destructive controls start as outline red; confirmation state fills with destructive red.

### Chips

- **Style:** pill chips use 999px radius, 1px borders or subtle accent tints, and 0.7rem to 0.72rem text.
- **State:** theme family, source, and status chips are informational. Do not make chips look like primary CTAs.

### Cards / Containers

- **Corner Style:** 8px is the upper bound for most framed tools. The command palette can use 10px because it is a floating dialog.
- **Background:** use `--chrome-surface` for persistent app shell, `--preview-ui-background` for preview canvases, and `--preview-ui-card` for raised panels.
- **Shadow Strategy:** flat by default; only overlays get shadow.
- **Border:** 1px `--preview-ui-border` dividers are the norm.
- **Internal Padding:** dense controls use 8px to 12px; framed panels use 14px to 24px.

### Inputs / Fields

- **Style:** 34px height, 6px radius, 1px `--preview-ui-border`, background from the current surface.
- **Focus:** 2px outline using `--preview-focus-ring`; compound search fields use `:focus-within`.
- **Error / Disabled:** errors use destructive tokens; disabled controls reduce opacity rather than changing shape.

### Navigation

- **Top Bar:** 38px high, centered command trigger, repo link on the right, all on `--chrome-surface`.
- **Rail:** 300px wide on desktop, sticky search, grouped rows, selected row neutral tint, swatch dots for theme identity.
- **Bottom Bar:** 32px high, tabular counts and compact keyboard hints.
- **Mobile:** rail collapses into a self-scrolling panel above the pane; keyboard hints disappear on touch-width layouts.

### Command Palette

The command palette is the reference overlay: 720px wide, 550px max height, 48px search row, 44px options, transparent backdrop, 10px radius, and a normal 1px Superset divider under the search. It must not blur or darken the app behind it.

### Superset Workspace Scene

This is the signature preview. Preserve the Superset left rail ordering, 14px sidebar rhythm, muted top-level navigation, and only the nested active thread row as active. The terminal uses theme terminal tokens, not app foreground tokens.

## 6. Do's and Don'ts

### Do:

- **Do** build the catalog as the first usable screen. Product browsing comes before marketing.
- **Do** use real theme-preview surfaces: file/workspace chrome, command palette, settings, terminal, forms, selections, focus states, warnings, and compare slots.
- **Do** keep app-specific metadata outside exported theme JSON.
- **Do** use semantic CSS variables rather than fixed colors in UI implementation.
- **Do** keep rows compact, aligned, and predictable. The user is comparing details, not admiring decoration.
- **Do** preserve Superset Light and Dark fidelity when the request is to match the real app.

### Don't:

- **Don't** make a static gallery where only one theme can be seen at a time.
- **Don't** ship decorative tabs that do not switch preview content.
- **Don't** show only code colors and miss file-browser, command, form, and terminal surfaces.
- **Don't** let random color generation produce unusable RGB noise.
- **Don't** let catalog metadata become a loose tag soup.
- **Don't** put agent-only shell wrappers in user-facing docs.
- **Don't** use SaaS landing-page composition, oversized heroes, generic palette cards, gradient text, or decorative glass.
- **Don't** add saturated inactive states or colored side-stripe accents. State is neutral and structural.
