import { ArrowLeft, Check, Redo2, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { downloadThemeJson, exportThemeJson } from "../theme-core/exportTheme";
import type { SupersetTheme } from "../theme-core/themeTypes";

interface LabFooterProps {
  canRedo: boolean;
  canUndo: boolean;
  onBackToCatalog: () => void;
  onRedo: () => void;
  onUndo: () => void;
  theme: SupersetTheme;
}

// How long the "Copied" / "Downloaded" confirmation lingers before clearing.
const STATUS_TIMEOUT_MS = 3000;

export function LabFooter({
  canRedo,
  canUndo,
  onBackToCatalog,
  onRedo,
  onUndo,
  theme,
}: LabFooterProps) {
  // Export fires silently (clipboard write / file download), so a transient
  // status line confirms the action landed. role="status" announces it politely.
  const [status, setStatus] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const flashStatus = (message: string) => {
    setStatus(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(null), STATUS_TIMEOUT_MS);
  };

  const copyJson = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(exportThemeJson(theme));
      flashStatus("Copied");
    } catch {
      flashStatus("Copy failed");
    }
  };

  const downloadJson = () => {
    downloadThemeJson(theme);
    flashStatus("Downloaded");
  };

  return (
    <div className="lab-footer">
      <div className="lab-footer__nav">
        <button className="lab-footer__back" onClick={onBackToCatalog} type="button">
          <ArrowLeft aria-hidden="true" />
          Back to catalog
        </button>
        <button className="lab-footer__action" disabled={!canUndo} onClick={onUndo} type="button">
          <Undo2 aria-hidden="true" />
          Undo
        </button>
        <button className="lab-footer__action" disabled={!canRedo} onClick={onRedo} type="button">
          <Redo2 aria-hidden="true" />
          Redo
        </button>
      </div>
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
        <span aria-live="polite" className="lab-footer__status" role="status">
          {status ? (
            <>
              {status === "Copied" || status === "Downloaded" ? <Check aria-hidden="true" /> : null}
              {status}
            </>
          ) : null}
        </span>
      </div>
    </div>
  );
}
