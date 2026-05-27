import type { CatalogThemeEntry, CatalogThemeMeta, SupersetTheme } from "../theme-core/themeTypes";
import auroraDarkTheme from "./themes/aurora-dark.json" with { type: "json" };
import auroraLightTheme from "./themes/aurora-light.json" with { type: "json" };
import graphiteDarkTheme from "./themes/graphite-dark.json" with { type: "json" };

export const catalogThemeMetadata = [
  {
    themeId: "aurora-light",
    source: "fixture",
    family: "Aurora",
    variant: "light",
    pairGroup: "aurora",
    styleTags: ["cool", "clear", "editorial"],
    accentHue: 174,
    warmth: "cool",
    contrastTier: "standard",
    terminalPaletteQuality: "rich",
    license: "MIT",
    upstreamUrl: null,
    portStatus: "original",
    notes: "Original fixture with crisp blue surfaces and teal accents.",
  },
  {
    themeId: "aurora-dark",
    source: "fixture",
    family: "Aurora",
    variant: "dark",
    pairGroup: "aurora",
    styleTags: ["cool", "focused", "terminal-rich"],
    accentHue: 174,
    warmth: "cool",
    contrastTier: "standard",
    terminalPaletteQuality: "rich",
    license: "MIT",
    upstreamUrl: null,
    portStatus: "original",
    notes: "Original dark pair for Aurora Light with matching blue and teal structure.",
  },
  {
    themeId: "graphite-dark",
    source: "fixture",
    family: "Graphite",
    variant: "dark",
    styleTags: ["neutral", "warm-accent", "high-contrast"],
    accentHue: 6,
    warmth: "neutral",
    contrastTier: "high",
    terminalPaletteQuality: "balanced",
    license: "MIT",
    upstreamUrl: null,
    portStatus: "original",
    notes: "Original fixture with neutral graphite surfaces and warm alert accents.",
  },
] as const satisfies CatalogThemeMeta[];

const rawCatalogThemes = [
  {
    theme: auroraLightTheme as SupersetTheme,
    meta: catalogThemeMetadata[0],
  },
  {
    theme: auroraDarkTheme as SupersetTheme,
    meta: catalogThemeMetadata[1],
  },
  {
    theme: graphiteDarkTheme as SupersetTheme,
    meta: catalogThemeMetadata[2],
  },
] as const satisfies CatalogThemeEntry[];

export const catalogThemes = [...rawCatalogThemes] satisfies CatalogThemeEntry[];
