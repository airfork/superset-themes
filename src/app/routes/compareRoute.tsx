import { useEffect, useMemo, useRef, useState } from "react";
import { BottomBar } from "../../chrome/BottomBar";
import { LayoutShell } from "../../chrome/LayoutShell";
import { CompareView } from "../../compare/CompareView";
import { type CompareSlotId, type CompareState, compareReducer } from "../../compare/compareState";
import { catalogThemes } from "../../data/catalog";
import { buildThemeCommands, nextThemeId, type PaletteCommand } from "../../palette/commands";
import { usePalette } from "../../palette/usePalette";
import type { SceneId } from "../../pane/SceneTabs";
import { Rail } from "../../rail/Rail";
import { useFocusedTheme } from "../../theme/useFocusedTheme";
import {
  type CompareRouteSearch,
  compareStateToSearch,
  seedCompareState,
} from "./compareRouteSearch";

function entryFor(themeId: string | null) {
  return themeId ? catalogThemes.find((candidate) => candidate.theme.id === themeId) : undefined;
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
  // Mirror of the rail's filter so ⌘K can seed itself with whatever's typed there.
  const [railFilter, setRailFilter] = useState("");

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
  const restore = (slot: CompareSlotId, themeId: string) =>
    commit(compareReducer(state, { type: "restore", slot, themeId }));

  const changeScene = (next: SceneId) => {
    setScene(next);
    onChangeSearch(compareStateToSearch(state, next));
  };

  const pinnedThemeIds = useMemo(
    () => new Set([state.a, state.b].filter((id): id is string => id !== null)),
    [state.a, state.b],
  );

  const hint =
    state.b === null ? "Compare mode: click any theme to fill the second slot." : undefined;

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
  const palette = usePalette(commands, { seedQuery: railFilter });

  return (
    <LayoutShell
      onOpenPalette={palette.open}
      palette={palette.paletteProps}
      bottomBar={<BottomBar variant="compare" a={entryFor(state.a)} b={entryFor(state.b)} />}
      rail={
        <Rail
          focusedThemeId={fromId}
          pinnedThemeIds={pinnedThemeIds}
          hint={hint}
          onSelect={pin}
          onFilterChange={setRailFilter}
        />
      }
      pane={
        <CompareView
          state={state}
          scene={scene}
          onSceneChange={changeScene}
          onUnpin={unpin}
          onRestore={restore}
          onExit={() => onExit(fromId)}
        />
      }
    />
  );
}

export type { CompareRouteSearch } from "./compareRouteSearch";
export {
  compareStateToSearch,
  parseCompareRouteSearch,
  seedCompareState,
} from "./compareRouteSearch";
