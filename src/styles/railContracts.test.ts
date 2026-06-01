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

describe("rail style contracts", () => {
  it("softens light-theme selected rows with accent instead of primary ink", () => {
    const body = ruleBody(':root[data-theme-type="light"] .rail-row[data-selected]');

    expect(body).toContain("var(--preview-ui-accent)");
    expect(body).not.toContain("var(--preview-ui-primary)");
  });
});
