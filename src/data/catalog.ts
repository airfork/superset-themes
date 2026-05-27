import type { CatalogThemeEntry, CatalogThemeMeta, SupersetTheme } from "../theme-core/themeTypes";
import auroraDarkTheme from "./themes/aurora-dark.json" with { type: "json" };
import auroraLightTheme from "./themes/aurora-light.json" with { type: "json" };
import graphiteDarkTheme from "./themes/graphite-dark.json" with { type: "json" };
import nordTheme from "./themes/nord.json" with { type: "json" };
import solarizedDarkTheme from "./themes/solarized-dark.json" with { type: "json" };
import solarizedLightTheme from "./themes/solarized-light.json" with { type: "json" };

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
  {
    themeId: "solarized-light",
    source: "upstream-port",
    family: "Solarized",
    variant: "light",
    pairGroup: "solarized",
    styleTags: ["classic", "low-glare", "balanced"],
    accentHue: 205,
    warmth: "warm",
    contrastTier: "standard",
    terminalPaletteQuality: "rich",
    license: "MIT",
    upstreamUrl: "https://ethanschoonover.com/solarized",
    portStatus: "ported",
    notes: "Schema-clean catalog adaptation of the reference Solarized Light port.",
  },
  {
    themeId: "solarized-dark",
    source: "upstream-port",
    family: "Solarized",
    variant: "dark",
    pairGroup: "solarized",
    styleTags: ["classic", "low-glare", "balanced"],
    accentHue: 205,
    warmth: "cool",
    contrastTier: "standard",
    terminalPaletteQuality: "rich",
    license: "MIT",
    upstreamUrl: "https://ethanschoonover.com/solarized",
    portStatus: "ported",
    notes: "Schema-clean catalog adaptation of the reference Solarized Dark port.",
  },
  {
    themeId: "nord",
    source: "upstream-port",
    family: "Nord",
    variant: "dark",
    styleTags: ["cool", "arctic", "terminal-rich"],
    accentHue: 193,
    warmth: "cool",
    contrastTier: "standard",
    terminalPaletteQuality: "rich",
    license: "MIT",
    upstreamUrl: "https://www.nordtheme.com",
    portStatus: "ported",
    notes: "Schema-clean catalog adaptation of the reference Nord port.",
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
  {
    theme: solarizedLightTheme as SupersetTheme,
    meta: catalogThemeMetadata[3],
  },
  {
    theme: solarizedDarkTheme as SupersetTheme,
    meta: catalogThemeMetadata[4],
  },
  {
    theme: nordTheme as SupersetTheme,
    meta: catalogThemeMetadata[5],
  },
] as const satisfies CatalogThemeEntry[];

export const catalogThemes = [...rawCatalogThemes] satisfies CatalogThemeEntry[];
