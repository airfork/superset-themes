# Catalog Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the Superset Theme Catalog UI as a Superset-adjacent master/detail shell where the entire site morphs into the focused theme, per `docs/design/2026-05-27-catalog-redesign.md`.

**Architecture:** Single token namespace — chrome reads `--preview-*` CSS variables directly, with no separation between "site chrome" and "preview chrome." A small `applyTheme()` utility writes vars to `:root` so the rail, top bar, bottom bar, pane, palette, and Lab all shift in unison. Build-time critical-CSS injection paints the first Featured theme before JS hydrates. Catalog and Lab are sibling routes sharing the same shell shape.

**Tech Stack:** Unchanged — pnpm, Biome, Vite, React 19, TypeScript, TanStack Router, Vitest, Playwright, Storybook, Zod, Culori. Adds a small Vite plugin for critical-CSS inlining.

---

## Source of truth

- Design doc: `docs/design/2026-05-27-catalog-redesign.md` (read this before any task)
- Prior implementation plan: `docs/superpowers/plans/2026-05-27-superset-theme-catalog-implementation.md` (context only — most of the UI it produced is being replaced)
- Agent rules: `AGENTS.md`
- Status log: `docs/STATUS.md` — update after every Phase checkpoint

## Testing strategy

- **Vitest** — pure logic (`applyTheme`, palette state, compare state, rail keyboard nav, fuzzy search) and component behavior (RailRow accent rules, scene tab synchronization).
- **Playwright** — full flows (theme-match URL, rail click → chrome morph, compare pin/replace, ⌘K open + jump, Lab live edit, keyboard navigation, reduced motion).
- **Storybook + Vitest stories** — isolated component states (RailRow variants, Nameplate, Palette open states, ScenesTabs, Lab ColorField). Stories double as a11y harness via `@storybook/addon-a11y`.

## Resumability rules

- Tick checkboxes as steps complete.
- After each Phase checkpoint, update `docs/STATUS.md` with the current state, next step, last verification command, and any blockers.
- Commit at the end of each task (each task ends with a `git add` + `git commit`).
- Keep `COMMANDS.md` synced with `package.json` if scripts change.

## Verification commands

```bash
pnpm check          # lint + typecheck + unit tests + build
pnpm test:e2e       # Playwright
pnpm test:stories   # Storybook interaction + a11y
pnpm build          # production build (also part of pnpm check)
pnpm dev            # for visual QA
```

## Review skills used during this plan

Specific tasks invoke these skills via the `Skill` tool. Do not skip them — they catch regressions tests cannot.

- `impeccable` — visual / interaction polish, design coherence, micro-interactions.
- `vercel-react-best-practices` — React 19 patterns, Server Components boundaries (N/A here, static), state colocation, memoization, render avoidance.
- `web-design-guidelines` — accessibility, keyboard, focus, semantics, motion preferences.

---

# Phase 1 — Data prep (no UI change yet)

## Task 1: Port Rose Pine Dawn theme

**Files:**
- Create: `src/data/themes/rose-pine-dawn.json`
- Modify: `src/data/catalog.ts`
- Modify: `docs/THEME_ATTRIBUTIONS.md`

Reference palette: https://github.com/rose-pine/rose-pine-theme (`dawn` variant, MIT license).

- [x] **Step 1: Write a failing schema test for the new theme**

Add to `src/theme-core/schema.test.ts` (or a new sibling test) a case asserting the file parses cleanly and the variant is `light`. Run it first to confirm it fails because the file does not exist:

```bash
pnpm test src/theme-core/schema.test.ts
```

Expected: FAIL with a missing-import or schema error.

- [x] **Step 2: Create the theme JSON**

Map Rose Pine Dawn's documented palette to `src/theme-core/schema.ts`'s `supersetThemeSchema`. Use `version: 1`, `id: "rose-pine-dawn"`, `type: "light"`, `author: "Rosé Pine"`, and a one-line `description` mentioning warm rose foreground and soft cream surfaces.

Critical: the foreground/background pair must clear WCAG AA (≥4.5:1). If Rose Pine Dawn's natural `text` is too light against `base`, swap to `subtle` or darken slightly — the contrast gate is non-negotiable per the design doc.

- [x] **Step 3: Add metadata entry**

Append to `catalogThemeMetadata` in `src/data/catalog.ts`:

```ts
{
  themeId: "rose-pine-dawn",
  source: "upstream-port",
  family: "Rosé Pine",
  variant: "light",
  styleTags: ["soft", "warm", "designer-darling"],
  accentHue: 343,
  warmth: "warm",
  contrastTier: "standard",
  terminalPaletteQuality: "rich",
  license: "MIT",
  upstreamUrl: "https://github.com/rose-pine/rose-pine-theme",
  portStatus: "ported",
  notes: "Schema-clean catalog adaptation of the Rosé Pine Dawn palette.",
}
```

Append the entry to `rawCatalogThemes` with the imported JSON.

- [x] **Step 4: Run validation + contrast scripts**

```bash
pnpm themes:validate
pnpm themes:check-contrast
```

Expected: both pass. If contrast fails, adjust foreground / muted in Step 2 and re-run.

- [x] **Step 5: Update attributions**

Add a Rosé Pine block to `docs/THEME_ATTRIBUTIONS.md` mirroring existing entry style (name, upstream URL, license, port notes).

- [x] **Step 6: Run schema test + commit**

```bash
pnpm test src/theme-core/schema.test.ts
git add src/data/themes/rose-pine-dawn.json src/data/catalog.ts docs/THEME_ATTRIBUTIONS.md src/theme-core/schema.test.ts
git commit -m "feat: add Rose Pine Dawn theme port"
```

## Task 2: Port One Dark theme

**Files:**
- Create: `src/data/themes/one-dark.json`
- Modify: `src/data/catalog.ts`
- Modify: `docs/THEME_ATTRIBUTIONS.md`

Reference palette: https://github.com/atom/atom/tree/master/packages/one-dark-ui (MIT license, Atom lineage).

Repeat the structure of Task 1 with the following deltas:
- `id: "one-dark"`, `type: "dark"`, `family: "One Dark"`, `variant: "dark"`, `accentHue: 207`, `warmth: "cool"`, `styleTags: ["classic", "balanced", "atom-lineage"]`, `upstreamUrl: "https://github.com/atom/atom"`.

- [x] **Step 1: Failing schema test**
- [x] **Step 2: Create `src/data/themes/one-dark.json`** with `#282c34` background, `#abb2bf` foreground, accent `#61afef`, primary `#61afef`, selection `#3e4451`. Cross-check contrast pairs before saving.
- [x] **Step 3: Add metadata entry + raw entry**
- [x] **Step 4: `pnpm themes:validate && pnpm themes:check-contrast`**
- [x] **Step 5: Update `docs/THEME_ATTRIBUTIONS.md`**
- [x] **Step 6: Commit `feat: add One Dark theme port`**

## Task 3: Add `featured` slot metadata

**Files:**
- Modify: `src/theme-core/schema.ts`
- Modify: `src/theme-core/themeTypes.ts` (auto via inference)
- Modify: `src/theme-core/schema.test.ts`
- Modify: `src/data/catalog.ts`
- Create: `src/data/featured.ts`
- Create: `src/data/featured.test.ts`

The Featured tier is 5 hand-picked themes shown in a deliberate order. Encode it in metadata, not in component-level constants, so Storybook + tests can read it without importing UI.

- [x] **Step 1: Failing test asserting featured order**

Create `src/data/featured.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getFeaturedThemes, FEATURED_IDS } from "./featured";

describe("featured themes", () => {
  it("exposes five hand-picked themes in deliberate order", () => {
    expect(FEATURED_IDS).toEqual([
      "tokyo-night",
      "catppuccin-mocha",
      "solarized-light",
      "rose-pine-dawn",
      "one-dark",
    ]);
  });

  it("returns catalog entries in featured order with featuredRank set", () => {
    const featured = getFeaturedThemes();
    expect(featured).toHaveLength(5);
    expect(featured[0].theme.id).toBe("tokyo-night");
    expect(featured[0].meta.featuredRank).toBe(1);
    expect(featured[4].meta.featuredRank).toBe(5);
  });
});
```

Run:

```bash
pnpm test src/data/featured.test.ts
```

Expected: FAIL (module does not exist).

- [x] **Step 2: Extend `catalogThemeMetaSchema`**

Add to `catalogThemeMetaSchema` in `src/theme-core/schema.ts`:

```ts
featuredRank: z.number().int().min(1).max(5).nullable(),
```

Run `pnpm test src/theme-core` — every existing fixture will fail because `featuredRank` is now required. Either:
- (a) Make it `.optional()` instead of `.nullable()`, OR
- (b) Add `featuredRank: null` to every existing metadata entry.

Pick (b) — explicit nullable is clearer than absent-vs-set in a catalog this small.

- [x] **Step 3: Add `featuredRank` to all 12 metadata entries**

In `src/data/catalog.ts`, set:
- `tokyo-night: 1`, `catppuccin-mocha: 2`, `solarized-light: 3`, `rose-pine-dawn: 4`, `one-dark: 5`.
- All others: `featuredRank: null`.

- [x] **Step 4: Create `src/data/featured.ts`**

```ts
import { catalogThemes } from "./catalog";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

export const FEATURED_IDS = [
  "tokyo-night",
  "catppuccin-mocha",
  "solarized-light",
  "rose-pine-dawn",
  "one-dark",
] as const;

export function getFeaturedThemes(): CatalogThemeEntry[] {
  return FEATURED_IDS.map((id) => {
    const entry = catalogThemes.find((e) => e.theme.id === id);
    if (!entry) throw new Error(`Featured theme missing from catalog: ${id}`);
    return entry;
  });
}

export function getDefaultFocusedTheme(): CatalogThemeEntry {
  return getFeaturedThemes()[0];
}
```

- [x] **Step 5: Run unit + validation suites**

```bash
pnpm test
pnpm themes:validate
```

Expected: all pass.

- [x] **Step 6: Commit**

```bash
git add src/theme-core/schema.ts src/data/catalog.ts src/data/featured.ts src/data/featured.test.ts
git commit -m "feat: add featured tier metadata and default theme"
```

## Phase 1 checkpoint

Run all of:

```bash
pnpm check
pnpm themes:validate
pnpm themes:check-contrast
```

Update `docs/STATUS.md` with Phase 1 complete, all 12 themes valid, featured slate locked.

---

# Phase 2 — Theme-match foundation

## Task 4: Collapse `--app-*` tokens into `--preview-*`

**Files:**
- Modify: `src/styles/tokens.css` (delete its contents or remove file)
- Modify: `src/styles/global.css` (rewrite chrome rules to use `--preview-*`)

The design says: "No separation between site chrome and preview chrome." Chrome reads preview tokens directly. There is one namespace.

- [x] **Step 1: Survey usages**

```bash
rg --vimgrep '--app-' src/styles src/ui src/catalog src/compare src/lab src/preview
```

Note every consumer. Map each to its `--preview-*` equivalent:

| Old (`--app-*`)      | New (`--preview-*`)             |
| -------------------- | ------------------------------- |
| `--app-bg`           | `--preview-ui-background`       |
| `--app-surface`      | `--preview-ui-card`             |
| `--app-surface-muted`| `--preview-ui-muted`            |
| `--app-border`       | `--preview-ui-border`           |
| `--app-text`         | `--preview-ui-foreground`       |
| `--app-text-muted`   | `--preview-ui-muted-foreground` |
| `--app-accent`       | `--preview-ui-accent`           |
| `--app-accent-strong`| `--preview-ui-accent-foreground`|
| `--app-focus`        | `--preview-ui-ring`             |
| `--app-shadow`       | drop — use `color-mix(in srgb, var(--preview-ui-background) 80%, transparent)` inline |
| `--app-radius`       | inline `8px` (single-value, no benefit as a token) |
| `--app-font`         | move to a hardcoded `:root` rule |

- [x] **Step 2: Empty `tokens.css`**

Replace `src/styles/tokens.css` with a stub that only sets the chrome font, color-scheme, and a transition timing variable:

```css
:root {
  color-scheme: light dark;
  --app-font-chrome: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --app-font-editor: Menlo, ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace;
  --app-font-terminal: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --app-transition: 180ms ease;
}

:root[data-theme-type="dark"] {
  color-scheme: dark;
}

:root[data-theme-type="light"] {
  color-scheme: light;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --app-transition: 0ms;
  }
}
```

- [x] **Step 3: Rewrite `global.css` chrome rules**

Replace all `--app-bg` / `--app-surface` / `--app-text` / etc. usages with the mapped `--preview-*` equivalents. Most of the old chrome CSS will be deleted in Phase 3 when the new shell lands, so for this task only do the minimum needed to keep the app rendering. Leave the existing per-component class names in place; they will be removed in Phase 10 cleanup.

- [x] **Step 4: Verify the app still renders**

```bash
pnpm dev
```

Open `http://localhost:5173`. The catalog page will look broken because chrome now uses the default `:root` preview vars which are unset → expect inherited browser defaults / blank. That's fine; Task 5 wires `applyTheme`.

Run `pnpm check` to confirm nothing typechecks against `--app-*`:

```bash
pnpm check
```

- [x] **Step 5: Commit**

```bash
git add src/styles/
git commit -m "refactor: collapse chrome tokens into preview namespace"
```

## Task 5: `applyTheme` utility + React provider

**Files:**
- Create: `src/theme/applyTheme.ts`
- Create: `src/theme/applyTheme.test.ts`
- Create: `src/theme/FocusedThemeProvider.tsx`
- Create: `src/theme/useFocusedTheme.ts`
- Modify: `src/main.tsx`

- [x] **Step 1: Failing test for `applyTheme`**

`src/theme/applyTheme.test.ts`:

```ts
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { applyTheme } from "./applyTheme";
import { getDefaultFocusedTheme } from "../data/featured";

describe("applyTheme", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme-type");
    document.documentElement.removeAttribute("data-theme-id");
  });

  it("writes ui + terminal vars to :root and sets data attributes", () => {
    const entry = getDefaultFocusedTheme();
    applyTheme(entry.theme);

    const root = document.documentElement;
    expect(root.style.getPropertyValue("--preview-ui-background")).toBe(entry.theme.ui.background);
    expect(root.style.getPropertyValue("--preview-terminal-background")).toBe(entry.theme.terminal.background);
    expect(root.getAttribute("data-theme-type")).toBe(entry.theme.type);
    expect(root.getAttribute("data-theme-id")).toBe(entry.theme.id);
  });
});
```

Run:

```bash
pnpm test src/theme/applyTheme.test.ts
```

Expected: FAIL (module missing).

- [x] **Step 2: Implement `applyTheme.ts`**

```ts
import { getThemeCssVars } from "../preview/themeCssVars";
import type { SupersetTheme } from "../theme-core/themeTypes";

export function applyTheme(theme: SupersetTheme, root: HTMLElement = document.documentElement) {
  const vars = getThemeCssVars(theme);
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
  root.setAttribute("data-theme-type", theme.type);
  root.setAttribute("data-theme-id", theme.id);
}
```

Run test — expect PASS.

- [x] **Step 3: Failing test for the React provider**

`src/theme/FocusedThemeProvider.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { FocusedThemeProvider } from "./FocusedThemeProvider";
import { useFocusedTheme } from "./useFocusedTheme";

function Probe() {
  const { focused, setFocusedId } = useFocusedTheme();
  return (
    <>
      <output>{focused.theme.id}</output>
      <button onClick={() => setFocusedId("solarized-light")}>swap</button>
    </>
  );
}

describe("FocusedThemeProvider", () => {
  it("exposes the focused entry and updates :root vars when changed", async () => {
    render(
      <FocusedThemeProvider initialThemeId="tokyo-night">
        <Probe />
      </FocusedThemeProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("tokyo-night");
    expect(document.documentElement.getAttribute("data-theme-id")).toBe("tokyo-night");

    await userEvent.click(screen.getByText("swap"));

    expect(screen.getByRole("status")).toHaveTextContent("solarized-light");
    expect(document.documentElement.getAttribute("data-theme-id")).toBe("solarized-light");
    expect(catalogThemes.length).toBeGreaterThan(0);
  });
});
```

- [x] **Step 4: Implement `FocusedThemeProvider` + hook**

```tsx
// FocusedThemeProvider.tsx
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { catalogThemes } from "../data/catalog";
import { getDefaultFocusedTheme } from "../data/featured";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { applyTheme } from "./applyTheme";

interface FocusedThemeContextValue {
  focused: CatalogThemeEntry;
  setFocusedId: (id: string) => void;
}

export const FocusedThemeContext = createContext<FocusedThemeContextValue | null>(null);

export function FocusedThemeProvider({
  children,
  initialThemeId,
}: {
  children: ReactNode;
  initialThemeId?: string;
}) {
  const [focusedId, setFocusedId] = useState<string>(
    () => initialThemeId ?? getDefaultFocusedTheme().theme.id,
  );

  const focused = useMemo(() => {
    const entry = catalogThemes.find((e) => e.theme.id === focusedId);
    return entry ?? getDefaultFocusedTheme();
  }, [focusedId]);

  useEffect(() => {
    applyTheme(focused.theme);
  }, [focused]);

  const value = useMemo(
    () => ({ focused, setFocusedId: useCallback(setFocusedId, []) }),
    [focused],
  );

  return <FocusedThemeContext.Provider value={value}>{children}</FocusedThemeContext.Provider>;
}
```

```ts
// useFocusedTheme.ts
import { useContext } from "react";
import { FocusedThemeContext } from "./FocusedThemeProvider";

export function useFocusedTheme() {
  const ctx = useContext(FocusedThemeContext);
  if (!ctx) throw new Error("useFocusedTheme must be used inside FocusedThemeProvider");
  return ctx;
}
```

Run `pnpm test src/theme/` — expect PASS.

- [x] **Step 5: Wire provider in `src/main.tsx`**

Wrap `<App />` in `<FocusedThemeProvider />`. The router will later set the initial theme from URL search params; for now the default is fine.

- [x] **Step 6: Run check + commit**

```bash
pnpm check
git add src/theme src/main.tsx
git commit -m "feat: add applyTheme provider for whole-site theme match"
```

## Task 6: Critical-CSS Vite plugin for instant first paint

**Files:**
- Create: `scripts/vite-plugin-critical-theme.mjs`
- Modify: `vite.config.ts`
- Modify: `index.html` (add a placeholder marker)

The plugin reads the default Featured theme JSON at build time, computes the CSS var declarations, and injects an inline `<style>` block before `</head>` so the chrome paints at the right color before any JS runs.

- [x] **Step 1: Add a marker to `index.html`**

Inside `<head>`:

```html
<style id="critical-theme">/* injected at build time */</style>
```

For dev (no plugin run), the `<style>` is empty; the `applyTheme` effect in `FocusedThemeProvider` paints on mount.

- [x] **Step 2: Implement the plugin**

`scripts/vite-plugin-critical-theme.mjs`:

```js
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const FEATURED_DEFAULT_ID = "tokyo-night";

function readDefaultTheme(root) {
  const path = resolve(root, `src/data/themes/${FEATURED_DEFAULT_ID}.json`);
  return JSON.parse(readFileSync(path, "utf8"));
}

function buildVarDeclarations(theme) {
  const decls = [];
  for (const [key, value] of Object.entries(theme.ui)) {
    decls.push(`--preview-ui-${kebab(key)}: ${value};`);
  }
  for (const [key, value] of Object.entries(theme.terminal)) {
    decls.push(`--preview-terminal-${kebab(key)}: ${value};`);
  }
  return decls.join("\n  ");
}

function kebab(str) {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

export function criticalThemePlugin() {
  let root = process.cwd();
  return {
    name: "critical-theme",
    configResolved(config) {
      root = config.root;
    },
    transformIndexHtml() {
      const theme = readDefaultTheme(root);
      const decls = buildVarDeclarations(theme);
      const css = `:root[data-theme-id="${theme.id}"],\n:root:not([data-theme-id]) {\n  ${decls}\n  color-scheme: ${theme.type};\n}\nhtml { background: ${theme.ui.background}; color: ${theme.ui.foreground}; }`;
      return [
        {
          tag: "style",
          attrs: { id: "critical-theme" },
          children: css,
          injectTo: "head",
        },
      ];
    },
  };
}
```

- [x] **Step 3: Register plugin in `vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { criticalThemePlugin } from "./scripts/vite-plugin-critical-theme.mjs";

export default defineConfig({
  plugins: [react(), criticalThemePlugin()],
});
```

- [x] **Step 4: Smoke test the build output**

```bash
pnpm build
grep -c 'preview-ui-background' dist/index.html
```

Expected: at least 1 occurrence (the inlined critical CSS).

- [x] **Step 5: Playwright spec for no-flash first paint**

Add `e2e/first-paint.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("first paint renders default theme background", async ({ page }) => {
  await page.goto("/");
  const bg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
  // Tokyo Night ui.background is #1a1b26 → rgb(26, 27, 38)
  expect(bg).toBe("rgb(26, 27, 38)");
});
```

Run:

```bash
pnpm test:e2e first-paint
```

Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add scripts/vite-plugin-critical-theme.mjs vite.config.ts index.html e2e/first-paint.spec.ts
git commit -m "feat: inline critical CSS for instant first-paint theme"
```

## Task 7: Global 180ms color transitions

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add the transition rule**

At the top of `global.css` (after the `*` reset):

```css
:root {
  transition:
    background-color var(--app-transition),
    color var(--app-transition);
}

*,
*::before,
*::after {
  transition:
    background-color var(--app-transition),
    border-color var(--app-transition),
    color var(--app-transition),
    fill var(--app-transition),
    stroke var(--app-transition),
    box-shadow var(--app-transition);
}
```

The `--app-transition` var is set to `0ms` under `prefers-reduced-motion: reduce` by Task 4's `tokens.css`, so reduced-motion users get instant swaps automatically.

- [ ] **Step 2: Playwright spec for reduced-motion**

Add to `e2e/first-paint.spec.ts`:

```ts
test("reduced motion zeroes the transition timing", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  const transition = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--app-transition").trim(),
  );
  expect(transition).toBe("0ms");
  await context.close();
});
```

- [ ] **Step 3: Verify + commit**

```bash
pnpm test:e2e first-paint
git add src/styles/global.css e2e/first-paint.spec.ts
git commit -m "feat: smooth 180ms color transitions with reduced-motion opt-out"
```

## Phase 2 checkpoint

```bash
pnpm check
pnpm test:e2e
```

**REVIEW:** Invoke the `vercel-react-best-practices` skill on `src/theme/`. The `FocusedThemeProvider` is the central render gate — make sure the context value is stable (memoized), `applyTheme` runs only when the focused theme actually changes, and no unnecessary re-renders are introduced. Update `docs/STATUS.md` with the review outcome.

---

# Phase 3 — Shell anatomy

## Task 8: Top bar

**Files:**
- Create: `src/chrome/TopBar.tsx`
- Create: `src/chrome/TopBar.stories.tsx`
- Create: `src/chrome/TopBar.test.tsx`

Composition: site name (small, left), ⌘K trigger (button styled like a search input), repo link. No tagline, no nav tabs.

- [ ] **Step 1: Failing test**

`TopBar.test.tsx` asserts: site name renders, "Search themes" placeholder visible, ⌘K hint visible, repo link points to upstream URL, top bar has `role="banner"`.

- [ ] **Step 2: Implement `TopBar.tsx`**

```tsx
import { Search } from "lucide-react";

interface TopBarProps {
  onOpenPalette: () => void;
}

export function TopBar({ onOpenPalette }: TopBarProps) {
  return (
    <header className="chrome-topbar" role="banner">
      <span className="chrome-topbar__name">Superset Themes</span>
      <button
        type="button"
        className="chrome-topbar__search"
        onClick={onOpenPalette}
        aria-label="Open command palette"
      >
        <Search aria-hidden="true" />
        <span>Search themes</span>
        <kbd>⌘K</kbd>
      </button>
      <a
        href="https://github.com/superset-sh/superset-themes"
        className="chrome-topbar__repo"
        rel="noreferrer"
      >
        repo
      </a>
    </header>
  );
}
```

- [ ] **Step 3: Add CSS to `global.css`**

Density target: ~38px tall, 12px horizontal padding, 1px bottom border using `--preview-ui-border`, surface using `--preview-ui-card`.

- [ ] **Step 4: Storybook story** showing default state (no-op `onOpenPalette`).

- [ ] **Step 5: Run check + commit**

```bash
pnpm check
git add src/chrome/TopBar.tsx src/chrome/TopBar.test.tsx src/chrome/TopBar.stories.tsx src/styles/global.css
git commit -m "feat: add top bar chrome"
```

## Task 9: Bottom status bar

**Files:**
- Create: `src/chrome/BottomBar.tsx`
- Create: `src/chrome/BottomBar.stories.tsx`
- Create: `src/chrome/BottomBar.test.tsx`

Composition: `<theme name> · <family> · <contrast ratio>` on left; `↓ next · ⌘K · . pin` keyboard hints on right.

- [ ] **Step 1: Failing test** — given a focused entry, renders the three left-side facts and the three keyboard hints.
- [ ] **Step 2: Implement `BottomBar.tsx`** taking `entry: CatalogThemeEntry`. Compute contrast ratio via `contrastRatio(theme.ui.background, theme.ui.foreground)` from `src/theme-core/contrast.ts` and render to one decimal place + `":1"`.
- [ ] **Step 3: CSS** — same density and surface as top bar, 1px top border.
- [ ] **Step 4: Storybook story** showing Tokyo Night, Solarized Light, and Catppuccin Mocha variants.
- [ ] **Step 5: Commit `feat: add bottom status bar`**

## Task 10: Layout shell

**Files:**
- Create: `src/chrome/LayoutShell.tsx`
- Modify: `src/main.tsx`

The shell is a CSS grid: `grid-template-rows: auto 1fr auto` (top / pane / bottom) with the rail nested inside the middle row as `grid-template-columns: 300px minmax(0, 1fr)`.

- [ ] **Step 1: Implement `LayoutShell.tsx`** taking `rail: ReactNode`, `pane: ReactNode`, `onOpenPalette: () => void`, and rendering `<TopBar />`, the rail+pane grid, and `<BottomBar entry={useFocusedTheme().focused} />`.
- [ ] **Step 2: CSS** with sticky rail (`position: sticky; top: 0; align-self: start; max-height: calc(100vh - var(--chrome-top) - var(--chrome-bottom))`).
- [ ] **Step 3: Failing Playwright** — assert the shell renders `header[role=banner]`, the rail region, the pane region, and a status footer.
- [ ] **Step 4: Wire shell into the catalog route** (placeholder rail + placeholder pane so the layout is observable). Old `<header className="app-header">` and the `<main>` wrapper in `router.tsx` get removed.
- [ ] **Step 5: Run check + commit `feat: add master-detail layout shell`**

## Phase 3 checkpoint

```bash
pnpm check
pnpm test:e2e
pnpm test:stories
```

**REVIEW:** Invoke `impeccable` on the live dev server. Focus: does the shell read as a Superset-adjacent workspace? Is density right? Are the top/bottom bars too loud or too quiet? Are the borders carrying their weight? Iterate before continuing — the chrome is the spine that everything else hangs off.

Update `docs/STATUS.md`.

---

# Phase 4 — Rail

## Task 11: RailRow primitive

**Files:**
- Create: `src/rail/RailRow.tsx`
- Create: `src/rail/RailRow.test.tsx`
- Create: `src/rail/RailRow.stories.tsx`

Composition: theme name (regular), trailing accent dot (filled for dark, ring for light, **colored with this row's theme accent, not the focused theme's accent**). Featured rows additionally show a family eyebrow and a 5-swatch palette glimpse. Selected row gets a subtle accent-tinted background.

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDefaultFocusedTheme } from "../data/featured";
import { RailRow } from "./RailRow";

describe("RailRow", () => {
  const tokyo = getDefaultFocusedTheme();

  it("colors the accent dot with the row's own theme accent", () => {
    render(<RailRow entry={tokyo} selected={false} pinned={false} variant="basic" />);
    const dot = screen.getByTestId("rail-accent-dot");
    expect(dot).toHaveStyle({ backgroundColor: tokyo.theme.ui.accent });
  });

  it("renders a ring (not filled) dot for light themes", () => {
    // grab solarized-light from catalog
  });

  it("shows family eyebrow + 5-swatch glimpse on featured variant", () => { /* … */ });

  it("shows a pin glyph when pinned", () => { /* … */ });
});
```

- [ ] **Step 2: Implement `RailRow.tsx`**

Props: `entry: CatalogThemeEntry`, `selected: boolean`, `pinned: boolean`, `variant: "basic" | "featured"`, `onSelect?: () => void`. The component does **not** call `useFocusedTheme()` — accent comes purely from `entry.theme.ui.accent`, so the rail row stays informative regardless of what's loaded.

Use `style={{ backgroundColor: entry.theme.ui.accent }}` directly on the dot — this is the *one* place where inline color is correct, because it must escape the `--preview-*` system that's bound to the focused theme.

The 5-swatch glimpse pulls `entry.theme.ui.primary`, `secondary`, `accent`, `destructive`, `selection`.

Selected state: background `color-mix(in srgb, var(--row-accent) 12%, transparent)`. Set `--row-accent` as an inline CSS variable on the row element so the CSS rule can use it.

- [ ] **Step 3: Run RailRow tests** — expect PASS.
- [ ] **Step 4: Storybook stories** — basic dark, basic light, featured dark, featured light, selected, pinned.
- [ ] **Step 5: Commit `feat: add RailRow primitive with self-colored accent`**

## Task 12: RailSection + RailSearch

**Files:**
- Create: `src/rail/RailSection.tsx`
- Create: `src/rail/RailSearch.tsx`
- Create: `src/rail/Rail.tsx`
- Create: `src/rail/Rail.test.tsx`

`RailSection` renders a labelled group (`FEATURED` / `LIGHT` / `DARK`). `RailSearch` is the search input at the top; on focus or `/` keypress it opens the palette (palette wired in Phase 8). `Rail` composes them.

- [ ] **Step 1: Failing test for Rail composition**

Asserts the rail renders three sections in order, Featured contains exactly 5 rows in the configured order, Light contains all light themes alphabetically, Dark contains all dark themes alphabetically. Featured entries also appear in their light/dark section (verify by id).

- [ ] **Step 2: Implement `RailSection.tsx`** as a `<section>` with a sticky-on-scroll-within-rail header label.
- [ ] **Step 3: Implement `RailSearch.tsx`** as a button styled like an input (real input lives inside the palette). Clicking or pressing `/` calls `onOpenPalette`.
- [ ] **Step 4: Implement `Rail.tsx`** that builds the three sections from `catalogThemes` + `getFeaturedThemes()`. Wire `onSelect` to update the focused theme via `useFocusedTheme()` and update the URL `?theme=` param via a passed-in `onSelectThemeId` callback.
- [ ] **Step 5: Run tests + commit `feat: compose rail with featured/light/dark sections`**

## Task 13: Rail keyboard navigation

**Files:**
- Create: `src/rail/useRailKeyboard.ts`
- Create: `src/rail/useRailKeyboard.test.ts`

Roving tabindex: ArrowDown/ArrowUp move focus within the rail list, Home/End jump to first/last, Enter activates the focused row, `/` opens the palette. Wrap-around at top/bottom.

- [ ] **Step 1: Failing test** simulating keydown events on a virtual list of ids; verify the hook updates the focused index correctly.
- [ ] **Step 2: Implement hook** using a `useReducer` keyed on action `"down" | "up" | "home" | "end" | "set"`.
- [ ] **Step 3: Wire into `Rail.tsx`** — set `tabIndex={focused === index ? 0 : -1}` on each row, attach a `keydown` handler to the rail container.
- [ ] **Step 4: Playwright spec** — arrow-key navigation in the rail morphs the chrome to each focused theme.
- [ ] **Step 5: Commit `feat: rail keyboard navigation`**

## Phase 4 checkpoint

```bash
pnpm check
pnpm test:e2e
pnpm test:stories
```

**REVIEW:** Invoke `web-design-guidelines` on `src/rail/`. Verify the rail is a proper landmark (`aria-label="Themes"`), the section labels are semantic, keyboard nav covers all rows including those after the section break, focus rings are visible on every theme's accent (worst-case contrast pairing).

**REVIEW:** Invoke `impeccable` on the rail. Check that featured rows differentiate clearly from basic rows without shouting, the accent dots read at the intended density, hover/selected states feel deliberate.

Update `docs/STATUS.md`.

---

# Phase 5 — Pane

## Task 14: Pane nameplate

**Files:**
- Create: `src/pane/Nameplate.tsx`
- Create: `src/pane/Nameplate.test.tsx`
- Create: `src/pane/Nameplate.stories.tsx`

Composition: theme name · family chip · tag chips · light/dark indicator on the left; `Pin to compare`, `Open in Lab`, `Copy JSON` actions on the right.

- [ ] **Step 1: Failing test** — renders all three actions; "Pin to compare" calls `onPin` with focused id.
- [ ] **Step 2: Implement** — actions are ghost-style buttons (subtle, no primary color), separated by thin vertical dividers.
- [ ] **Step 3: Stories** — Tokyo Night and Rose Pine Dawn variants.
- [ ] **Step 4: Commit `feat: add pane nameplate`**

## Task 15: Workspace scene — Superset three-column layout

**Files:**
- Create: `src/pane/WorkspaceScene.tsx`
- Create: `src/pane/WorkspaceScene.test.tsx`
- Create: `src/pane/WorkspaceScene.stories.tsx`
- Modify: `src/preview/surfaces.tsx` (extract reusable bits; mark Diff/Command/Editor as deprecated, removed in Phase 10)

Three-column shape matching the design doc's ASCII diagram. The third column (files/changes) is collapsed to its toggle icon (`▢` PanelRight). Two columns visible:
- Left: workspaces tree (`T Team` header, `Workspaces / Automations / Tasks & PRs` nav, project list with branches, `Ports / Settings` footer).
- Middle: thread (branch header with the toggle, agent run row, agent picker tabs, message stream with code blocks, input bar).

This is **not** the current `surfaces.tsx` workspace — that one mimicked Bolt/VS Code. The new one mimics Superset's actual workspace layout.

- [ ] **Step 1: Failing component test** — renders the workspaces tree, the thread, and the collapsed third-column toggle. No file tree on the right.
- [ ] **Step 2: Implement `WorkspaceScene.tsx`** with hardcoded fixture content that reads "this is a Superset workspace" without being literally Superset-branded. Use `--preview-ui-*` for all surfaces, `--preview-terminal-*` only for the input prompt indicator.
- [ ] **Step 3: CSS** — single grid `grid-template-columns: 220px minmax(0, 1fr) 32px` (third col is toggle-width). Use `--app-font-chrome` for sidebars, `--app-font-editor` for code blocks.
- [ ] **Step 4: Stories** covering Tokyo Night, Solarized Light, Catppuccin Mocha, Rose Pine Dawn, One Dark.
- [ ] **Step 5: Commit `feat: add Workspace preview scene`**

## Task 16: Settings scene

**Files:**
- Create: `src/pane/SettingsScene.tsx`
- Create: `src/pane/SettingsScene.test.tsx`
- Create: `src/pane/SettingsScene.stories.tsx`

A full appearance/settings page covering: a labeled `<input>`, a `<select>`, a checkbox group, a radio set, a destructive action button, a code-block sample (uses editor font + terminal colors), and a terminal sample. Mirrors Superset's settings density.

- [ ] **Step 1: Failing test** — renders all 7 input types and the code/terminal samples.
- [ ] **Step 2: Implement** using only `--preview-*` vars + `--app-font-*` family vars.
- [ ] **Step 3: Stories**.
- [ ] **Step 4: Commit `feat: add Settings preview scene`**

## Task 17: Scene tab strip + pane expand

**Files:**
- Create: `src/pane/SceneTabs.tsx`
- Create: `src/pane/Pane.tsx`
- Create: `src/pane/Pane.test.tsx`

Two scenes only: `Workspace` (default) and `Settings`. Tab strip sits **below** the body (per design ASCII), not above. Expand affordance: clicking the nameplate name or pressing `f` (think "fullscreen") toggles a class on the layout shell that hides the rail and pushes the pane to viewport-fill.

- [ ] **Step 1: Failing test for `Pane`** — switches between scenes; expand toggle dispatches a callback.
- [ ] **Step 2: Implement `SceneTabs.tsx`** as `role="tablist"` with two tabs.
- [ ] **Step 3: Implement `Pane.tsx`** composing Nameplate + (Workspace|Settings) + SceneTabs.
- [ ] **Step 4: Wire expand into `LayoutShell`** — when `expanded`, add `data-expanded="true"` and CSS hides the rail.
- [ ] **Step 5: Playwright** — pressing `f` hides the rail, pressing `f` again restores it.
- [ ] **Step 6: Commit `feat: scene tabs and pane expand`**

## Task 18: Catalog route wiring

**Files:**
- Modify: `src/app/routes/catalogRoute.tsx`
- Modify: `src/app/router.tsx`

The catalog route is now the master/detail shell, not the old filter/grid. URL is `/?theme=<id>`; clicking a rail row updates the param via `navigate({ replace: true, search })` and the provider syncs.

- [ ] **Step 1: Replace `CatalogRouteView` body** — render `<LayoutShell rail={<Rail …/>} pane={<Pane …/>} />`.
- [ ] **Step 2: Initial theme from URL** — `FocusedThemeProvider` accepts `initialThemeId={search.theme ?? getDefaultFocusedTheme().theme.id}`. Move provider down from `main.tsx` into the catalog route container so each route can pass its own initial theme.

Actually, leave the provider in `main.tsx` and have the catalog route call `setFocusedId(search.theme)` in a `useEffect` driven by URL changes. Same outcome, simpler.

- [ ] **Step 3: Update Playwright `e2e/catalog.spec.ts`** — replace old assertions about filters/grids with: rail visible, clicking a rail row updates `?theme=…`, chrome background changes.
- [ ] **Step 4: Delete `src/app/routes/themeRoute.tsx` and `src/catalog/ThemeDetail.tsx`** + their tests. Remove the `themeRoute` from the route tree.
- [ ] **Step 5: Commit `feat: wire catalog as master-detail shell`**

## Phase 5 checkpoint

```bash
pnpm check
pnpm test:e2e
pnpm test:stories
pnpm dev   # visual QA — click through every theme in the rail; chrome should morph cleanly
```

**REVIEW:** Invoke `impeccable` on the live catalog with at least 3 themes (Tokyo Night, Solarized Light, Rose Pine Dawn). Focus: does each theme *feel* like itself in the Workspace scene? Does the pane scale gracefully on a 1280×800 viewport? Are scene tabs underweight or overweight? Iterate on density and color usage.

**REVIEW:** Invoke `web-design-guidelines` on `src/pane/SettingsScene.tsx`. Form controls must have visible labels, the radio/checkbox groups need `fieldset/legend`, focus must be visible against every theme's `--preview-ui-background`.

Update `docs/STATUS.md` with the Phase 5 milestone and a screenshot or short note about visual QA outcome.

---

# Phase 6 — Compare mode

## Task 19: Compare state machine

**Files:**
- Create: `src/compare/compareState.ts`
- Create: `src/compare/compareState.test.ts`
- Delete: `src/compare/pairing.ts` + `pairing.test.ts`

State shape: `{ a: string | null, b: string | null, lastPinned: "a" | "b" | null, enteredFromThemeId: string }`. Reducer actions: `pin(themeId)`, `unpin("a" | "b")`, `enter(themeId)`, `exit()`.

- [ ] **Step 1: Failing tests** covering: first pin fills `a`, second pin fills `b`, third pin replaces the LRU slot, `unpin` clears one slot, `exit` returns to a clean state.
- [ ] **Step 2: Implement reducer**. LRU = "least recently pinned" — when both slots are full, the next pin replaces the slot whose `lastPinned` was *not* most recent. Track `lastPinned` to make this explicit.
- [ ] **Step 3: Delete old `pairing.ts` + test**. Update any importers.
- [ ] **Step 4: Commit `refactor: replace pairing with compare-mode state machine`**

## Task 20: Compare UI

**Files:**
- Create: `src/compare/CompareSlot.tsx`
- Modify: `src/compare/PairCompare.tsx` → rename to `src/compare/CompareView.tsx` (rewrite contents)
- Modify: `src/app/routes/compareRoute.tsx`

When compare mode is active, the pane area splits vertically into two slots. Each slot renders Nameplate + Workspace/Settings scene for its theme. Chrome (top bar, rail, bottom bar) stays at the **entry-state theme** — does not morph as you pin. Each rail row that's pinned gets a pin glyph.

- [ ] **Step 1: Failing Playwright** — `/compare?a=tokyo-night&b=solarized-light` renders two slots side by side; both rail rows show pin glyph; chrome stays at the entry-state theme (not Tokyo Night or Solarized).
- [ ] **Step 2: Implement `CompareSlot.tsx`** — internally creates a scoped CSS variable scope so its preview vars don't bleed onto siblings. Use `style={getThemeCssVars(theme) as CSSProperties}` directly on the slot element, then have its descendants use those vars.

This is the trick: chrome reads `:root` vars, slot reads its own scope. Same `getThemeCssVars` utility, different attachment point.

- [ ] **Step 3: Implement `CompareView.tsx`** — uses `compareState` to render two slots with shared `currentScene` state so Workspace ↔ Settings toggles sync.
- [ ] **Step 4: Add hint** ("compare mode — click any theme to fill") that shows below the rail header until `b` is filled.
- [ ] **Step 5: Wire to route** — `/compare?a=…&b=…&scene=workspace|settings`. Update Playwright `e2e/pairing.spec.ts` → rename to `e2e/compare.spec.ts` and rewrite for the new flow.
- [ ] **Step 6: Commit `feat: compare mode with pane split`**

## Task 21: Compare keyboard + entry

**Files:**
- Modify: `src/app/router.tsx`
- Modify: `src/rail/Rail.tsx`
- Modify: `src/pane/Nameplate.tsx`

- [ ] **Step 1: `.` (period) keypress** anywhere in the catalog enters compare mode using the currently focused theme as `a` (and as the entry-state). Esc exits.
- [ ] **Step 2: Nameplate `Pin to compare` button** is a synonym for the `.` shortcut.
- [ ] **Step 3: Rail row click in compare mode** dispatches `pin` instead of switching the focused theme.
- [ ] **Step 4: Playwright** for both entry paths.
- [ ] **Step 5: Commit `feat: keyboard and nameplate entry to compare mode`**

## Phase 6 checkpoint

```bash
pnpm check
pnpm test:e2e
```

**REVIEW:** Invoke `impeccable` on compare mode with 3 different pin combinations (light+dark, dark+dark, light+light). Verify scene sync feels natural and chrome staying put doesn't feel jarring.

**REVIEW:** Invoke `web-design-guidelines` on the compare flow. Live region for "second slot filled" announcement; Esc behavior must be predictable; pinned glyph must not rely on color alone.

Update `docs/STATUS.md`.

---

# Phase 7 — ⌘K command palette

## Task 22: Palette state machine

**Files:**
- Create: `src/palette/paletteState.ts`
- Create: `src/palette/paletteState.test.ts`
- Create: `src/palette/fuzzy.ts`
- Create: `src/palette/fuzzy.test.ts`

State: `{ open: boolean, query: string, focusedIndex: number }`. Actions: `open`, `close`, `setQuery`, `move("up"|"down")`, `submit()`.

Sections rendered: `Themes` (fuzzy match over all catalog ids + names) and `Actions` (context-dependent: always shows `Open in Lab`, `Toggle next theme`; shows `Pin to compare` when not in compare mode; shows `Exit compare` when in compare mode; shows `Back to catalog` when in Lab).

- [ ] **Step 1: Failing tests** for state reducer (open/close, up/down clamping, submit selects focused result).
- [ ] **Step 2: Failing tests for `fuzzy.ts`** — simple subsequence match with score = sum of run lengths. Sort: exact prefix > prefix > subsequence; ties broken by shorter id.
- [ ] **Step 3: Implement both**.
- [ ] **Step 4: Commit `feat: command palette state and fuzzy matcher`**

## Task 23: Palette UI

**Files:**
- Create: `src/palette/Palette.tsx`
- Create: `src/palette/Palette.test.tsx`
- Create: `src/palette/Palette.stories.tsx`
- Modify: `src/chrome/TopBar.tsx`
- Modify: `src/chrome/LayoutShell.tsx`

The palette visually mirrors Superset's command palette: light card (`--preview-ui-popover`), section labels (`Themes`, `Actions`), keyboard hints right-aligned, subtle row highlight on focus. Renders inside the focused theme's chrome so it's the actual palette demo.

- [ ] **Step 1: Failing test** — opens on ⌘K, closes on Esc, typing filters Themes section, ArrowDown moves focus, Enter submits.
- [ ] **Step 2: Implement `Palette.tsx`** as a portal-rendered overlay (use `<dialog>` or a fixed-position div with `role="dialog"` + focus trap).
- [ ] **Step 3: Wire to LayoutShell** — shell holds palette open state; TopBar's search button toggles it.
- [ ] **Step 4: Global ⌘K listener** in `LayoutShell`.
- [ ] **Step 5: Stories** — empty query, Themes filtered, Actions section (catalog context), Actions section (compare context), Actions section (Lab context).
- [ ] **Step 6: Playwright** — open, type "rose", Enter → URL has `?theme=rose-pine-dawn`.
- [ ] **Step 7: Commit `feat: ⌘K command palette`**

## Phase 7 checkpoint

```bash
pnpm check
pnpm test:e2e
pnpm test:stories
```

**REVIEW:** Invoke `impeccable` on the palette across at least 4 themes (Tokyo Night, Solarized Light, Rose Pine Dawn, Catppuccin Mocha). The palette is dual-purpose — it must read as the palette demo while functioning. Watch for: does the row-focus background land on a sane color in every theme? Does the popover shadow read in light themes (where strong shadows look wrong)?

**REVIEW:** Invoke `web-design-guidelines` on the palette. Focus trap inside the dialog, focus returns to TopBar trigger on close, `aria-activedescendant` for the focused row, `role="listbox"` + `role="option"` for results.

Update `docs/STATUS.md`.

---

# Phase 8 — Lab

## Task 24: Lab route shell

**Files:**
- Modify: `src/app/routes/labRoute.tsx`
- Create: `src/lab/LabView.tsx` (replaces `LabPage.tsx`)
- Create: `src/lab/LabRail.tsx`

Lab is a sibling route sharing the same `LayoutShell`. Rail contents change; the pane stays identical (Workspace + Settings scenes from `src/pane/`).

- [ ] **Step 1: Replace `LabRouteView` body** with `<LayoutShell rail={<LabRail …/>} pane={<Pane theme={draft.theme} …/>} />`.
- [ ] **Step 2: Draft theme drives the focused theme** — same `applyTheme` flow, so editing in the rail morphs the whole chrome.
- [ ] **Step 3: Nameplate variant for Lab** — reads `Draft — based on tokyo-night` or `Draft — generated, seed: atlas`. Tag chips hidden (drafts have no tags yet).
- [ ] **Step 4: Commit `feat: lab uses shared layout shell`**

## Task 25: Lab rail — Source + Generate

**Files:**
- Create: `src/lab/SourceSection.tsx`
- Create: `src/lab/GenerateSection.tsx`

- [ ] **Step 1: SourceSection** — `Start from: [select]` (lists all catalog themes), `Import JSON: [↑]` file input, `Paste JSON: [textarea]` collapsed by default. Validation errors surface inline.
- [ ] **Step 2: GenerateSection** — `Seed: [input]`, `Mode: [light|dark]` select, `Hue: [range slider]`, `[Reroll all]` button. Only renders when a seed is in use.
- [ ] **Step 3: Wire to existing `draftTheme.ts`, `importTheme.ts`, `randomTheme.ts`** (these survive from the previous implementation).
- [ ] **Step 4: Commit `feat: lab source and generate sections`**

## Task 26: Lab rail — Tokens with color picker

**Files:**
- Create: `src/lab/TokensSection.tsx`
- Create: `src/lab/ColorField.tsx`
- Create: `src/lab/ColorField.test.tsx`
- Create: `src/lab/ColorField.stories.tsx`

Tokens grouped by `UI` / `Terminal` / `Diagnostic`. Each row: swatch + token name + hex. Click hex → opens native `<input type="color">` as a floating panel anchored to the swatch. Reroll button per group.

`ColorField` is the workhorse. No third-party color picker — use the browser's native `<input type="color">` plus a synced hex `<input>` for keyboard editing. This is per the design's "minimal" stance and keeps the bundle slim.

- [ ] **Step 1: Failing test** — entering `#ff0000` updates draft.theme.ui.background; clicking the swatch focuses the color input.
- [ ] **Step 2: Implement `ColorField`** with controlled state synced to the draft theme. Hex input validates against `/^#[0-9a-fA-F]{6}$/` on blur.
- [ ] **Step 3: Implement `TokensSection`** that renders all 20 UI tokens + 21 terminal tokens + any diagnostic tokens, grouped, with a sticky group header per group and a `↻ reroll group` button.
- [ ] **Step 4: Stories** for ColorField (idle, focused, invalid hex).
- [ ] **Step 5: Commit `feat: lab tokens editor with native color picker`**

## Task 27: Lab rail — Contrast summary + sticky footer

**Files:**
- Create: `src/lab/ContrastSummary.tsx`
- Create: `src/lab/LabFooter.tsx`

ContrastSummary lists every important token pair (`bg/fg`, `bg/muted`, `card/cardFg`, `selection/selectionFg`, `accent/accentFg`, `primary/primaryFg`). Failing pairs (< AA 4.5:1 for normal text) at top; passing pairs collapsed. Click a warning to scroll the rail to the involved token.

LabFooter: sticky bottom of the rail with `← Back to catalog` and `Export JSON` (sub-actions: copy, download).

- [ ] **Step 1: Failing test for ContrastSummary** — given a draft with `bg/muted` < 3.0:1, the failing pair is visible and labelled `AA fail`.
- [ ] **Step 2: Implement** using `contrastRatio` from `src/theme-core/contrast.ts`.
- [ ] **Step 3: LabFooter** — `Export JSON` uses `exportTheme.ts` (existing) to strip non-Superset metadata before copy/download.
- [ ] **Step 4: Playwright** — edit `ui.muted` to a low-contrast value → contrast section shows the failing pair → click it → rail scrolls to muted token.
- [ ] **Step 5: Commit `feat: lab contrast summary and export footer`**

## Task 28: Lab palette behavior

**Files:**
- Modify: `src/palette/Palette.tsx`

In Lab, ⌘K Themes section seeds the draft from another theme rather than navigating. Add a route-context prop to Palette that switches the submit handler.

- [ ] **Step 1: Failing Playwright** — in `/lab`, ⌘K + select Solarized Light → URL becomes `/lab?from=solarized-light`; draft tokens match Solarized Light.
- [ ] **Step 2: Implement context switch**.
- [ ] **Step 3: Commit `feat: ⌘K in lab seeds from theme`**

## Phase 8 checkpoint

```bash
pnpm check
pnpm test:e2e
pnpm test:stories
```

**REVIEW:** Invoke `impeccable` on `/lab` live. Edit several tokens and watch the chrome morph. Does the color picker feel native and tight, or floppy? Does the contrast section scale (is it useful when half the tokens fail)?

**REVIEW:** Invoke `web-design-guidelines` on `ColorField`. The native color input plus hex input pattern must keep keyboard parity, the swatch must have an accessible name, the floating picker must close on outside click and Esc.

**REVIEW:** Invoke `vercel-react-best-practices` on `LabView.tsx`. Token edits trigger many state updates per second — verify there's no avoidable re-render of the pane, and that the draft-theme reducer is stable.

Update `docs/STATUS.md`.

---

# Phase 9 — Research script + cleanup

## Task 29: `scripts/themes-research.mjs`

**Files:**
- Create: `scripts/themes-research.mjs`
- Create: `scripts/themes-research.test.mjs`
- Modify: `package.json` (add `themes:research` script)
- Modify: `.gitignore` (ignore `research-output.json`)

Ranks candidate themes by combining VS Code Marketplace install counts and GitHub star velocity. Output: ranked JSON list saved to `research-output.json` (not committed).

- [ ] **Step 1: Define candidate input** — `scripts/themes-research-input.json` with `[{ name, marketplaceId, repo }]` rows for the top ~50 candidates to evaluate.
- [ ] **Step 2: Implement marketplace fetch** — `https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery` POST with the marketplace id, parse install count. Add a 250ms throttle between requests.
- [ ] **Step 3: Implement GitHub star velocity** — fetch the last 30 days of stargazers from `https://api.github.com/repos/<repo>/stargazers` with a `GITHUB_TOKEN` env var (warn if missing; fall back to total star count). Compute stars/day.
- [ ] **Step 4: Implement ranking** — normalized score: `0.6 * log10(installs+1) + 0.4 * log10(starsPerDay+1)`. Output sorted descending.
- [ ] **Step 5: Write output** to `research-output.json` with `{ generatedAt, candidates: [...] }`.
- [ ] **Step 6: Commit `feat: theme research script`**

## Task 30: Delete legacy code paths

**Files (delete):**
- `src/app/routes/themeRoute.tsx` (already deleted in Task 18 — verify)
- `src/catalog/CatalogPage.tsx`, `CatalogPage.test.tsx`
- `src/catalog/ThemeCard.tsx`, `ThemeCard.stories.tsx`
- `src/catalog/catalogFilters.ts`, `catalogFilters.test.ts`
- `src/catalog/catalogSearch.ts`, `catalogSearch.test.ts`
- `src/catalog/ThemeDetail.tsx`, `ThemeDetail.test.tsx`
- `src/compare/PairCompare.tsx`, `PairCompare.test.tsx`, `PairSlot.tsx`
- `src/preview/PreviewTabs.tsx`, `PreviewTabs.test.tsx`, `PreviewTabs.stories.tsx`
- `src/preview/PreviewFrame.tsx` (if no longer referenced)
- Diff/Command/Editor scene blocks in `src/preview/surfaces.tsx`
- `src/ui/Tabs.tsx` (if replaced by SceneTabs)
- `src/ui/SegmentedControl.tsx` (if unused)

- [ ] **Step 1: List references**

```bash
rg --vimgrep -l "CatalogPage|ThemeCard|catalogFilters|catalogSearch|ThemeDetail|PairCompare|PairSlot|PreviewTabs|PreviewFrame" src/
```

- [ ] **Step 2: Delete files in batches** matching the list above; resolve each remaining importer.
- [ ] **Step 3: Strip Diff/Command/Editor scenes from `surfaces.tsx`** or, if `surfaces.tsx` is no longer referenced after the rewrite, delete it whole.
- [ ] **Step 4: Run `pnpm check`** — expect clean. Fix any dangling imports.
- [ ] **Step 5: Commit `chore: delete legacy catalog UI`**

## Phase 9 checkpoint

```bash
pnpm check
pnpm test:e2e
pnpm test:stories
pnpm themes:research   # smoke-test
```

Update `docs/STATUS.md`. After this point, the repo holds only the new shell + scripts.

---

# Phase 10 — Polish & ship

## Task 31: Storybook full sweep

**Files:**
- Verify all `*.stories.tsx` in `src/chrome`, `src/rail`, `src/pane`, `src/palette`, `src/compare`, `src/lab`.

- [ ] **Step 1:** every component referenced in the new UI has at least one story.
- [ ] **Step 2:** every story passes `@storybook/addon-a11y` checks. Fix any violations.
- [ ] **Step 3:** `pnpm test:stories` clean.
- [ ] **Step 4:** Commit `chore: storybook coverage for new shell`.

## Task 32: Contrast smoke for chrome readability

**Files:**
- Create: `scripts/chrome-readability-check.mjs`
- Modify: `package.json` (`themes:check-chrome`)

This is distinct from `themes:check-contrast`. It asserts the *rail label text* and *bottom-bar text* meet AA against every catalog theme's background, because the design pulls those vars into chrome and a bad theme would make the catalog unnavigable.

- [ ] **Step 1: Implement** — iterate `catalogThemes`, check `--preview-ui-foreground / --preview-ui-background` and `--preview-ui-muted-foreground / --preview-ui-background` are both ≥ 4.5:1.
- [ ] **Step 2: Wire into `scripts/check.mjs`** so `pnpm check` includes it.
- [ ] **Step 3: Commit `feat: chrome-readability contrast gate`**

## Task 33: Full review sweep

- [ ] **Step 1:** Invoke `impeccable` on the entire app (catalog, compare, palette open, lab). Capture the score and the top three improvements. Implement the top three.
- [ ] **Step 2:** Invoke `web-design-guidelines` on the entire app. Address any high-severity findings.
- [ ] **Step 3:** Invoke `vercel-react-best-practices` on `src/rail/`, `src/pane/`, `src/palette/`, `src/lab/`. Address any render-perf or pattern-fit findings.
- [ ] **Step 4:** Commit any changes as `polish: review-sweep fixes` (or as separate commits per skill if extensive).

## Task 34: Final verification

```bash
pnpm check
pnpm test:e2e
pnpm test:stories
pnpm build
pnpm themes:validate
pnpm themes:check-contrast
pnpm themes:check-chrome
```

All green. Manual visual sweep:
- Click every theme in the rail; chrome morphs cleanly with no flash.
- Enter `/compare`, pin three different themes via the third-pin-replaces flow.
- Open `/lab`, edit a token, verify chrome morphs live.
- Open ⌘K from each route, exercise all sections.
- Toggle `prefers-reduced-motion` — transitions are instant.
- Reload `/?theme=rose-pine-dawn` — first paint is Rose Pine Dawn, no flash to default.

- [ ] **Step 1:** Run all verification commands; record outputs in `docs/STATUS.md`.
- [ ] **Step 2:** Manual sweep with notes.
- [ ] **Step 3:** Update `docs/STATUS.md` to "ship-ready" with last verified date.
- [ ] **Step 4:** Final commit `chore: pre-ship verification log`.

---

## Done criteria

- All Phase 10 verification commands green.
- Visual sweep passes for all 12 themes.
- `docs/STATUS.md` marks the branch ship-ready.
- No `--app-*` tokens remain in the repo (`rg '--app-' src/ | wc -l` returns 0 outside `src/styles/tokens.css`).
- No references to deleted components (`rg 'CatalogPage|ThemeCard|PairCompare|PreviewTabs' src/` returns 0).
- All three review skills (`impeccable`, `web-design-guidelines`, `vercel-react-best-practices`) have been invoked at the noted checkpoints, with outcomes logged in `docs/STATUS.md`.
