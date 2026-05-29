import assert from "node:assert/strict";
import test from "node:test";
import {
  countStarsSince,
  extractMarketplaceInstalls,
  parseArgs,
  rankCandidates,
  scoreCandidate,
} from "./themes-research.mjs";

test("extractMarketplaceInstalls reads the install statistic", () => {
  const response = {
    results: [
      {
        extensions: [
          {
            statistics: [
              { statisticName: "averagerating", value: 4.8 },
              { statisticName: "install", value: 123456 },
            ],
          },
        ],
      },
    ],
  };

  assert.equal(extractMarketplaceInstalls(response), 123456);
});

test("countStarsSince keeps only recent starred_at values", () => {
  const since = new Date("2026-04-29T00:00:00.000Z");
  const stars = [
    { starred_at: "2026-05-28T00:00:00.000Z" },
    { starred_at: "2026-05-01T00:00:00.000Z" },
    { starred_at: "2026-04-01T00:00:00.000Z" },
  ];

  assert.equal(countStarsSince(stars, since), 2);
});

test("scoreCandidate prefers strong install and momentum signals", () => {
  const high = scoreCandidate({ installs: 1000000, starsPerDay: 2, totalStars: 5000 });
  const low = scoreCandidate({ installs: 1000, starsPerDay: 0, totalStars: 50 });

  assert.ok(high > low);
});

test("rankCandidates sorts descending by score without mutating input", () => {
  const candidates = [
    { name: "Quiet", marketplaceId: "acme.quiet", repo: "acme/quiet" },
    { name: "Loud", marketplaceId: "acme.loud", repo: "acme/loud" },
  ];

  const ranked = rankCandidates(candidates, {
    "acme.quiet": { installs: 100, starsPerDay: 0, totalStars: 10 },
    "acme.loud": { installs: 100000, starsPerDay: 1, totalStars: 1000 },
  });

  assert.deepEqual(
    candidates.map((candidate) => candidate.name),
    ["Quiet", "Loud"],
  );
  assert.deepEqual(
    ranked.map((candidate) => candidate.name),
    ["Loud", "Quiet"],
  );
});

test("parseArgs tolerates the pnpm argument separator", () => {
  assert.deepEqual(parseArgs(["--", "--out", "research-output.json", "--since-days", "30"]), {
    input: "scripts/themes-research-input.json",
    out: "research-output.json",
    sinceDays: 30,
    throttleMs: 250,
  });
});
