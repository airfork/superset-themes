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

function universalTransitionBody(): string {
  const rule = globalCss.match(/\*,\s*\*::before,\s*\*::after\s*\{\s*(?<body>[^}]+)\}/);

  if (!rule?.groups?.body) {
    throw new Error("Missing global transition rule");
  }

  return rule.groups.body;
}

function expectNoTransitionProperty(body: string, property: string): void {
  expect(body).not.toMatch(new RegExp(`(^|[,\\n]\\s*)${property}\\s+`));
}

describe("theme transition contracts", () => {
  it("does not animate text paint during theme swaps", () => {
    expectNoTransitionProperty(ruleBody(":root"), "color");

    const universal = universalTransitionBody();
    expect(universal).toContain("background-color var(--app-transition)");
    expect(universal).toContain("border-color var(--app-transition)");
    expect(universal).toContain("box-shadow var(--app-transition)");
    expectNoTransitionProperty(universal, "color");
    expectNoTransitionProperty(universal, "fill");
    expectNoTransitionProperty(universal, "stroke");
    expectNoTransitionProperty(ruleBody(".rail-row"), "color");
  });
});
