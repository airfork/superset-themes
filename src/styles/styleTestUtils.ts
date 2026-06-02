import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const CSS_IMPORT_PATTERN = /@import\s+["'](?<path>[^"']+)["'];?/g;

export function readStyleSheetGraph(entryPath: string, seen = new Set<string>()): string {
  const absolutePath = resolve(entryPath);

  if (seen.has(absolutePath)) {
    return "";
  }

  seen.add(absolutePath);

  const css = readFileSync(absolutePath, "utf8");
  let output = "";
  let lastIndex = 0;

  for (const match of css.matchAll(CSS_IMPORT_PATTERN)) {
    const importPath = match.groups?.path;

    if (!importPath || match.index === undefined) {
      continue;
    }

    output += css.slice(lastIndex, match.index);
    output += readStyleSheetGraph(join(dirname(absolutePath), importPath), seen);
    lastIndex = match.index + match[0].length;

    if (css[lastIndex] === "\n" && output.endsWith("\n")) {
      lastIndex += 1;
    }
  }

  output += css.slice(lastIndex);

  return output;
}
