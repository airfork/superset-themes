import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { PaletteCommand } from "./commands";
import { rankFuzzy } from "./fuzzy";
import type { PaletteProps } from "./usePalette";

interface PaletteComponentProps extends PaletteProps {
  // Stories portal into a theme-scoped element; the app defaults to document.body.
  container?: HTMLElement | null;
}

const MORE_ACTIONS_ID = "palette-option-more-actions";

type PaletteEntry = { kind: "command"; command: PaletteCommand } | { kind: "more-actions" };

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
  actionsExpanded,
  commands,
  onQueryChange,
  onMove,
  onExpandActions,
  onClose,
  onSubmit,
  container,
}: PaletteComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const { themes, actions, collapsed, entries } = useMemo(() => {
    const themeCommands = commands.filter((command) => command.section === "Themes");
    const actionCommands = commands.filter((command) => command.section === "Actions");
    const rankedThemes = rankFuzzy(query, themeCommands);
    const trimmed = query.trim().toLowerCase();
    const filteredActions = actionCommands.filter((command) => matchesAction(command, trimmed));
    // At rest the shelf is a single "More actions" teaser so the theme list
    // owns the panel; a query reveals matching actions directly.
    const isCollapsed = trimmed === "" && !actionsExpanded && filteredActions.length > 0;
    const themeEntries: PaletteEntry[] = rankedThemes.map((command) => ({
      kind: "command",
      command,
    }));
    const actionEntries: PaletteEntry[] = isCollapsed
      ? [{ kind: "more-actions" }]
      : filteredActions.map((command) => ({ kind: "command", command }));
    return {
      themes: rankedThemes,
      actions: filteredActions,
      collapsed: isCollapsed,
      entries: [...themeEntries, ...actionEntries],
    };
  }, [commands, query, actionsExpanded]);

  const activeEntry = entries[focusedIndex];
  const activeDescendant =
    activeEntry?.kind === "command"
      ? optionId(activeEntry.command)
      : activeEntry?.kind === "more-actions"
        ? MORE_ACTIONS_ID
        : undefined;

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
        if (entry?.kind === "more-actions") {
          onExpandActions(themes.length);
        } else if (entry) {
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
        <span className="palette__option-label">{command.label}</span>
        {command.shortcut ? (
          <kbd className="palette__option-key">{command.shortcut}</kbd>
        ) : command.hint ? (
          <span className="palette__option-hint">{command.hint}</span>
        ) : null}
      </button>
    );
  };

  // The collapsed shelf's single option: activating it expands the full Actions
  // list in place rather than running a command, so the palette stays open.
  const renderMoreActions = (index: number) => {
    const active = index === focusedIndex;
    return (
      <button
        type="button"
        id={MORE_ACTIONS_ID}
        role="option"
        aria-selected={active}
        tabIndex={-1}
        className="palette__option palette__more-actions"
        data-active={active || undefined}
        onClick={() => onExpandActions(themes.length)}
        onMouseDown={(event) => event.preventDefault()}
      >
        <span className="palette__option-label">More actions</span>
        <span className="palette__option-hint">{actions.length}</span>
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
          aria-activedescendant={activeDescendant}
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
          {collapsed ? (
            // biome-ignore lint/a11y/useSemanticElements: a listbox groups options with ARIA role="group"; <fieldset> is a form element whose <legend> renders on the group's border (strikethrough).
            <div
              role="group"
              aria-label="Actions"
              className="palette__group palette__group--actions palette__group--collapsed"
            >
              {renderMoreActions(themes.length)}
            </div>
          ) : actions.length > 0 ? (
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
          {entries.length === 0 ? (
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
