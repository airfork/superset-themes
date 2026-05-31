import { describe, expect, it } from "vitest";
import { foldForMatch } from "./foldForMatch";

describe("foldForMatch", () => {
  it("strips diacritics so accented text folds to its ASCII form", () => {
    expect(foldForMatch("Rosé Pine")).toBe("rose pine");
  });

  it("lowercases so matching is case-insensitive", () => {
    expect(foldForMatch("NORD")).toBe("nord");
  });

  it("leaves plain ASCII unchanged apart from case", () => {
    expect(foldForMatch("Tokyo Night")).toBe("tokyo night");
  });
});
