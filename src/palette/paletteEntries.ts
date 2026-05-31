import type { PaletteCommand } from "./commands";
import { bestMatch, type FuzzyMatch, rankFuzzy } from "./fuzzy";

export type PaletteEntry = { kind: "command"; command: PaletteCommand } | { kind: "more-actions" };

export interface PaletteEntries {
  themes: PaletteCommand[];
  actions: PaletteCommand[];
  collapsed: boolean;
  entries: PaletteEntry[];
  // The option focus should land on when the query changes. A verb query
  // (e.g. "pin") seeds the matching action; otherwise the first theme.
  defaultFocusIndex: number;
}

export function matchesAction(command: PaletteCommand, query: string): boolean {
  if (query === "") {
    return true;
  }
  return (
    command.label.toLowerCase().includes(query) ||
    command.keys.some((key) => key.toLowerCase().includes(query))
  );
}

// An action steals default focus only when it matches the query strictly better
// (lower tier) than the best theme. A tie keeps focus on the theme list, since
// themes own the panel and a same-tier action is no more "intended".
function isBetter(candidate: FuzzyMatch, incumbent: FuzzyMatch | null): boolean {
  if (!incumbent) {
    return true;
  }
  if (candidate.tier !== incumbent.tier) {
    return candidate.tier < incumbent.tier;
  }
  return candidate.score > incumbent.score;
}

export function buildPaletteEntries(
  commands: readonly PaletteCommand[],
  query: string,
  actionsExpanded: boolean,
): PaletteEntries {
  const themeCommands = commands.filter((command) => command.section === "Themes");
  const actionCommands = commands.filter((command) => command.section === "Actions");
  const rankedThemes = rankFuzzy(query, themeCommands);
  const trimmed = query.trim().toLowerCase();
  const filteredActions = actionCommands.filter((command) => matchesAction(command, trimmed));
  // At rest the shelf is a single "More actions" teaser so the theme list owns
  // the panel; a query reveals matching actions directly.
  const collapsed = trimmed === "" && !actionsExpanded && filteredActions.length > 0;

  const themeEntries: PaletteEntry[] = rankedThemes.map((command) => ({
    kind: "command",
    command,
  }));
  const actionEntries: PaletteEntry[] = collapsed
    ? [{ kind: "more-actions" }]
    : filteredActions.map((command) => ({ kind: "command", command }));

  return {
    themes: rankedThemes,
    actions: filteredActions,
    collapsed,
    entries: [...themeEntries, ...actionEntries],
    defaultFocusIndex: defaultFocusIndex(query, rankedThemes, filteredActions, collapsed),
  };
}

function defaultFocusIndex(
  query: string,
  rankedThemes: readonly PaletteCommand[],
  filteredActions: readonly PaletteCommand[],
  collapsed: boolean,
): number {
  if (query.trim() === "" || collapsed) {
    return 0;
  }

  const bestThemeMatch = rankedThemes[0] ? bestMatch(query, rankedThemes[0].keys) : null;

  let bestActionMatch: FuzzyMatch | null = null;
  let bestActionIndex = -1;
  filteredActions.forEach((command, index) => {
    const match = bestMatch(query, command.keys);
    if (match && isBetter(match, bestActionMatch)) {
      bestActionMatch = match;
      bestActionIndex = index;
    }
  });

  const actionWins =
    bestActionMatch !== null &&
    (bestThemeMatch === null || isBetter(bestActionMatch, bestThemeMatch));

  return actionWins ? rankedThemes.length + bestActionIndex : 0;
}
