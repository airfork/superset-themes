import { Search } from "lucide-react";
import type { Ref } from "react";

interface RailSearchProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
}

export function RailSearch({ value, onChange, inputRef }: RailSearchProps) {
  return (
    <div className="rail-search">
      <Search className="rail-search__icon" aria-hidden="true" width={14} height={14} />
      <input
        ref={inputRef}
        type="text"
        className="rail-search__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Filter by name"
        placeholder="Filter by name"
      />
      <kbd className="rail-search__kbd">/</kbd>
    </div>
  );
}
