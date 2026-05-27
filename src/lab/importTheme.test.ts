import { describe, expect, it } from "vitest";
import { getThemeById } from "../data/fixtures";
import { parseImportedThemeJson } from "./importTheme";

const auroraLight = getThemeById("aurora-light");

if (!auroraLight) {
  throw new Error("Expected aurora-light fixture to exist.");
}

describe("parseImportedThemeJson", () => {
  it("imports valid Superset theme JSON", () => {
    const result = parseImportedThemeJson(JSON.stringify(auroraLight));

    expect(result).toMatchObject({
      ok: true,
      theme: {
        id: "aurora-light",
        name: "Aurora Light",
      },
    });
  });

  it("returns a readable invalid JSON error", () => {
    const result = parseImportedThemeJson("{ nope");

    expect(result).toEqual({
      error: "Invalid JSON: expected property name or '}' at line 1 column 3",
      ok: false,
    });
  });

  it("returns schema errors for non-theme JSON", () => {
    const result = parseImportedThemeJson(JSON.stringify({ id: "not-enough" }));

    if (result.ok) {
      throw new Error("Expected schema import to fail.");
    }

    expect(result.error).toContain("Theme schema error:");
    expect(result.error).toContain("author");
  });
});
