import { Search } from "lucide-react";

interface TopBarProps {
  onOpenPalette: () => void;
}

export function TopBar({ onOpenPalette }: TopBarProps) {
  return (
    <header className="chrome-topbar">
      <span className="chrome-topbar__name">Superset Themes</span>
      <button
        type="button"
        className="chrome-topbar__search"
        onClick={onOpenPalette}
        aria-label="Search themes"
      >
        <Search aria-hidden="true" />
        <span className="chrome-topbar__search-label">Search themes</span>
        <kbd>⌘K</kbd>
      </button>
      <a
        href="https://github.com/superset-sh/superset-themes"
        className="chrome-topbar__repo"
        rel="noreferrer"
      >
        repo
      </a>
    </header>
  );
}
