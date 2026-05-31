import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { collectCleanupTargets, runCleanup } from "./archive-clean.mjs";

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function makeWorkspace() {
  const rootPath = await mkdtemp(path.join(tmpdir(), "superset-themes-archive-clean-"));
  await writeFile(path.join(rootPath, "package.json"), JSON.stringify({ name: "superset-themes" }));

  for (const directory of [
    "node_modules",
    "dist",
    "test-results",
    ".cache",
    ".superpowers",
    "src",
  ]) {
    await rm(path.join(rootPath, directory), { force: true, recursive: true });
    await mkdir(path.join(rootPath, directory), { recursive: true });
  }

  for (const [relativePath, contents] of [
    [".env", "SECRET=1"],
    [".env.local", "LOCAL=1"],
    [".env.example", "EXAMPLE=1"],
    ["app.log", "log"],
    ["pnpm-debug.log", "debug"],
    ["src/keep.ts", "export const keep = true;"],
  ]) {
    await writeFile(path.join(rootPath, relativePath), contents);
  }

  return rootPath;
}

test("collectCleanupTargets includes archive-only generated and local files", async () => {
  const rootPath = await makeWorkspace();
  try {
    const targets = await collectCleanupTargets(rootPath);
    const relativePaths = targets.map((target) => target.relativePath).sort();

    assert.deepEqual(relativePaths, [
      ".cache",
      ".env",
      ".env.local",
      ".superpowers",
      "app.log",
      "dist",
      "node_modules",
      "pnpm-debug.log",
      "test-results",
    ]);
  } finally {
    await rm(rootPath, { force: true, recursive: true });
  }
});

test("runCleanup supports dry-run and removes only explicit archive targets", async () => {
  const rootPath = await makeWorkspace();
  const output = [];

  try {
    const dryRunResult = await runCleanup({
      dryRun: true,
      rootPath,
      stdout: (message) => output.push(message),
    });

    assert.equal(dryRunResult.removed, 0);
    assert.ok(await exists(path.join(rootPath, "node_modules")));
    assert.ok(output.some((message) => message.includes("would remove node_modules")));

    const cleanupResult = await runCleanup({
      rootPath,
      stdout: (message) => output.push(message),
    });

    assert.equal(cleanupResult.removed, 9);
    assert.equal(await exists(path.join(rootPath, "node_modules")), false);
    assert.equal(await exists(path.join(rootPath, "dist")), false);
    assert.equal(await exists(path.join(rootPath, ".env")), false);
    assert.equal(await exists(path.join(rootPath, ".env.local")), false);
    assert.equal(await exists(path.join(rootPath, "app.log")), false);
    assert.equal(await exists(path.join(rootPath, ".env.example")), true);
    assert.equal(await exists(path.join(rootPath, "src/keep.ts")), true);
    assert.equal(
      await readFile(path.join(rootPath, "src/keep.ts"), "utf8"),
      "export const keep = true;",
    );
  } finally {
    await rm(rootPath, { force: true, recursive: true });
  }
});

test("runCleanup refuses to run outside the superset-themes package", async () => {
  const rootPath = await mkdtemp(path.join(tmpdir(), "not-superset-themes-"));
  await writeFile(path.join(rootPath, "package.json"), JSON.stringify({ name: "other" }));

  try {
    await assert.rejects(
      runCleanup({
        rootPath,
        stdout: () => {},
      }),
      /Expected package\.json name "superset-themes"/,
    );
  } finally {
    await rm(rootPath, { force: true, recursive: true });
  }
});
