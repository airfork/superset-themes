// Normalize text for name matching: strip diacritics so a plain-ASCII query
// ("rose pine") still matches an accented name ("Rosé Pine Dawn"), and lowercase
// so matching is case-insensitive. Shared by the rail filter and the ⌘K palette
// so both search surfaces fold identically.
export function foldForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
