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
  it("keeps the command palette search divider at the normal Superset border", () => {
    expect(ruleBody(".palette__search")).toContain(
      "border-bottom: 1px solid var(--preview-ui-border)",
    );
    expect(globalCss).not.toContain(".palette__search:has(.palette__input:focus-visible)");
  });

  it("uses the normal Superset palette divider instead of a focus-darkened rule", () => {
    expect(ruleBody(".palette__search")).toContain(
      "border-bottom: 1px solid var(--preview-ui-border)",
    );
    expect(globalCss).not.toContain("border-bottom-color: var(--preview-ui-ring)");
  });

  it("keeps the palette search icon muted like the live command input", () => {
    const body = ruleBody(".palette__search-icon");

    expect(body).toContain("color: var(--preview-ui-foreground)");
    expect(body).toContain("opacity: 0.5");
  });
});
