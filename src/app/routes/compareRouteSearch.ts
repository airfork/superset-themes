import type { CompareState } from "../../compare/compareState";
import { catalogThemes } from "../../data/catalog";
import type { SceneId } from "../../pane/SceneTabs";

export interface CompareRouteSearch {
  a?: string;
  b?: string;
  scene?: SceneId;
}

const SCENE_VALUES = new Set<SceneId>(["workspace", "settings"]);
const THEME_IDS = new Set(catalogThemes.map((entry) => entry.theme.id));

function stringParam(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function themeIdParam(value: unknown): string | undefined {
  const themeId = stringParam(value);
  return themeId && THEME_IDS.has(themeId) ? themeId : undefined;
}

export function parseCompareRouteSearch(search: Record<string, unknown>): CompareRouteSearch {
  return {
    a: themeIdParam(search.a),
    b: themeIdParam(search.b),
    scene:
      typeof search.scene === "string" && SCENE_VALUES.has(search.scene as SceneId)
        ? (search.scene as SceneId)
        : undefined,
  };
}

// `a` is the baseline (also the chrome theme); `b` is the candidate. A bare visit
// has no `a`, so the caller supplies the focused theme as the fallback baseline.
export function seedCompareState(
  search: CompareRouteSearch,
  fallbackBaseline: string,
): CompareState {
  const baseline = search.a || fallbackBaseline;
  const candidate = search.b && search.b !== baseline ? search.b : null;
  return {
    baseline,
    candidate,
  };
}

export function compareStateToSearch(state: CompareState, scene: SceneId): CompareRouteSearch {
  return {
    a: state.baseline || undefined,
    b: state.candidate ?? undefined,
    scene,
  };
}
