import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { PaletteCommand } from "./commands";
import { rankFuzzy } from "./fuzzy";
import type { PaletteProps } from "./usePalette";

interface PaletteComponentProps extends PaletteProps {
  // Stories portal into a theme-scoped element; the app defaults to document.body.
  container?: HTMLElement | null;
}

function optionId(command: PaletteCommand): string {
  return `palette-option-${command.id}`;
}

function matchesAction(command: PaletteCommand, query: string): boolean {
  if (query === "") {
    return true;
  }
  return (
    command.label.toLowerCase().includes(query) ||
    command.keys.some((key) => key.toLowerCase().includes(query))
  );
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

  const { themes, actions, results } = useMemo(() => {
    const themeCommands = commands.filter((command) => command.section === "Themes");
    const actionCommands = commands.filter((command) => command.section === "Actions");
    const rankedThemes = rankFuzzy(query, themeCommands);
    const trimmed = query.trim().toLowerCase();
    const filteredActions = actionCommands.filter((command) => matchesAction(command, trimmed));
    return {
      themes: rankedThemes,
      actions: filteredActions,
      results: [...rankedThemes, ...filteredActions],
    };
  }, [commands, query]);

  const activeCommand = results[focusedIndex];

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
        onMove("down", results.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        onMove("up", results.length);
        break;
      case "Enter":
        event.preventDefault();
        onSubmit(results[focusedIndex]);
        break;
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
        <span className="palette__option-label">{command.label}</span>
        {command.hint ? <span className="palette__option-hint">{command.hint}</span> : null}
      </button>
    );
  };

  const overlay = (
    <div className="palette__backdrop">
      <div
        ref={panelRef}
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <input
          ref={inputRef}
          type="text"
          className="palette__input"
          role="combobox"
          aria-label="Command palette search"
          aria-expanded="true"
          aria-controls="palette-listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeCommand ? optionId(activeCommand) : undefined}
          placeholder="Search themes and actions…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={onInputKeyDown}
        />
        <div id="palette-listbox" role="listbox" aria-label="Commands" className="palette__results">
          {themes.length > 0 ? (
            // biome-ignore lint/a11y/useSemanticElements: a listbox groups options with ARIA role="group"; <fieldset> is a form element whose <legend> renders on the group's border (strikethrough).
            <div role="group" aria-label="Themes" className="palette__group palette__group--themes">
              <span className="palette__group-label" aria-hidden="true">
                Themes
              </span>
              {themes.map((command, index) => renderOption(command, index))}
            </div>
          ) : null}
          {actions.length > 0 ? (
            // biome-ignore lint/a11y/useSemanticElements: a listbox groups options with ARIA role="group"; <fieldset> is a form element whose <legend> renders on the group's border (strikethrough).
            <div
              role="group"
              aria-label="Actions"
              className="palette__group palette__group--actions"
            >
              <span className="palette__group-label" aria-hidden="true">
                Actions
              </span>
              {actions.map((command, index) => renderOption(command, themes.length + index))}
            </div>
          ) : null}
          {results.length === 0 ? (
            <div className="palette__empty" role="status">
              No matches for “{query.trim()}”
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, container ?? document.body);
}
