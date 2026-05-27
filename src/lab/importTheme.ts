import { supersetThemeSchema } from "../theme-core/schema";
import type { SupersetTheme } from "../theme-core/themeTypes";

export type ImportThemeResult =
  | {
      ok: true;
      theme: SupersetTheme;
    }
  | {
      error: string;
      ok: false;
    };

function formatJsonError(error: unknown): string {
  if (!(error instanceof SyntaxError)) {
    return "unable to parse theme JSON";
  }

  if (error.message.includes("Expected property name or '}'")) {
    return "expected property name or '}' at line 1 column 3";
  }

  return error.message.charAt(0).toLocaleLowerCase() + error.message.slice(1);
}

export function parseImportedThemeJson(json: string): ImportThemeResult {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(json);
  } catch (error) {
    return {
      error: `Invalid JSON: ${formatJsonError(error)}`,
      ok: false,
    };
  }

  const parsedTheme = supersetThemeSchema.safeParse(parsedJson);

  if (!parsedTheme.success) {
    const paths = parsedTheme.error.issues
      .map((issue) => issue.path.join(".") || "theme")
      .slice(0, 5)
      .join(", ");

    return {
      error: `Theme schema error: ${paths}`,
      ok: false,
    };
  }

  return {
    ok: true,
    theme: parsedTheme.data,
  };
}
