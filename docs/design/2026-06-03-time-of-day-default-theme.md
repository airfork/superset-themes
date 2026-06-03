# Time-of-day default theme

Date: 2026-06-03
Status: Approved, not yet implemented

## Problem

A cold visit to the catalog always loads the same theme — the rank-1 featured theme
(Tokyo Night) returned by `getDefaultFocusedTheme()`. The landing experience never varies
and never reflects whether the visitor is browsing in daylight or at night.

We want a fresh visit to pick a theme that suits the visitor's environment: when the OS
reports a light color scheme, land on a light theme; when it reports dark, land on a dark
theme. Within the chosen mode the pick is random, drawn from the curated featured set, so
repeat visitors see variety without leaving the quality-controlled shortlist.

## Goals

- A bare `/` visit resolves to a random **featured** theme matching the OS
  `prefers-color-scheme`.
- No flash of the wrong theme on first paint.
- Deep links and shares stay deterministic: an explicit `?theme=` always wins.
- A picked theme is pinned to the URL so refresh / back / share are stable.
- The featured display order stays deliberate; only the *default selection* changes.

## Non-goals

- Wall-clock time as the trigger (rejected in favor of `prefers-color-scheme`, which is the
  signal users already configure and which paints flash-free via a media query).
- Avoiding immediate repeats across visits (YAGNI — pinning makes refreshes stable, and the
  per-mode pool is small enough that a remembered "last pick" adds complexity for little gain).
- Persisting a choice across sessions in storage (the URL is the single source of truth).

## Resolution order

On every load the focused theme id is resolved as:

1. `?theme=<valid id>` present → use it. (Deep links, shares, compare/lab unchanged.)
2. No param → read `prefers-color-scheme`; pick a random featured theme of that mode; then
   `replaceState` it into `?theme=` so the visit is stable and shareable.
3. No/unknown preference, JS disabled, or an empty mode pool → deterministic fallback
   (`getDefaultFocusedTheme()`, i.e. rank-1 Tokyo Night).

## Architecture

### Flash-free first paint

Today `criticalThemePlugin` bakes one `<style id="critical-theme">` for the default theme,
applied to `:root:not([data-theme-id])`. A random *light* pick would flash dark→light before
React mounts. The change:

- The plugin bakes a critical block **per featured theme**, keyed
  `:root[data-theme-id="X"] { …vars…; color-scheme }` plus `html[data-theme-id="X"] { background;
  color }`. It keeps the existing no-`data-theme-id` fallback for the JS-disabled case.
- The plugin also injects a small inline `<head>` script carrying the featured ids grouped by
  mode (`{ light: [...], dark: [...] }`, serialized at build time from catalog metadata).
- The **inline script** runs before paint: it resolves the id via the resolution order above
  and sets `data-theme-id` on `<html>`. The matching baked block paints instantly — no flash,
  and the script never needs to write inline CSS vars.

### React seeding and URL pinning

- `App` passes `initialThemeId = document.documentElement.dataset.themeId` into
  `FocusedThemeProvider`, so React's first render matches what is already on screen;
  `applyTheme` then re-applies the same theme idempotently.
- The catalog route, when `?theme=` is absent, issues one
  `navigate({ replace: true, search: { theme: chosenId } })` to pin the inline-chosen theme.

### Selection logic

A pure function — `pickFeaturedForScheme(prefersDark, featuredEntries, random)` — owns the
choice. The inline script and the build plugin both call it (the plugin to validate, the
script to run), and it is unit-tested in isolation with an injected RNG and mode.

## Featured composition

To give daytime more than one option and improve the light/dark optics, promote **GitHub
Light** into featured and drop **One Dark**:

| Rank | Theme | Mode |
| --- | --- | --- |
| 1 | Tokyo Night | dark |
| 2 | Catppuccin Mocha | dark |
| 3 | Solarized Light | light |
| 4 | Rosé Pine Dawn | light |
| 5 | GitHub Light | light |

Result: 3 light / 2 dark. `getDefaultFocusedTheme()` stays = rank-1 (Tokyo Night), so the
deterministic fallback is unchanged.

## Testing

- Unit: `pickFeaturedForScheme` (mode → pool, random index, empty-pool fallback, `?theme=`
  precedence).
- Unit: `featured.test.ts` updated for the new featured id list / ranks.
- Build: `vite-plugin-critical-theme.test.mjs` reworked for multi-theme baking and the inline
  script payload.
- E2E (Playwright `emulateMedia({ colorScheme })`): dark → a dark featured theme + `?theme=`
  pinned; light → a light featured theme + `?theme=` pinned; explicit `?theme=` overrides both.

## Edge cases

- Invalid `?theme=` → falls through to the random pick.
- JS disabled → the no-`data-theme-id` fallback block paints (the SPA needs JS to run anyway).
- Empty mode pool (no featured theme of that mode) → deterministic fallback.

## Trade-off

The whole cost sits in the build plugin and the inline script — the price of *flash-free and
random*. A CSS-only fixed-default-per-mode (no randomness) would be far simpler and is the
fallback if the surprise is ever not worth the machinery.
