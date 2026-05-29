import { RailSearch } from "../rail/RailSearch";
import type { SupersetTheme, TerminalTokens, ThemeType, UiTokens } from "../theme-core/themeTypes";
import type { ThemeDraft } from "./draftTheme";
import { GenerateSection } from "./GenerateSection";
import type { RandomThemeTokenGroup } from "./randomTheme";
import { SourceSection } from "./SourceSection";
import { TokensSection } from "./TokensSection";

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
  onRerollGroup: (group: RandomThemeTokenGroup) => void;
  onSeedChange: (seed: string) => void;
  onStartFromCatalog: (themeId: string) => void;
  onTerminalTokenChange: (token: keyof TerminalTokens, value: string) => void;
  onUiTokenChange: (token: keyof UiTokens, value: string) => void;
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
  onRerollGroup,
  onSeedChange,
  onStartFromCatalog,
  onTerminalTokenChange,
  onUiTokenChange,
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

      <TokensSection
        draft={draft}
        onRerollGroup={onRerollGroup}
        onTerminalTokenChange={onTerminalTokenChange}
        onUiTokenChange={onUiTokenChange}
      />
    </div>
  );
}
