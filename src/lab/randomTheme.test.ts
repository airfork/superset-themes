import { converter } from "culori";
import { describe, expect, it } from "vitest";
import { getThemeById } from "../data/fixtures";
import { checkThemeContrast } from "../theme-core/contrast";
import { exportThemeJson } from "../theme-core/exportTheme";
import { supersetThemeSchema } from "../theme-core/schema";
import {
  generateRandomTheme,
  type RandomThemeTokenGroup,
  rerollRandomThemeGroup,
} from "./randomTheme";

const auroraLight = getThemeById("aurora-light");

if (!auroraLight) {
  throw new Error("Expected aurora-light fixture to exist.");
}

const toOklch = converter("oklch");

describe("generateRandomTheme", () => {
  it("returns deterministic valid themes for a seed", () => {
    const first = generateRandomTheme({ mode: "dark", seed: "atlas" });
    const second = generateRandomTheme({ mode: "dark", seed: "atlas" });

    expect(first).toEqual(second);
    expect(supersetThemeSchema.safeParse(first).success).toBe(true);
    expect(first).toMatchObject({
      author: "Superset Theme Lab",
      id: "generated-atlas-dark",
      name: "Generated Atlas Dark",
      type: "dark",
      version: 1,
    });
  });

  it("generates light and dark mode surfaces with passing contrast", () => {
    const lightTheme = generateRandomTheme({ mode: "light", seed: "contrast-check" });
    const darkTheme = generateRandomTheme({ mode: "dark", seed: "contrast-check" });

    expect(lightTheme.type).toBe("light");
    expect(darkTheme.type).toBe("dark");
    expect(checkThemeContrast(lightTheme).issues).toEqual([]);
    expect(checkThemeContrast(darkTheme).issues).toEqual([]);
  });

  it("keeps locked token groups from the base theme", () => {
    const generated = generateRandomTheme({
      baseTheme: auroraLight,
      locks: {
        surfaces: true,
        terminal: true,
      },
      mode: "light",
      seed: "locked-groups",
    });

    expect(generated.ui.background).toBe(auroraLight.ui.background);
    expect(generated.ui.card).toBe(auroraLight.ui.card);
    expect(generated.terminal.background).toBe(auroraLight.terminal.background);
    expect(generated.terminal.blue).toBe(auroraLight.terminal.blue);
    expect(generated.ui.accent).not.toBe(auroraLight.ui.accent);
  });

  it("keeps generated accent hues inside a requested range", () => {
    const theme = generateRandomTheme({
      hueRange: { max: 220, min: 180 },
      mode: "dark",
      seed: "narrow-hue",
    });
    const accent = toOklch(theme.ui.accent);

    expect(accent?.h).toBeGreaterThanOrEqual(180);
    expect(accent?.h).toBeLessThanOrEqual(220);
  });

  it("rerolls only the requested unlocked token group", () => {
    const groups: RandomThemeTokenGroup[] = ["surfaces", "accent", "terminal", "highlights"];
    const rerolled = rerollRandomThemeGroup({
      group: "accent",
      seed: "reroll-accent",
      theme: auroraLight,
    });

    expect(groups).toContain("accent");
    expect(rerolled.ui.accent).not.toBe(auroraLight.ui.accent);
    expect(rerolled.ui.background).toBe(auroraLight.ui.background);
    expect(rerolled.terminal.background).toBe(auroraLight.terminal.background);
    expect(rerolled.ui.selection).toBe(auroraLight.ui.selection);
  });

  it("exports generated themes without catalog metadata", () => {
    const theme = generateRandomTheme({ mode: "light", seed: "clean-export" });
    const exported = JSON.parse(exportThemeJson(theme));

    expect(exported).toMatchObject({
      id: "generated-clean-export-light",
      type: "light",
    });
    expect(exported).not.toHaveProperty("pairGroup");
    expect(exported).not.toHaveProperty("source");
  });
});
