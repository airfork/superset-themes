import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutShell } from "../../chrome/LayoutShell";
import { CompareView } from "../../compare/CompareView";
import { type CompareSlotId, type CompareState, compareReducer } from "../../compare/compareState";
import { buildThemeCommands, nextThemeId, type PaletteCommand } from "../../palette/commands";
import { usePalette } from "../../palette/usePalette";
import type { SceneId } from "../../pane/SceneTabs";
import { Rail } from "../../rail/Rail";
import { useFocusedTheme } from "../../theme/useFocusedTheme";

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

export interface CompareRouteViewProps {
  search: CompareRouteSearch;
  onChangeSearch: (search: CompareRouteSearch) => void;
  onExit: (themeId: string) => void;
  onOpenLab: (themeId: string) => void;
}

export function CompareRouteView({
  search,
  onChangeSearch,
  onExit,
  onOpenLab,
}: CompareRouteViewProps) {
  const { focused, setFocusedId } = useFocusedTheme();
  const [state, setState] = useState<CompareState>(() => seedCompareState(search));
  const [scene, setScene] = useState<SceneId>(search.scene ?? "workspace");

  // Chrome stays at the entry-state theme: apply `from` to :root via the provider.
  const fromId = state.enteredFromThemeId;
  useEffect(() => {
    if (fromId && fromId !== focused.theme.id) {
      setFocusedId(fromId);
    }
  }, [fromId, focused.theme.id, setFocusedId]);

  // Esc exits compare mode back to the catalog at the entry-state theme.
  const exitRef = useRef(() => onExit(fromId));
  exitRef.current = () => onExit(fromId);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        exitRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const commit = (next: CompareState) => {
    setState(next);
    onChangeSearch(compareStateToSearch(next, scene));
  };

  const pin = (themeId: string) => commit(compareReducer(state, { type: "pin", themeId }));
  const unpin = (slot: CompareSlotId) => commit(compareReducer(state, { type: "unpin", slot }));

  const changeScene = (next: SceneId) => {
    setScene(next);
    onChangeSearch(compareStateToSearch(state, next));
  };

  const pinnedThemeIds = useMemo(
    () => new Set([state.a, state.b].filter((id): id is string => id !== null)),
    [state.a, state.b],
  );

  const hint =
    state.b === null ? "Compare mode — click any theme to fill the second slot." : undefined;

  // Picking a theme fills the next compare slot; the entry-from theme drives the chrome.
  const setEntryTheme = (themeId: string) => commit({ ...state, enteredFromThemeId: themeId });
  const commands: PaletteCommand[] = [
    ...buildThemeCommands(pin),
    {
      id: "action-open-in-lab",
      label: "Open in Lab",
      section: "Actions",
      keys: ["open in lab", "lab", "editor"],
      run: () => onOpenLab(fromId),
    },
    {
      id: "action-exit-compare",
      label: "Exit compare",
      section: "Actions",
      keys: ["exit compare", "close", "back"],
      run: () => onExit(fromId),
    },
    {
      id: "action-toggle-next-theme",
      label: "Toggle next theme",
      section: "Actions",
      keys: ["toggle next theme", "next", "cycle"],
      run: () => setEntryTheme(nextThemeId(fromId)),
    },
  ];
  const palette = usePalette(commands);

  return (
    <LayoutShell
      onOpenPalette={palette.open}
      palette={palette.paletteProps}
      rail={
        <Rail focusedThemeId={fromId} pinnedThemeIds={pinnedThemeIds} hint={hint} onSelect={pin} />
      }
      pane={
        <CompareView
          state={state}
          scene={scene}
          onSceneChange={changeScene}
          onUnpin={unpin}
          onRepin={pin}
          onExit={() => onExit(fromId)}
        />
      }
    />
  );
}
