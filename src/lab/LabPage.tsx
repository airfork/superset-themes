import { Copy, Download, RotateCcw, Shuffle, Sparkles } from "lucide-react";
import { useState } from "react";
import { PreviewTabs } from "../preview/PreviewTabs";
import { checkThemeContrast } from "../theme-core/contrast";
import type { CatalogThemeEntry, TerminalTokens, UiTokens } from "../theme-core/themeTypes";
import {
  createDraftFromCatalogEntry,
  createDraftFromGeneratedTheme,
  createDraftFromImportedTheme,
  exportDraftThemeJson,
  resetDraftToSource,
  type ThemeDraft,
  updateDraftTerminalToken,
  updateDraftUiToken,
} from "./draftTheme";
import { parseImportedThemeJson } from "./importTheme";
import {
  generateRandomTheme,
  type RandomThemeTokenGroup,
  rerollRandomThemeGroup,
} from "./randomTheme";

export interface LabPageProps {
  catalogEntries?: readonly CatalogThemeEntry[];
  initialDraft: ThemeDraft;
  onStartFromCatalog?: (themeId: string) => void;
  selectedCatalogThemeId?: string;
}

const UI_TOKEN_CONTROLS = [
  { label: "UI background", token: "background" },
  { label: "UI foreground", token: "foreground" },
  { label: "UI card", token: "card" },
  { label: "UI primary", token: "primary" },
  { label: "UI accent", token: "accent" },
  { label: "UI destructive", token: "destructive" },
] as const satisfies readonly { label: string; token: keyof UiTokens }[];

const UI_HIGHLIGHT_TOKEN_CONTROLS = [
  { label: "UI selection", token: "selection" },
  { label: "UI selection foreground", token: "selectionForeground" },
  { label: "UI focus ring", token: "ring" },
] as const satisfies readonly { label: string; token: keyof UiTokens }[];

const TERMINAL_TOKEN_CONTROLS = [
  { label: "Terminal background", token: "background" },
  { label: "Terminal foreground", token: "foreground" },
  { label: "Terminal red", token: "red" },
  { label: "Terminal green", token: "green" },
  { label: "Terminal yellow", token: "yellow" },
  { label: "Terminal blue", token: "blue" },
  { label: "Terminal cyan", token: "cyan" },
  { label: "Terminal cursor", token: "cursor" },
  { label: "Terminal selection", token: "selection" },
  { label: "Terminal selection foreground", token: "selectionForeground" },
] as const satisfies readonly { label: string; token: keyof TerminalTokens }[];

const RANDOM_GROUPS = [
  { group: "surfaces", label: "Surfaces" },
  { group: "accent", label: "Accent" },
  { group: "terminal", label: "Terminal" },
  { group: "highlights", label: "Highlights" },
] as const satisfies readonly { group: RandomThemeTokenGroup; label: string }[];

function ColorField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const name = label.toLowerCase().replaceAll(" ", "-");

  return (
    <label className="lab-color-field">
      <span>{label}</span>
      <input
        aria-label={label}
        name={name}
        onChange={(event) => onChange(event.currentTarget.value)}
        type="color"
        value={value}
      />
      <code>{value}</code>
    </label>
  );
}

export function LabPage({
  catalogEntries = [],
  initialDraft,
  onStartFromCatalog,
  selectedCatalogThemeId,
}: LabPageProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"copied" | "idle">("idle");
  const [generatorSeed, setGeneratorSeed] = useState("preview");
  const [rerollCount, setRerollCount] = useState(0);
  const draftJson = exportDraftThemeJson(draft);
  const downloadHref = `data:application/json;charset=utf-8,${encodeURIComponent(draftJson)}`;
  const contrastIssues = checkThemeContrast(draft.theme).issues;

  const replaceDraft = (nextDraft: ThemeDraft) => {
    setDraft(nextDraft);
    setCopyState("idle");
    setImportError(null);
    setImportText("");
  };

  const importJson = () => {
    const result = parseImportedThemeJson(importText);

    if (!result.ok) {
      setImportError(result.error);
      return;
    }

    replaceDraft(createDraftFromImportedTheme(result.theme));
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(draftJson);
    setCopyState("copied");
  };

  const startFromCatalogTheme = (themeId: string) => {
    const entry = catalogEntries.find((catalogEntry) => catalogEntry.theme.id === themeId);

    if (!entry) {
      return;
    }

    if (onStartFromCatalog) {
      onStartFromCatalog(themeId);
      return;
    }

    replaceDraft(createDraftFromCatalogEntry(entry));
  };

  const generateDraft = (mode: "dark" | "light") => {
    replaceDraft(
      createDraftFromGeneratedTheme(
        generateRandomTheme({
          mode,
          seed: generatorSeed,
        }),
      ),
    );
  };

  const rerollGroup = (group: RandomThemeTokenGroup) => {
    const nextRerollCount = rerollCount + 1;
    setRerollCount(nextRerollCount);
    replaceDraft(
      createDraftFromGeneratedTheme(
        rerollRandomThemeGroup({
          group,
          seed: `${generatorSeed}:${group}:${nextRerollCount}`,
          theme: draft.theme,
        }),
      ),
    );
  };

  return (
    <section aria-labelledby="lab-title" className="lab-page">
      <div className="lab-page__header">
        <div>
          <p className="eyebrow">Lab</p>
          <h2 id="lab-title">Theme lab</h2>
          <p>Clone, import, edit, preview, and export a clean Superset theme JSON file.</p>
        </div>
        <p className="lab-page__status">{draft.dirty ? "Unsaved changes" : "Draft clean"}</p>
      </div>

      <div className="lab-page__workspace">
        <aside className="lab-panel" aria-label="Lab controls">
          {catalogEntries.length > 0 ? (
            <div className="lab-panel__section">
              <label className="catalog-field" htmlFor="lab-start-from">
                <span>Start from catalog theme</span>
                <select
                  id="lab-start-from"
                  name="lab-start-from"
                  onChange={(event) => startFromCatalogTheme(event.currentTarget.value)}
                  value={selectedCatalogThemeId ?? ""}
                >
                  {selectedCatalogThemeId ? null : (
                    <option value="" disabled>
                      Imported draft
                    </option>
                  )}
                  {catalogEntries.map((entry) => (
                    <option key={entry.theme.id} value={entry.theme.id}>
                      {entry.theme.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          <div className="lab-panel__section">
            <label className="catalog-field" htmlFor="lab-generator-seed">
              <span>Generator seed</span>
              <input
                autoComplete="off"
                id="lab-generator-seed"
                name="lab-generator-seed"
                onChange={(event) => setGeneratorSeed(event.currentTarget.value)}
                spellCheck={false}
                type="text"
                value={generatorSeed}
              />
            </label>
            <div className="lab-actions">
              <button
                className="catalog-action-button"
                onClick={() => generateDraft("light")}
                type="button"
              >
                <Sparkles aria-hidden="true" />
                <span>Generate light</span>
              </button>
              <button
                className="catalog-action-button"
                onClick={() => generateDraft("dark")}
                type="button"
              >
                <Sparkles aria-hidden="true" />
                <span>Generate dark</span>
              </button>
            </div>
            <fieldset className="lab-reroll-grid">
              <legend className="sr-only">Reroll generated token groups</legend>
              {RANDOM_GROUPS.map(({ group, label }) => (
                <button
                  aria-label={`Reroll ${label.toLocaleLowerCase()}`}
                  className="catalog-action-button"
                  key={group}
                  onClick={() => rerollGroup(group)}
                  type="button"
                >
                  <Shuffle aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </fieldset>
          </div>

          <div className="lab-panel__section">
            <h3>{draft.theme.name}</h3>
            <dl className="lab-draft-facts">
              <div>
                <dt>Mode</dt>
                <dd>{draft.theme.type}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{draft.source.type}</dd>
              </div>
            </dl>
            <div className="lab-actions">
              <button
                className="catalog-action-button"
                onClick={() => setDraft(resetDraftToSource(draft))}
                type="button"
              >
                <RotateCcw aria-hidden="true" />
                <span>Reset to source</span>
              </button>
              <button className="catalog-action-button" onClick={copyJson} type="button">
                <Copy aria-hidden="true" />
                <span>{copyState === "copied" ? "Copied JSON" : "Copy JSON"}</span>
              </button>
              <a
                className="catalog-action-button"
                download={`${draft.theme.id}.json`}
                href={downloadHref}
              >
                <Download aria-hidden="true" />
                <span>Download JSON</span>
              </a>
            </div>
          </div>

          <div className="lab-panel__section">
            <label className="lab-import-field" htmlFor="lab-import-json">
              <span>Import theme JSON</span>
              <textarea
                autoComplete="off"
                id="lab-import-json"
                name="lab-import-json"
                onChange={(event) => setImportText(event.currentTarget.value)}
                placeholder='{"version":1,…}'
                spellCheck={false}
                value={importText}
              />
            </label>
            {importError ? <p className="lab-error">{importError}</p> : null}
            <button className="catalog-action-button" onClick={importJson} type="button">
              Import JSON
            </button>
          </div>

          <div className="lab-panel__section" aria-live="polite">
            {contrastIssues.length > 0 ? (
              <div className="lab-validation lab-validation--warning">
                <h4>Contrast issues</h4>
                <ul>
                  {contrastIssues.slice(0, 4).map((issue) => (
                    <li key={`${issue.backgroundPath}-${issue.foregroundPath}`}>
                      {issue.label}
                      {"ratio" in issue ? `: ${issue.ratio.toFixed(2)}:1` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="lab-validation lab-validation--ok">Contrast checks clear</p>
            )}
          </div>

          <fieldset className="lab-token-group">
            <legend>UI tokens</legend>
            {UI_TOKEN_CONTROLS.map(({ label, token }) => (
              <ColorField
                key={token}
                label={label}
                onChange={(value) => setDraft(updateDraftUiToken(draft, token, value))}
                value={draft.theme.ui[token]}
              />
            ))}
          </fieldset>

          <fieldset className="lab-token-group">
            <legend>Highlight tokens</legend>
            {UI_HIGHLIGHT_TOKEN_CONTROLS.map(({ label, token }) => (
              <ColorField
                key={token}
                label={label}
                onChange={(value) => setDraft(updateDraftUiToken(draft, token, value))}
                value={draft.theme.ui[token]}
              />
            ))}
          </fieldset>

          <fieldset className="lab-token-group">
            <legend>Terminal tokens</legend>
            {TERMINAL_TOKEN_CONTROLS.map(({ label, token }) => (
              <ColorField
                key={token}
                label={label}
                onChange={(value) => setDraft(updateDraftTerminalToken(draft, token, value))}
                value={draft.theme.terminal[token]}
              />
            ))}
          </fieldset>
        </aside>

        <div className="lab-preview">
          <PreviewTabs theme={draft.theme} />
        </div>
      </div>
    </section>
  );
}
