import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const globalCss = readFileSync(join(process.cwd(), "src/styles/global.css"), "utf8");

describe("focus contracts", () => {
  it("keeps the command palette input visibly focused without boxing the panel edge", () => {
    const focusRule = globalCss.match(
      /\.palette__search:has\(\.palette__input:focus-visible\)\s*\{(?<body>[^}]+)\}/,
    );

    expect(focusRule?.groups?.body).toContain("border-bottom-color:");
    expect(focusRule?.groups?.body).not.toContain("outline: none");
  });
});
