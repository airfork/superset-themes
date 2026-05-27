# Superset Theme Catalog

## Register

product

## Product Purpose

Superset Theme Catalog is a catalog-first web app for browsing, filtering, comparing, pairing, editing, importing, generating, validating, and exporting themes for Superset-compatible editor environments.

The existing `itsbariscan/superset-themes` repo and GitHub Pages site are references, not architectural constraints. This project should be a clean-slate build that keeps the useful ideas, fixes the weak interaction model, and creates room for a much larger theme library.

## Users

- Developers choosing a theme for daily editor use.
- Theme collectors comparing light and dark variants across families.
- Theme authors porting palettes from editor ecosystems.
- The project owner iterating privately until the catalog and theme set feel strong enough to publish.

## Strategic Principles

- Catalog first. The first screen is the usable browser, not marketing.
- Pairing is first-class but optional. Normal browsing stays simple, while pinned light and dark slots support serious comparison.
- Preview surfaces must answer practical theme questions: file tree, tabs, editor, terminal, diff, command palette, forms, controls, selections, focus states, and warnings.
- The lab supports the catalog. It should clone, import, generate, validate, tweak, and export themes without becoming the primary product.
- Theme JSON stays clean and Superset-compatible. App-specific metadata lives beside themes, not inside exported files.
- The interface should feel like a careful utility for people comparing visual systems, not a SaaS landing page or generic palette gallery.

## Anti-References

- A static gallery where only one theme can be seen at a time.
- Decorative tabs that do not switch preview content.
- Theme cards that show only code colors and miss file-browser, command, form, and terminal surfaces.
- Random color generators that produce unusable RGB noise.
- Catalog metadata that becomes a loose tag soup.
- User-facing docs that include agent-only shell wrappers.

