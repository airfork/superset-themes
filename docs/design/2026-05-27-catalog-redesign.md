# Catalog Redesign

Date: 2026-05-27
Status: Design locked. Implementation plan to follow.

## Overview

Full pivot of the catalog UI. The current design (per `DESIGN.md`) produced a generic admin shell — themes shown in abstract block diagrams inside a Bootstrap-feeling chrome. Visitors cannot read a theme's actual feel from the previews; the catalog has no visual identity of its own.

This document replaces `DESIGN.md`. The new direction is **Superset-adjacent, idiom-borrowing**: the site reads as if it shipped from the same team that ships Superset, the editor it themes. Preview surfaces render Superset's actual three-column workspace shape, and the entire site morphs into the currently-focused theme — chrome included.

Audience: developers shopping for a theme to use daily in Superset. Distribution: public on GitHub Pages.

## Visual register

**Superset-adjacent, idiom-borrowing.** Not a clone. Borrow design language wholesale: density, type, panel layout, status-dot vocabulary, command palette shape, bottom-bar idiom. Same family, not the same artifact.

Reference: Superset itself (https://github.com/superset-sh/superset) — an AI-agent-first editor with workspace + branch navigation, three-column workspace layout (workspaces | thread | files), command palette, automations, and Tasks & PRs as first-class surfaces. The catalog reads as another Superset workspace.

Anti-references:
- Marketing-shaped landing pages with hero headlines and feature grids
- Bootstrap/admin-shell aesthetics (white cards, neutral borders, drop shadows)
- Abstract block-diagram previews
- Generic dark/light editor demos that could be any editor

## Hero principle

**The master/detail shell IS the hero.** First paint shows a real Superset window rendering a real Featured theme at full fidelity. No headline. No welcome copy. No top-level nav tabs. The rail labels and the rendered editor pane together communicate "this is a catalog of Superset themes" without explanatory framing.

## Shell anatomy

```
┌─ Superset Themes ───────────────────────── ⌘K ─ repo ─┐
│ FEATURED                  │  ┌──── theme nameplate ─┐ │
│  ◉ Tokyo Night        ●d  │  │ name · family · tags │ │
│  ○ Catppuccin Mocha   ●d  │  └──────────────────────┘ │
│  ○ Solarized Light    ○l  │  ┌──────────────────────┐ │
│  ○ Rose Pine Dawn     ○l  │  │                      │ │
│  ○ One Dark           ●d  │  │  Superset workspace  │ │
│                           │  │  (three columns,     │ │
│ ── LIGHT ─────────────    │  │  right pane          │ │
│  ○ Aurora Light           │  │  collapsed)          │ │
│  ○ …                      │  │                      │ │
│                           │  └──────────────────────┘ │
│ ── DARK ──────────────    │  Workspace · Settings     │
│  ○ Aurora Dark            │                           │
│  ○ Dracula                │                           │
│  ○ Gruvbox Dark           │                           │
│  ○ Nord                   │                           │
│  ○ …                      │                           │
├─────────────────────────────────────────────────────────┤
│ tokyo-night · dark · 8.2:1     ↓ next · ⌘K · . pin    │
└─────────────────────────────────────────────────────────┘
```

### Global chrome

**Top bar (thin)**
- Site name (small, left)
- ⌘K search trigger
- Link to repo
- No tagline, no nav tabs
- No light/dark chrome toggle (the theme is the toggle)

**Bottom bar (thin status strip)**
- Current theme name, family, primary contrast ratio
- Keyboard hints: `↓ next`, `⌘K`, `. pin`
- Borrows Superset's bottom-bar idiom

### Left rail (~280–320px, sticky)

Composition top-to-bottom:
1. **Search input** at top, also bound to ⌘K
2. **Featured** section — 5 hand-picked themes in deliberate order
3. **Light** section — alphabetical
4. **Dark** section — alphabetical

Featured items also appear in their light/dark section. No filter chips. No sort dropdown. No family grouping (revisit at N≈25+).

**Rail item composition (one line):**
- Theme name (regular weight)
- Light/dark indicator dot at right edge (filled = dark, ring = light, colored with the theme's accent)
- Featured rows additionally show a family eyebrow and a faint inline 5-swatch palette glimpse after the name
- Selected row gets a subtle background tint matching the focused theme's accent

The accent dots always show each row's own theme accent, never the site's currently-applied theme. The rail stays informative regardless of which theme is loaded.

### Main pane (the hero)

**Nameplate (thin strip at top)**
- Theme name + family chip + tag chips + light/dark indicator
- Right-aligned subtle actions: `Pin to compare`, `Open in Lab`, `Copy JSON`
- Actions invite the other workflows without selling them

**Body — default Workspace scene**

A small Superset window with two columns visible and the third (files/changes/review) collapsed to its toggle icon:

```
┌─ workspace preview ───────────────────────────────────┐
│ T Team           │ feat/x  branch ▾                  ▢│
│ ⊕ Workspaces     ├───────────────────────────────────│
│ ⊘ Automations    │ Codex  Run ⌘G ▾  Redesign theme   │
│ ⊓ Tasks & PRs    ├───────────────────────────────────│
│                  │ ⚙ ◉ Claude  ⚙ Codex               │
│ S superset-…     │ ──────────────────────────────────│
│ • feat/x +13k    │ Cool. Here's the full anatomy…    │
│   docs   +103    │                                    │
│                  │ ┌─────────────────────────────┐    │
│ ⊝ storybook-lab  │ │> the rail structure          │    │
│                  │ └─────────────────────────────┘    │
│ ⊙ Ports 5174     │ »» bypass perms on (shift+tab)    │
│ ⚙ Settings       │                                    │
└─────────────────────────────────────────────────────────┘
```

The thin `▢` icon at the top right is the right-pane toggle. It communicates the third column exists without spending real estate.

**Scene tab strip below body**

Two scenes only:
- `Workspace` (default)
- `Settings` — full appearance/settings page, covers form inputs, dropdowns, code block sample, terminal sample

Drop `Diff`, `Command palette`, `Editor` scenes from the current implementation. Diff lives inside the right pane (collapsed); the command palette renders as the catalog's actual ⌘K (see below); Editor is not a Superset concept.

**Default editor font:** Menlo. **Default terminal font:** JetBrains Mono. **Chrome font:** system / Inter. All previews use these regardless of theme metadata to keep comparison apples-to-apples. (A future "use theme's preferred fonts" toggle is possible, default off.)

**Expand affordance:** clicking the nameplate name or pressing a shortcut blows the pane up to viewport-fill, rail hides. For close inspection.

### Command palette (⌘K)

The site's navigation palette is a literal copy of Superset's command palette UI: light card, section labels (`Themes`, `Actions`), keyboard hints right-aligned, subtle row highlight on focus. Dual purpose:

- Functional: jump to any theme, toggle light/dark filter, open Lab with current theme, copy JSON, exit compare, etc.
- Demonstrative: since the palette is part of the site chrome and the site chrome takes on the focused theme's colors, ⌘K *is* the command-palette demo for whatever theme is currently focused.

Sections:
- **Themes** — fuzzy search across all catalog themes
- **Actions** — `Pin to compare`, `Open in Lab`, `Copy JSON`, `Toggle next theme`, `Exit compare` (when active), `Back to catalog` (when in Lab)

## Theme application rules

- **Site = focused theme.** Chrome, rail, and preview all render in the currently-focused theme's colors. No separation between "site chrome" and "preview chrome."
- **First paint default:** the first Featured theme (currently Tokyo Night). Critical CSS inlined to avoid flash.
- **Transitions:** ~180ms ease on color properties globally. Smooth, not sluggish.
- **Per-row accent swatches in the rail** keep showing their own theme's accent, not the site's current theme. The rail remains informative.
- **No light/dark chrome toggle.** The theme is the toggle.

## Compare mode

- Enter via `Pin to compare` (nameplate action) or `.` keyboard shortcut.
- Main pane splits vertically into two slots. Rail unchanged.
- Chrome stays at whichever theme was focused on entry. Doesn't shift while comparing.
- Clicking a rail row fills the empty slot. When both slots are full, the next click replaces the least-recently-pinned slot.
- Scenes (`Workspace` ↔ `Settings`) sync across both slots so the comparison stays apples-to-apples.
- Right pane stays collapsed in both slots.
- URL: `/compare?a=<id>&b=<id>`. No enforced light/dark — not all comparisons are pairs.
- Pinned themes show a small pin glyph in their rail row.
- Exit via "Exit compare" or Esc. Chrome remains at the entry-state theme.
- On entering compare, a subtle "compare mode — click any theme to fill" hint appears under the rail header until the second slot is filled.

## Lab page

Lab is a **sibling route** of the catalog, same shell shape — rail contents change, preview pane stays identical.

```
┌─ Lab · Draft from tokyo-night ──── back · copy · download ┐
│ ⌕ Search tokens                 ⌘K │                       │
│                                     │  [Superset workspace  │
│ SOURCE                              │   preview — identical │
│  Start from: [tokyo-night ▾]        │   to catalog pane,    │
│  Import JSON: [↑]                   │   updates live as     │
│                                     │   tokens change]      │
│ GENERATE                            │                       │
│  Seed: [atlas]   Mode: dark ▾       │                       │
│  Hue: 200°–260°                     │                       │
│  [Reroll all]                       │                       │
│                                     │                       │
│ ── UI ─────────────                 │                       │
│  background  ●  #1a1b26   ⚠         │                       │
│  foreground  ●  #a9b1d6             │                       │
│  border      ●  #1f2032             │                       │
│  selection   ●  #364a82             │                       │
│  [↻ reroll group]                   │                       │
│                                     │                       │
│ ── TERMINAL ───────                 │                       │
│  bg          ●  #16161e             │                       │
│  …                                  │                       │
│                                     │                       │
│ ── CONTRAST ───────                 │                       │
│  bg/fg     8.2:1  ✓                 │                       │
│  bg/muted  3.1:1  ⚠ AA fail         │                       │
└─────────────────────────────────────┴───────────────────────┘
```

**Rail contents (top to bottom):**
- Token search (⌘K-bound) — useful when token name known
- **Source** — start from catalog theme, paste JSON, upload file
- **Generate** — seed + mode + hue range + reroll-all (only shown when seed in use)
- **Tokens** grouped by `UI` / `Terminal` / `Diagnostic`. Each row: swatch + token name + hex. Click hex to open color picker (pops out as floating panel anchored to swatch). Reroll button per group.
- **Contrast** summary at bottom. Failing pairs at top, passing pairs collapsed. Click warning to scroll the rail to involved token.

**Bottom of rail (sticky):**
- `← Back to catalog`
- `Export JSON` (sub-actions: copy, download)

**Nameplate** reads `Draft — based on tokyo-night` or `Draft — generated, seed: atlas`. Tag chips disabled (drafts don't have tags until exported).

**Theme-match rule extends to Lab:** as you edit tokens, the chrome morphs with the draft. You're previewing the whole-site experience in real time, not just a window inside a fixed shell.

**⌘K in Lab** seeds your draft from another theme rather than navigating away. Esc / "Back to catalog" exits Lab.

Rail width stays at 320px (consistent with catalog), accepting that token-list editing involves some scrolling. Visual consistency between catalog and Lab outweighs ~80px of editor breathing room.

## Featured tier

**Count:** 5 slots. Hand-picked.

**Criteria:**
- **Variety** — mix light + dark, warm + cool, high contrast + soft. Featured is a survey of the space, not five dark neon themes in a row.
- **Distinctive identity** — themes that have a *feel*, can't be confused with "generic dark theme #43."
- **Recognition** — themes a visiting dev nods at. Builds trust.
- **Renders well in Superset** — must look good at full-app scale in Superset's actual chrome.

**Proposed initial slate:**
1. **Tokyo Night** — dark, cool/neon — already in catalog
2. **Catppuccin Mocha** — dark, soft pastel — already in catalog
3. **Solarized Light** — light, warm — already in catalog
4. **Rose Pine Dawn** — light, soft, designer-darling — needs adding
5. **One Dark** — dark, classic, Atom lineage — needs adding

3 dark + 2 light. Drops Aurora / Graphite / Gruvbox / Nord / Dracula from Featured; they remain in the broader catalog.

## Curation quality bar

- Themes are admitted to the catalog only if their UI tokens (`background`, `foreground`, `border`, `selection`, `muted`) meet WCAG AA on critical pairs at full-app scale.
- Existing `pnpm themes:check-contrast` enforces this.
- The bar IS the gate. Themes that don't meet it don't enter the catalog. No exceptions.

This protects two surfaces:
- The preview pane (themes must be readable in a real editor)
- The site chrome itself (a poor-contrast theme would degrade the catalog's own navigation under the theme-match rule)

## Theme sourcing

For growing the catalog beyond the current 10 themes:

- Script: `scripts/themes-research.mjs`
- **VS Code Marketplace install counts** for breadth (top ~50 themes)
- **GitHub star velocity** on each theme's repo for momentum (themes climbing recently, not just total)
- **Manual filter:** clean color spec, permissive license, design quality at Superset's chrome scale
- Output: ranked candidate list, separate from committed JSON. Research data, not catalog data.

Material Theme variants require license verification (the original Mattia Astorino theme had license drama). If a Material entry is wanted, pick a permissively licensed variant or build a fresh port.

## Routes

| Route | Purpose | Notes |
|-------|---------|-------|
| `/` | Catalog. Master/detail shell. | Default focused theme = first Featured. |
| `/?theme=<id>` | Catalog with specific theme focused. | URL-shareable. |
| `/compare?a=<id>&b=<id>` | Compare mode. Pane split. | Rail unchanged. |
| `/lab` | Lab. Sibling shell. | Empty draft. |
| `/lab?from=<id>` | Lab seeded from a catalog theme. | URL-shareable. |
| `/lab?seed=<seed>&mode=<m>` | Lab with generated draft. | URL-shareable, deterministic. |

No separate `/themes/:id` detail route. Detail is folded into the catalog.

## What stays from the current implementation

Data and logic survive the pivot. Only the UI is rewritten.

- Theme JSON schema and Zod runtime validation (`src/theme-core/`)
- Theme catalog data structure with attribution metadata (out-of-band, not in exported JSON)
- Contrast validation utilities and CLI (`pnpm themes:check-contrast`)
- Random theme generator (used by Lab)
- Theme JSON export-clean behavior (no app-specific metadata in exported themes)
- Existing 10 themes (Aurora light/dark, Graphite Dark, Solarized light/dark, Nord, Catppuccin Mocha, Dracula, Gruvbox Dark, Tokyo Night)
- TanStack Router, Vite, React, TypeScript, Biome, Vitest, Playwright, Storybook stack

## What gets rewritten

- Global CSS (`src/styles/global.css`) — entirely new
- Catalog page (`src/catalog/`) — new master/detail shell
- Theme detail page — eliminated, folded into catalog
- Pair compare page (`src/compare/`) — becomes a pane-split mode in catalog
- Lab page (`src/lab/`) — new editor-as-rail layout
- Preview components (`src/preview/`) — new Superset three-column workspace surfaces, drop `Diff`/`Command`/`Editor` scenes
- Theme card → becomes a rail row
- UI primitives (`src/ui/`) — rebuilt for the new register

## What gets added

- Command palette (⌘K) — Superset-shaped, dual-purpose
- Featured tier metadata in catalog data
- Theme-match transition system (CSS variable system mapping theme tokens to chrome tokens, smooth ~180ms color transitions)
- Site-as-theme infrastructure — theme tokens flow into chrome tokens, default theme inlined for instant paint
- Rose Pine Dawn theme port
- One Dark theme port
- `scripts/themes-research.mjs` for popularity sourcing

## Out of scope (explicitly dropped)

- Editorial landing page / hero copy / welcome framing
- Top-level nav tabs (`Catalog / Compare / Lab` as a tab strip)
- Filter form on left rail (light/dark radios, tag checkboxes, family radios)
- Sort dropdown with `name / family / accent / hue / contrast` options
- "View details" button — card-is-the-link instead, and no separate detail page
- `Diff`, `Command palette`, `Editor`, `Settings` (the current one) preview scenes
- Light/dark site chrome toggle independent of focused theme
- Per-theme detail route

## Open implementation questions

These are not design questions; they need answers when writing the implementation plan.

- Exact mapping of theme tokens → chrome CSS variables (which preview tokens drive which chrome tokens)
- Strategy for instant first-paint with focused theme (inline `<style>` in `index.html`, server-render static HTML per theme at build time, or a critical CSS extraction step)
- Smooth-transition implementation: `transition: background-color 180ms, color 180ms` on `:root` and selected descendants, with respect for `prefers-reduced-motion`
- Color picker library (or custom) for Lab
- Keyboard navigation for rail (arrow keys, Home/End)
- Compare-mode rail-row hover state to signal "this slot will fill"

## Next steps

1. Replace `DESIGN.md` with a pointer to this document, or remove it.
2. Write the implementation plan in `docs/superpowers/plans/`.
3. Execute against the plan in a worktree.
