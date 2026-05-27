# Agent Instructions

Use these instructions for all agent work in this repo.

## Working Style

- Use superpowers when possible.
- Default to taking action on implementation, cleanup, debugging, and review-remediation requests once intent is clear.
- Ask only when a choice is risky, destructive, or cannot be inferred from repo context.
- Do not revert, overwrite, or clean up unrelated user changes in a dirty worktree unless explicitly asked.
- Sub-agents are approved by default for broad reviews, independent implementation slices, and parallel repo exploration when they materially improve coverage.
- Prefer the Browser plugin for local app inspection, screenshots, and interaction checks. Use Chrome only when the user explicitly needs their Chrome profile, cookies, extensions, or an existing Chrome tab.

## Resumability

- Treat resumability as a first-class requirement.
- Keep durable state in repo-local docs, not chat-only notes.
- Update `docs/STATUS.md` after meaningful checkpoints with current state, next step, verification, and blockers.
- For long implementation runs, keep the active plan checkboxes current in `docs/superpowers/plans/`.
- Commit at good stopping points. Avoid leaving a massive dirty file list at the end of a large task.
- If work stops mid-task, leave the repo in a state where another agent can resume from `docs/STATUS.md`, the active plan, and git status.

## RTK Shell Usage

RTK is installed and should be used for shell commands. Prefix shell commands with `rtk` by default, for example:

```bash
rtk git status
rtk pnpm check
rtk pnpm test
```

Use `rtk proxy <cmd>` only when raw unfiltered output is needed for debugging.

RTK is an agent execution wrapper only. Do not include `rtk` in README files, command references, setup instructions, website docs, or other user-facing command snippets. Keep `rtk` only in agent-facing instructions, internal plans, and actual shell commands run by agents.

## Required Project Constraints

- Use a Node-based static web app.
- Use `pnpm` for package management.
- Use `biome` for formatting and linting.
- Use React, TypeScript, Vite, and TanStack Router unless the design docs are explicitly changed.
- Use Vercel React best practices when writing or reviewing React code.
- Keep app-specific metadata out of exported theme JSON.

## Design and Review Requirements

- Use `PRODUCT.md` and `DESIGN.md` as the design context.
- Use Impeccable heavily for UI shaping, critique, polish, and refinement.
- Run Impeccable critique loops for major catalog, detail, compare, and lab screens.
- Use Web Interface Guidelines reviews against actual UI files during implementation and polish. Fetch the latest rules at review time.
- Use UI/UX Pro Max as a secondary source for accessibility, responsive behavior, motion, typography, and interaction checks.

## Verification

Before claiming work is complete, run the relevant verification and report the exact command.

Expected verification once the app is scaffolded:

```bash
rtk pnpm check
rtk pnpm test
rtk pnpm test:e2e
rtk pnpm build
```

If verification is skipped or blocked, say that plainly and record it in `docs/STATUS.md`.

