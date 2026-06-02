import type { CatalogThemeEntry, CatalogThemeMeta, SupersetTheme } from "../theme-core/themeTypes";
import auroraDarkTheme from "./themes/aurora-dark.json" with { type: "json" };
import auroraLightTheme from "./themes/aurora-light.json" with { type: "json" };
import catppuccinMochaTheme from "./themes/catppuccin-mocha.json" with { type: "json" };
import draculaTheme from "./themes/dracula.json" with { type: "json" };
import graphiteDarkTheme from "./themes/graphite-dark.json" with { type: "json" };
import gruvboxDarkTheme from "./themes/gruvbox-dark.json" with { type: "json" };
import nordTheme from "./themes/nord.json" with { type: "json" };
import oneDarkTheme from "./themes/one-dark.json" with { type: "json" };
import rosePineDawnTheme from "./themes/rose-pine-dawn.json" with { type: "json" };
import solarizedDarkTheme from "./themes/solarized-dark.json" with { type: "json" };
import solarizedLightTheme from "./themes/solarized-light.json" with { type: "json" };
import supersetDarkTheme from "./themes/superset-dark.json" with { type: "json" };
import supersetLightTheme from "./themes/superset-light.json" with { type: "json" };
import tokyoNightTheme from "./themes/tokyo-night.json" with { type: "json" };

type CatalogRankKey = "baselineRank" | "featuredRank";

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
    featuredRank: null,
    baselineRank: null,
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
    featuredRank: null,
    baselineRank: null,
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
    featuredRank: null,
    baselineRank: null,
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
    featuredRank: 3,
    baselineRank: null,
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
    featuredRank: null,
    baselineRank: null,
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
    featuredRank: null,
    baselineRank: null,
  },
  {
    themeId: "catppuccin-mocha",
    source: "upstream-port",
    family: "Catppuccin",
    variant: "dark",
    styleTags: ["pastel", "low-glare", "terminal-rich"],
    accentHue: 217,
    warmth: "cool",
    contrastTier: "standard",
    terminalPaletteQuality: "rich",
    license: "MIT",
    upstreamUrl: "https://github.com/catppuccin/catppuccin",
    portStatus: "ported",
    notes: "Schema-clean catalog adaptation of the official Catppuccin Mocha palette.",
    featuredRank: 2,
    baselineRank: null,
  },
  {
    themeId: "dracula",
    source: "upstream-port",
    family: "Dracula",
    variant: "dark",
    styleTags: ["neon", "classic", "terminal-rich"],
    accentHue: 265,
    warmth: "neutral",
    contrastTier: "standard",
    terminalPaletteQuality: "rich",
    license: "MIT",
    upstreamUrl: "https://github.com/dracula/dracula-theme",
    portStatus: "ported",
    notes: "Schema-clean catalog adaptation of the official Dracula OSS palette.",
    featuredRank: null,
    baselineRank: null,
  },
  {
    themeId: "gruvbox-dark",
    source: "upstream-port",
    family: "Gruvbox",
    variant: "dark",
    styleTags: ["warm", "retro", "terminal-rich"],
    accentHue: 43,
    warmth: "warm",
    contrastTier: "standard",
    terminalPaletteQuality: "rich",
    license: "MIT/X11",
    upstreamUrl: "https://github.com/morhetz/gruvbox",
    portStatus: "ported",
    notes: "Schema-clean catalog adaptation of Gruvbox Dark with local contrast-gate foregrounds.",
    featuredRank: null,
    baselineRank: null,
  },
  {
    themeId: "tokyo-night",
    source: "upstream-port",
    family: "Tokyo Night",
    variant: "dark",
    styleTags: ["neon", "focused", "terminal-rich"],
    accentHue: 223,
    warmth: "cool",
    contrastTier: "standard",
    terminalPaletteQuality: "rich",
    license: "MIT",
    upstreamUrl: "https://github.com/tokyo-night/tokyo-night-vscode-theme",
    portStatus: "ported",
    notes: "Schema-clean catalog adaptation of the Tokyo Night VS Code palette.",
    featuredRank: 1,
    baselineRank: null,
  },
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
    featuredRank: 4,
    baselineRank: null,
  },
  {
    themeId: "one-dark",
    source: "upstream-port",
    family: "One Dark",
    variant: "dark",
    styleTags: ["classic", "balanced", "atom-lineage"],
    accentHue: 207,
    warmth: "cool",
    contrastTier: "standard",
    terminalPaletteQuality: "rich",
    license: "MIT",
    upstreamUrl: "https://github.com/atom/atom",
    portStatus: "ported",
    notes: "Schema-clean catalog adaptation of the Atom One Dark palette.",
    featuredRank: 5,
    baselineRank: null,
  },
  {
    themeId: "superset-light",
    source: "upstream-port",
    family: "Superset",
    variant: "light",
    pairGroup: "superset-default",
    styleTags: ["baseline", "default", "neutral"],
    accentHue: 0,
    warmth: "neutral",
    contrastTier: "standard",
    terminalPaletteQuality: "basic",
    license: "Elastic License 2.0",
    upstreamUrl: "https://github.com/superset-sh/superset",
    portStatus: "adapted",
    notes:
      "Install-safe adaptation of Superset's built-in Light theme; reserved id 'light' is exported as 'superset-light'.",
    featuredRank: null,
    baselineRank: 1,
  },
  {
    themeId: "superset-dark",
    source: "upstream-port",
    family: "Superset",
    variant: "dark",
    pairGroup: "superset-default",
    styleTags: ["baseline", "default", "warm"],
    accentHue: 18,
    warmth: "warm",
    contrastTier: "standard",
    terminalPaletteQuality: "rich",
    license: "Elastic License 2.0",
    upstreamUrl: "https://github.com/superset-sh/superset",
    portStatus: "adapted",
    notes:
      "Install-safe adaptation of Superset's built-in Dark theme; reserved id 'dark' is exported as 'superset-dark'.",
    featuredRank: null,
    baselineRank: 2,
  },
] as const satisfies CatalogThemeMeta[];

const catalogThemesById = {
  "aurora-light": auroraLightTheme as SupersetTheme,
  "aurora-dark": auroraDarkTheme as SupersetTheme,
  "graphite-dark": graphiteDarkTheme as SupersetTheme,
  "solarized-light": solarizedLightTheme as SupersetTheme,
  "solarized-dark": solarizedDarkTheme as SupersetTheme,
  nord: nordTheme as SupersetTheme,
  "catppuccin-mocha": catppuccinMochaTheme as SupersetTheme,
  dracula: draculaTheme as SupersetTheme,
  "gruvbox-dark": gruvboxDarkTheme as SupersetTheme,
  "tokyo-night": tokyoNightTheme as SupersetTheme,
  "rose-pine-dawn": rosePineDawnTheme as SupersetTheme,
  "one-dark": oneDarkTheme as SupersetTheme,
  "superset-light": supersetLightTheme as SupersetTheme,
  "superset-dark": supersetDarkTheme as SupersetTheme,
} as const satisfies Record<string, SupersetTheme>;

export function buildCatalogThemes(
  metadata: readonly CatalogThemeMeta[],
  themesById: Readonly<Record<string, SupersetTheme>>,
): CatalogThemeEntry[] {
  return metadata.map((meta) => {
    const theme = themesById[meta.themeId];

    if (!theme) {
      throw new Error(`Missing theme JSON for catalog metadata "${meta.themeId}".`);
    }

    if (theme.id !== meta.themeId) {
      throw new Error(`Catalog metadata "${meta.themeId}" points at theme JSON "${theme.id}".`);
    }

    return { theme, meta };
  });
}

export const catalogThemes = buildCatalogThemes(catalogThemeMetadata, catalogThemesById);

export function getRankedCatalogThemeIds(
  entries: readonly CatalogThemeEntry[],
  rankKey: CatalogRankKey,
): string[] {
  return entries
    .filter((entry) => entry.meta[rankKey] !== null)
    .toSorted((a, b) => Number(a.meta[rankKey]) - Number(b.meta[rankKey]))
    .map((entry) => entry.theme.id);
}
