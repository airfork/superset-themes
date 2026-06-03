export type HistoryShortcut = "undo" | "redo";

interface ShortcutEvent {
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
}

// Map a keyboard event to an undo/redo intent. Cmd/Ctrl+Z is undo, Cmd/Ctrl+
// Shift+Z is redo, and Ctrl+Y is the Windows redo. Returns null for anything
// else so callers can ignore it.
export function historyShortcut(event: ShortcutEvent): HistoryShortcut | null {
  if (!event.metaKey && !event.ctrlKey) {
    return null;
  }

  const key = event.key.toLowerCase();

  if (key === "z") {
    return event.shiftKey ? "redo" : "undo";
  }

  if (key === "y" && !event.shiftKey) {
    return "redo";
  }

  return null;
}
