export interface FuzzyMatch {
  // 0 = exact, 1 = prefix, 2 = subsequence. Lower tiers always rank first.
  tier: number;
  // Higher is better within a tier; consecutive matches score more than scattered ones.
  score: number;
}

export interface RankableItem {
  id: string;
  keys: readonly string[];
}

export function scoreMatch(query: string, target: string): FuzzyMatch | null {
  const q = query.trim().toLowerCase();
  const t = target.toLowerCase();
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
  for (const key of keys) {
    const match = scoreMatch(query, key);
    if (!match) {
      continue;
    }
    if (!best || match.tier < best.tier || (match.tier === best.tier && match.score > best.score)) {
      best = match;
    }
  }
  return best;
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
    if (a.item.id.length !== b.item.id.length) {
      return a.item.id.length - b.item.id.length;
    }
    return a.item.id.localeCompare(b.item.id);
  });

  return scored.map((entry) => entry.item);
}
