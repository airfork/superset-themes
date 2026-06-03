import { describe, expect, it } from "vitest";
import { filterTokenGroups } from "./tokenFilter";

const groups = [
  {
    group: "surfaces",
    label: "Surfaces",
    rows: [{ label: "Background" }, { label: "Foreground" }],
  },
  {
    group: "terminal",
    label: "Terminal",
    rows: [{ label: "Bright red" }, { label: "Bright blue" }],
  },
];

describe("filterTokenGroups", () => {
  it("returns every group unchanged for an empty query", () => {
    expect(filterTokenGroups(groups, "")).toEqual(groups);
    expect(filterTokenGroups(groups, "   ")).toEqual(groups);
  });

  it("keeps only rows whose label matches the query", () => {
    const result = filterTokenGroups(groups, "bright");
    expect(result.map((g) => g.group)).toEqual(["terminal"]);
    expect(result.flatMap((g) => g.rows.map((r) => r.label))).toEqual([
      "Bright red",
      "Bright blue",
    ]);
  });

  it("can match rows across groups, keeping only matching rows", () => {
    const result = filterTokenGroups(groups, "ground");
    expect(result.map((g) => g.group)).toEqual(["surfaces"]);
    expect(result.flatMap((g) => g.rows.map((r) => r.label))).toEqual(["Background", "Foreground"]);
  });

  it("drops groups with no matching rows", () => {
    const result = filterTokenGroups(groups, "background");
    expect(result.map((g) => g.group)).toEqual(["surfaces"]);
    expect(result.flatMap((g) => g.rows.map((r) => r.label))).toEqual(["Background"]);
  });

  it("is case-insensitive", () => {
    expect(filterTokenGroups(groups, "BRIGHT")).toHaveLength(1);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterTokenGroups(groups, "zzz")).toEqual([]);
  });
});
