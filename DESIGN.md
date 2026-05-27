# Design Direction

## Product Scene

A developer is comparing editor themes on a large monitor before changing a daily-use workspace, moving quickly between catalog browsing, exact surface inspection, and light/dark pairing.

## Interface Register

Product UI. The design serves comparison, inspection, and editing. It should be dense enough for repeated use, but not cramped.

## Design Principles

- Use a restrained base interface so theme previews carry the visual variety.
- Do not make the app itself strongly light-only or dark-only. The chrome should support accurate light and dark theme previews without competing with them.
- Use semantic design tokens and OKLCH where practical. Avoid raw ad hoc component colors.
- Use stable dimensions for preview cards, preview tabs, swatches, comparison slots, and controls.
- Prefer inline panels, drawers, and persistent regions before modals.
- Keep visible copy short and operational. Avoid explanatory marketing text.
- Use SVG icons from one icon family when icons are needed. Do not use emoji as structural icons.
- Respect keyboard navigation, visible focus, reduced motion, contrast, and responsive behavior from the first UI pass.

## Required Design QA

- Use Impeccable heavily during UI shaping, critique, polish, and refinement.
- Run Impeccable critique loops on both light and dark preview states before accepting major UI changes.
- Use Web Interface Guidelines reviews against actual UI files during implementation and polish. Fetch the latest guidelines at review time.
- Use UI/UX Pro Max as a secondary design intelligence source for interaction, accessibility, responsive behavior, and quality checks.

## Tooling Constraints

- Node-based project.
- `pnpm` is required for package management.
- `biome` is required for formatting and linting.
- Verification should include type checking, lint/format checks, unit tests for theme logic, and browser tests for catalog and preview behavior.

