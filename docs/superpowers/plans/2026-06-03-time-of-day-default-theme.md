# Time-of-day Default Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** A bare `/` visit seeds a random *featured* theme matching the OS `prefers-color-scheme`, flash-free, and pins the pick to `?theme=`; explicit `?theme=` deep links always win.

**Architecture:** A build plugin bakes per-featured critical CSS (keyed by `data-theme-id`) plus an inline `<head>` script that, when no `?theme=` is present, reads `prefers-color-scheme` and sets `data-theme-id` before paint. React seeds the focused theme from that attribute and the catalog route pins it into the URL. A pure `pickThemeIdForScheme` owns the choice and is unit-tested.

**Tech Stack:** React 19, TanStack Router, Vite, Vitest (jsdom), Playwright, biome. Reference design: `docs/design/2026-06-03-time-of-day-default-theme.md`.

Run `rtk` in front of shell commands (agent convention). Reference skills: @superpowers:test-driven-development for each task.

**Working-tree note:** `github-dark.json` and `github-light.json` have intentional uncommitted user tweaks (chart/highlight). Do NOT revert them and do NOT stage them in feature commits — stage only the files each task names.

---

### Task 1: Featured composition swap (GitHub Light in, One Dark out)

**Files:**
- Modify: `src/data/catalog.ts` (github-light `featuredRank: null` → `5`; one-dark `featuredRank: 5` → `null`)
- Test: `src/data/featured.test.ts`

**Step 1 — Update the test (red):** In `src/data/featured.test.ts`, change both featured id lists from ending `"one-dark"` to ending `"github-light"`, i.e. `["tokyo-night","catppuccin-mocha","solarized-light","rose-pine-dawn","github-light"]`. Keep the ranks `[1,2,3,4,5]` and the default `getDefaultFocusedTheme().theme.id === "tokyo-night"` assertions unchanged.

**Step 2 — Run, expect fail:** `rtk pnpm test:unit src/data/featured.test.ts` → FAIL (catalog still ranks one-dark).

**Step 3 — Implement:** In `src/data/catalog.ts`, set the `one-dark` entry `featuredRank: null` and the `github-light` entry `featuredRank: 5`.

**Step 4 — Run, expect pass:** `rtk pnpm test:unit src/data/featured.test.ts` → PASS.

**Step 5 — Commit:**
```bash
git add src/data/catalog.ts src/data/featured.test.ts
git commit -m "Promote GitHub Light into featured, retire One Dark"
```

---

### Task 2: Pure selection module

**Files:**
- Create: `src/theme/defaultThemeSelection.ts`
- Test: `src/theme/defaultThemeSelection.test.ts`

**Step 1 — Write failing tests** (`src/theme/defaultThemeSelection.test.ts`):
```ts
import { describe, expect, it } from "vitest";
import { getFeaturedIdsByMode, pickThemeIdForScheme } from "./defaultThemeSelection";

describe("getFeaturedIdsByMode", () => {
  it("groups featured ids by theme type in featured order", () => {
    const byMode = getFeaturedIdsByMode();
    expect(byMode.dark).toEqual(["tokyo-night", "catppuccin-mocha"]);
    expect(byMode.light).toEqual(["solarized-light", "rose-pine-dawn", "github-light"]);
  });
});

describe("pickThemeIdForScheme", () => {
  const byMode = { light: ["l1", "l2", "l3"], dark: ["d1", "d2"] };

  it("picks a dark theme when the OS prefers dark", () => {
    expect(pickThemeIdForScheme(true, byMode, 0, "fb")).toBe("d1");
    expect(pickThemeIdForScheme(true, byMode, 0.99, "fb")).toBe("d2");
  });
  it("picks a light theme when the OS prefers light", () => {
    expect(pickThemeIdForScheme(false, byMode, 0, "fb")).toBe("l1");
    expect(pickThemeIdForScheme(false, byMode, 0.99, "fb")).toBe("l3");
  });
  it("falls back to the other mode when the preferred pool is empty", () => {
    expect(pickThemeIdForScheme(true, { light: ["l1"], dark: [] }, 0, "fb")).toBe("l1");
  });
  it("returns the fallback id when both pools are empty", () => {
    expect(pickThemeIdForScheme(true, { light: [], dark: [] }, 0, "fb")).toBe("fb");
  });
});
```

**Step 2 — Run, expect fail:** `rtk pnpm test:unit src/theme/defaultThemeSelection.test.ts` → FAIL (module missing).

**Step 3 — Implement** (`src/theme/defaultThemeSelection.ts`):
```ts
import { getFeaturedThemes } from "../data/featured";

export interface FeaturedByMode {
  light: string[];
  dark: string[];
}

// Featured ids grouped by mode, preserving featured order. Build-time and the
// inline first-paint script both read this so the catalog stays the source of truth.
export function getFeaturedIdsByMode(): FeaturedByMode {
  const byMode: FeaturedByMode = { light: [], dark: [] };
  for (const entry of getFeaturedThemes()) {
    byMode[entry.theme.type].push(entry.theme.id);
  }
  return byMode;
}

// Pure: choose a featured id for the OS color scheme. `random` is a [0,1) value.
// Empty preferred pool falls back to the other mode, then to fallbackId.
export function pickThemeIdForScheme(
  prefersDark: boolean,
  byMode: FeaturedByMode,
  random: number,
  fallbackId: string,
): string {
  const preferred = prefersDark ? byMode.dark : byMode.light;
  const alternate = prefersDark ? byMode.light : byMode.dark;
  const pool = preferred.length > 0 ? preferred : alternate;
  if (pool.length === 0) {
    return fallbackId;
  }
  const index = Math.min(pool.length - 1, Math.floor(random * pool.length));
  return pool[index] ?? fallbackId;
}
```

**Step 4 — Run, expect pass.** **Step 5 — Commit:**
```bash
git add src/theme/defaultThemeSelection.ts src/theme/defaultThemeSelection.test.ts
git commit -m "Add pure featured-by-mode theme picker"
```

---

### Task 3: Critical-theme plugin bakes all featured themes + inline first-paint script

**Files:**
- Modify: `scripts/vite-plugin-critical-theme.mjs`
- Test: `scripts/vite-plugin-critical-theme.test.mjs`

**Behavior:** For each featured theme bake `:root[data-theme-id="X"]{vars;color-scheme}` and `html[data-theme-id="X"]{background;color}`; keep a `:root:not([data-theme-id])` + `html:not([data-theme-id])` fallback using `getDefaultFocusedTheme()`. Append an inline script that, only when `?theme=` is absent, sets `data-theme-id` from `pickThemeIdForScheme`. No hardcoded theme ids in source (existing test asserts this).

**Step 1 — Rework the test** (`scripts/vite-plugin-critical-theme.test.mjs`): keep the two existing assertions but source the featured set dynamically:
```js
import { getFeaturedThemes, getDefaultFocusedTheme } from "../src/data/featured.ts";
// ...
test("bakes a critical block for every featured theme", () => {
  const html = criticalThemePlugin().transformIndexHtml(
    '<html><head><style id="critical-theme"></style></head><body></body></html>',
  );
  for (const { theme } of getFeaturedThemes()) {
    assertIncludes(html, `:root[data-theme-id="${theme.id}"]`);
    assertIncludes(html, `html[data-theme-id="${theme.id}"]`);
  }
  assertIncludes(html, ":root:not([data-theme-id])");
});
test("injects an inline first-paint script that honors an explicit theme param", () => {
  const html = criticalThemePlugin().transformIndexHtml(/* same stub */);
  assertIncludes(html, "prefers-color-scheme: dark");
  assertIncludes(html, "data-theme-id");
  assertIncludes(html, "URLSearchParams");
});
```
Keep the existing "uses the runtime theme CSS variable mapper" test (default theme vars present) and the "no hardcoded id in source" assertion (`assert.doesNotMatch(source, /tokyo-night/)`).

**Step 2 — Run, expect fail.**

**Step 3 — Implement** (`scripts/vite-plugin-critical-theme.mjs`): build one block per featured theme; build the inline script from `getFeaturedIdsByMode()` and `getDefaultFocusedTheme().theme.id`:
```js
import { getDefaultFocusedTheme, getFeaturedThemes } from "../src/data/featured.ts";
import { getFeaturedIdsByMode } from "../src/theme/defaultThemeSelection.ts";
import { getThemeCssVars } from "../src/preview/themeCssVars.ts";

const MARKER_REGEX = /<style id="critical-theme">[\s\S]*?<\/style>/;

function buildVarDeclarations(theme) {
  return Object.entries(getThemeCssVars(theme))
    .map(([k, v]) => `${k}: ${v};`)
    .join("\n  ");
}

function buildThemeBlock(theme, selectorRoot, selectorHtml) {
  return `${selectorRoot} {
  ${buildVarDeclarations(theme)}
  color-scheme: ${theme.type};
}
${selectorHtml} { background: ${theme.ui.background}; color: ${theme.ui.foreground}; }`;
}

function buildCriticalCss() {
  const blocks = getFeaturedThemes().map(({ theme }) =>
    buildThemeBlock(theme, `:root[data-theme-id="${theme.id}"]`, `html[data-theme-id="${theme.id}"]`),
  );
  const fallback = getDefaultFocusedTheme().theme;
  blocks.push(buildThemeBlock(fallback, ":root:not([data-theme-id])", "html:not([data-theme-id])"));
  return blocks.join("\n");
}

function buildInlineScript() {
  const byMode = JSON.stringify(getFeaturedIdsByMode());
  const fallbackId = JSON.stringify(getDefaultFocusedTheme().theme.id);
  // Runs before paint. Only acts on a bare visit (no ?theme=), so deep links and
  // compare/lab params are untouched and paint via the :not([data-theme-id]) fallback.
  return `<script>(function(){try{` +
    `if(new URLSearchParams(location.search).get('theme'))return;` +
    `var m=${byMode},fb=${fallbackId};` +
    `var dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;` +
    `var pool=(dark?m.dark:m.light);if(!pool.length)pool=(dark?m.light:m.dark);if(!pool.length){` +
    `document.documentElement.setAttribute('data-theme-id',fb);return;}` +
    `var id=pool[Math.floor(Math.random()*pool.length)]||fb;` +
    `document.documentElement.setAttribute('data-theme-id',id);}catch(e){}})();</script>`;
}

export function criticalThemePlugin() {
  return {
    name: "critical-theme",
    transformIndexHtml(html) {
      const tag = `<style id="critical-theme">${buildCriticalCss()}</style>\n  ${buildInlineScript()}`;
      if (MARKER_REGEX.test(html)) {
        return html.replace(MARKER_REGEX, tag);
      }
      return html.replace(/<\/head>/, `${tag}\n  </head>`);
    },
  };
}
```

**Step 4 — Run, expect pass:** `rtk pnpm exec tsx --test scripts/vite-plugin-critical-theme.test.mjs`.

**Step 5 — Commit:**
```bash
git add scripts/vite-plugin-critical-theme.mjs scripts/vite-plugin-critical-theme.test.mjs
git commit -m "Bake per-featured critical CSS and a prefers-color-scheme first-paint script"
```

---

### Task 4: React seeds the focused theme from the painted attribute

**Files:**
- Modify: `src/app/App.tsx`
- Test: `src/app/App.test.tsx`

**Step 1 — Write failing test** in `src/app/App.test.tsx`: set the attribute the inline script would, render `<App/>`, assert the chrome reflects that theme (e.g. bottom bar shows the theme name, or `document.documentElement` keeps `data-theme-id`). Example:
```ts
it("seeds the focused theme from the data-theme-id the first-paint script set", () => {
  document.documentElement.setAttribute("data-theme-id", "github-light");
  render(<App />);
  expect(screen.getAllByText(/github light/i).length).toBeGreaterThan(0);
  document.documentElement.removeAttribute("data-theme-id");
});
```

**Step 2 — Run, expect fail** (App seeds Tokyo Night, not the attribute).

**Step 3 — Implement** (`src/app/App.tsx`): read the attribute and pass it through.
```tsx
export function App() {
  const initialThemeId =
    typeof document !== "undefined"
      ? (document.documentElement.getAttribute("data-theme-id") ?? undefined)
      : undefined;
  return (
    <FocusedThemeProvider initialThemeId={initialThemeId}>
      <RouterProvider router={router} />
    </FocusedThemeProvider>
  );
}
```
(`FocusedThemeProvider` already accepts `initialThemeId`.)

**Step 4 — Run, expect pass.** **Step 5 — Commit:**
```bash
git add src/app/App.tsx src/app/App.test.tsx
git commit -m "Seed the focused theme from the first-paint data-theme-id"
```

---

### Task 5: Catalog route pins the chosen theme into the URL

**Files:**
- Modify: `src/app/router.tsx` (CatalogRouteContainer)

**Step 1 — Implement** the pin effect inside `CatalogRouteContainer`, after the existing `?theme=`→context sync effect:
```tsx
// On a bare visit the first-paint script chose the focused theme; pin it into the
// URL (replace) so refresh/back/share are stable and shareable.
useEffect(() => {
  if (!search.theme) {
    void navigate({ replace: true, search: { ...search, theme: focused.theme.id } });
  }
}, [search, focused.theme.id, navigate]);
```

**Step 2 — Verify** via the e2e in Task 6 (router URL pinning is covered there).

**Step 3 — Commit:**
```bash
git add src/app/router.tsx
git commit -m "Pin the first-paint theme into the catalog URL"
```

---

### Task 6: First-paint + prefers-color-scheme e2e

**Files:**
- Modify: `e2e/first-paint.spec.ts`
- Create: `e2e/default-theme.spec.ts`

**Step 1 — Update `e2e/first-paint.spec.ts`** so the default-theme test is deterministic: add `test.use({ colorScheme: "dark" })` (or `page.emulateMedia`) and assert the painted background matches a dark featured theme rather than a hardcoded color, or assert `data-theme-id` is one of the dark featured ids.

**Step 2 — Create `e2e/default-theme.spec.ts`:**
```ts
import { expect, test } from "@playwright/test";

test.describe("time-of-day default theme", () => {
  test("dark OS preference lands on a dark featured theme and pins the URL", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page).toHaveURL(/theme=(tokyo-night|catppuccin-mocha)/);
    await expect(page.locator("html")).toHaveAttribute("data-theme-type", "dark");
  });

  test("light OS preference lands on a light featured theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page).toHaveURL(/theme=(solarized-light|rose-pine-dawn|github-light)/);
    await expect(page.locator("html")).toHaveAttribute("data-theme-type", "light");
  });

  test("explicit ?theme= overrides the OS preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/?theme=github-light");
    await expect(page.locator("html")).toHaveAttribute("data-theme-id", "github-light");
  });
});
```

**Step 3 — Run:** `rtk pnpm test:e2e e2e/first-paint.spec.ts e2e/default-theme.spec.ts` → PASS.

**Step 4 — Commit:**
```bash
git add e2e/first-paint.spec.ts e2e/default-theme.spec.ts
git commit -m "Cover the prefers-color-scheme default theme end to end"
```

---

### Task 7: Full verification

**Step 1 — Run the whole gate:**
```bash
rtk pnpm check
rtk pnpm test:stories
rtk pnpm test:e2e
```
All green. Fix any fallout (likely additional snapshot/list tests that assumed a fixed default or One Dark featured).

**Step 2 — Manual smoke (Browser):** with the dev server, load `/` under each OS scheme and confirm no cross-mode flash and a pinned `?theme=`.

**Step 3 — Update `docs/STATUS.md`** with the feature state, then commit any remaining changes:
```bash
git add docs/STATUS.md
git commit -m "Record time-of-day default theme completion"
```

---

## Edge cases checklist
- Invalid `?theme=` → inline script leaves attribute unset → fallback paints → React resolves/falls back. ✅ (no regression vs today)
- JS disabled → `:not([data-theme-id])` fallback paints; SPA needs JS anyway. ✅
- Empty mode pool → inline script sets fallback id; `pickThemeIdForScheme` returns fallback. ✅
- StrictMode double effects → pin effect is idempotent (condition false once `theme` is set). ✅
