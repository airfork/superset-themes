import { describe, expect, it } from "vitest";
import type { PaletteCommand } from "./commands";
import { buildPaletteEntries } from "./paletteEntries";

const noop = () => {};

function theme(id: string, keys: string[]): PaletteCommand {
  return { id, label: id, section: "Themes", keys, run: noop };
}

function action(id: string, keys: string[]): PaletteCommand {
  return { id, label: id, section: "Actions", keys, run: noop };
}

function focusedCommand(commands: PaletteCommand[], query: string) {
  const { entries, defaultFocusIndex } = buildPaletteEntries(commands, query, false);
  const entry = entries[defaultFocusIndex];
  return entry?.kind === "command" ? entry.command : undefined;
}

describe("buildPaletteEntries default focus", () => {
  it("aims focus at a prefix-matching action over an incidental theme subsequence", () => {
    // "pin" is only a scattered subsequence of "rose pine" (tier 2) but a clean
    // prefix of the Pin action (tier 1), so intent should land on the action.
    const commands = [
      theme("rose-pine", ["rose pine"]),
      action("pin-to-compare", ["pin to compare"]),
    ];

    expect(focusedCommand(commands, "pin")?.id).toBe("pin-to-compare");
  });

  it("keeps focus on the first theme when an action only ties the theme's tier", () => {
    // Both prefix-match (tier 1); a tie is not a strict win, so the theme keeps focus.
    const commands = [theme("porta", ["porta"]), action("portb", ["portb"])];

    expect(focusedCommand(commands, "port")?.id).toBe("porta");
  });

  it("keeps focus on the first theme when the theme outranks every action", () => {
    const commands = [theme("nord", ["nord"]), action("pin-to-compare", ["pin to compare"])];

    expect(focusedCommand(commands, "nord")?.id).toBe("nord");
  });

  it("picks the strongest action when several actions match", () => {
    const commands = [
      theme("rose-pine", ["rose pine"]),
      action("export-json", ["export to json"]),
      action("copy", ["copy export"]),
    ];

    // "export" prefix-matches "export to json" (tier 1) but is only a subsequence
    // of "copy export" (tier 2), so the prefix action wins focus.
    expect(focusedCommand(commands, "export")?.id).toBe("export-json");
  });

  it("seeds focus at the first entry for an empty query", () => {
    const commands = [theme("nord", ["nord"]), action("pin-to-compare", ["pin to compare"])];

    expect(buildPaletteEntries(commands, "", false).defaultFocusIndex).toBe(0);
  });

  it("collapses actions to the More actions teaser at rest", () => {
    const commands = [theme("nord", ["nord"]), action("pin-to-compare", ["pin to compare"])];
    const { collapsed, entries, defaultFocusIndex } = buildPaletteEntries(commands, "", false);

    expect(collapsed).toBe(true);
    expect(entries.at(-1)?.kind).toBe("more-actions");
    expect(defaultFocusIndex).toBe(0);
  });
});
