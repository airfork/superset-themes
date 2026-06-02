import { Search } from "lucide-react";
import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { PaletteCommand } from "./commands";
import { buildPaletteEntries } from "./paletteEntries";
import type { PaletteProps } from "./usePalette";

interface PaletteComponentProps extends PaletteProps {
  // Stories portal into a theme-scoped element; the app defaults to document.body.
  container?: HTMLElement | null;
}

function optionId(command: PaletteCommand): string {
  return `palette-option-${command.id}`;
}

// Leading glyph: theme rows show their own accent swatch, action rows their icon.
// A blank placeholder keeps every label on the same left edge.
function renderLeading(command: PaletteCommand) {
  if (command.accent) {
    return (
      <span
        className="palette__option-swatch"
        data-variant={command.themeType}
        style={{ backgroundColor: command.accent }}
        aria-hidden="true"
      />
    );
  }
  if (command.icon) {
    const Icon = command.icon;
    return <Icon className="palette__option-icon" aria-hidden="true" />;
  }
  return <span className="palette__option-icon" aria-hidden="true" />;
}

export function Palette({
  open,
  query,
  focusedIndex,
  commands,
  onQueryChange,
  onMove,
  onClose,
  onSubmit,
  container,
}: PaletteComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const { themes, actions, entries } = useMemo(
    () => buildPaletteEntries(commands, query),
    [commands, query],
  );

  const activeEntry = entries[focusedIndex];
  const activeDescendant =
    activeEntry?.kind === "command" ? optionId(activeEntry.command) : undefined;

  // Focus the input on open; return focus to the opener on close.
  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement as HTMLElement | null;
      inputRef.current?.focus();
    } else if (restoreRef.current) {
      restoreRef.current.focus();
      restoreRef.current = null;
    }
  }, [open]);

  // Close when a pointer press lands outside the panel.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        onMove("down", entries.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        onMove("up", entries.length);
        break;
      case "Enter": {
        event.preventDefault();
        const entry = entries[focusedIndex];
        if (entry) {
          onSubmit(entry.command);
        }
        break;
      }
      case "Escape":
        event.preventDefault();
        onClose();
        break;
      case "Tab":
        // The input is the only focusable control, so keep focus trapped on it.
        event.preventDefault();
        break;
    }
  };

  const renderOption = (command: PaletteCommand, index: number) => {
    const active = index === focusedIndex;
    return (
      <button
        key={command.id}
        type="button"
        id={optionId(command)}
        role="option"
        aria-selected={active}
        // Virtual focus stays on the combobox input; options are reachable only via
        // aria-activedescendant, not the tab sequence.
        tabIndex={-1}
        className="palette__option"
        data-active={active || undefined}
        onClick={() => onSubmit(command)}
        onMouseDown={(event) => event.preventDefault()}
      >
        {renderLeading(command)}
        <span className="palette__option-label">{command.label}</span>
        {command.shortcut ? (
          <kbd className="palette__option-key">{command.shortcut}</kbd>
        ) : command.hint ? (
          <span className="palette__option-hint">{command.hint}</span>
        ) : null}
      </button>
    );
  };

  const actionsFirst = query.trim() === "";
  const actionBase = actionsFirst ? 0 : themes.length;
  const themeBase = actionsFirst ? actions.length : 0;

  const renderActionsGroup = () =>
    actions.length > 0 ? (
      // biome-ignore lint/a11y/useSemanticElements: a listbox groups options with ARIA role="group"; <fieldset> is a form element whose <legend> renders on the group's border (strikethrough).
      <div role="group" aria-label="Actions" className="palette__group palette__group--actions">
        <span className="palette__group-label" aria-hidden="true">
          Actions
        </span>
        {actions.map((command, index) => renderOption(command, actionBase + index))}
      </div>
    ) : null;

  const renderThemesGroup = () =>
    themes.length > 0 ? (
      // biome-ignore lint/a11y/useSemanticElements: a listbox groups options with ARIA role="group"; <fieldset> is a form element whose <legend> renders on the group's border (strikethrough).
      <div role="group" aria-label="Themes" className="palette__group palette__group--themes">
        <div className="palette__group-label palette__group-label--themes" aria-hidden="true">
          <span className="palette__group-title">Themes</span>
          <span className="palette__group-meta-label">Family</span>
        </div>
        {themes.map((command, index) => renderOption(command, themeBase + index))}
      </div>
    ) : null;

  const overlay = (
    <div className="palette__backdrop">
      <div
        ref={panelRef}
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="palette__search">
          <Search className="palette__search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="palette__input"
            role="combobox"
            aria-label="Command palette search"
            aria-expanded="true"
            aria-controls="palette-listbox"
            aria-autocomplete="list"
            aria-activedescendant={activeDescendant}
            autoComplete="off"
            name="command-palette-search"
            placeholder="Type a command or search…"
            spellCheck={false}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={onInputKeyDown}
          />
        </div>
        <div id="palette-listbox" role="listbox" aria-label="Commands" className="palette__results">
          {actionsFirst ? renderActionsGroup() : renderThemesGroup()}
          {actionsFirst ? renderThemesGroup() : renderActionsGroup()}
          {entries.length === 0 ? (
            <div className="palette__empty" role="status">
              No matches for “{query.trim()}”
              <span className="palette__empty-hint">Try a theme name, family, or action.</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, container ?? document.body);
}
