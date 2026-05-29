import { describe, expect, it } from "vitest";
import { parseCatalogRouteSearch } from "./catalogRoute";

describe("parseCatalogRouteSearch", () => {
  it("keeps only the catalog theme search param", () => {
    expect(
      parseCatalogRouteSearch({
        dark: "dracula",
        light: "solarized-light",
        tab: "diff",
        theme: "tokyo-night",
      }),
    ).toEqual({ theme: "tokyo-night" });
  });

  it("drops blank and non-string theme params", () => {
    expect(parseCatalogRouteSearch({ theme: " " })).toEqual({});
    expect(parseCatalogRouteSearch({ theme: 12 })).toEqual({});
  });
});
