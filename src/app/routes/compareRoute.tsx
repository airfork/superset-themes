import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { BottomBar } from "../../chrome/BottomBar";
import { LayoutShell } from "../../chrome/LayoutShell";
import { CompareView } from "../../compare/CompareView";
import { type CompareState, compareReducer } from "../../compare/compareState";
import { catalogThemes } from "../../data/catalog";
import { buildThemeCommands, type PaletteCommand } from "../../palette/commands";
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
  // Resolve the baseline once: a bare /compare visit has no `a`, so fall back to
  // the first-paint focused theme.
  const [state, setState] = useState<CompareState>(() =>
    seedCompareState(search, focused.theme.id),
  );
  const [scene, setScene] = useState<SceneId>(search.scene ?? "workspace");
  // Mirror of the rail's filter so ⌘K can seed itself with whatever's typed there.
  const [railFilter, setRailFilter] = useState("");

  // The chrome reads :root, which the provider sets to the baseline theme.
  const baselineId = state.baseline;
  useEffect(() => {
    if (baselineId && baselineId !== focused.theme.id) {
      setFocusedId(baselineId);
    }
  }, [baselineId, focused.theme.id, setFocusedId]);

  const commit = (next: CompareState) => {
    setState(next);
    onChangeSearch(compareStateToSearch(next, scene));
  };

  const pick = (themeId: string) => commit(compareReducer(state, { type: "pick", themeId }));
  const swap = () => commit(compareReducer(state, { type: "swap" }));
  const clearCandidate = () => commit(compareReducer(state, { type: "clear" }));

  // Esc exits compare mode back to the catalog at the current baseline.
  const exitRef = useRef(() => onExit(baselineId));
  exitRef.current = () => onExit(baselineId);
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

  const changeScene = (next: SceneId) => {
    setScene(next);
    onChangeSearch(compareStateToSearch(state, next));
  };

  // The baseline reads as the current theme; the candidate carries the pin marker.
  const pinnedThemeIds = useMemo(
    () => new Set([state.candidate].filter((id): id is string => id !== null)),
    [state.candidate],
  );

  const hint =
    state.candidate === null ? "Compare mode: click any theme to set the candidate." : undefined;

  const commands: PaletteCommand[] = [
    ...buildThemeCommands(pick),
    {
      id: "action-swap-slots",
      label: "Swap slots",
      section: "Actions",
      keys: ["swap slots", "swap", "exchange"],
      run: swap,
    },
    {
      id: "action-open-in-lab",
      label: "Open in Lab",
      section: "Actions",
      keys: ["open in lab", "lab", "editor"],
      run: () => onOpenLab(baselineId),
    },
    {
      id: "action-exit-compare",
      label: "Exit compare",
      section: "Actions",
      keys: ["exit compare", "close", "back"],
      run: () => onExit(baselineId),
    },
  ];
  const palette = usePalette(commands, { seedQuery: railFilter });

  return (
    <LayoutShell
      onOpenPalette={palette.open}
      palette={palette.paletteProps}
      bottomBar={
        <BottomBar
          variant="compare"
          baseline={entryFor(state.baseline)}
          candidate={entryFor(state.candidate)}
        />
      }
      rail={
        <Rail
          focusedThemeId={baselineId}
          pinnedThemeIds={pinnedThemeIds}
          hint={hint}
          onSelect={pick}
          onFilterChange={setRailFilter}
        />
      }
      pane={
        <CompareView
          state={state}
          scene={scene}
          onSceneChange={changeScene}
          onSwap={swap}
          onClearCandidate={clearCandidate}
          onExit={() => onExit(baselineId)}
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
