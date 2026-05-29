import { RailSection } from "../rail/RailSection";
import { getContrastRatio } from "../theme-core/contrast";
import type { SupersetTheme, UiTokens } from "../theme-core/themeTypes";

// WCAG AA for normal text. Pairs below this are surfaced as failures.
const AA_NORMAL_TEXT = 4.5;

type ContrastPairSpec = {
  backgroundToken: keyof UiTokens;
  // The token a user would adjust to fix the pair — also the scroll anchor.
  foregroundToken: keyof UiTokens;
  label: string;
};

// Text-on-surface pairs that drive readability. The foreground token is both
// the contrast text colour and the anchor we scroll to when a pair is clicked.
const CONTRAST_PAIRS: ContrastPairSpec[] = [
  {
    backgroundToken: "background",
    foregroundToken: "foreground",
    label: "Foreground on background",
  },
  {
    backgroundToken: "background",
    foregroundToken: "mutedForeground",
    label: "Muted foreground on background",
  },
  { backgroundToken: "card", foregroundToken: "cardForeground", label: "Card foreground on card" },
  {
    backgroundToken: "selection",
    foregroundToken: "selectionForeground",
    label: "Selection foreground on selection",
  },
  {
    backgroundToken: "accent",
    foregroundToken: "accentForeground",
    label: "Accent foreground on accent",
  },
  {
    backgroundToken: "primary",
    foregroundToken: "primaryForeground",
    label: "Primary foreground on primary",
  },
];

interface ContrastSummaryProps {
  onSelectToken?: (token: keyof UiTokens) => void;
  theme: SupersetTheme;
}

interface ContrastRow extends ContrastPairSpec {
  passes: boolean;
  ratio: number;
}

function evaluatePair(theme: SupersetTheme, pair: ContrastPairSpec): ContrastRow {
  const ratio = getContrastRatio(theme.ui[pair.backgroundToken], theme.ui[pair.foregroundToken]);
  return { ...pair, passes: ratio >= AA_NORMAL_TEXT, ratio };
}

export function ContrastSummary({ onSelectToken, theme }: ContrastSummaryProps) {
  const rows = CONTRAST_PAIRS.map((pair) => evaluatePair(theme, pair));
  const failing = rows.filter((row) => !row.passes);
  const passing = rows.filter((row) => row.passes);

  const renderRow = (row: ContrastRow) => (
    <li key={row.label}>
      <button
        className={`lab-contrast__row${row.passes ? "" : " lab-contrast__row--fail"}`}
        onClick={() => onSelectToken?.(row.foregroundToken)}
        type="button"
      >
        <span className="lab-contrast__pair">{row.label}</span>
        <span className="lab-contrast__ratio">{row.ratio.toFixed(1)}:1</span>
        <span className={`lab-contrast__badge${row.passes ? " lab-contrast__badge--pass" : ""}`}>
          {row.passes ? "AA" : "AA fail"}
        </span>
      </button>
    </li>
  );

  return (
    <RailSection label="Contrast">
      {failing.length > 0 ? (
        <ul className="lab-contrast__list">{failing.map(renderRow)}</ul>
      ) : (
        <p className="lab-contrast__ok">All pairs meet AA (4.5:1).</p>
      )}
      {passing.length > 0 ? (
        <details className="lab-contrast__passing">
          <summary>{passing.length} passing</summary>
          <ul className="lab-contrast__list">{passing.map(renderRow)}</ul>
        </details>
      ) : null}
    </RailSection>
  );
}
