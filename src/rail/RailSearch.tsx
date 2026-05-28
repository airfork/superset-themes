import { Search } from "lucide-react";

interface RailSearchProps {
  onOpenPalette: () => void;
}

export function RailSearch({ onOpenPalette }: RailSearchProps) {
  return (
    <button
      type="button"
      className="rail-search"
      onClick={onOpenPalette}
      aria-label="Search themes"
    >
      <Search aria-hidden="true" width={14} height={14} />
      <span className="rail-search__label">Search themes</span>
      <kbd className="rail-search__kbd">/</kbd>
    </button>
  );
}
