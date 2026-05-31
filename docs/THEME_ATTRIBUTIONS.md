# Theme Attributions

This catalog keeps app metadata and attribution outside exported theme JSON. Theme files under
`src/data/themes/` remain Superset-compatible JSON; catalog source, license, and notes live in
`src/data/catalog.ts`.

## Reference Port Batch

The first upstream-port batch was adapted from `itsbariscan/superset-themes` at commit
`014ab42a784c4c5a976ce3764eb89c4b92b01907`.

Adaptations made for this app:

- Dropped fields outside this repo's current export schema.
- Converted selection backgrounds to six-digit hex tokens.
- Adjusted required foreground tokens where needed to satisfy the local contrast gate.

## Solarized

- Themes: `solarized-light`, `solarized-dark`
- Original theme: Solarized by Ethan Schoonover
- Source: <https://ethanschoonover.com/solarized>
- Source repository: <https://github.com/altercation/solarized>
- License: MIT
- Reference port: Baris Can Sayin

## Nord

- Theme: `nord`
- Original theme: Nord by Sven Greb / Arctic Ice Studio
- Source: <https://www.nordtheme.com>
- Source organization: <https://github.com/nordtheme>
- License: MIT
- Reference port: Baris Can Sayin

## Catppuccin Mocha

- Theme: `catppuccin-mocha`
- Original theme: Catppuccin Mocha by the Catppuccin organization
- Source: <https://github.com/catppuccin/catppuccin>
- Palette source: <https://github.com/catppuccin/palette>
- License: MIT
- Adaptation notes: Kept Mocha palette names and ANSI colors; mapped app chrome to this repo's
  Superset theme schema.

## Dracula

- Theme: `dracula`
- Original theme: Dracula by Zeno Rocha / Dracula Theme
- Source: <https://github.com/dracula/dracula-theme>
- Palette source: <https://draculatheme.com>
- License: MIT
- Adaptation notes: Kept the OSS palette values; used conservative foreground tokens where this
  app's preview surfaces need explicit action and destructive contrast.

## Gruvbox Dark

- Theme: `gruvbox-dark`
- Original theme: Gruvbox by Pavel Pertsev
- Source: <https://github.com/morhetz/gruvbox>
- License: MIT/X11
- Catalog license field: MIT/X11
- Adaptation notes: Used the dark medium palette and terminal colors from the original Vim theme;
  adjusted only schema mapping and required foreground relationships.

## Tokyo Night

- Theme: `tokyo-night`
- Original theme: Tokyo Night by Enkia
- Source: <https://github.com/tokyo-night/tokyo-night-vscode-theme>
- License: MIT
- Adaptation notes: Used the Tokyo Night dark palette and terminal colors; brightened terminal
  foreground/exported preview text where needed for this app's contrast gate.

## Rosé Pine Dawn

- Theme: `rose-pine-dawn`
- Original theme: Rosé Pine Dawn by the Rosé Pine organization
- Source: <https://github.com/rose-pine/rose-pine-theme>
- License: MIT
- Adaptation notes: Used the published Rosé Pine Dawn palette (base, surface, text, love, gold,
  rose, pine, foam, iris, subtle, highlight). Darkened the destructive/red token to a deeper
  ruby (#9c2c4b) to satisfy the local AA contrast gate against the cream background. The
  `ui.ring` token shifted from `#d7827e` (rose) to `#286983` (pine) so focus rings clear the
  WCAG 3:1 non-text contrast bar; the rose stays the row identity accent via `ui.accent`.

## One Dark

- Theme: `one-dark`
- Original theme: One Dark by the Atom team
- Source: <https://github.com/atom/atom>
- License: MIT
- Adaptation notes: Used the One Dark UI palette (#282c34 surfaces, #abb2bf foreground) and the
  Atom-lineage ANSI mapping. Used a near-black foreground on the cool blue primary and warm red
  destructive tokens for AA contrast against light accent surfaces.

## Superset Defaults

- Themes: `superset-light`, `superset-dark`
- Original themes: Superset built-in Light and Dark themes by Superset
- Source: <https://github.com/superset-sh/superset>
- License: Elastic License 2.0
- Adaptation notes: Export IDs use `superset-light` and `superset-dark` because Superset reserves
  built-in IDs such as `light` and `dark`. Light-mode OKLCH UI values were converted to six-digit
  hex tokens for this catalog schema. Dark-mode translucent terminal selection was flattened over
  the built-in background. `ui.ring` and `ui.destructiveForeground` were adjusted only where needed
  to satisfy this app's contrast gates.
