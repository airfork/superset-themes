import { getContrastRatio } from "./contrast";
import type { SupersetTheme } from "./themeTypes";

// Persistent chrome (top/bottom bars, rail, palette, nameplate) derives its own
// legibility for most catalog themes and keeps a primary/secondary split. Superset
// Light/Dark are fidelity exceptions: they keep the live app tokens even where the
// live app is more subtle than our local contrast gates. Other themes break a naive
// CSS derivation:
//   - Solarized maps card/input/muted/popover onto a single cream where even full
//     foreground barely clears AA, so chrome sits on the higher-contrast base below.
//   - Imported or hand-authored themes can ship muted-foreground == foreground, so any
//     "mix muted toward foreground" derivation collapses onto primary.
// So the muted token is synthesised here from foreground + surface with the contrast
// math a stylesheet cannot do.

const AA_CONTRAST = 4.5;
const NON_TEXT_CONTRAST = 3.0;

type Rgb = readonly [number, number, number];

function parseHex(hex: string): Rgb {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

// Matches CSS `color-mix(in srgb, base, target weight)`: gamma-encoded channels are
// interpolated linearly, with `weight` the target's share.
function mixSrgb(baseHex: string, targetHex: string, weight: number): string {
  const base = parseHex(baseHex);
  const target = parseHex(targetHex);
  return toHex([
    base[0] * (1 - weight) + target[0] * weight,
    base[1] * (1 - weight) + target[1] * weight,
    base[2] * (1 - weight) + target[2] * weight,
  ]);
}

function sameHex(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function isSupersetBaseline(theme: SupersetTheme): boolean {
  return theme.id === "superset-light" || theme.id === "superset-dark";
}

function raiseContrastTo(
  baseHex: string,
  targetHex: string,
  surfaceHex: string,
  minContrast: number,
): string {
  if (getContrastRatio(baseHex, surfaceHex) >= minContrast) {
    return baseHex;
  }
  if (getContrastRatio(targetHex, surfaceHex) <= minContrast) {
    return targetHex;
  }

  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (getContrastRatio(mixSrgb(baseHex, targetHex, mid), surfaceHex) < minContrast) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return mixSrgb(baseHex, targetHex, high);
}

function lowerContrastTo(
  baseHex: string,
  targetHex: string,
  surfaceHex: string,
  targetContrast: number,
): string {
  if (getContrastRatio(baseHex, surfaceHex) <= targetContrast) {
    return baseHex;
  }

  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (getContrastRatio(mixSrgb(baseHex, targetHex, mid), surfaceHex) > targetContrast) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return mixSrgb(baseHex, targetHex, low);
}

// Light themes usually keep chrome on the background, but Superset Light's real app
// shell uses its raised card gray for sidebars and bars. Use a light card surface
// only when it is the softer surface and foreground text still clears AA; Solarized's
// cream card stays on the higher-contrast background fallback.
export function getChromeSurface(theme: SupersetTheme): string {
  if (theme.type !== "light") {
    return theme.ui.card;
  }

  const cardContrast = getContrastRatio(theme.ui.foreground, theme.ui.card);
  const backgroundContrast = getContrastRatio(theme.ui.foreground, theme.ui.background);

  return cardContrast >= AA_CONTRAST && cardContrast <= backgroundContrast
    ? theme.ui.card
    : theme.ui.background;
}

export function getChromeMutedForeground(theme: SupersetTheme): string {
  const surface = getChromeSurface(theme);
  const foreground = theme.ui.foreground;
  const muted = theme.ui.mutedForeground;

  if (isSupersetBaseline(theme)) {
    return muted;
  }

  if (!sameHex(muted, foreground)) {
    return raiseContrastTo(muted, foreground, surface, AA_CONTRAST);
  }

  const primary = getContrastRatio(foreground, surface);
  if (AA_CONTRAST >= primary) {
    // No headroom between AA and primary; a distinct muted would drop below AA.
    return foreground;
  }

  // Equal-token themes need a synthesized secondary. Fade foreground toward the
  // surface only until AA, keeping it muted instead of another foreground label.
  return lowerContrastTo(foreground, surface, surface, AA_CONTRAST);
}

export function getFocusRingColor(theme: SupersetTheme): string {
  if (isSupersetBaseline(theme)) {
    return theme.ui.ring;
  }

  const candidates = [
    theme.ui.ring,
    theme.ui.mutedForeground,
    theme.ui.foreground,
    theme.ui.primary,
  ].filter((candidate, index, all) => all.indexOf(candidate) === index);

  return (
    candidates.find(
      (candidate) =>
        getContrastRatio(candidate, theme.ui.background) >= NON_TEXT_CONTRAST &&
        getContrastRatio(candidate, theme.ui.card) >= NON_TEXT_CONTRAST,
    ) ?? theme.ui.foreground
  );
}
