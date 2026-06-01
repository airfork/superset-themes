import { describe, expect, it } from "vitest";
import { getThemeById } from "../data/fixtures";
import { parseImportedThemeJson } from "./importTheme";

const auroraLight = getThemeById("aurora-light");

if (!auroraLight) {
  throw new Error("Expected aurora-light fixture to exist.");
}

describe("parseImportedThemeJson", () => {
  it("imports valid Superset theme JSON", () => {
    const result = parseImportedThemeJson(JSON.stringify(auroraLight));

    expect(result).toMatchObject({
      ok: true,
      theme: {
        id: "aurora-light",
        name: "Aurora Light",
      },
    });
  });

  it("imports Superset marketplace and starter download JSON", () => {
    const result = parseImportedThemeJson(
      JSON.stringify({
        author: "You",
        description: "Custom Superset theme",
        id: "my-custom-theme",
        name: "My Custom Theme",
        terminal: {
          background: "#ffffff",
          black: "#2e3436",
          blue: "#3465a4",
          brightBlack: "#555753",
          brightBlue: "#729fcf",
          brightCyan: "#34e2e2",
          brightGreen: "#8ae234",
          brightMagenta: "#ad7fa8",
          brightRed: "#ef2929",
          brightWhite: "#eeeeec",
          brightYellow: "#fce94f",
          cursor: "#000000",
          cursorAccent: "#ffffff",
          cyan: "#06989a",
          foreground: "#000000",
          green: "#4e9a06",
          magenta: "#75507b",
          red: "#cc0000",
          selectionBackground: "#add6ff",
          white: "#d3d7cf",
          yellow: "#c4a000",
        },
        type: "light",
        ui: {
          accent: "oklch(0.93 0 0)",
          accentForeground: "oklch(0.205 0 0)",
          background: "oklch(1 0 0)",
          border: "oklch(0.922 0 0)",
          card: "oklch(0.97 0 0)",
          cardForeground: "oklch(0.145 0 0)",
          chart1: "oklch(0.646 0.222 41.116)",
          chart2: "oklch(0.6 0.118 184.704)",
          chart3: "oklch(0.398 0.07 227.392)",
          chart4: "oklch(0.828 0.189 84.429)",
          chart5: "oklch(0.769 0.188 70.08)",
          destructive: "oklch(0.577 0.245 27.325)",
          destructiveForeground: "oklch(0.985 0 0)",
          foreground: "oklch(0.145 0 0)",
          highlight: "oklch(0.646 0.222 41.116)",
          highlightActive: "rgba(255, 150, 50, 0.55)",
          highlightForeground: "oklch(0.985 0 0)",
          highlightMatch: "rgba(255, 211, 61, 0.35)",
          input: "oklch(0.922 0 0)",
          muted: "oklch(0.97 0 0)",
          mutedForeground: "oklch(0.556 0 0)",
          popover: "oklch(0.97 0 0)",
          popoverForeground: "oklch(0.145 0 0)",
          primary: "oklch(0.205 0 0)",
          primaryForeground: "oklch(0.985 0 0)",
          ring: "oklch(0.708 0 0)",
          secondary: "oklch(0.97 0 0)",
          secondaryForeground: "oklch(0.205 0 0)",
          sidebar: "oklch(0.985 0 0)",
          sidebarAccent: "oklch(0.97 0 0)",
          sidebarAccentForeground: "oklch(0.205 0 0)",
          sidebarBorder: "oklch(0.922 0 0)",
          sidebarForeground: "oklch(0.145 0 0)",
          sidebarPrimary: "oklch(0.205 0 0)",
          sidebarPrimaryForeground: "oklch(0.985 0 0)",
          sidebarRing: "oklch(0.708 0 0)",
          tertiary: "oklch(0.95 0.003 40)",
          tertiaryActive: "oklch(0.90 0.003 40)",
        },
      }),
    );

    expect(result).toMatchObject({
      ok: true,
      theme: {
        id: "my-custom-theme",
        terminal: {
          selection: "#add6ff",
          selectionForeground: "#000000",
        },
        ui: {
          background: "#ffffff",
          foreground: "#0a0a0a",
          selectionForeground: "#fafafa",
        },
        version: 1,
      },
    });
  });

  it("returns a readable invalid JSON error", () => {
    const result = parseImportedThemeJson("{ nope");

    expect(result).toEqual({
      error: "Invalid JSON: expected property name or '}' at line 1 column 3",
      ok: false,
    });
  });

  it("returns schema errors for non-theme JSON", () => {
    const result = parseImportedThemeJson(JSON.stringify({ id: "not-enough" }));

    if (result.ok) {
      throw new Error("Expected schema import to fail.");
    }

    expect(result.error).toContain("Theme schema error:");
    expect(result.error).toContain("author");
  });
});
