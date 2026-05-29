import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const MARKETPLACE_ENDPOINT =
  "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=3.0-preview.1";
const GITHUB_API = "https://api.github.com";
const DEFAULT_INPUT = "scripts/themes-research-input.json";
const DEFAULT_OUTPUT = "research-output.json";
const DEFAULT_SINCE_DAYS = 30;
const DEFAULT_THROTTLE_MS = 250;

let warnedMissingGithubToken = false;

export function extractMarketplaceInstalls(response) {
  const extension = response?.results?.[0]?.extensions?.[0];
  const installStatistic = extension?.statistics?.find(
    (statistic) => statistic.statisticName === "install",
  );
  const installs = Number(installStatistic?.value);

  if (!Number.isFinite(installs)) {
    throw new Error("Marketplace response did not include an install statistic.");
  }

  return installs;
}

export function countStarsSince(stargazers, sinceDate) {
  const sinceTime = sinceDate.getTime();

  return stargazers.filter((stargazer) => {
    const starredTime = Date.parse(stargazer.starred_at ?? "");
    return Number.isFinite(starredTime) && starredTime >= sinceTime;
  }).length;
}

export function scoreCandidate({ installs, starsPerDay, totalStars }) {
  const installScore = Math.log10(Number(installs ?? 0) + 1);
  const githubScore =
    starsPerDay === null || starsPerDay === undefined
      ? 0.25 * Math.log10(Number(totalStars ?? 0) + 1)
      : Math.log10(Number(starsPerDay) + 1);
  const score = 0.6 * installScore + 0.4 * githubScore;

  return Math.round(score * 10000) / 10000;
}

export function rankCandidates(candidates, signalsByMarketplaceId) {
  return candidates
    .map((candidate) => {
      const signals = signalsByMarketplaceId[candidate.marketplaceId];

      if (!signals) {
        throw new Error(`Missing research signals for ${candidate.marketplaceId}.`);
      }

      return {
        ...candidate,
        githubSignal: signals.githubSignal ?? "velocity",
        installs: signals.installs,
        score: scoreCandidate(signals),
        stars30d: signals.stars30d ?? null,
        starsPerDay: signals.starsPerDay ?? null,
        totalStars: signals.totalStars ?? null,
      };
    })
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
}

export function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT,
    out: DEFAULT_OUTPUT,
    sinceDays: DEFAULT_SINCE_DAYS,
    throttleMs: DEFAULT_THROTTLE_MS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    if (arg === "--") {
      continue;
    }

    if (arg === "--input") {
      options.input = readRequiredValue(arg, value);
      index += 1;
      continue;
    }

    if (arg === "--out") {
      options.out = readRequiredValue(arg, value);
      index += 1;
      continue;
    }

    if (arg === "--since-days") {
      options.sinceDays = readPositiveInteger(arg, value);
      index += 1;
      continue;
    }

    if (arg === "--throttle-ms") {
      options.throttleMs = readNonNegativeInteger(arg, value);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function readRequiredValue(arg, value) {
  if (!value || value.startsWith("--")) {
    throw new Error(`Expected a value after ${arg}.`);
  }

  return value;
}

function readPositiveInteger(arg, value) {
  const parsed = Number(readRequiredValue(arg, value));

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected ${arg} to be a positive integer.`);
  }

  return parsed;
}

function readNonNegativeInteger(arg, value) {
  const parsed = Number(readRequiredValue(arg, value));

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Expected ${arg} to be a non-negative integer.`);
  }

  return parsed;
}

function validateCandidates(value) {
  if (!Array.isArray(value)) {
    throw new Error("Research input must be a JSON array.");
  }

  const seen = new Set();

  return value.map((candidate, index) => {
    const name = readString(candidate?.name, `candidate ${index + 1} name`);
    const marketplaceId = readString(
      candidate?.marketplaceId,
      `candidate ${index + 1} marketplaceId`,
    );
    const repo = readString(candidate?.repo, `candidate ${index + 1} repo`);

    if (!/^[^.]+\.[^.]+$/.test(marketplaceId)) {
      throw new Error(`Expected ${marketplaceId} to look like publisher.extension.`);
    }

    if (!/^[^/]+\/[^/]+$/.test(repo)) {
      throw new Error(`Expected ${repo} to look like owner/name.`);
    }

    if (seen.has(marketplaceId)) {
      throw new Error(`Duplicate marketplaceId: ${marketplaceId}.`);
    }
    seen.add(marketplaceId);

    return { name, marketplaceId, repo };
  });
}

function readString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Expected ${label} to be a non-empty string.`);
  }

  return value.trim();
}

async function loadCandidates(path) {
  const raw = await readFile(path, "utf8");
  return validateCandidates(JSON.parse(raw));
}

function createThrottledFetch(fetchImpl, throttleMs) {
  let previousRequestTime = 0;

  return async (url, options) => {
    const now = Date.now();
    const waitMs = Math.max(0, previousRequestTime + throttleMs - now);

    if (waitMs > 0) {
      await sleep(waitMs);
    }

    previousRequestTime = Date.now();
    return fetchImpl(url, options);
  };
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchMarketplaceInstalls(candidate, fetchImpl) {
  const response = await fetchImpl(MARKETPLACE_ENDPOINT, {
    body: JSON.stringify({
      filters: [
        {
          criteria: [{ filterType: 7, value: candidate.marketplaceId }],
          pageNumber: 1,
          pageSize: 1,
          sortBy: 0,
          sortOrder: 0,
        },
      ],
      flags: 914,
    }),
    headers: {
      Accept: "application/json;api-version=3.0-preview.1",
      "Content-Type": "application/json",
      "User-Agent": "superset-theme-catalog-research",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Marketplace request failed for ${candidate.marketplaceId}: ${response.status} ${response.statusText}`,
    );
  }

  return extractMarketplaceInstalls(await response.json());
}

async function fetchGitHubSignals(candidate, { fetchImpl, githubToken, sinceDate, sinceDays }) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "superset-theme-catalog-research",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  } else if (!warnedMissingGithubToken) {
    console.warn("GITHUB_TOKEN is not set; falling back to total GitHub stars.");
    warnedMissingGithubToken = true;
  }

  const repoResponse = await fetchImpl(`${GITHUB_API}/repos/${candidate.repo}`, { headers });

  if (!repoResponse.ok) {
    throw new Error(
      `GitHub repo request failed for ${candidate.repo}: ${repoResponse.status} ${repoResponse.statusText}`,
    );
  }

  const repo = await repoResponse.json();
  const totalStars = Number(repo.stargazers_count ?? 0);

  if (!githubToken) {
    return {
      githubSignal: "total-fallback",
      stars30d: null,
      starsPerDay: null,
      totalStars,
    };
  }

  const stars30d = await fetchRecentStargazerCount(candidate, {
    fetchImpl,
    headers: {
      ...headers,
      Accept: "application/vnd.github.star+json",
    },
    sinceDate,
  });

  return {
    githubSignal: "velocity",
    stars30d,
    starsPerDay: stars30d / sinceDays,
    totalStars,
  };
}

async function fetchRecentStargazerCount(candidate, { fetchImpl, headers, sinceDate }) {
  let page = 1;
  let count = 0;

  while (true) {
    const response = await fetchImpl(
      `${GITHUB_API}/repos/${candidate.repo}/stargazers?per_page=100&page=${page}`,
      { headers },
    );

    if (!response.ok) {
      throw new Error(
        `GitHub stargazer request failed for ${candidate.repo}: ${response.status} ${response.statusText}`,
      );
    }

    const stargazers = await response.json();

    if (!Array.isArray(stargazers) || stargazers.length === 0) {
      return count;
    }

    count += countStarsSince(stargazers, sinceDate);

    if (
      stargazers.some((stargazer) => Date.parse(stargazer.starred_at ?? "") < sinceDate.getTime())
    ) {
      return count;
    }

    page += 1;
  }
}

async function researchCandidates(candidates, options) {
  const fetchImpl = createThrottledFetch(fetch, options.throttleMs);
  const githubToken = process.env.GITHUB_TOKEN;
  const sinceDate = new Date(Date.now() - options.sinceDays * 24 * 60 * 60 * 1000);
  const signalsByMarketplaceId = {};

  for (const candidate of candidates) {
    const installs = await fetchMarketplaceInstalls(candidate, fetchImpl);
    const githubSignals = await fetchGitHubSignals(candidate, {
      fetchImpl,
      githubToken,
      sinceDate,
      sinceDays: options.sinceDays,
    });

    signalsByMarketplaceId[candidate.marketplaceId] = {
      installs,
      ...githubSignals,
    };
  }

  return rankCandidates(candidates, signalsByMarketplaceId);
}

async function run(argv) {
  const options = parseArgs(argv);
  const candidates = await loadCandidates(options.input);
  const ranked = await researchCandidates(candidates, options);
  const payload = {
    candidates: ranked,
    generatedAt: new Date().toISOString(),
    sinceDays: options.sinceDays,
  };

  await writeFile(options.out, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.error(`Wrote ${ranked.length} ranked candidate(s) to ${options.out}.`);
}

function isCliEntryPoint() {
  const entry = process.argv[1];
  return entry ? import.meta.url === pathToFileURL(entry).href : false;
}

if (isCliEntryPoint()) {
  run(process.argv.slice(2)).catch((error) => {
    console.error(`${basename(fileURLToPath(import.meta.url))}: ${error.message}`);
    process.exit(1);
  });
}
