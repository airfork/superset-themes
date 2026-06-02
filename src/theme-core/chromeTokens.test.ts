import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { getChromeMutedForeground, getChromeSurface, getFocusRingColor } from "./chromeTokens";
import { getContrastRatio } from "./contrast";

const AA = 4.5;

function entryFor(id: string) {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

describe("getChromeSurface", () => {
  it("uses the raised card for dark themes", () => {
    const { theme } = entryFor("tokyo-night");
    expect(getChromeSurface(theme)).toBe(theme.ui.card);
  });

  it("uses the background for light themes, the more reliable AA base", () => {
    const { theme } = entryFor("solarized-light");
    expect(getChromeSurface(theme)).toBe(theme.ui.background);
  });

  it("uses Superset Light's raised card when it can carry chrome text", () => {
    const { theme } = entryFor("superset-light");

    expect(getContrastRatio(theme.ui.foreground, theme.ui.card)).toBeGreaterThanOrEqual(AA);
    expect(getChromeSurface(theme)).toBe(theme.ui.card);
  });
});

describe("getChromeMutedForeground", () => {
  it("returns a six-digit hex color", () => {
    expect(getChromeMutedForeground(entryFor("tokyo-night").theme)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("keeps muted chrome text at or above AA against the chrome surface for every theme", () => {
    for (const { theme } of catalogThemes) {
      if (theme.id === "superset-light" || theme.id === "superset-dark") {
        continue;
      }
      const surface = getChromeSurface(theme);
      const ratio = getContrastRatio(getChromeMutedForeground(theme), surface);
      expect(ratio, `${theme.id} muted contrast`).toBeGreaterThanOrEqual(AA);
    }
  });

  it("never makes muted higher-contrast than the primary foreground (stays a de-emphasis)", () => {
    for (const { theme } of catalogThemes) {
      const surface = getChromeSurface(theme);
      const primary = getContrastRatio(theme.ui.foreground, surface);
      const muted = getContrastRatio(getChromeMutedForeground(theme), surface);
      expect(muted, `${theme.id} muted vs primary`).toBeLessThanOrEqual(primary + 0.01);
    }
  });

  it("restores hierarchy on equal-token themes where muted-foreground equals foreground", () => {
    // Imported or hand-authored themes can ship muted-foreground == foreground, which
    // collapses a naive CSS mix of chrome muted onto primary. Force the equal-token
    // condition on a real dark theme; the derivation must pull it perceptibly lighter.
    const { theme: base } = entryFor("tokyo-night");
    const theme = { ...base, ui: { ...base.ui, mutedForeground: base.ui.foreground } };
    expect(theme.ui.mutedForeground.toLowerCase()).toBe(theme.ui.foreground.toLowerCase());

    const surface = getChromeSurface(theme);
    const muted = getChromeMutedForeground(theme);
    expect(muted.toLowerCase()).not.toBe(theme.ui.foreground.toLowerCase());

    const primary = getContrastRatio(theme.ui.foreground, surface);
    const mutedRatio = getContrastRatio(muted, surface);
    expect(mutedRatio).toBeLessThan(primary - 0.5);
    expect(mutedRatio).toBeGreaterThanOrEqual(AA);
  });

  it("uses Superset Light's live muted token exactly even though it falls just below AA", () => {
    const { theme } = entryFor("superset-light");
    const surface = getChromeSurface(theme);
    const mutedRatio = getContrastRatio(getChromeMutedForeground(theme), surface);

    expect(getChromeMutedForeground(theme)).toBe(theme.ui.mutedForeground);
    expect(mutedRatio).toBeLessThan(AA);
  });

  it("uses the live Superset Dark muted token when it already clears AA", () => {
    const { theme } = entryFor("superset-dark");

    expect(
      getContrastRatio(theme.ui.mutedForeground, getChromeSurface(theme)),
    ).toBeGreaterThanOrEqual(AA);
    expect(getChromeMutedForeground(theme)).toBe(theme.ui.mutedForeground);
  });
});

describe("getFocusRingColor", () => {
  it("uses Superset Light's live ring token exactly", () => {
    const { theme } = entryFor("superset-light");

    expect(theme.ui.ring).toBe("#a1a1a1");
    expect(getFocusRingColor(theme)).toBe(theme.ui.ring);
  });

  it("uses Superset Dark's live ring token exactly", () => {
    const { theme } = entryFor("superset-dark");

    expect(theme.ui.ring).toBe("#3a3837");
    expect(getFocusRingColor(theme)).toBe(theme.ui.ring);
  });
});
