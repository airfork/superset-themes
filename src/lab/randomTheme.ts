import { clampGamut, formatHex } from "culori";
import { checkThemeContrast } from "../theme-core/contrast";
import { terminalTokensSchema, uiTokensSchema } from "../theme-core/schema";
import type { SupersetTheme, TerminalTokens, ThemeType, UiTokens } from "../theme-core/themeTypes";

export type RandomThemeTokenGroup = "accent" | "highlights" | "surfaces" | "terminal";

export type RandomThemeLocks = Partial<Record<RandomThemeTokenGroup, boolean>>;

export interface HueRange {
  max: number;
  min: number;
}

export interface GenerateRandomThemeOptions {
  author?: string;
  baseTheme?: SupersetTheme;
  description?: string;
  hueRange?: HueRange;
  id?: string;
  locks?: RandomThemeLocks;
  mode?: ThemeType;
  name?: string;
  seed: number | string;
}

export interface RerollRandomThemeGroupOptions {
  group: RandomThemeTokenGroup;
  seed: number | string;
  theme: SupersetTheme;
}

type Prng = () => number;

const clampToRgb = clampGamut("rgb");
const MAX_GENERATION_ATTEMPTS = 16;

export function generateRandomTheme(options: GenerateRandomThemeOptions): SupersetTheme {
  let candidate = buildRandomTheme(options);

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
    if (checkThemeContrast(candidate).issues.length === 0) {
      return candidate;
    }

    candidate = buildRandomTheme({
      ...options,
      seed: `${options.seed}:${attempt}`,
    });
  }

  return candidate;
}

export function rerollRandomThemeGroup({
  group,
  seed,
  theme,
}: RerollRandomThemeGroupOptions): SupersetTheme {
  return generateRandomTheme({
    author: theme.author,
    baseTheme: theme,
    description: theme.description,
    id: theme.id,
    locks: {
      accent: group !== "accent",
      highlights: group !== "highlights",
      surfaces: group !== "surfaces",
      terminal: group !== "terminal",
    },
    mode: theme.type,
    name: theme.name,
    seed,
  });
}

function buildRandomTheme(options: GenerateRandomThemeOptions): SupersetTheme {
  const mode = options.mode ?? options.baseTheme?.type ?? pickMode(options.seed);
  const prng = createPrng(`${options.seed}:${mode}`);
  const hue = pickHue(prng, options.hueRange);
  const ui = buildUiTokens(mode, hue, prng);
  const terminal = buildTerminalTokens(mode, hue, prng);
  const seedSlug = slugifySeed(options.seed);

  const generated: SupersetTheme = {
    author: options.author ?? options.baseTheme?.author ?? "Superset Theme Lab",
    description:
      options.description ??
      options.baseTheme?.description ??
      `Generated ${mode} theme from seed ${String(options.seed)}.`,
    id: options.id ?? options.baseTheme?.id ?? `generated-${seedSlug}-${mode}`,
    name:
      options.name ??
      options.baseTheme?.name ??
      `Generated ${titleize(seedSlug)} ${titleize(mode)}`,
    terminal,
    type: mode,
    ui,
    version: 1,
  };

  return applyLocks(generated, options.baseTheme, options.locks);
}

function buildUiTokens(mode: ThemeType, hue: number, prng: Prng): UiTokens {
  const surfaceHue = wrapHue(hue + randomBetween(prng, -18, 18));
  const destructiveHue = wrapHue(25 + randomBetween(prng, -5, 5));

  if (mode === "light") {
    const primary = oklchHex(0.45, 0.16, hue);
    const accent = oklchHex(0.5, 0.14, hue);
    const selection = oklchHex(0.88, 0.055, hue);

    return uiTokensSchema.parse({
      accent,
      accentForeground: "#ffffff",
      background: oklchHex(0.98, 0.012, surfaceHue),
      border: oklchHex(0.84, 0.026, surfaceHue),
      card: oklchHex(0.995, 0.006, surfaceHue),
      cardForeground: oklchHex(0.2, 0.028, surfaceHue),
      destructive: oklchHex(0.45, 0.18, destructiveHue),
      destructiveForeground: "#ffffff",
      foreground: oklchHex(0.2, 0.028, surfaceHue),
      input: oklchHex(0.9, 0.022, surfaceHue),
      muted: oklchHex(0.93, 0.018, surfaceHue),
      mutedForeground: oklchHex(0.43, 0.03, surfaceHue),
      popover: oklchHex(1, 0.004, surfaceHue),
      popoverForeground: oklchHex(0.2, 0.028, surfaceHue),
      primary,
      primaryForeground: "#ffffff",
      ring: oklchHex(0.58, 0.16, hue),
      secondary: oklchHex(0.91, 0.03, surfaceHue),
      secondaryForeground: oklchHex(0.24, 0.03, surfaceHue),
      selection,
      selectionForeground: oklchHex(0.18, 0.04, hue),
    });
  }

  const primary = oklchHex(0.7, 0.16, hue);
  const accent = oklchHex(0.72, 0.14, hue);
  const selection = oklchHex(0.33, 0.075, hue);

  return uiTokensSchema.parse({
    accent,
    accentForeground: "#07111f",
    background: oklchHex(0.16, 0.02, surfaceHue),
    border: oklchHex(0.32, 0.035, surfaceHue),
    card: oklchHex(0.2, 0.025, surfaceHue),
    cardForeground: oklchHex(0.93, 0.015, surfaceHue),
    destructive: oklchHex(0.66, 0.17, destructiveHue),
    destructiveForeground: "#07111f",
    foreground: oklchHex(0.93, 0.015, surfaceHue),
    input: oklchHex(0.27, 0.03, surfaceHue),
    muted: oklchHex(0.25, 0.026, surfaceHue),
    mutedForeground: oklchHex(0.74, 0.02, surfaceHue),
    popover: oklchHex(0.18, 0.022, surfaceHue),
    popoverForeground: oklchHex(0.93, 0.015, surfaceHue),
    primary,
    primaryForeground: "#07111f",
    ring: oklchHex(0.72, 0.16, hue),
    secondary: oklchHex(0.28, 0.035, surfaceHue),
    secondaryForeground: oklchHex(0.9, 0.018, surfaceHue),
    selection,
    selectionForeground: oklchHex(0.94, 0.02, hue),
  });
}

function buildTerminalTokens(mode: ThemeType, hue: number, prng: Prng): TerminalTokens {
  const cyanHue = wrapHue(hue + randomBetween(prng, -16, 16));
  const blueHue = wrapHue(hue + 34);
  const magentaHue = wrapHue(hue - 52);
  const greenHue = 150;
  const yellowHue = 88;
  const redHue = 27;

  if (mode === "light") {
    return terminalTokensSchema.parse({
      background: oklchHex(0.985, 0.008, hue),
      black: oklchHex(0.2, 0.018, hue),
      blue: oklchHex(0.48, 0.16, blueHue),
      brightBlack: oklchHex(0.48, 0.018, hue),
      brightBlue: oklchHex(0.58, 0.17, blueHue),
      brightCyan: oklchHex(0.62, 0.13, cyanHue),
      brightGreen: oklchHex(0.59, 0.14, greenHue),
      brightMagenta: oklchHex(0.58, 0.15, magentaHue),
      brightRed: oklchHex(0.58, 0.17, redHue),
      brightWhite: oklchHex(0.98, 0.006, hue),
      brightYellow: oklchHex(0.68, 0.14, yellowHue),
      cursor: oklchHex(0.48, 0.16, hue),
      cyan: oklchHex(0.5, 0.13, cyanHue),
      foreground: oklchHex(0.2, 0.02, hue),
      green: oklchHex(0.49, 0.14, greenHue),
      magenta: oklchHex(0.48, 0.15, magentaHue),
      red: oklchHex(0.48, 0.17, redHue),
      selection: oklchHex(0.88, 0.045, hue),
      selectionForeground: oklchHex(0.18, 0.03, hue),
      white: oklchHex(0.9, 0.006, hue),
      yellow: oklchHex(0.57, 0.14, yellowHue),
    });
  }

  return terminalTokensSchema.parse({
    background: oklchHex(0.14, 0.018, hue),
    black: oklchHex(0.18, 0.018, hue),
    blue: oklchHex(0.69, 0.16, blueHue),
    brightBlack: oklchHex(0.48, 0.02, hue),
    brightBlue: oklchHex(0.76, 0.16, blueHue),
    brightCyan: oklchHex(0.78, 0.13, cyanHue),
    brightGreen: oklchHex(0.75, 0.14, greenHue),
    brightMagenta: oklchHex(0.76, 0.15, magentaHue),
    brightRed: oklchHex(0.72, 0.17, redHue),
    brightWhite: oklchHex(0.98, 0.006, hue),
    brightYellow: oklchHex(0.83, 0.14, yellowHue),
    cursor: oklchHex(0.72, 0.16, hue),
    cyan: oklchHex(0.7, 0.13, cyanHue),
    foreground: oklchHex(0.9, 0.018, hue),
    green: oklchHex(0.68, 0.14, greenHue),
    magenta: oklchHex(0.7, 0.15, magentaHue),
    red: oklchHex(0.66, 0.17, redHue),
    selection: oklchHex(0.32, 0.06, hue),
    selectionForeground: oklchHex(0.94, 0.018, hue),
    white: oklchHex(0.86, 0.006, hue),
    yellow: oklchHex(0.77, 0.14, yellowHue),
  });
}

function applyLocks(
  theme: SupersetTheme,
  baseTheme: SupersetTheme | undefined,
  locks: RandomThemeLocks | undefined,
): SupersetTheme {
  if (!baseTheme || !locks) {
    return theme;
  }

  const nextTheme = structuredClone(theme);

  if (locks.surfaces) {
    nextTheme.ui.background = baseTheme.ui.background;
    nextTheme.ui.border = baseTheme.ui.border;
    nextTheme.ui.card = baseTheme.ui.card;
    nextTheme.ui.cardForeground = baseTheme.ui.cardForeground;
    nextTheme.ui.foreground = baseTheme.ui.foreground;
    nextTheme.ui.input = baseTheme.ui.input;
    nextTheme.ui.muted = baseTheme.ui.muted;
    nextTheme.ui.mutedForeground = baseTheme.ui.mutedForeground;
    nextTheme.ui.popover = baseTheme.ui.popover;
    nextTheme.ui.popoverForeground = baseTheme.ui.popoverForeground;
    nextTheme.ui.secondary = baseTheme.ui.secondary;
    nextTheme.ui.secondaryForeground = baseTheme.ui.secondaryForeground;
    nextTheme.ui.tertiary = baseTheme.ui.tertiary;
    nextTheme.ui.tertiaryActive = baseTheme.ui.tertiaryActive;
    nextTheme.ui.sidebar = baseTheme.ui.sidebar;
    nextTheme.ui.sidebarForeground = baseTheme.ui.sidebarForeground;
    nextTheme.ui.sidebarAccent = baseTheme.ui.sidebarAccent;
    nextTheme.ui.sidebarAccentForeground = baseTheme.ui.sidebarAccentForeground;
    nextTheme.ui.sidebarBorder = baseTheme.ui.sidebarBorder;
  }

  if (locks.accent) {
    nextTheme.ui.accent = baseTheme.ui.accent;
    nextTheme.ui.accentForeground = baseTheme.ui.accentForeground;
    nextTheme.ui.destructive = baseTheme.ui.destructive;
    nextTheme.ui.destructiveForeground = baseTheme.ui.destructiveForeground;
    nextTheme.ui.primary = baseTheme.ui.primary;
    nextTheme.ui.primaryForeground = baseTheme.ui.primaryForeground;
    nextTheme.ui.sidebarPrimary = baseTheme.ui.sidebarPrimary;
    nextTheme.ui.sidebarPrimaryForeground = baseTheme.ui.sidebarPrimaryForeground;
    nextTheme.ui.sidebarRing = baseTheme.ui.sidebarRing;
    nextTheme.ui.chart1 = baseTheme.ui.chart1;
    nextTheme.ui.chart2 = baseTheme.ui.chart2;
    nextTheme.ui.chart3 = baseTheme.ui.chart3;
    nextTheme.ui.chart4 = baseTheme.ui.chart4;
    nextTheme.ui.chart5 = baseTheme.ui.chart5;
  }

  if (locks.highlights) {
    nextTheme.ui.ring = baseTheme.ui.ring;
    nextTheme.ui.selection = baseTheme.ui.selection;
    nextTheme.ui.selectionForeground = baseTheme.ui.selectionForeground;
    nextTheme.ui.highlightMatch = baseTheme.ui.highlightMatch;
    nextTheme.ui.highlightActive = baseTheme.ui.highlightActive;
    nextTheme.ui.highlight = baseTheme.ui.highlight;
    nextTheme.ui.highlightForeground = baseTheme.ui.highlightForeground;
    nextTheme.terminal.selection = baseTheme.terminal.selection;
    nextTheme.terminal.selectionForeground = baseTheme.terminal.selectionForeground;
    nextTheme.terminal.cursorAccent = baseTheme.terminal.cursorAccent;
    nextTheme.terminal.selectionBackground = baseTheme.terminal.selectionBackground;
  }

  if (locks.terminal) {
    nextTheme.terminal = structuredClone(baseTheme.terminal);
  }

  return nextTheme;
}

function pickMode(seed: number | string): ThemeType {
  return createPrng(seed)() > 0.5 ? "dark" : "light";
}

function pickHue(prng: Prng, hueRange: HueRange | undefined): number {
  const min = hueRange?.min ?? 0;
  const max = hueRange?.max ?? 360;
  const constrainedMin = normalizeHue(min);
  const constrainedMax = normalizeHue(max);

  if (constrainedMin < constrainedMax) {
    const inset = constrainedMax - constrainedMin > 8 ? 2 : 0;
    return constrainedMin + inset + prng() * (constrainedMax - constrainedMin - inset * 2);
  }

  return normalizeHue(prng() * 360);
}

function randomBetween(prng: Prng, min: number, max: number): number {
  return min + prng() * (max - min);
}

function oklchHex(l: number, c: number, h: number): string {
  const hex = formatHex(clampToRgb({ c, h: normalizeHue(h), l, mode: "oklch" }));

  if (!hex) {
    throw new Error("Unable to format generated OKLCH color.");
  }

  return hex;
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

function wrapHue(hue: number): number {
  return normalizeHue(hue);
}

function createPrng(seed: number | string): Prng {
  let state = hashSeed(String(seed));

  return () => {
    state += 0x6d2b79f5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function slugifySeed(seed: number | string): string {
  const slug = String(seed)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "theme";
}

function titleize(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
