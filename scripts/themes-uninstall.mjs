#!/usr/bin/env node
// Interactively remove custom (imported) themes from the Superset desktop app.
//
// Superset stores imported themes in ~/.superset/app-state.json under
// themeState.customThemes and has no in-app delete UI, so this script:
//   1. lists installed custom themes as a space-to-select checkbox list,
//   2. gates the action behind a y/n confirm,
//   3. quits Superset, removes the selected themes, and relaunches it.
//
// Usage:  node scripts/superset-theme.mjs   (or chmod +x and run directly)

import { spawn, spawnSync } from "node:child_process";
import { constants, copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const STATE_PATH = join(homedir(), ".superset", "app-state.json");
const APP_NAME = "Superset";

// Mirror Superset's own fallbacks (see theme store: removeCustomTheme).
const DEFAULT_THEME_ID = "dark";
const DEFAULT_LIGHT_THEME_ID = "light";
const DEFAULT_DARK_THEME_ID = "dark";

// --- tiny ANSI helpers -------------------------------------------------------
const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
};
const out = (s) => process.stdout.write(s);

function fail(msg) {
  console.error(`\n${c.yellow}${msg}${c.reset}`);
  process.exit(1);
}

function createBackup() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = `${STATE_PATH}.${stamp}.bak`;
  copyFileSync(STATE_PATH, backup, constants.COPYFILE_EXCL);
  return backup;
}

// --- load state --------------------------------------------------------------
if (!existsSync(STATE_PATH)) {
  fail(`Could not find Superset state at ${STATE_PATH}.\nIs Superset installed?`);
}

let state;
try {
  state = JSON.parse(readFileSync(STATE_PATH, "utf8"));
} catch (e) {
  fail(`Failed to parse ${STATE_PATH}: ${e.message}`);
}

const themeState = state.themeState ?? {};
const customThemes = Array.isArray(themeState.customThemes) ? themeState.customThemes : [];

if (customThemes.length === 0) {
  console.log(`\n${c.dim}No custom themes are installed in Superset.${c.reset}\n`);
  process.exit(0);
}

// --- checkbox multi-select ---------------------------------------------------
async function multiSelect(items) {
  if (!process.stdin.isTTY) {
    fail("This script needs an interactive terminal (TTY).");
  }

  const checked = new Array(items.length).fill(false);
  let cursor = 0;
  let rendered = 0;

  const header = [
    `${c.bold}Custom themes installed in Superset${c.reset}`,
    `${c.dim}↑/↓ move · space select · a toggle all · enter confirm · q cancel${c.reset}`,
    "",
  ];

  function render() {
    const lines = [...header];
    items.forEach((item, i) => {
      const pointer = i === cursor ? `${c.cyan}❯${c.reset}` : " ";
      const box = checked[i] ? `${c.green}◉${c.reset}` : `${c.dim}◯${c.reset}`;
      const active = item.id === themeState.activeThemeId ? `${c.dim} (active)${c.reset}` : "";
      const label = i === cursor ? `${c.cyan}${item.name}${c.reset}` : item.name;
      lines.push(`${pointer} ${box} ${label} ${c.dim}[${item.id}]${c.reset}${active}`);
    });
    const selectedCount = checked.filter(Boolean).length;
    lines.push("");
    lines.push(`${c.dim}${selectedCount} selected${c.reset}`);

    if (rendered > 0) out(`\x1b[${rendered}A`); // move cursor up to overwrite
    out("\x1b[0J"); // clear from cursor to end of screen
    out(`${lines.join("\n")}\n`);
    rendered = lines.length;
  }

  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    out("\x1b[?25l"); // hide cursor
    render();

    function cleanup() {
      out("\x1b[?25h"); // show cursor
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
    }

    function onData(key) {
      // Ctrl-C, q, Esc -> cancel
      if (key === "" || key === "q" || key === "") {
        cleanup();
        console.log(`\n${c.dim}Cancelled. No changes made.${c.reset}\n`);
        process.exit(0);
      }
      if (key === "[A" || key === "k") {
        cursor = (cursor - 1 + items.length) % items.length;
        render();
      } else if (key === "[B" || key === "j") {
        cursor = (cursor + 1) % items.length;
        render();
      } else if (key === " ") {
        checked[cursor] = !checked[cursor];
        render();
      } else if (key === "a") {
        const allOn = checked.every(Boolean);
        checked.fill(!allOn);
        render();
      } else if (key === "\r" || key === "\n") {
        cleanup();
        const selected = items.filter((_, i) => checked[i]);
        resolve(selected);
      }
    }

    stdin.on("data", onData);
  });
}

// --- single-line y/n prompt --------------------------------------------------
function confirm(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    out(`${question} ${c.dim}(y/N)${c.reset} `);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    stdin.once("data", (key) => {
      stdin.setRawMode(false);
      stdin.pause();
      const yes = key.toLowerCase() === "y";
      out(`${yes ? "y" : "n"}\n`);
      resolve(yes);
    });
  });
}

// --- app control -------------------------------------------------------------
// NOTE: don't use pgrep here. Superset runs background Node-mode child services
// (e.g. its terminal-host daemon) from the SAME MacOS/Superset binary, and they
// survive quitting the GUI — so `pgrep -x Superset` never drops to zero and the
// poll waits forever. AppleScript's `is running` tracks the actual GUI app and
// reports false once the window app has quit (and does not launch the app).
function isRunning() {
  const r = spawnSync("osascript", ["-e", `application "${APP_NAME}" is running`], {
    encoding: "utf8",
  });
  return r.stdout.trim() === "true";
}

// Send the quit Apple Event WITHOUT blocking. Superset has a "confirm before
// quitting" setting; when on, it shows its own dialog and the quit event won't
// complete until the user accepts it. So we fire-and-forget here and poll for
// the process to actually disappear in waitForQuit().
function requestQuit() {
  spawn("osascript", ["-e", `tell application "${APP_NAME}" to quit`], {
    detached: true,
    stdio: "ignore",
  }).unref();
}

async function waitForQuit(timeoutMs = 120000) {
  const start = Date.now();
  let nudged = false;
  while (Date.now() - start < timeoutMs) {
    if (!isRunning()) return true;
    if (!nudged) {
      out(`\n${c.dim}If Superset asks you to confirm quitting, accept it…${c.reset} `);
      nudged = true;
    }
    out(".");
    await sleep(500);
  }
  return false;
}

function launchApp() {
  spawnSync("open", ["-a", APP_NAME]);
}

// --- main --------------------------------------------------------------------
const selected = await multiSelect(customThemes);

if (selected.length === 0) {
  console.log(`\n${c.dim}Nothing selected. No changes made.${c.reset}\n`);
  process.exit(0);
}

const selectedIds = new Set(selected.map((t) => t.id));
console.log(`\n${c.bold}Will remove:${c.reset}`);
for (const t of selected) console.log(`  • ${t.name} ${c.dim}[${t.id}]${c.reset}`);

const running = isRunning();
const action = running
  ? "Quit Superset, remove these, and relaunch?"
  : "Remove these and launch Superset?";
const ok = await confirm(`\n${action}`);

if (!ok) {
  console.log(`\n${c.dim}Cancelled. No changes made.${c.reset}\n`);
  process.exit(0);
}

// 1. quit if running (state must be edited while the app is closed, or it
//    rewrites the file from memory on the next change)
if (running) {
  process.stdout.write("Quitting Superset…");
  requestQuit();
  const quit = await waitForQuit();
  if (!quit) {
    fail(
      "\nSuperset is still running, so nothing was changed.\nQuit Superset manually, then re-run.",
    );
  }
  console.log(" done");
}

// 2. backup and re-read after quit, in case the app flushed state while closing
const backup = createBackup();
console.log(`${c.dim}Backed up state -> ${backup}${c.reset}`);

// 3. edit
state = JSON.parse(readFileSync(STATE_PATH, "utf8"));
state.themeState ??= {};
const ts = state.themeState;
ts.customThemes = (ts.customThemes ?? []).filter((t) => !selectedIds.has(t.id));

// reset any references to removed themes, mirroring the app's own logic
if (selectedIds.has(ts.activeThemeId)) ts.activeThemeId = DEFAULT_THEME_ID;
if (selectedIds.has(ts.systemLightThemeId)) ts.systemLightThemeId = DEFAULT_LIGHT_THEME_ID;
if (selectedIds.has(ts.systemDarkThemeId)) ts.systemDarkThemeId = DEFAULT_DARK_THEME_ID;

writeFileSync(STATE_PATH, JSON.stringify(state, null, 2)); // match app's 2-space, no trailing newline
console.log(`${c.green}Removed ${selected.length} theme(s).${c.reset}`);

// 4. relaunch
process.stdout.write("Launching Superset… ");
launchApp();
console.log("done\n");
