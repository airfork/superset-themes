import { Pin } from "lucide-react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

export type RailRowVariant = "basic" | "featured";

interface RailRowProps {
  entry: CatalogThemeEntry;
  selected: boolean;
  pinned: boolean;
  variant: RailRowVariant;
  onSelect?: () => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
  tabIndex?: number;
  id?: string;
}

const SWATCH_KEYS = ["primary", "secondary", "accent", "destructive", "selection"] as const;

export function RailRow({
  entry,
  selected,
  pinned,
  variant,
  onSelect,
  onKeyDown,
  tabIndex,
  id,
}: RailRowProps) {
  const themeAccent = entry.theme.ui.accent;
  const themeVariant = entry.theme.type;

  // Inline color escapes the --preview-* system on purpose: the row dot always
  // shows the entry's own accent, never the focused theme's.
  const rowStyle: CSSProperties = {
    "--row-accent": themeAccent,
  } as CSSProperties;

  return (
    <button
      type="button"
      className="rail-row"
      data-variant={variant}
      data-selected={selected || undefined}
      style={rowStyle}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      aria-current={selected ? "true" : undefined}
      // Fold pinned state into the accessible name so screen readers announce it.
      // The Pin SVG inside is aria-hidden because aria-label here overrides children.
      aria-label={pinned ? `${entry.theme.name}, pinned for compare` : entry.theme.name}
      tabIndex={tabIndex}
      id={id}
    >
      <span className="rail-row__body">
        {variant === "featured" ? (
          <span className="rail-row__eyebrow">{entry.meta.family}</span>
        ) : null}
        <span className="rail-row__name">{entry.theme.name}</span>
        {variant === "featured" ? (
          <span className="rail-row__glimpse" aria-hidden="true">
            {SWATCH_KEYS.map((key) => (
              <span
                key={key}
                data-testid="rail-swatch"
                className="rail-row__swatch"
                style={{ backgroundColor: entry.theme.ui[key] }}
              />
            ))}
          </span>
        ) : null}
      </span>
      <span className="rail-row__trailing">
        {pinned ? (
          <Pin
            className="rail-row__pin"
            data-testid="rail-pin"
            aria-hidden="true"
            width={12}
            height={12}
          />
        ) : null}
        <span
          className="rail-row__dot"
          data-testid="rail-accent-dot"
          data-variant={themeVariant}
          // Dark themes fill the dot; light themes paint a ring via border, so leave
          // the background unset on light rows so the CSS rule isn't overridden inline.
          style={themeVariant === "dark" ? { backgroundColor: themeAccent } : undefined}
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
