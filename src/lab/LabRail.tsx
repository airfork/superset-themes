import { Search } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { SupersetTheme, TerminalTokens, ThemeType, UiTokens } from "../theme-core/themeTypes";
import { ContrastSummary } from "./ContrastSummary";
import type { ThemeDraft } from "./draftTheme";
import { GenerateSection } from "./GenerateSection";
import { LabFooter } from "./LabFooter";
import type { RandomThemeTokenGroup } from "./randomTheme";
import { SourceSection } from "./SourceSection";
import { TokensSection } from "./TokensSection";

interface LabRailProps {
  draft: ThemeDraft;
  hue: number;
  mode: ThemeType;
  onBackToCatalog: () => void;
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

// Scroll a UI token's editor into view and focus its hex input so the user can
// fix the value a contrast warning points at.
function focusUiToken(token: keyof UiTokens) {
  const row = document.getElementById(`lab-token-ui-${token}`);
  if (!row) {
    return;
  }
  row.scrollIntoView({ block: "center" });
  row.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
}

export function LabRail({
  draft,
  hue,
  mode,
  onBackToCatalog,
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
  // The lab rail keeps a visible palette trigger (the catalog rail repurposed its
  // search box into a theme filter). "/" while focused mirrors the kbd hint.
  const onSearchKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "/") {
      event.preventDefault();
      onOpenPalette();
    }
  };

  return (
    <div className="rail lab-rail">
      <div className="rail__search">
        <button
          type="button"
          className="rail-search"
          onClick={onOpenPalette}
          onKeyDown={onSearchKeyDown}
          aria-label="Search themes"
        >
          <Search aria-hidden="true" width={14} height={14} />
          <span className="rail-search__label">Search themes</span>
          <kbd className="rail-search__kbd">/</kbd>
        </button>
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

      <ContrastSummary onSelectToken={focusUiToken} theme={draft.theme} />

      <TokensSection
        draft={draft}
        onRerollGroup={onRerollGroup}
        onTerminalTokenChange={onTerminalTokenChange}
        onUiTokenChange={onUiTokenChange}
      />

      <LabFooter onBackToCatalog={onBackToCatalog} theme={draft.theme} />
    </div>
  );
}
