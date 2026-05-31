// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { catalogThemes } from "../data/catalog";
import { FEATURED_IDS } from "../data/featured";
import { exportThemeJson } from "../theme-core/exportTheme";
import { buildThemeCommands, copyThemeJsonCommand } from "./commands";

function entryFor(id: string) {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

describe("buildThemeCommands", () => {
  it("orders theme commands Featured-first so ⌘K echoes the rail at rest", () => {
    // The rail leads with the featured block; the palette's resting order (which
    // the empty-query fuzzy pass preserves) must match so a user can transfer
    // their mental model between the two search surfaces.
    const commands = buildThemeCommands(() => {});
    expect(commands.slice(0, FEATURED_IDS.length).map((command) => command.id)).toEqual([
      ...FEATURED_IDS,
    ]);
  });

  it("includes every catalog theme exactly once", () => {
    const commands = buildThemeCommands(() => {});
    expect(commands).toHaveLength(catalogThemes.length);
    expect(new Set(commands.map((command) => command.id)).size).toBe(catalogThemes.length);
  });

  it("drops the family hint when it only echoes the theme name", () => {
    const commands = buildThemeCommands(() => {});
    const byId = (id: string) => {
      const found = commands.find((command) => command.id === id);
      if (!found) {
        throw new Error(`Expected command ${id}`);
      }
      return found;
    };
    // "Tokyo Night" sits in the "Tokyo Night" family, so the hint would only
    // repeat the name; the palette omits it the way the rail eyebrow and bottom
    // bar already do. A family that groups distinct themes still earns its hint.
    expect(byId("tokyo-night").hint).toBeUndefined();
    expect(byId("rose-pine-dawn").hint).toBe("Rosé Pine");
  });
});

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
