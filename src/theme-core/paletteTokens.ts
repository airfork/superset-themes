import { differenceCiede2000, formatHex, interpolate } from "culori";
import type { SupersetTheme } from "./themeTypes";

// Several interactive surfaces fill their active/hovered state with a tinted band drawn
// from `ui.accent`: the command palette's rows over the popover, and the workspace
// session tab's close button over the app background. Most themes ship an accent that
// already reads as a distinct band — GitHub Light's pale blue sits clearly over white —
// but several themes set `accent` equal to (or a hair from) the surface it lands on
// (Gruvbox Light, both Solarized variants, GitHub Dark Dimmed), so the state vanishes
// into the surface and you cannot tell what is focused or hovered.
//
// A stylesheet cannot tell "distinct accent" from "accent == surface". The gap that
// matters here is perceptual (hue and chroma), not luminance, so WCAG contrast — which
// reads GitHub Light's blue band as ~1.1:1 against white — is the wrong test and would
// wrongly flag the accents that already work. We measure CIEDE2000 ΔE instead and only
// intervene when the accent is too close to the surface to register as a state, fading
// the surface toward its own foreground to synthesize a neutral tonal band. This mirrors
// the rail, which already keeps selection neutral "otherwise the rail's readability swings
// wildly between themes" (see rail.css). Distinct accents pass through untouched.

const deltaE = differenceCiede2000();

// Below this ΔE the accent is treated as a missing state and replaced with a synthesized
// neutral band. At or above it the theme's own accent is kept verbatim (Tokyo Night Light
// 5.9, GitHub Light 9.4). No catalog theme sits in the 3.5–5.9 gap, so the boundary is
// unambiguous.
const MIN_VISIBLE_DELTA = 4.5;
// Synthesized bands aim for a clearly-visible delta (well past the ~2.3 just-noticeable
// threshold); hover lands lower so the focused row still reads as the stronger of the two.
const SYNTH_ACTIVE_DELTA = 6.5;
const SYNTH_HOVER_DELTA = 3.6;

// Superset Light/Dark keep their real app tokens even where subtler than our gates; see
// the Fidelity Exception Rule in DESIGN.md.
function isSupersetBaseline(theme: SupersetTheme): boolean {
  return theme.id === "superset-light" || theme.id === "superset-dark";
}

// Gamma-sRGB interpolation, matching CSS `color-mix(in srgb, from, to weight)`.
function mix(from: string, to: string, weight: number): string {
  return formatHex(interpolate([from, to], "rgb")(weight)) ?? from;
}

// Fade `surface` toward `target` until the result clears `delta` ΔE from the surface.
// Binary search because ΔE is non-linear in the mix weight.
function bandToward(surface: string, target: string, delta: number): string {
  if (deltaE(target, surface) <= delta) {
    return target;
  }

  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (deltaE(mix(surface, target, mid), surface) < delta) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return mix(surface, target, high);
}

function clearsDelta(color: string, surfaces: readonly string[], delta: number): boolean {
  return surfaces.every((surface) => deltaE(color, surface) >= delta);
}

// Fade `surface` toward `target` until the result clears `delta` ΔE from every surface
// it can appear on.
function bandTowardAll(
  surface: string,
  target: string,
  delta: number,
  comparisonSurfaces: readonly string[],
): string {
  if (comparisonSurfaces.length === 1) {
    return bandToward(surface, target, delta);
  }
  if (!clearsDelta(target, comparisonSurfaces, delta)) {
    return target;
  }

  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (clearsDelta(mix(surface, target, mid), comparisonSurfaces, delta)) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return mix(surface, target, high);
}

export type ActiveSurface = {
  active: string;
  activeForeground: string;
  hover: string;
};

// Derives the active and hover bands (plus a legible foreground for the active band) for
// `accent` landing on `surface`, so the state stays visible on every theme while keeping
// the theme's own accent wherever it already reads as a band. `keepAccent` forces the
// accent through unchanged for the Superset fidelity baselines.
function deriveActiveSurface(
  surface: string,
  surfaceForeground: string,
  accent: string,
  accentForeground: string,
  keepAccent: boolean,
  comparisonSurfaces: readonly string[] = [surface],
): ActiveSurface {
  if (keepAccent || clearsDelta(accent, comparisonSurfaces, MIN_VISIBLE_DELTA)) {
    return {
      active: accent,
      activeForeground: accentForeground,
      // The accent at 64% over the surface, matching the prior CSS hover.
      hover: mix(surface, accent, 0.64),
    };
  }

  // Accent collapses onto the surface: synthesize a neutral band from the surface itself,
  // keeping the surface foreground (already legible on the surface) for the text/icon.
  return {
    active: bandTowardAll(surface, surfaceForeground, SYNTH_ACTIVE_DELTA, comparisonSurfaces),
    activeForeground: surfaceForeground,
    hover: bandTowardAll(surface, surfaceForeground, SYNTH_HOVER_DELTA, comparisonSurfaces),
  };
}

// The command palette's active-row and hover bands, drawn over the popover surface.
export function getPaletteActiveSurface(theme: SupersetTheme): ActiveSurface {
  const { accent, accentForeground, popover, popoverForeground } = theme.ui;
  return deriveActiveSurface(
    popover,
    popoverForeground,
    accent,
    accentForeground,
    isSupersetBaseline(theme),
  );
}

// The workspace session tab's close-button hover band, drawn over the app background. The
// button also appears on the lightly tinted active tab, where a raw accent collapses
// almost completely (ΔE ~1 on the collapsed themes); deriving against the background keeps
// the band visible on both.
export function getWorkspaceControlSurface(theme: SupersetTheme): ActiveSurface {
  const { accent, accentForeground, background, border, foreground } = theme.ui;
  // Active session tabs render `border` at 30% over the workspace background; the close
  // button hover must clear both that tab fill and the resting background.
  const activeTabSurface = mix(background, border, 0.3);
  return deriveActiveSurface(
    background,
    foreground,
    accent,
    accentForeground,
    isSupersetBaseline(theme),
    [background, activeTabSurface],
  );
}
