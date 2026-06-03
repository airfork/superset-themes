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

  it("keeps the focused command palette input visually borderless like Superset", () => {
    expect(ruleBody(".palette__input:focus")).toContain("outline: 0");
    expect(globalCss).not.toContain(".palette__input:focus-visible");
  });

  it("keeps the palette search icon muted like the live command input", () => {
    const body = ruleBody(".palette__search-icon");

    expect(body).toContain("color: var(--preview-ui-foreground)");
    expect(body).toContain("opacity: 0.5");
  });

  it("fills the palette active/hover rows from the derived popover bands, not raw accent", () => {
    // Raw accent makes the focused and hover rows invisible on themes that set
    // accent == popover (Gruvbox Light, Solarized); the derived tokens guarantee a band.
    expect(ruleBody(".palette__option:hover")).toContain(
      "background: var(--preview-popover-hover)",
    );

    // The active rule lists two selectors; match the one that directly precedes the body.
    const activeBody = ruleBody(".palette__option[data-active]:hover");
    expect(activeBody).toContain("background: var(--preview-popover-active)");
    expect(activeBody).toContain("color: var(--preview-popover-active-foreground)");
  });
});
