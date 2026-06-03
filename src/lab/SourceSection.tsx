import { useState } from "react";
import { getBaselineFirstThemes } from "../data/baseline";
import { RailSection } from "../rail/RailSection";
import type { SupersetTheme } from "../theme-core/themeTypes";
import type { ThemeDraft } from "./draftTheme";
import { parseImportedThemeJson } from "./importTheme";

interface SourceSectionProps {
  draft: ThemeDraft;
  onImportTheme: (theme: SupersetTheme) => void;
  onStartFromCatalog: (themeId: string) => void;
}

export function SourceSection({ draft, onImportTheme, onStartFromCatalog }: SourceSectionProps) {
  const [pasteText, setPasteText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const selectedCatalogThemeId = draft.source.type === "catalog" ? draft.source.themeId : "";
  const catalogOptions = getBaselineFirstThemes();

  const importJson = (json: string) => {
    const result = parseImportedThemeJson(json);

    if (!result.ok) {
      setImportError(result.error);
      return;
    }

    setImportError(null);
    setPasteText("");
    onImportTheme(result.theme);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    importJson(await file.text());
  };

  return (
    <RailSection label="Source">
      <label className="lab-field" htmlFor="lab-start-from">
        <span>Start from catalog theme</span>
        <span className="lab-field__select">
          <select
            id="lab-start-from"
            name="lab-start-from"
            onChange={(event) => onStartFromCatalog(event.currentTarget.value)}
            value={selectedCatalogThemeId}
          >
            {selectedCatalogThemeId ? null : (
              <option value="" disabled>
                Imported or generated draft
              </option>
            )}
            {catalogOptions.map((entry) => (
              <option key={entry.theme.id} value={entry.theme.id}>
                {entry.theme.name}
              </option>
            ))}
          </select>
        </span>
      </label>

      <label className="lab-field" htmlFor="lab-import-file">
        <span>Import JSON</span>
        <input
          accept="application/json,.json"
          id="lab-import-file"
          name="lab-import-file"
          onChange={(event) => void handleFile(event.currentTarget.files?.[0])}
          type="file"
        />
      </label>

      <details className="lab-paste">
        <summary>Paste JSON</summary>
        <textarea
          aria-label="Paste theme JSON"
          autoComplete="off"
          className="lab-paste__textarea"
          name="lab-paste-json"
          onChange={(event) => setPasteText(event.currentTarget.value)}
          placeholder={'{"version":1,…}'}
          spellCheck={false}
          value={pasteText}
        />
        <button
          className="catalog-action-button"
          onClick={() => importJson(pasteText)}
          type="button"
        >
          Import pasted JSON
        </button>
      </details>

      {importError ? (
        // Assertive (alert): a one-shot failure in response to an explicit import
        // action, so interrupting is appropriate. The per-blur hex error
        // (ColorField) is polite (status) because it repeats during editing.
        <p className="lab-source__error" role="alert">
          {importError}
        </p>
      ) : null}
    </RailSection>
  );
}
