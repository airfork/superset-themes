import { X } from "lucide-react";
import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ShortcutEntry {
  keys: string[];
  label: string;
}

interface ShortcutGroup {
  heading: string;
  shortcuts: ShortcutEntry[];
}

// The chrome's keyboard map, grouped the way a learner scans it: how to move
// around the catalog first, then what to do once a theme is focused.
const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    heading: "Navigate",
    shortcuts: [
      { keys: ["↑", "↓"], label: "Move between themes" },
      { keys: ["Home", "End"], label: "Jump to the first or last theme" },
      { keys: ["/"], label: "Jump to the filter field" },
      { keys: ["Enter"], label: "Open the focused theme" },
    ],
  },
  {
    heading: "Actions",
    shortcuts: [
      { keys: ["⌘", "K"], label: "Search themes and actions" },
      { keys: ["."], label: "Pin the focused theme to compare" },
      { keys: ["?"], label: "Show this shortcut list" },
      { keys: ["Esc"], label: "Close this dialog or the palette" },
    ],
  },
];

interface ShortcutsOverlayProps {
  open: boolean;
  onClose: () => void;
  // Stories portal into a theme-scoped element; the app defaults to document.body.
  container?: HTMLElement | null;
}

export function ShortcutsOverlay({ open, onClose, container }: ShortcutsOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Focus the close button on open; return focus to the opener on close.
  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement as HTMLElement | null;
      closeRef.current?.focus();
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

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "Tab") {
      // The close button is the only focusable control, so keep focus trapped on it.
      event.preventDefault();
    }
  };

  const overlay = (
    <div className="shortcuts__backdrop">
      <div
        ref={panelRef}
        className="shortcuts"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onKeyDown={onKeyDown}
      >
        <header className="shortcuts__header">
          <h2 className="shortcuts__title">Keyboard shortcuts</h2>
          <button
            ref={closeRef}
            type="button"
            className="shortcuts__close"
            aria-label="Close keyboard shortcuts"
            onClick={onClose}
          >
            <X aria-hidden="true" width={16} height={16} />
          </button>
        </header>
        <div className="shortcuts__groups">
          {SHORTCUT_GROUPS.map((group) => (
            <section key={group.heading} className="shortcuts__group" aria-label={group.heading}>
              <h3 className="shortcuts__group-title">{group.heading}</h3>
              <ul className="shortcuts__list">
                {group.shortcuts.map((shortcut) => (
                  <li key={shortcut.label} className="shortcuts__row">
                    <span className="shortcuts__label">{shortcut.label}</span>
                    <span className="shortcuts__keys">
                      {shortcut.keys.map((key) => (
                        <kbd key={key} className="shortcuts__key">
                          {key}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, container ?? document.body);
}
