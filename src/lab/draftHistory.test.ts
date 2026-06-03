import { describe, expect, it } from "vitest";
import { canRedo, canUndo, commit, currentDraft, initHistory, redo, undo } from "./draftHistory";

describe("draftHistory", () => {
  it("starts with a single entry and no undo/redo", () => {
    const h = initHistory("a");
    expect(currentDraft(h)).toBe("a");
    expect(canUndo(h)).toBe(false);
    expect(canRedo(h)).toBe(false);
  });

  it("appends commits and steps back and forward through them", () => {
    let h = initHistory("a");
    h = commit(h, "b");
    h = commit(h, "c");
    expect(currentDraft(h)).toBe("c");
    expect(canUndo(h)).toBe(true);
    expect(canRedo(h)).toBe(false);

    h = undo(h);
    expect(currentDraft(h)).toBe("b");
    expect(canRedo(h)).toBe(true);

    h = undo(h);
    expect(currentDraft(h)).toBe("a");
    expect(canUndo(h)).toBe(false);

    h = redo(h);
    expect(currentDraft(h)).toBe("b");
    h = redo(h);
    expect(currentDraft(h)).toBe("c");
  });

  it("drops the redo branch when committing after an undo", () => {
    let h = initHistory("a");
    h = commit(h, "b");
    h = commit(h, "c");
    h = undo(h); // back to "b", "c" is now a redo branch
    h = commit(h, "d"); // should discard "c"
    expect(currentDraft(h)).toBe("d");
    expect(canRedo(h)).toBe(false);
    h = undo(h);
    expect(currentDraft(h)).toBe("b");
  });

  it("coalesces consecutive commits sharing a key into one undo step", () => {
    let h = initHistory("a");
    h = commit(h, "b1", "ui:background");
    h = commit(h, "b2", "ui:background");
    h = commit(h, "b3", "ui:background");
    expect(currentDraft(h)).toBe("b3");
    // The three same-key edits collapsed to one entry; one undo returns to "a".
    h = undo(h);
    expect(currentDraft(h)).toBe("a");
    expect(canUndo(h)).toBe(false);
  });

  it("does not coalesce commits with different keys", () => {
    let h = initHistory("a");
    h = commit(h, "b", "ui:background");
    h = commit(h, "c", "ui:foreground");
    h = undo(h);
    expect(currentDraft(h)).toBe("b");
    h = undo(h);
    expect(currentDraft(h)).toBe("a");
  });

  it("does not coalesce a keyed edit into a pre-undo entry of the same key", () => {
    let h = initHistory("a");
    h = commit(h, "b", "ui:background");
    h = undo(h); // cursor moves off the tip; lastCoalesceKey reset
    h = commit(h, "c", "ui:background");
    // "c" should be a fresh entry replacing the redo branch, not a coalesce of "b".
    expect(currentDraft(h)).toBe("c");
    h = undo(h);
    expect(currentDraft(h)).toBe("a");
  });

  it("treats uncoalesced (null-key) commits as always distinct", () => {
    let h = initHistory("a");
    h = commit(h, "b");
    h = commit(h, "c");
    expect(h.stack).toEqual(["a", "b", "c"]);
  });

  it("returns the same reference when undo/redo are not possible", () => {
    const h = initHistory("a");
    expect(undo(h)).toBe(h);
    expect(redo(h)).toBe(h);
  });
});
