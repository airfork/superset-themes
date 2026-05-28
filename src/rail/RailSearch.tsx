import { Search } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

interface RailSearchProps {
  onOpenPalette: () => void;
}

export function RailSearch({ onOpenPalette }: RailSearchProps) {
  // The "/" keypress is the visible shortcut on the search button's kbd hint, so the
  // button must respond to "/" while focused. Without this, only rail rows pick up
  // slash via useRailKeyboard, and tabbing into the search and pressing "/" no-ops.
  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "/") {
      event.preventDefault();
      onOpenPalette();
    }
  };

  return (
    <button
      type="button"
      className="rail-search"
      onClick={onOpenPalette}
      onKeyDown={onKeyDown}
      aria-label="Search themes"
    >
      <Search aria-hidden="true" width={14} height={14} />
      <span className="rail-search__label">Search themes</span>
      <kbd className="rail-search__kbd">/</kbd>
    </button>
  );
}
