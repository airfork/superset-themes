import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { themeFixtures } from "../data/fixtures";
import { catalogThemeMetaSchema, supersetThemeSchema, validateCatalogThemes } from "./schema";

function requireValue<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  return value as T;
}

describe("theme schema", () => {
  it("parses every fixture theme", () => {
    for (const theme of themeFixtures) {
      expect(supersetThemeSchema.parse(theme)).toMatchObject({
        description: theme.description,
        id: theme.id,
        type: theme.type,
      });
    }
  });

  it("rejects invalid theme types", () => {
    expect(() =>
      supersetThemeSchema.parse({
        ...themeFixtures[0],
        type: "midnight",
      }),
    ).toThrow();
  });

  it("parses every catalog metadata entry", () => {
    for (const entry of catalogThemes) {
      expect(catalogThemeMetaSchema.parse(entry.meta)).toMatchObject({
        themeId: entry.theme.id,
      });
    }
  });

  it("includes a small upstream port batch with paired Solarized variants", () => {
    const upstreamPorts = catalogThemes.filter((entry) => entry.meta.source === "upstream-port");

    expect(upstreamPorts.map((entry) => entry.theme.id).sort()).toEqual([
      "nord",
      "solarized-dark",
      "solarized-light",
    ]);
    expect(
      upstreamPorts
        .filter((entry) => "pairGroup" in entry.meta && entry.meta.pairGroup === "solarized")
        .map((entry) => entry.theme.type)
        .sort(),
    ).toEqual(["dark", "light"]);
    expect(
      upstreamPorts.map((entry) => ({
        license: entry.meta.license,
        portStatus: entry.meta.portStatus,
      })),
    ).toEqual([
      { license: "MIT", portStatus: "ported" },
      { license: "MIT", portStatus: "ported" },
      { license: "MIT", portStatus: "ported" },
    ]);
  });

  it("fails catalog validation for duplicate theme IDs", () => {
    const firstTheme = requireValue(themeFixtures[0]);
    const secondTheme = requireValue(themeFixtures[1]);
    const firstEntry = requireValue(catalogThemes[0]);
    const secondEntry = requireValue(catalogThemes[1]);

    const result = validateCatalogThemes([
      {
        theme: firstTheme,
        meta: firstEntry.meta,
      },
      {
        theme: { ...secondTheme, id: firstTheme.id },
        meta: { ...secondEntry.meta, themeId: firstTheme.id, pairGroup: undefined },
      },
    ]);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(`Duplicate theme id: ${firstTheme.id}`);
  });
});
