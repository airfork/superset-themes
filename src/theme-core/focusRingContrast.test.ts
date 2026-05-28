import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { getContrastRatio } from "./contrast";

// Phase 4 checkpoint requirement: focus rings (which use --preview-ui-ring) must clear
// the WCAG 3:1 non-text contrast bar against both the background and card surfaces of
// every catalog theme. The rail row focus ring is the worst-case caller — it sits inside
// the rail (.rail background uses --preview-ui-card) but visually reads against the
// page background as well.

const NON_TEXT_CONTRAST_BAR = 3.0;

describe("ui.ring contrast vs ui.background and ui.card", () => {
  for (const { theme } of catalogThemes) {
    it(`${theme.id}: ring clears 3:1 against bg and card`, () => {
      const ringVsBg = getContrastRatio(theme.ui.ring, theme.ui.background);
      const ringVsCard = getContrastRatio(theme.ui.ring, theme.ui.card);
      expect(ringVsBg, `${theme.id} ring vs bg`).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST_BAR);
      expect(ringVsCard, `${theme.id} ring vs card`).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST_BAR);
    });
  }
});
