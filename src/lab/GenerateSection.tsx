import { Shuffle, Sparkles } from "lucide-react";
import { RailSection } from "../rail/RailSection";
import type { ThemeType } from "../theme-core/themeTypes";
import type { ThemeDraft } from "./draftTheme";

interface GenerateSectionProps {
  draft: ThemeDraft;
  hue: number;
  mode: ThemeType;
  onGenerate: () => void;
  onHueChange: (hue: number) => void;
  onModeChange: (mode: ThemeType) => void;
  onRerollAll: () => void;
  onSeedChange: (seed: string) => void;
  seed: string;
}

export function GenerateSection({
  draft,
  hue,
  mode,
  onGenerate,
  onHueChange,
  onModeChange,
  onRerollAll,
  onSeedChange,
  seed,
}: GenerateSectionProps) {
  // "Reroll all" only makes sense once a seed-based draft already exists.
  const generated = draft.source.type === "generated";

  return (
    <RailSection label="Generate">
      <label className="lab-field" htmlFor="lab-generate-seed">
        <span>Seed</span>
        <input
          autoComplete="off"
          id="lab-generate-seed"
          name="lab-generate-seed"
          onChange={(event) => onSeedChange(event.currentTarget.value)}
          spellCheck={false}
          type="text"
          value={seed}
        />
      </label>

      <label className="lab-field" htmlFor="lab-generate-mode">
        <span>Mode</span>
        <span className="lab-field__select">
          <select
            id="lab-generate-mode"
            name="lab-generate-mode"
            onChange={(event) =>
              onModeChange(event.currentTarget.value === "dark" ? "dark" : "light")
            }
            value={mode}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </span>
      </label>

      <label className="lab-field lab-hue-field" htmlFor="lab-generate-hue">
        <span>Hue {Math.round(hue)}°</span>
        <input
          id="lab-generate-hue"
          max={300}
          min={0}
          name="lab-generate-hue"
          onChange={(event) => onHueChange(event.currentTarget.valueAsNumber)}
          step={1}
          type="range"
          value={hue}
        />
      </label>

      <div className="lab-actions">
        <button className="catalog-action-button" onClick={onGenerate} type="button">
          <Sparkles aria-hidden="true" />
          <span>Generate</span>
        </button>
        {generated ? (
          <button className="catalog-action-button" onClick={onRerollAll} type="button">
            <Shuffle aria-hidden="true" />
            <span>Reroll all</span>
          </button>
        ) : null}
      </div>

      <p className="lab-field-hint">
        The same seed and hue reproduce the same palette. Every pair is checked against WCAG AA.
      </p>
    </RailSection>
  );
}
