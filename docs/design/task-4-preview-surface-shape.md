# Task 4 Preview Surface Shape Brief

## Feature Summary

Task 4 builds the reusable preview surface system for Superset Theme Catalog. It gives later catalog, detail, compare, Storybook, and lab screens one shared way to inspect how a theme behaves across realistic editor surfaces.

The feature is for developers and theme authors comparing daily-use editor themes. It must reveal practical theme behavior, not just decorative swatches.

## Primary User Action

Switch between preview tabs and immediately understand how the selected theme handles the workspace, editor, terminal, diff, command palette, and settings/form surfaces.

## Design Direction

- Color strategy: restrained app chrome. Theme colors carry the variety.
- Scene sentence: a developer is comparing editor themes on a large monitor before changing a daily-use workspace, moving quickly between exact surface inspection and light/dark pairing.
- Anchor references: Linear for dense product confidence, Raycast for command-surface clarity, VS Code for familiar editor structure.
- Visual probe result: use the tabbed inspector lane as the primary implementation direction. Borrow the dense composite lane for future catalog cards. Keep the pair comparison lane for the compare workflow.

## Scope

- Fidelity: production-ready component foundation, visually restrained but polished.
- Breadth: reusable preview frame, tab controls, six preview surfaces, base UI controls needed by the surfaces.
- Interactivity: shipped-quality tab switching and semantic controls; no fake decorative tabs.
- Time intent: implement enough quality now that later catalog and lab screens reuse the system instead of rewriting preview UI.

## Layout Strategy

The preview system should feel like a compact developer workspace inside a neutral frame. `PreviewFrame` owns the themed container and stable dimensions. `PreviewTabs` owns the inspection mode and keyboard-accessible tab semantics.

The `Workspace` tab is the broadest surface: file tree, editor, terminal/status strip, command or agent context. Other tabs are focused inspection modes. Each tab should use enough realistic UI detail to reveal theme problems without becoming a full editor clone.

Avoid nested cards. Use panel divisions, toolbars, tab strips, gutters, and subtle borders. The app chrome stays neutral and restrained; the preview interior receives the selected theme variables.

## Key States

- Default: one selected theme, `Workspace` selected, all preview surfaces available.
- Tab selected: active tab must be visually and semantically selected.
- Keyboard focus: visible focus on tabs and interactive controls.
- Disabled: include disabled controls inside `Settings/Form`.
- Error and warning: include validation-style messages inside `Settings/Form` and terminal warning/error lines.
- Empty: command palette or file list should include at least one empty or muted row state.
- Selection: editor, terminal, and diff surfaces must show selected text or selected rows.
- Reduced motion: tab changes can use subtle opacity/transform if implemented, but must remain usable with reduced motion.

## Interaction Model

- Tabs switch content on click and keyboard activation.
- Arrow-key tab navigation should be supported by the shared `Tabs` component if practical in Task 4.
- Icon-only controls need accessible labels.
- Preview components should avoid side effects. They receive a theme and selected tab, then render.
- Storybook should expose light and dark fixture examples and individual tab states.

## Content Requirements

Use realistic but short developer-tool content:

- File names: `app.ts`, `theme.json`, `PreviewFrame.tsx`, `tokens.css`.
- Editor code: theme import, token mapping, small function call, comments, active line, cursor.
- Terminal lines: success, warning, error, selected output, ANSI swatches.
- Diff lines: added, removed, modified, inline marker.
- Command palette: search input, active command, shortcut labels, disabled or unavailable item.
- Settings/form: labeled inputs, select or segmented control, toggle/checkbox, primary/secondary/destructive buttons, validation message.

Copy should stay operational. Do not explain how the app works inside the UI.

## Recommended References

- Impeccable product register for restrained, task-first UI.
- Impeccable shape reference for preserving this brief during implementation.
- Vercel React best practices for stable React component boundaries and avoiding avoidable rerenders.
- Web Interface Guidelines review after the implementation exists.

## Implementation Notes

- Use semantic tab markup or a small accessible tab abstraction.
- Keep preview dimensions stable with explicit min/max and responsive behavior.
- Use the `themeCssVars` mapping from Task 3 rather than duplicating token mapping in components.
- Prefer small focused files over one large preview file if surfaces become hard to scan.
- Do not introduce catalog filtering, pair compare state, or lab behavior in Task 4.

## Open Questions

No blocking questions. Confirm this brief before Task 4 implementation starts.
