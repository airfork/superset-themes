import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readStyleSheetGraph } from "./styleTestUtils";

describe("readStyleSheetGraph", () => {
  it("inlines relative CSS imports in source order", () => {
    const root = mkdtempSync(join(tmpdir(), "style-graph-"));

    try {
      mkdirSync(join(root, "parts"));
      writeFileSync(
        join(root, "global.css"),
        '@import "./parts/base.css";\n.root { display: grid; }\n',
      );
      writeFileSync(join(root, "parts/base.css"), ".base { color: red; }\n");

      expect(readStyleSheetGraph(join(root, "global.css"))).toContain(
        ".base { color: red; }\n.root { display: grid; }",
      );
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });
});
