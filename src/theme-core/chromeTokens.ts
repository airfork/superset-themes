import { getContrastRatio } from "./contrast";
import type { SupersetTheme } from "./themeTypes";

// Persistent chrome (top/bottom bars, rail, palette, nameplate) must guarantee its
// own legibility no matter which theme it is wearing, and keep a primary/secondary
// split. Two themes break a naive CSS derivation:
//   - Solarized maps card/input/muted/popover onto a single cream where even full
//     foreground barely clears AA, so chrome sits on the higher-contrast base below.
//   - Several themes (Tokyo Night, Nord, Dracula, …) ship muted-foreground == fore-
//     ground, so any "mix muted toward foreground" derivation collapses onto primary.
// So the muted token is synthesised here from foreground + surface with the contrast
// math a stylesheet cannot do.

const AA_CONTRAST = 4.5;
const NON_TEXT_CONTRAST = 3.0;
// Muted text aims for this share of the primary text's contrast, floored at AA. High
// enough to stay comfortably legible, low enough to read as clearly secondary.
const HIERARCHY_RATIO = 0.72;

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

// Light themes can map card to a tint darker than background (e.g. Solarized base2),
// so their reliable AA surface is the background; dark themes keep the raised card.
export function getChromeSurface(theme: SupersetTheme): string {
  return theme.type === "light" ? theme.ui.background : theme.ui.card;
}

export function getChromeMutedForeground(theme: SupersetTheme): string {
  const surface = getChromeSurface(theme);
  const foreground = theme.ui.foreground;
  const primary = getContrastRatio(foreground, surface);

  const target = Math.max(AA_CONTRAST, primary * HIERARCHY_RATIO);
  if (target >= primary) {
    // No headroom between AA and primary (foreground itself is barely legible, e.g.
    // Solarized): a distinct muted would drop below AA, so keep parity with primary.
    return foreground;
  }

  // Contrast falls monotonically as foreground slides toward the surface, so binary
  // search the blend weight that lands on the target contrast.
  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (getContrastRatio(mixSrgb(foreground, surface, mid), surface) > target) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return mixSrgb(foreground, surface, low);
}

export function getFocusRingColor(theme: SupersetTheme): string {
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
