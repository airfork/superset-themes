import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readStyleSheetGraph } from "./styleTestUtils";

const globalCss = readStyleSheetGraph(join(process.cwd(), "src/styles/global.css"));

function ruleBody(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = globalCss.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[^}]+)\\}`));

  if (!rule?.groups?.body) {
    throw new Error(`Missing CSS rule for ${selector}`);
  }

  return rule.groups.body;
}

describe("rail style contracts", () => {
  it("keeps selected rail rows neutral instead of tinting them with theme accents", () => {
    const body = ruleBody(".rail-row[data-selected]");

    expect(body).toContain("var(--preview-ui-foreground)");
    expect(body).not.toContain("var(--preview-ui-primary)");
    expect(body).not.toContain("var(--preview-ui-accent)");
    expect(body).not.toContain("var(--row-accent)");
    expect(globalCss).not.toContain(':root[data-theme-type="light"] .rail-row[data-selected]');
  });

  it("does not use the row accent for rail hover fills", () => {
    const body = ruleBody(".rail-row:hover");

    expect(body).toContain("var(--preview-ui-foreground)");
    expect(body).not.toContain("var(--row-accent)");
  });

  it("uses an explicit neutral mode badge instead of a color-as-mode dot", () => {
    expect(globalCss).not.toContain(".rail-row__dot");
    expect(ruleBody(".rail-row__mode")).toContain("color: var(--preview-ui-foreground)");
    expect(ruleBody(".rail-row__mode")).toContain("border: 1px solid");
  });
});
