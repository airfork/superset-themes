import type { CompareSlotId, CompareState } from "../../compare/compareState";
import type { SceneId } from "../../pane/SceneTabs";

export interface CompareRouteSearch {
  a?: string;
  b?: string;
  from?: string;
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
    from: stringParam(search.from),
    scene:
      typeof search.scene === "string" && SCENE_VALUES.has(search.scene as SceneId)
        ? (search.scene as SceneId)
        : undefined,
  };
}

export function seedCompareState(search: CompareRouteSearch): CompareState {
  const a = search.a ?? null;
  const b = search.b ?? null;
  const lastPinned: CompareSlotId | null = b ? "b" : a ? "a" : null;
  return {
    a,
    b,
    lastPinned,
    enteredFromThemeId: search.from ?? a ?? "",
  };
}

export function compareStateToSearch(state: CompareState, scene: SceneId): CompareRouteSearch {
  return {
    a: state.a ?? undefined,
    b: state.b ?? undefined,
    from: state.enteredFromThemeId || undefined,
    scene,
  };
}
