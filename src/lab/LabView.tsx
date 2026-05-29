import { useEffect, useMemo, useState } from "react";
import { LayoutShell } from "../chrome/LayoutShell";
import { getCatalogThemeById } from "../data/fixtures";
import { buildThemeCommands, type PaletteCommand } from "../palette/commands";
import { usePalette } from "../palette/usePalette";
import { Pane } from "../pane/Pane";
import { useFocusedTheme } from "../theme/useFocusedTheme";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import type { ThemeDraft } from "./draftTheme";
import { LabNameplate } from "./LabNameplate";
import { LabRail } from "./LabRail";

interface LabViewProps {
  initialDraft: ThemeDraft;
  // Reseeds the draft from a catalog theme by changing ?from=, which remounts
  // this view with a fresh initialDraft.
  onStartFromCatalog: (themeId: string) => void;
}

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

export function LabView({ initialDraft, onStartFromCatalog }: LabViewProps) {
  const [draft] = useState(initialDraft);
  const entry = useMemo(() => draftToEntry(draft), [draft]);

  const { setTransientEntry } = useFocusedTheme();

  // Push the live draft into the focused-theme context so the whole chrome morphs.
  useEffect(() => {
    setTransientEntry(entry);
  }, [entry, setTransientEntry]);

  // Clear the override when leaving the lab so the catalog focus resumes.
  useEffect(() => () => setTransientEntry(null), [setTransientEntry]);

  // In the lab, ⌘K Themes reseed the draft from a catalog theme rather than
  // navigating to a detail route.
  const commands: PaletteCommand[] = buildThemeCommands(onStartFromCatalog);
  const palette = usePalette(commands);

  return (
    <LayoutShell
      onOpenPalette={palette.open}
      palette={palette.paletteProps}
      rail={
        <LabRail
          draft={draft}
          onStartFromCatalog={onStartFromCatalog}
          onOpenPalette={palette.open}
        />
      }
      pane={<Pane entry={entry} nameplate={<LabNameplate draft={draft} />} />}
    />
  );
}
