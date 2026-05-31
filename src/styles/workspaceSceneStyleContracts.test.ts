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

  it("paints the Claude terminal with terminal tokens instead of UI foreground tokens", () => {
    expect(ruleBody(".scene-workspace__terminal")).toContain(
      "background: var(--preview-terminal-background)",
    );
    expect(ruleBody(".scene-workspace__terminal-output")).toContain(
      "var(--preview-terminal-foreground)",
    );
    expect(ruleBody(".scene-workspace__prompt")).toContain(
      "color: var(--preview-terminal-foreground)",
    );
    expect(ruleBody(".scene-workspace__terminal-cursor")).toContain(
      "background: var(--preview-terminal-cursor)",
    );
  });
});
