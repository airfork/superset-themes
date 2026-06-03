import { useDeferredValue, useLayoutEffect, useMemo, useState } from "react";
import { LayoutShell } from "../chrome/LayoutShell";
import { getCatalogThemeById } from "../data/fixtures";
import { buildThemeCommands, type PaletteCommand } from "../palette/commands";
import { usePalette } from "../palette/usePalette";
import { Pane } from "../pane/Pane";
import { useFocusedTheme } from "../theme/useFocusedTheme";
import type {
  CatalogThemeEntry,
  SupersetTheme,
  TerminalTokens,
  ThemeType,
  UiTokens,
} from "../theme-core/themeTypes";
import {
  currentDraft,
  type DraftHistory,
  canRedo as historyCanRedo,
  canUndo as historyCanUndo,
  commit as historyCommit,
  redo as historyRedo,
  undo as historyUndo,
  initHistory,
} from "./draftHistory";
import {
  createDraftFromGeneratedTheme,
  createDraftFromImportedTheme,
  type ThemeDraft,
  updateDraftTerminalToken,
  updateDraftUiToken,
} from "./draftTheme";
import { LabMobileNotice } from "./LabMobileNotice";
import { LabNameplate } from "./LabNameplate";
import { LabRail } from "./LabRail";
import {
  generateRandomTheme,
  type RandomThemeTokenGroup,
  rerollRandomThemeGroup,
} from "./randomTheme";

interface LabViewProps {
  initialDraft: ThemeDraft;
  // Leaves the lab and returns to the catalog route.
  onBackToCatalog: () => void;
  // Reseeds the draft from a catalog theme by changing ?from=, which remounts
  // this view with a fresh initialDraft.
  onStartFromCatalog: (themeId: string) => void;
}

const DEFAULT_SEED = "preview";
// Slider band width keeps the generated hue near the chosen value while leaving
// the generator a little room to vary; capping the slider at 300 means
// `value + HUE_BAND` never wraps past 360 (which would collapse to full-random).
const DEFAULT_HUE = 220;
const HUE_BAND = 60;

// The chrome is entry-shaped (Pane scenes + BottomBar read a CatalogThemeEntry).
// Drafts have no catalog metadata, so we wrap the live theme in a synthetic entry;
// only `meta.family` is surfaced (in the BottomBar) and it is never schema-validated.
function draftToEntry(draft: ThemeDraft): CatalogThemeEntry {
  const family =
    draft.source.type === "catalog"
      ? (getCatalogThemeById(draft.source.themeId)?.meta.family ?? "Lab draft")
      : "Lab draft";

  return {
    theme: draft.theme,
    meta: {
      accentHue: 0,
      baselineRank: null,
      contrastTier: "standard",
      family,
      featuredRank: null,
      license: "draft",
      notes: "Lab draft",
      portStatus: "adapted",
      source: "generated",
      styleTags: ["draft"],
      terminalPaletteQuality: "balanced",
      themeId: draft.theme.id,
      upstreamUrl: null,
      variant: draft.theme.type,
      warmth: "neutral",
    },
  };
}

export function LabView({ initialDraft, onBackToCatalog, onStartFromCatalog }: LabViewProps) {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [mode, setMode] = useState<ThemeType>(initialDraft.theme.type);
  const [hue, setHue] = useState(DEFAULT_HUE);
  const [rerollNonce, setRerollNonce] = useState(0);

  // Full edit history with a cursor so Undo/Redo step through every change,
  // including manual token edits. See draftHistory.ts for the coalescing rule
  // that keeps a color-picker drag as one undo step.
  const [history, setHistory] = useState<DraftHistory<ThemeDraft>>(() => initHistory(initialDraft));

  const draft = currentDraft(history);
  const canUndo = historyCanUndo(history);
  const canRedo = historyCanRedo(history);
  const entry = useMemo(() => draftToEntry(draft), [draft]);

  const commitDraft = (next: ThemeDraft, coalesceKey: string | null = null) => {
    setHistory((current) => historyCommit(current, next, coalesceKey));
  };

  const handleUndo = () => setHistory(historyUndo);
  const handleRedo = () => setHistory(historyRedo);

  // Token edits (and continuous native color-picker drags) call setDraft many
  // times a second. The Pane subtree reads from a deferred draft so it re-renders
  // at low priority and the rail inputs stay responsive; the live `entry` below
  // still drives the CSS-var morph, so the previewed colors track the drag.
  const deferredDraft = useDeferredValue(draft);
  const deferredEntry = useMemo(() => draftToEntry(deferredDraft), [deferredDraft]);

  const { setTransientEntry } = useFocusedTheme();

  // Push the live draft into the focused-theme context so the whole chrome morphs.
  useLayoutEffect(() => {
    setTransientEntry(entry);
  }, [entry, setTransientEntry]);

  // Clear the override when leaving the lab so the catalog focus resumes.
  useLayoutEffect(() => () => setTransientEntry(null), [setTransientEntry]);

  const generate = (generationSeed: string) => {
    commitDraft(
      createDraftFromGeneratedTheme(
        generateRandomTheme({
          hueRange: { max: hue + HUE_BAND, min: hue },
          mode,
          seed: generationSeed,
        }),
      ),
    );
  };

  const handleGenerate = () => generate(seed);

  const handleRerollAll = () => {
    const nextNonce = rerollNonce + 1;
    setRerollNonce(nextNonce);
    generate(`${seed}:all:${nextNonce}`);
  };

  const handleImportTheme = (theme: SupersetTheme) => {
    commitDraft(createDraftFromImportedTheme(theme));
  };

  const handleUiTokenChange = (token: keyof UiTokens, value: string) => {
    commitDraft(updateDraftUiToken(draft, token, value), `ui:${token}`);
  };

  const handleTerminalTokenChange = (token: keyof TerminalTokens, value: string) => {
    commitDraft(updateDraftTerminalToken(draft, token, value), `term:${token}`);
  };

  const handleRerollGroup = (group: RandomThemeTokenGroup) => {
    const nextNonce = rerollNonce + 1;
    setRerollNonce(nextNonce);
    commitDraft(
      createDraftFromGeneratedTheme(
        rerollRandomThemeGroup({
          group,
          seed: `${seed}:${group}:${nextNonce}`,
          theme: draft.theme,
        }),
      ),
    );
  };

  // In the lab, ⌘K Themes reseed the draft from a catalog theme rather than
  // navigating to a detail route.
  const commands: PaletteCommand[] = buildThemeCommands(onStartFromCatalog);
  const palette = usePalette(commands);

  // Seed only labels generated drafts; for catalog/import drafts it stays
  // undefined, so editing the Seed field never changes this element and the
  // memoized Pane is left untouched by Seed/Hue/Mode edits.
  const nameplateSeed = deferredDraft.source.type === "generated" ? seed : undefined;
  const nameplate = useMemo(
    () => <LabNameplate draft={deferredDraft} seed={nameplateSeed} />,
    [deferredDraft, nameplateSeed],
  );

  return (
    <LayoutShell
      onOpenPalette={palette.open}
      palette={palette.paletteProps}
      rail={
        <LabRail
          canRedo={canRedo}
          canUndo={canUndo}
          draft={draft}
          hue={hue}
          mode={mode}
          onBackToCatalog={onBackToCatalog}
          onGenerate={handleGenerate}
          onHueChange={setHue}
          onImportTheme={handleImportTheme}
          onModeChange={setMode}
          onOpenPalette={palette.open}
          onRedo={handleRedo}
          onRerollAll={handleRerollAll}
          onRerollGroup={handleRerollGroup}
          onSeedChange={setSeed}
          onStartFromCatalog={onStartFromCatalog}
          onTerminalTokenChange={handleTerminalTokenChange}
          onUiTokenChange={handleUiTokenChange}
          onUndo={handleUndo}
          seed={seed}
        />
      }
      pane={
        <>
          <LabMobileNotice />
          <Pane entry={deferredEntry} nameplate={nameplate} />
        </>
      }
    />
  );
}
