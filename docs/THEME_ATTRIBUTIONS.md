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
