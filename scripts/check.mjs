import { spawnSync } from "node:child_process";

const commands = [
  ["pnpm", ["lint"]],
  ["pnpm", ["typecheck"]],
  ["pnpm", ["test"]],
  ["pnpm", ["themes:research:test"]],
  ["pnpm", ["themes:generate:test"]],
  ["pnpm", ["site:metadata:test"]],
  ["pnpm", ["exec", "tsx", "--test", "scripts/vite-plugin-critical-theme.test.mjs"]],
  ["pnpm", ["archive:clean:test"]],
  ["pnpm", ["build"]],
];

for (const [command, args] of commands) {
  const label = [command, ...args].join(" ");
  console.log(`\n> ${label}`);

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    console.error(`\n${label} failed to start: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`\n${label} failed with exit code ${result.status ?? 1}.`);
    process.exit(result.status ?? 1);
  }
}
