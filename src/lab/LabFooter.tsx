import { ArrowLeft } from "lucide-react";
import { exportThemeJson } from "../theme-core/exportTheme";
import type { SupersetTheme } from "../theme-core/themeTypes";

interface LabFooterProps {
  onBackToCatalog: () => void;
  theme: SupersetTheme;
}

export function LabFooter({ onBackToCatalog, theme }: LabFooterProps) {
  const copyJson = () => {
    void navigator.clipboard?.writeText(exportThemeJson(theme));
  };

  const downloadJson = () => {
    const url = URL.createObjectURL(
      new Blob([exportThemeJson(theme)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${theme.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lab-footer">
      <button className="lab-footer__back" onClick={onBackToCatalog} type="button">
        <ArrowLeft aria-hidden="true" />
        Back to catalog
      </button>
      <div className="lab-footer__export">
        <span className="lab-footer__export-label">Export JSON</span>
        <button
          aria-label="Copy theme JSON"
          className="lab-footer__action"
          onClick={copyJson}
          type="button"
        >
          Copy
        </button>
        <button
          aria-label="Download theme JSON"
          className="lab-footer__action"
          onClick={downloadJson}
          type="button"
        >
          Download
        </button>
      </div>
    </div>
  );
}
