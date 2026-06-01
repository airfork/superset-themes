import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const globalCss = readFileSync(join(process.cwd(), "src/styles/global.css"), "utf8");

function ruleBody(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = globalCss.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[^}]+)\\}`));

  if (!rule?.groups?.body) {
    throw new Error(`Missing CSS rule for ${selector}`);
  }

  return rule.groups.body;
}

describe("workspace scene style contracts", () => {
  it("uses Superset's muted foreground token for secondary chrome labels", () => {
    expect(ruleBody(".scene-workspace__nav a")).toContain(
      "color: var(--preview-ui-muted-foreground)",
    );
    expect(ruleBody(".scene-workspace__session")).toContain(
      "color: var(--preview-ui-muted-foreground)",
    );
    expect(ruleBody(".scene-workspace__tab")).toContain(
      "color: var(--preview-ui-muted-foreground)",
    );
  });

  it("uses the live Superset dark shell layers instead of hand-tinted sidebars", () => {
    expect(ruleBody(".scene-workspace")).toContain(
      "--scene-workspace-muted-layer: color-mix(in srgb, var(--preview-ui-muted) 45%, transparent)",
    );
    expect(globalCss).toContain(':root[data-theme-type="dark"] .scene-workspace');
    expect(globalCss).toContain(
      "--scene-workspace-muted-layer: color-mix(in srgb, var(--preview-ui-muted) 35%, transparent)",
    );
    expect(ruleBody(".scene-workspace__sessions")).toContain(
      "background: var(--preview-ui-background)",
    );
  });

  it("paints the Claude terminal with terminal tokens instead of UI foreground tokens", () => {
    expect(ruleBody(".scene-workspace__terminal")).toContain(
      "background: var(--preview-terminal-background)",
    );
    expect(ruleBody(".scene-workspace__terminal")).toContain("font-size: 14px");
    expect(ruleBody(".scene-workspace__terminal-output")).toContain(
      "color: var(--preview-terminal-foreground)",
    );
    expect(ruleBody(".scene-workspace__prompt")).toContain(
      "color: var(--preview-terminal-foreground)",
    );
    expect(ruleBody(".scene-workspace__terminal-cursor")).toContain(
      "background: var(--preview-terminal-cursor)",
    );
  });

  it("keeps agent tabs quiet because the active Claude thread is named in the subheader", () => {
    expect(ruleBody(".scene-workspace__tab[data-active]")).toContain("background: transparent");
    expect(ruleBody(".scene-workspace__tab[data-active]")).toContain(
      "color: var(--preview-ui-muted-foreground)",
    );
  });
});
