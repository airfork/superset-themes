import { describe, expect, it } from "vitest";
import {
  compareStateToSearch,
  parseCompareRouteSearch,
  seedCompareState,
} from "./compareRouteSearch";

describe("compareRouteSearch", () => {
  it("seeds baseline and candidate from the search params", () => {
    const state = seedCompareState({ a: "tokyo-night", b: "solarized-light" }, "fallback");
    expect(state).toEqual({ baseline: "tokyo-night", candidate: "solarized-light" });
  });

  it("falls back to the provided baseline when no a param is present", () => {
    const state = seedCompareState({ b: "solarized-light" }, "aurora-dark");
    expect(state).toEqual({ baseline: "aurora-dark", candidate: "solarized-light" });
  });

  it("serializes state back to a/b/scene without a from param", () => {
    const search = compareStateToSearch(
      { baseline: "tokyo-night", candidate: "solarized-light" },
      "workspace",
    );
    expect(search).toEqual({ a: "tokyo-night", b: "solarized-light", scene: "workspace" });
  });

  it("omits an absent candidate from the serialized search", () => {
    const search = compareStateToSearch({ baseline: "tokyo-night", candidate: null }, "settings");
    expect(search).toEqual({ a: "tokyo-night", b: undefined, scene: "settings" });
  });

  it("uses the fallback baseline and a null candidate on a bare visit", () => {
    expect(seedCompareState({}, "aurora-dark")).toEqual({
      baseline: "aurora-dark",
      candidate: null,
    });
  });

  it("parse ignores a stale from param and an invalid scene", () => {
    expect(
      parseCompareRouteSearch({
        a: "tokyo-night",
        b: "solarized-light",
        from: "z",
        scene: "nope",
      }),
    ).toEqual({
      a: "tokyo-night",
      b: "solarized-light",
      scene: undefined,
    });
  });

  it("drops unknown theme ids before seeding compare state", () => {
    const parsed = parseCompareRouteSearch({
      a: "tokyo-night",
      b: "does-not-exist",
      scene: "workspace",
    });

    expect(parsed).toEqual({
      a: "tokyo-night",
      b: undefined,
      scene: "workspace",
    });
    expect(seedCompareState(parsed, "aurora-dark")).toEqual({
      baseline: "tokyo-night",
      candidate: null,
    });
  });

  it("does not seed the same theme as both fallback baseline and candidate", () => {
    const parsed = parseCompareRouteSearch({
      a: "does-not-exist",
      b: "tokyo-night",
      scene: "workspace",
    });

    expect(seedCompareState(parsed, "tokyo-night")).toEqual({
      baseline: "tokyo-night",
      candidate: null,
    });
  });
});
