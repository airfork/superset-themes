// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { catalogThemes } from "../data/catalog";
import { exportThemeJson } from "../theme-core/exportTheme";
import { copyThemeJsonCommand } from "./commands";

function entryFor(id: string) {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

describe("copyThemeJsonCommand", () => {
  it("is an Actions command discoverable by copy, export, and json", () => {
    const command = copyThemeJsonCommand(entryFor("tokyo-night"));

    expect(command.section).toBe("Actions");
    expect(command.label).toMatch(/copy theme json/i);
    expect(command.keys).toEqual(expect.arrayContaining(["copy", "export", "json"]));
  });

  it("writes the exported theme JSON to the clipboard when run", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const entry = entryFor("rose-pine-dawn");

    copyThemeJsonCommand(entry).run();

    expect(writeText).toHaveBeenCalledWith(exportThemeJson(entry));
    if (original) {
      Object.defineProperty(navigator, "clipboard", original);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  });
});
