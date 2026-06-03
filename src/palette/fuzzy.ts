import { foldForMatch } from "../text/foldForMatch";

export interface FuzzyMatch {
  // 0 = exact, 1 = prefix, 2 = subsequence. Lower tiers always rank first.
  tier: number;
  // Higher is better within a tier; consecutive matches score more than scattered ones.
  score: number;
  // Lower means the match came from a more canonical key for the item.
  keyIndex?: number;
}

export interface RankableItem {
  id: string;
  keys: readonly string[];
}

export function scoreMatch(query: string, target: string): FuzzyMatch | null {
  const q = foldForMatch(query.trim());
  const t = foldForMatch(target);
  if (q === "") {
    return { tier: 2, score: 0 };
  }
  if (t === q) {
    return { tier: 0, score: t.length };
  }
  if (t.startsWith(q)) {
    return { tier: 1, score: q.length };
  }

  let qi = 0;
  let run = 0;
  let score = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti += 1) {
    if (t[ti] === q[qi]) {
      run += 1;
      score += run; // 1, then 3 for a run of two, then 6 for three — rewards adjacency.
      qi += 1;
    } else {
      run = 0;
    }
  }
  return qi === q.length ? { tier: 2, score } : null;
}

export function bestMatch(query: string, keys: readonly string[]): FuzzyMatch | null {
  let best: FuzzyMatch | null = null;
  for (const [keyIndex, key] of keys.entries()) {
    const scored = scoreMatch(query, key);
    const match = scored ? { ...scored, keyIndex } : null;
    if (!match) {
      continue;
    }
    if (!best || isBetterMatch(match, best)) {
      best = match;
    }
  }
  return best;
}

function isBetterMatch(candidate: FuzzyMatch, incumbent: FuzzyMatch): boolean {
  if (candidate.tier !== incumbent.tier) {
    return candidate.tier < incumbent.tier;
  }
  if (candidate.score !== incumbent.score) {
    return candidate.score > incumbent.score;
  }
  return keyIndexFor(candidate) < keyIndexFor(incumbent);
}

function keyIndexFor(match: FuzzyMatch): number {
  return match.keyIndex ?? Number.MAX_SAFE_INTEGER;
}

export function rankFuzzy<T extends RankableItem>(query: string, items: readonly T[]): T[] {
  if (query.trim() === "") {
    return [...items];
  }

  const scored = items
    .map((item) => ({ item, match: bestMatch(query, item.keys) }))
    .filter((entry): entry is { item: T; match: FuzzyMatch } => entry.match !== null);

  scored.sort((a, b) => {
    if (a.match.tier !== b.match.tier) {
      return a.match.tier - b.match.tier;
    }
    if (a.match.score !== b.match.score) {
      return b.match.score - a.match.score;
    }
    if (keyIndexFor(a.match) !== keyIndexFor(b.match)) {
      return keyIndexFor(a.match) - keyIndexFor(b.match);
    }
    if (a.item.id.length !== b.item.id.length) {
      return a.item.id.length - b.item.id.length;
    }
    return a.item.id.localeCompare(b.item.id);
  });

  return scored.map((entry) => entry.item);
}
