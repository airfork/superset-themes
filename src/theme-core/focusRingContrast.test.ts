import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { getFocusRingColor } from "./chromeTokens";
import { getContrastRatio } from "./contrast";

// Raw exported theme tokens can track upstream exactly even when an upstream ring is
// subtle. The app-facing focus variable is derived and must clear the WCAG 3:1 non-text
// contrast bar against both the background and card surfaces of every catalog theme.
// The rail row focus ring is the worst-case caller — it sits inside the rail
// (.rail background uses --preview-ui-card) but visually reads against the page
// background as well.

const NON_TEXT_CONTRAST_BAR = 3.0;

describe("derived focus ring contrast vs ui.background and ui.card", () => {
  for (const { theme } of catalogThemes) {
    it(`${theme.id}: focus ring clears 3:1 against bg and card`, () => {
      const focusRing = getFocusRingColor(theme);
      const ringVsBg = getContrastRatio(focusRing, theme.ui.background);
      const ringVsCard = getContrastRatio(focusRing, theme.ui.card);
      expect(ringVsBg, `${theme.id} ring vs bg`).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST_BAR);
      expect(ringVsCard, `${theme.id} ring vs card`).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST_BAR);
    });
  }
});
