import { describe, expect, it } from "vitest";
import { getCatalogThemeById, getThemeById } from "../data/fixtures";
import {
  createDraftFromCatalogEntry,
  createDraftFromGeneratedTheme,
  createDraftFromImportedTheme,
  exportDraftThemeJson,
  resetDraftToSource,
  updateDraftTerminalToken,
  updateDraftUiToken,
} from "./draftTheme";

const auroraLightEntry = getCatalogThemeById("aurora-light");
const graphiteDarkTheme = getThemeById("graphite-dark");

if (!auroraLightEntry || !graphiteDarkTheme) {
  throw new Error("Expected lab fixture themes to exist.");
}

describe("theme drafts", () => {
  it("clones a catalog theme into a draft without catalog metadata", () => {
    const draft = createDraftFromCatalogEntry(auroraLightEntry);
    const exported = JSON.parse(exportDraftThemeJson(draft));

    expect(draft).toMatchObject({
      dirty: false,
      source: {
        themeId: "aurora-light",
        type: "catalog",
      },
      theme: {
        id: "aurora-light",
        name: "Aurora Light",
      },
    });
    expect(exported).toMatchObject({
      id: "aurora-light",
      type: "light",
    });
    expect(exported).not.toHaveProperty("pairGroup");
  });

  it("updates UI and terminal tokens immutably", () => {
    const draft = createDraftFromCatalogEntry(auroraLightEntry);
    const withAccent = updateDraftUiToken(draft, "accent", "#123456");
    const withTerminal = updateDraftTerminalToken(withAccent, "background", "#010203");

    expect(draft.theme.ui.accent).toBe(auroraLightEntry.theme.ui.accent);
    expect(withAccent.theme.ui.accent).toBe("#123456");
    expect(withTerminal.theme.terminal.background).toBe("#010203");
    expect(withTerminal.dirty).toBe(true);
  });

  it("resets a draft to its source theme", () => {
    const draft = updateDraftUiToken(
      createDraftFromCatalogEntry(auroraLightEntry),
      "primary",
      "#abcdef",
    );
    const reset = resetDraftToSource(draft);

    expect(reset.dirty).toBe(false);
    expect(reset.theme.ui.primary).toBe(auroraLightEntry.theme.ui.primary);
  });

  it("creates imported drafts with import source state", () => {
    const draft = createDraftFromImportedTheme(graphiteDarkTheme);

    expect(draft).toMatchObject({
      dirty: false,
      source: {
        type: "import",
      },
      theme: {
        id: "graphite-dark",
      },
    });
  });

  it("creates generated drafts with generated source state", () => {
    const draft = createDraftFromGeneratedTheme(graphiteDarkTheme);

    expect(draft).toMatchObject({
      dirty: false,
      source: {
        type: "generated",
      },
      theme: {
        id: "graphite-dark",
      },
    });
  });
});
