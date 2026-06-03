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

## Catppuccin Latte

- Theme: `catppuccin-latte`
- Original theme: Catppuccin Latte by the Catppuccin organization
- Source: <https://github.com/catppuccin/catppuccin>
- Palette source: <https://github.com/catppuccin/palette>
- License: MIT
- Adaptation notes: Kept Latte palette names and ANSI colors; mapped app chrome to this repo's
  Superset theme schema. Used white button foregrounds on the blue/red accents and lightened the
  highlight and terminal selection one surface step to satisfy the local contrast gate.

## Dracula

- Theme: `dracula`
- Original theme: Dracula by Zeno Rocha / Dracula Theme
- Source: <https://github.com/dracula/dracula-theme>
- Palette source: <https://draculatheme.com>
- License: MIT
- Adaptation notes: Kept the OSS palette values; used conservative foreground tokens where this
  app's preview surfaces need explicit action and destructive contrast.

## Alucard

- Theme: `alucard`
- Original theme: Alucard (Dracula's official light theme) by Zeno Rocha / Dracula Theme
- Source: <https://github.com/dracula/dracula-theme>
- Palette source: <https://draculatheme.com/spec>
- License: MIT
- Adaptation notes: Used the published Alucard Classic palette (background `#fffbeb`, foreground
  `#1f1f1f`, selection `#cfcfde`, comment, and the red/orange/yellow/green/cyan/purple/pink accents).
  Violet carries the primary and red the destructive over the ivory paper, both with a cream
  foreground so they clear the local AA gate; red is reserved for `destructive` and kept out of the
  five-hue chart palette.

## Gruvbox Dark

- Theme: `gruvbox-dark`
- Original theme: Gruvbox by Pavel Pertsev
- Source: <https://github.com/morhetz/gruvbox>
- License: MIT/X11
- Catalog license field: MIT/X11
- Adaptation notes: Used the dark medium palette and terminal colors from the original Vim theme;
  adjusted only schema mapping and required foreground relationships.

## Gruvbox Light

- Theme: `gruvbox-light`
- Original theme: Gruvbox by Pavel Pertsev
- Source: <https://github.com/morhetz/gruvbox>
- License: MIT/X11
- Catalog license field: MIT/X11
- Adaptation notes: Used the light medium palette and the original light-mode terminal mapping
  (background `#fbf1c7`, neutral ANSI colors with the darker faded accents in the bright slots). The
  primary action uses faded orange (`#af3a03`) and the destructive faded red (`#9d0006`) with a cream
  foreground so both clear the local AA gate against the cream surface; `mutedForeground` steps to
  `#665c54` to hold AA on the background.

## Tokyo Night

- Theme: `tokyo-night`
- Original theme: Tokyo Night by Enkia
- Source: <https://github.com/tokyo-night/tokyo-night-vscode-theme>
- License: MIT
- Adaptation notes: Used the Tokyo Night dark palette and terminal colors; brightened terminal
  foreground/exported preview text where needed for this app's contrast gate.

## Tokyo Night Light

- Theme: `tokyo-night-light`
- Original theme: Tokyo Night Light by Enkia
- Source: <https://github.com/tokyo-night/tokyo-night-vscode-theme>
- License: MIT
- Adaptation notes: Used the Tokyo Night Light palette and terminal ANSI colors (background
  `#e6e7ed`, foreground `#343b59`). White button foregrounds sit on the deep blue primary and the
  maroon destructive; `mutedForeground` is darkened to `#565d7e` to hold AA on the background, and
  the source's translucent selection token is flattened to a six-digit hex.

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

## Rosé Pine and Rosé Pine Moon

- Themes: `rose-pine`, `rose-pine-moon`
- Original themes: Rosé Pine (main) and Rosé Pine Moon by the Rosé Pine organization
- Source: <https://github.com/rose-pine/rose-pine-theme>
- License: MIT
- Adaptation notes: Used the published main and moon palettes (base, surface, overlay, text, love,
  gold, rose, pine, foam, iris, subtle, highlight). For these dark variants the primary action uses
  foam (the light teal, kin to Dawn's pine primary) over a base-dark foreground, and love carries
  the destructive token over a base-dark foreground, so both clear the local AA contrast gate.

## One Dark

- Theme: `one-dark`
- Original theme: One Dark by the Atom team
- Source: <https://github.com/atom/atom>
- License: MIT
- Adaptation notes: Used the One Dark UI palette (#282c34 surfaces, #abb2bf foreground) and the
  Atom-lineage ANSI mapping. Used a near-black foreground on the cool blue primary and warm red
  destructive tokens for AA contrast against light accent surfaces.

## GitHub

- Themes: `github-light`, `github-dark`, `github-dark-dimmed`
- Original theme: GitHub VS Code theme (Primer) by GitHub
- Source: <https://github.com/primer/github-vscode-theme>
- Palette source: <https://primer.style> (Primer Primitives)
- License: MIT
- Adaptation notes: Used Primer's Light Default, Dark Default, and Dark Dimmed canvas/foreground/
  accent/danger primitives plus the published terminal ANSI palettes. Light Default uses white
  button foregrounds on the accent blue and danger red. The dark variants use a light accent
  (the link blue) over a canvas-dark foreground for the primary and destructive tokens so they
  clear the local AA contrast gate; Dark Dimmed's terminal selection foreground was brightened a
  step for selection legibility.

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
