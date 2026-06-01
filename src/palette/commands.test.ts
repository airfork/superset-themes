// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { BASELINE_IDS } from "../data/baseline";
import { catalogThemes } from "../data/catalog";
import { FEATURED_IDS } from "../data/featured";
import { exportThemeJson } from "../theme-core/exportTheme";
import { buildThemeCommands, downloadThemeJsonCommand } from "./commands";

function entryFor(id: string) {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

describe("buildThemeCommands", () => {
  it("orders theme commands Superset-first, then Featured, so ⌘K echoes the rail at rest", () => {
    // The rail leads with the baseline and featured blocks; the palette's resting order (which
    // the empty-query fuzzy pass preserves) must match so a user can transfer
    // their mental model between the two search surfaces.
    const commands = buildThemeCommands(() => {});
    expect(
      commands.slice(0, BASELINE_IDS.length + FEATURED_IDS.length).map((command) => command.id),
    ).toEqual([...BASELINE_IDS, ...FEATURED_IDS]);
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

describe("downloadThemeJsonCommand", () => {
  it("is an Actions command discoverable by download, export, and json", () => {
    const command = downloadThemeJsonCommand(entryFor("tokyo-night"));

    expect(command.section).toBe("Actions");
    expect(command.label).toMatch(/download theme json/i);
    expect(command.keys).toEqual(expect.arrayContaining(["download", "export", "json"]));
  });

  it("downloads the exported theme JSON when run", async () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:theme-json");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const clicked: { download?: string; href?: string }[] = [];
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push({ download: this.download, href: this.href });
    });
    const entry = entryFor("rose-pine-dawn");

    downloadThemeJsonCommand(entry).run();

    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(await blob.text()).toBe(exportThemeJson(entry));
    expect(clicked).toEqual([{ download: "rose-pine-dawn.json", href: "blob:theme-json" }]);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:theme-json");
    click.mockRestore();
  });
});
