import { describe, expect, it } from "vitest";
import { historyShortcut } from "./historyShortcut";

describe("historyShortcut", () => {
  it("maps Cmd+Z to undo", () => {
    expect(historyShortcut({ ctrlKey: false, key: "z", metaKey: true, shiftKey: false })).toBe(
      "undo",
    );
  });

  it("maps Ctrl+Z to undo", () => {
    expect(historyShortcut({ ctrlKey: true, key: "z", metaKey: false, shiftKey: false })).toBe(
      "undo",
    );
  });

  it("maps Cmd+Shift+Z to redo", () => {
    expect(historyShortcut({ ctrlKey: false, key: "z", metaKey: true, shiftKey: true })).toBe(
      "redo",
    );
  });

  it("maps Ctrl+Y to redo (Windows redo)", () => {
    expect(historyShortcut({ ctrlKey: true, key: "y", metaKey: false, shiftKey: false })).toBe(
      "redo",
    );
  });

  it("is case-insensitive on the key", () => {
    expect(historyShortcut({ ctrlKey: false, key: "Z", metaKey: true, shiftKey: false })).toBe(
      "undo",
    );
  });

  it("ignores Z without a Cmd/Ctrl modifier", () => {
    expect(
      historyShortcut({ ctrlKey: false, key: "z", metaKey: false, shiftKey: false }),
    ).toBeNull();
  });

  it("ignores other modified keys", () => {
    expect(
      historyShortcut({ ctrlKey: false, key: "s", metaKey: true, shiftKey: false }),
    ).toBeNull();
  });
});
