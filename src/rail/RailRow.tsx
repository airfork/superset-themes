import { Pin } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

export type RailRowVariant = "basic" | "featured";

interface RailRowProps {
  entry: CatalogThemeEntry;
  selected: boolean;
  pinned: boolean;
  variant: RailRowVariant;
  // Set on a section row (Dark/Light) whose theme is also pinned above it, so
  // the accessible name back-references that earlier appearance instead of looking
  // like a duplicate to a screen-reader user roving the list.
  alsoInSection?: string;
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
  alsoInSection,
  onSelect,
  onKeyDown,
  tabIndex,
  id,
}: RailRowProps) {
  const themeVariant = entry.theme.type;
  const themeModeLabel = themeVariant === "light" ? "Light" : "Dark";

  // Build the accessible name from the bare theme name plus any qualifiers, in
  // reading order: pinned status first, then the pinned-section back-reference.
  const labelParts = [entry.theme.name];
  if (pinned) {
    labelParts.push("pinned for compare");
  }
  if (alsoInSection) {
    labelParts.push(`also in ${alsoInSection}`);
  }
  const accessibleName = labelParts.join(", ");
  // Drop the family eyebrow when it only echoes the row's own name (e.g. the
  // "Tokyo Night" family over the "Tokyo Night" theme). It still earns its place
  // where the family groups distinct themes ("Rosé Pine" over "Rosé Pine Dawn").
  const showEyebrow = variant === "featured" && entry.meta.family !== entry.theme.name;

  return (
    <button
      type="button"
      className="rail-row"
      data-variant={variant}
      data-selected={selected || undefined}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      aria-current={selected ? "true" : undefined}
      // Fold pinned + Featured-duplicate state into the accessible name so screen
      // readers announce it. The Pin SVG inside is aria-hidden because aria-label
      // here overrides children.
      aria-label={accessibleName}
      tabIndex={tabIndex}
      id={id}
    >
      <span className="rail-row__body">
        {showEyebrow ? <span className="rail-row__eyebrow">{entry.meta.family}</span> : null}
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
          className="rail-row__mode"
          data-testid="rail-mode-badge"
          data-mode={themeVariant}
          aria-hidden="true"
        >
          {themeModeLabel}
        </span>
      </span>
    </button>
  );
}
