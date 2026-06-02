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
  it("uses Superset's sidebar token family for sidebar chrome labels", () => {
    expect(ruleBody(".scene-workspace__nav a")).toContain(
      "color: var(--preview-ui-sidebar-foreground)",
    );
    expect(ruleBody(".scene-workspace__session")).toContain(
      "color: var(--preview-ui-muted-foreground)",
    );
    expect(ruleBody(".scene-workspace__tab")).toContain(
      "color: var(--preview-ui-muted-foreground)",
    );
  });

  it("paints the workspace rail as a translucent muted fill, matching Superset's bg-muted/35", () => {
    // Superset 1.12.1 renders the team/workspace rail as `bg-muted/45 dark:bg-muted/35`
    // (a translucent --muted fill over the canvas), verified live via CDP, not the solid
    // --sidebar token. The preview mirrors that formula so the catalog matches the app.
    expect(globalCss).toContain(
      "--scene-workspace-sidebar: color-mix(in oklab, var(--preview-ui-muted) 35%, transparent)",
    );
    expect(globalCss).toContain(':root[data-theme-type="light"] .scene-workspace');
    expect(ruleBody(".scene-workspace__rail")).toContain(
      "background: var(--scene-workspace-sidebar)",
    );
    expect(ruleBody(".scene-workspace__rail")).toContain(
      "border-right: 1px solid var(--preview-ui-sidebar-border)",
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

  it("keeps top-level navigation muted because only the nested thread row is active", () => {
    expect(ruleBody(".scene-workspace__nav a")).toContain("font-size: 14px");
    expect(ruleBody(".scene-workspace__nav a")).toContain("font-weight: 500");
    expect(ruleBody(".scene-workspace__nav a")).toContain("line-height: 20px");
    expect(ruleBody(".scene-workspace__nav a")).toContain(
      "color: var(--preview-ui-sidebar-foreground)",
    );
    expect(globalCss).not.toContain('.scene-workspace__nav a[aria-current="page"]');
  });

  it("uses Superset's 14px sidebar rhythm for team, project, and active thread rows", () => {
    expect(ruleBody(".scene-workspace__team")).toContain("font-size: 14px");
    expect(ruleBody(".scene-workspace__team")).toContain("font-weight: 500");
    expect(ruleBody(".scene-workspace__team")).toContain("line-height: 20px");
    expect(ruleBody(".scene-workspace__project-header")).toContain("font-size: 14px");
    expect(ruleBody(".scene-workspace__project-header")).toContain("font-weight: 500");
    expect(ruleBody(".scene-workspace__project-header")).toContain("line-height: 20px");
    expect(ruleBody(".scene-workspace__branches li")).toContain("font-size: 14px");
    expect(ruleBody(".scene-workspace__branches li")).toContain("line-height: 20px");
    expect(ruleBody(".scene-workspace__branches li[data-active]")).toContain(
      "background: var(--scene-workspace-active-row)",
    );
    expect(ruleBody(".scene-workspace__branches li[data-active]")).toContain(
      "color: var(--preview-ui-sidebar-accent-foreground)",
    );
  });
});
