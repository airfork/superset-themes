import type { CompareState } from "../../compare/compareState";
import type { SceneId } from "../../pane/SceneTabs";

export interface CompareRouteSearch {
  a?: string;
  b?: string;
  scene?: SceneId;
}

const SCENE_VALUES = new Set<SceneId>(["workspace", "settings"]);

function stringParam(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function parseCompareRouteSearch(search: Record<string, unknown>): CompareRouteSearch {
  return {
    a: stringParam(search.a),
    b: stringParam(search.b),
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
  return {
    baseline: search.a ?? fallbackBaseline,
    candidate: search.b ?? null,
  };
}

export function compareStateToSearch(state: CompareState, scene: SceneId): CompareRouteSearch {
  return {
    a: state.baseline || undefined,
    b: state.candidate ?? undefined,
    scene,
  };
}
