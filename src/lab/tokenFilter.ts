// Filter token groups by a label substring, dropping any group left with no
// matching rows. Kept pure (generic over the group shape) so the Tokens section
// can filter its 40+ fields without a bespoke search index.
export function filterTokenGroups<Group extends { rows: { label: string }[] }>(
  groups: Group[],
  query: string,
): Group[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      rows: group.rows.filter((row) => row.label.toLowerCase().includes(needle)),
    }))
    .filter((group) => group.rows.length > 0);
}
