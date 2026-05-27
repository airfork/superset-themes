import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { exportThemeJson } from "./exportTheme";

function requireValue<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  return value as T;
}

describe("exportThemeJson", () => {
  it("exports only Superset theme data without catalog metadata", () => {
    const entry = requireValue(catalogThemes[0]);

    const exportedTheme = JSON.parse(exportThemeJson(entry));

    expect(exportedTheme).toEqual(entry.theme);
    expect(exportedTheme).not.toHaveProperty("meta");
    expect(exportedTheme).not.toHaveProperty("source");
    expect(exportedTheme).not.toHaveProperty("family");
    expect(exportedTheme).not.toHaveProperty("styleTags");
  });
});
