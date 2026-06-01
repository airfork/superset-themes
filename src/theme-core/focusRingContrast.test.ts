import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { getFocusRingColor } from "./chromeTokens";
import { getContrastRatio } from "./contrast";

// Non-Superset themes derive an app-facing focus variable that clears the WCAG 3:1
// non-text contrast bar against both background and card. Superset Light/Dark are
// fidelity exceptions: they keep the live app ring even when it is intentionally subtle.

const NON_TEXT_CONTRAST_BAR = 3.0;

describe("derived focus ring contrast vs ui.background and ui.card", () => {
  for (const { theme } of catalogThemes) {
    if (theme.id === "superset-light" || theme.id === "superset-dark") {
      continue;
    }

    it(`${theme.id}: focus ring clears 3:1 against bg and card`, () => {
      const focusRing = getFocusRingColor(theme);
      const ringVsBg = getContrastRatio(focusRing, theme.ui.background);
      const ringVsCard = getContrastRatio(focusRing, theme.ui.card);
      expect(ringVsBg, `${theme.id} ring vs bg`).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST_BAR);
      expect(ringVsCard, `${theme.id} ring vs card`).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST_BAR);
    });
  }
});
