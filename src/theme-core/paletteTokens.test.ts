import { differenceCiede2000 } from "culori";
import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { getContrastRatio } from "./contrast";
import { getPaletteActiveSurface, getWorkspaceControlSurface } from "./paletteTokens";
import type { SupersetTheme } from "./themeTypes";

const deltaE = differenceCiede2000();

const byId = new Map(catalogThemes.map((entry) => [entry.theme.id, entry.theme]));

function theme(id: string): SupersetTheme {
  const found = byId.get(id);
  if (!found) {
    throw new Error(`Missing catalog theme "${id}"`);
  }
  return found;
}

// Themes that ship accent === popover (or a hair away): the palette's focused/hover rows
// used to vanish into the surface. These are the ones the derivation must rescue.
const COLLAPSED = ["gruvbox-light", "solarized-light", "solarized-dark", "github-dark-dimmed"];
// Themes whose accent already reads as a distinct band: the derivation must leave them be.
const DISTINCT = ["github-light", "tokyo-night-light", "catppuccin-mocha", "rose-pine"];
const SUPERSET = ["superset-light", "superset-dark"];

describe("getPaletteActiveSurface", () => {
  it.each(DISTINCT)("keeps the theme's own accent band for %s", (id) => {
    const t = theme(id);
    const surface = getPaletteActiveSurface(t);

    expect(surface.active).toBe(t.ui.accent);
    expect(surface.activeForeground).toBe(t.ui.accentForeground);
  });

  it.each(SUPERSET)("keeps Superset fidelity tokens for %s", (id) => {
    const t = theme(id);
    const surface = getPaletteActiveSurface(t);

    // Superset Light/Dark stay on their real app accent even though it is subtler than the
    // local minimum-visible gate (the Fidelity Exception Rule).
    expect(surface.active).toBe(t.ui.accent);
    expect(surface.activeForeground).toBe(t.ui.accentForeground);
  });

  it.each(COLLAPSED)("synthesizes a visible neutral band for %s", (id) => {
    const t = theme(id);
    const surface = getPaletteActiveSurface(t);

    // The accent collapses onto the surface, so the derived band must differ from it.
    expect(surface.active).not.toBe(t.ui.popover);
    expect(deltaE(surface.active, t.ui.popover)).toBeGreaterThanOrEqual(5);
    // The hover band is present and lighter than the active band.
    expect(deltaE(surface.hover, t.ui.popover)).toBeGreaterThan(1.5);
    expect(deltaE(surface.active, t.ui.popover)).toBeGreaterThan(
      deltaE(surface.hover, t.ui.popover),
    );
    // The synthesized band keeps the popover foreground, which stays AA-legible on it.
    expect(surface.activeForeground).toBe(t.ui.popoverForeground);
    expect(getContrastRatio(surface.activeForeground, surface.active)).toBeGreaterThanOrEqual(4.5);
  });

  it("gives every non-Superset theme a perceptibly distinct active row", () => {
    for (const { theme: t } of catalogThemes) {
      const surface = getPaletteActiveSurface(t);
      if (t.id === "superset-light" || t.id === "superset-dark") {
        continue;
      }
      expect(
        deltaE(surface.active, t.ui.popover),
        `${t.id} active row should be visible on its popover surface`,
      ).toBeGreaterThanOrEqual(4.4);
    }
  });
});

describe("getWorkspaceControlSurface", () => {
  it.each([
    "github-light",
    "catppuccin-mocha",
  ])("keeps the theme's own accent band for %s", (id) => {
    const t = theme(id);
    const surface = getWorkspaceControlSurface(t);

    expect(surface.active).toBe(t.ui.accent);
    expect(surface.activeForeground).toBe(t.ui.accentForeground);
  });

  it.each(SUPERSET)("keeps Superset fidelity tokens for %s", (id) => {
    const t = theme(id);
    expect(getWorkspaceControlSurface(t).active).toBe(t.ui.accent);
  });

  it.each(COLLAPSED)("synthesizes a visible band over the background for %s", (id) => {
    const t = theme(id);
    const surface = getWorkspaceControlSurface(t);

    // These themes set accent within ~1 ΔE of the active tab; the derived band must lift
    // clear of the background it sits on, keeping the legible background foreground.
    expect(surface.active).not.toBe(t.ui.background);
    expect(deltaE(surface.active, t.ui.background)).toBeGreaterThanOrEqual(5);
    expect(surface.activeForeground).toBe(t.ui.foreground);
    // The close affordance is an X glyph (a non-text graphical control), so its icon stays
    // above the WCAG 3:1 non-text gate; Solarized's deliberately low-contrast foreground
    // lands below 4.5 here, which is fine for an icon and was already the shipped color.
    expect(getContrastRatio(surface.activeForeground, surface.active)).toBeGreaterThanOrEqual(3);
  });

  it("gives every non-Superset theme a perceptibly distinct close-button hover", () => {
    for (const { theme: t } of catalogThemes) {
      if (t.id === "superset-light" || t.id === "superset-dark") {
        continue;
      }
      expect(
        deltaE(getWorkspaceControlSurface(t).active, t.ui.background),
        `${t.id} close-button hover should be visible on its background`,
      ).toBeGreaterThanOrEqual(4.4);
    }
  });
});
