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

describe("focus contracts", () => {
  it("keeps the command palette input visibly focused without boxing the panel edge", () => {
    const focusRule = globalCss.match(
      /\.palette__search:has\(\.palette__input:focus-visible\)\s*\{(?<body>[^}]+)\}/,
    );

    expect(focusRule?.groups?.body).toContain("border-bottom-color:");
    expect(focusRule?.groups?.body).not.toContain("outline: none");
  });

  it("keeps the palette search icon muted like the live command input", () => {
    const body = ruleBody(".palette__search-icon");

    expect(body).toContain("color: var(--preview-ui-foreground)");
    expect(body).toContain("opacity: 0.5");
  });
});
