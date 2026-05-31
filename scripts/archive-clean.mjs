#!/usr/bin/env node

import { readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIRECTORIES = [
  "node_modules",
  "dist",
  "build",
  "storybook-static",
  "coverage",
  "playwright-report",
  "test-results",
  ".vite",
  ".pnpm-store",
  ".turbo",
  ".cache",
  ".superpowers",
  ".worktrees",
  ".impeccable",
];

const ROOT_FILES = ["research-output.json", ".eslintcache"];

const LOG_FILE_PATTERNS = [
  /^.*\.log$/,
  /^npm-debug\.log.*$/,
  /^pnpm-debug\.log.*$/,
  /^yarn-debug\.log.*$/,
  /^yarn-error\.log.*$/,
];

async function pathExists(filePath) {
  try {
    return await stat(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function readPackageName(rootPath) {
  const packagePath = path.join(rootPath, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  return packageJson.name;
}

async function assertWorkspaceRoot(rootPath) {
  const packageName = await readPackageName(rootPath);
  if (packageName !== "superset-themes") {
    throw new Error(
      `Expected package.json name "superset-themes" before archive cleanup, found "${packageName}".`,
    );
  }
}

function isLocalEnvFile(fileName) {
  return fileName === ".env" || (fileName.startsWith(".env.") && fileName !== ".env.example");
}

function isLogFile(fileName) {
  return LOG_FILE_PATTERNS.some((pattern) => pattern.test(fileName));
}

function isSupersetInspectionScratch(fileName) {
  return fileName.startsWith("superset-inspect") && fileName.endsWith(".mjs");
}

async function addIfExists(targets, rootPath, relativePath) {
  const absolutePath = path.join(rootPath, relativePath);
  const entryStat = await pathExists(absolutePath);

  if (entryStat) {
    targets.push({
      absolutePath,
      relativePath,
    });
  }
}

async function collectRootGeneratedTargets(rootPath) {
  const targets = [];

  for (const relativePath of [...ROOT_DIRECTORIES, ...ROOT_FILES]) {
    await addIfExists(targets, rootPath, relativePath);
  }

  for (const entry of await readdir(rootPath, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    if (isLocalEnvFile(entry.name) || isLogFile(entry.name)) {
      await addIfExists(targets, rootPath, entry.name);
    }
  }

  return targets;
}

async function collectDirectoryPatternTargets(rootPath, directoryPath, predicate) {
  const targets = [];
  const absoluteDirectory = path.join(rootPath, directoryPath);
  const directoryStat = await pathExists(absoluteDirectory);

  if (!directoryStat?.isDirectory()) {
    return targets;
  }

  for (const entry of await readdir(absoluteDirectory, { withFileTypes: true })) {
    if (entry.isFile() && predicate(entry.name)) {
      await addIfExists(targets, rootPath, path.join(directoryPath, entry.name));
    }
  }

  return targets;
}

export async function collectCleanupTargets(rootPath = process.cwd()) {
  await assertWorkspaceRoot(rootPath);

  const targets = [
    ...(await collectRootGeneratedTargets(rootPath)),
    ...(await collectDirectoryPatternTargets(rootPath, "scripts", isSupersetInspectionScratch)),
    ...(await collectDirectoryPatternTargets(rootPath, path.join("docs", "review"), (fileName) =>
      fileName.endsWith(".png"),
    )),
  ];

  return targets.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

export async function runCleanup({
  dryRun = false,
  rootPath = process.env.CONDUCTOR_WORKSPACE_PATH || process.cwd(),
  stdout = (message) => console.log(message),
} = {}) {
  const resolvedRootPath = path.resolve(rootPath);
  const targets = await collectCleanupTargets(resolvedRootPath);

  if (targets.length === 0) {
    stdout("Archive cleanup: nothing to remove.");
    return { dryRun, removed: 0, targets };
  }

  for (const target of targets) {
    stdout(`Archive cleanup: ${dryRun ? "would remove" : "removing"} ${target.relativePath}`);

    if (!dryRun) {
      await rm(target.absolutePath, { force: true, recursive: true });
    }
  }

  return {
    dryRun,
    removed: dryRun ? 0 : targets.length,
    targets,
  };
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run"),
  };
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFilePath) {
  const options = parseArgs(process.argv.slice(2));

  runCleanup(options).catch((error) => {
    console.error(`Archive cleanup failed: ${error.message}`);
    process.exit(1);
  });
}
