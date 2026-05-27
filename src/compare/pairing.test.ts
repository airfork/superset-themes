import { describe, expect, it } from "vitest";
import { getCatalogThemeById } from "../data/fixtures";
import { clearPairSlot, DEFAULT_PAIRING_STATE, pinPairTheme, setPairPreviewTab } from "./pairing";

const auroraLight = getCatalogThemeById("aurora-light");
const auroraDark = getCatalogThemeById("aurora-dark");
const graphiteDark = getCatalogThemeById("graphite-dark");

if (!auroraLight || !auroraDark || !graphiteDark) {
  throw new Error("Expected catalog fixture themes to exist.");
}

describe("pairing state helpers", () => {
  it("pins light and dark themes into matching slots", () => {
    const withLight = pinPairTheme(DEFAULT_PAIRING_STATE, auroraLight, "light");
    const withDark = pinPairTheme(withLight.state, auroraDark, "dark");

    expect(withLight).toMatchObject({
      ok: true,
      state: {
        lightThemeId: "aurora-light",
        selectedPreviewTab: "workspace",
      },
    });
    expect(withDark).toMatchObject({
      ok: true,
      state: {
        darkThemeId: "aurora-dark",
        lightThemeId: "aurora-light",
      },
    });
  });

  it("replaces an existing slot without mutating the previous state", () => {
    const initial = pinPairTheme(DEFAULT_PAIRING_STATE, auroraDark, "dark").state;
    const next = pinPairTheme(initial, graphiteDark, "dark");

    expect(initial.darkThemeId).toBe("aurora-dark");
    expect(next).toMatchObject({
      ok: true,
      state: {
        darkThemeId: "graphite-dark",
      },
    });
  });

  it("rejects mismatched slot operations with a clear reason", () => {
    const result = pinPairTheme(DEFAULT_PAIRING_STATE, auroraDark, "light");

    expect(result).toEqual({
      ok: false,
      reason: "Theme aurora-dark is dark and cannot be pinned to the light slot.",
      state: DEFAULT_PAIRING_STATE,
    });
  });

  it("clears slots and syncs the selected preview tab", () => {
    const paired = pinPairTheme(
      pinPairTheme(DEFAULT_PAIRING_STATE, auroraLight, "light").state,
      auroraDark,
      "dark",
    ).state;
    const terminalState = setPairPreviewTab(paired, "terminal");
    const withoutLight = clearPairSlot(terminalState, "light");

    expect(terminalState).toMatchObject({
      darkThemeId: "aurora-dark",
      lightThemeId: "aurora-light",
      selectedPreviewTab: "terminal",
    });
    expect(withoutLight).toEqual({
      darkThemeId: "aurora-dark",
      selectedPreviewTab: "terminal",
    });
  });
});
