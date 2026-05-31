import { useEffect, useMemo, useReducer } from "react";
import type { PaletteCommand } from "./commands";
import { buildPaletteEntries } from "./paletteEntries";
import { INITIAL_PALETTE_STATE, paletteReducer } from "./paletteState";

export interface PaletteProps {
  open: boolean;
  query: string;
  focusedIndex: number;
  actionsExpanded: boolean;
  commands: readonly PaletteCommand[];
  onQueryChange: (query: string) => void;
  onMove: (direction: "up" | "down", count: number) => void;
  onExpandActions: (focusedIndex: number) => void;
  onClose: () => void;
  onSubmit: (command: PaletteCommand | undefined) => void;
}

export interface UsePaletteResult {
  open: () => void;
  paletteProps: PaletteProps;
}

export function usePalette(commands: readonly PaletteCommand[]): UsePaletteResult {
  const [state, dispatch] = useReducer(paletteReducer, INITIAL_PALETTE_STATE);

  // Global ⌘K / Ctrl+K opens the palette from anywhere in the app.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        dispatch({ type: "open" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const paletteProps = useMemo<PaletteProps>(
    () => ({
      open: state.open,
      query: state.query,
      focusedIndex: state.focusedIndex,
      actionsExpanded: state.actionsExpanded,
      commands,
      onQueryChange: (query) => {
        // Seed focus on the intent-ranked entry (typing re-collapses the shelf,
        // so compute entries as if actions are unexpanded).
        const { defaultFocusIndex } = buildPaletteEntries(commands, query, false);
        dispatch({ type: "setQuery", query, focusedIndex: defaultFocusIndex });
      },
      onMove: (direction, count) => dispatch({ type: "move", direction, count }),
      onExpandActions: (focusedIndex) => dispatch({ type: "expandActions", focusedIndex }),
      onClose: () => dispatch({ type: "close" }),
      onSubmit: (command) => {
        command?.run();
        dispatch({ type: "submit" });
      },
    }),
    [state.open, state.query, state.focusedIndex, state.actionsExpanded, commands],
  );

  return useMemo(() => ({ open: () => dispatch({ type: "open" }), paletteProps }), [paletteProps]);
}
