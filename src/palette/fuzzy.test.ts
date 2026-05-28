import { describe, expect, it } from "vitest";
import { type RankableItem, rankFuzzy, scoreMatch } from "./fuzzy";

describe("scoreMatch", () => {
  it("ranks an exact match as tier 0", () => {
    const match = scoreMatch("nord", "nord");
    expect(match).not.toBeNull();
    expect(match?.tier).toBe(0);
  });

  it("ranks a prefix match as tier 1", () => {
    const match = scoreMatch("sol", "solarized-light");
    expect(match?.tier).toBe(1);
    expect(match?.score).toBeGreaterThan(0);
  });

  it("ranks a non-prefix subsequence as tier 2", () => {
    const match = scoreMatch("rpd", "rose-pine-dawn");
    expect(match?.tier).toBe(2);
    expect(match?.score).toBeGreaterThan(0);
  });

  it("returns null when the query is not a subsequence", () => {
    expect(scoreMatch("zzz", "nord")).toBeNull();
  });

  it("scores consecutive matches higher than scattered ones", () => {
    const consecutive = scoreMatch("ar", "bar");
    const scattered = scoreMatch("ar", "a-r");
    expect(consecutive?.score).toBeGreaterThan(scattered?.score ?? 0);
  });

  it("is case-insensitive", () => {
    expect(scoreMatch("NORD", "nord")?.tier).toBe(0);
  });
});

const items: RankableItem[] = [
  { id: "solarized-light", keys: ["solarized-light", "Solarized Light"] },
  { id: "solarized-dark", keys: ["solarized-dark", "Solarized Dark"] },
  { id: "rose-pine-dawn", keys: ["rose-pine-dawn", "Rosé Pine Dawn"] },
  { id: "nord", keys: ["nord", "Nord"] },
];

describe("rankFuzzy", () => {
  it("returns every item in original order for an empty query", () => {
    expect(rankFuzzy("", items).map((i) => i.id)).toEqual([
      "solarized-light",
      "solarized-dark",
      "rose-pine-dawn",
      "nord",
    ]);
  });

  it("drops items that do not match", () => {
    const ranked = rankFuzzy("sol", items).map((i) => i.id);
    expect(ranked).toContain("solarized-light");
    expect(ranked).toContain("solarized-dark");
    expect(ranked).not.toContain("nord");
  });

  it("breaks prefix-tier ties by shorter id", () => {
    const ranked = rankFuzzy("sol", items).map((i) => i.id);
    expect(ranked.indexOf("solarized-dark")).toBeLessThan(ranked.indexOf("solarized-light"));
  });

  it("matches against any key (id or display name)", () => {
    const ranked = rankFuzzy("rose", items).map((i) => i.id);
    expect(ranked[0]).toBe("rose-pine-dawn");
  });
});
