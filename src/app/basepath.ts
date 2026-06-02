export function normalizeRouterBasepath(baseUrl: string): string {
  const source = baseUrl.trim();

  if (!source || source === "." || source === "./") {
    return "/";
  }

  let pathname = source;

  if (/^[a-z]+:\/\//i.test(source)) {
    pathname = new URL(source).pathname;
  }

  const pathOnly = pathname.split(/[?#]/)[0] ?? "/";
  const collapsed = pathOnly.replace(/\/+/g, "/");
  const withLeadingSlash = collapsed.startsWith("/") ? collapsed : `/${collapsed}`;
  const withoutTrailingSlash =
    withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/g, "") : withLeadingSlash;

  return withoutTrailingSlash || "/";
}

export const APP_BASEPATH = normalizeRouterBasepath(import.meta.env.BASE_URL);

export function toAppHref(path: string, basepath = APP_BASEPATH): string {
  const normalizedBasepath = normalizeRouterBasepath(basepath);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedBasepath === "/") {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `${normalizedBasepath}/`;
  }

  return `${normalizedBasepath}${normalizedPath}`;
}
