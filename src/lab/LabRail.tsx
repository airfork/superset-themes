import { RailSearch } from "../rail/RailSearch";
import type { SupersetTheme, ThemeType } from "../theme-core/themeTypes";
import type { ThemeDraft } from "./draftTheme";
import { GenerateSection } from "./GenerateSection";
import { SourceSection } from "./SourceSection";

interface LabRailProps {
  draft: ThemeDraft;
  hue: number;
  mode: ThemeType;
  onGenerate: () => void;
  onHueChange: (hue: number) => void;
  onImportTheme: (theme: SupersetTheme) => void;
  onModeChange: (mode: ThemeType) => void;
  onOpenPalette: () => void;
  onRerollAll: () => void;
  onSeedChange: (seed: string) => void;
  onStartFromCatalog: (themeId: string) => void;
  seed: string;
}

export function LabRail({
  draft,
  hue,
  mode,
  onGenerate,
  onHueChange,
  onImportTheme,
  onModeChange,
  onOpenPalette,
  onRerollAll,
  onSeedChange,
  onStartFromCatalog,
  seed,
}: LabRailProps) {
  return (
    <div className="rail lab-rail">
      <div className="rail__search">
        <RailSearch onOpenPalette={onOpenPalette} />
      </div>

      <SourceSection
        draft={draft}
        onImportTheme={onImportTheme}
        onStartFromCatalog={onStartFromCatalog}
      />

      <GenerateSection
        draft={draft}
        hue={hue}
        mode={mode}
        onGenerate={onGenerate}
        onHueChange={onHueChange}
        onModeChange={onModeChange}
        onRerollAll={onRerollAll}
        onSeedChange={onSeedChange}
        seed={seed}
      />
    </div>
  );
}
