import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("themes-generate emits catalog-schema theme JSON", () => {
  const result = spawnSync(
    "pnpm",
    ["exec", "tsx", "scripts/themes-generate.mjs", "--", "--seed", "script-test", "--mode", "dark"],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  const generated = JSON.parse(result.stdout);

  assert.equal(generated.version, 1);
  assert.equal(typeof generated.ui.selection, "string");
  assert.equal(typeof generated.ui.selectionForeground, "string");
  assert.equal(typeof generated.terminal.selection, "string");
  assert.equal(typeof generated.terminal.selectionForeground, "string");
});
