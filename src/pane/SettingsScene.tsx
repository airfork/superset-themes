import { useEffect, useId, useRef, useState } from "react";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

interface SettingsSceneProps {
  entry: CatalogThemeEntry;
}

interface EditorFeatures {
  wordWrap: boolean;
  minimap: boolean;
  indentGuides: boolean;
}

const DEFAULT_FEATURES: EditorFeatures = {
  wordWrap: true,
  minimap: false,
  indentGuides: true,
};

// Superset uses the Heroicons outline trash for destructive actions (e.g. the
// Settings > Hosts delete), not lucide's Trash2. Verified live via CDP.
function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

export function SettingsScene({ entry }: SettingsSceneProps) {
  const { theme } = entry;
  const displayNameId = useId();
  const defaultEditorId = useId();
  const themeModeName = `theme-mode-${useId()}`;
  const featuresName = `features-${useId()}`;
  const resetAnnouncementId = useId();

  const [displayName, setDisplayName] = useState(theme.name);
  const [editor, setEditor] = useState("vscode");
  const [mode, setMode] = useState<"system" | "light" | "dark">("system");
  const [features, setFeatures] = useState<EditorFeatures>({ ...DEFAULT_FEATURES });
  const [resetState, setResetState] = useState<"idle" | "confirming" | "done">("idle");
  const resetTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    },
    [],
  );

  const onResetClick = () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    if (resetState === "confirming") {
      setDisplayName(theme.name);
      setEditor("vscode");
      setMode("system");
      setFeatures({ ...DEFAULT_FEATURES });
      setResetState("done");
      resetTimerRef.current = window.setTimeout(() => {
        setResetState("idle");
        resetTimerRef.current = null;
      }, 2400);
      return;
    }
    setResetState("confirming");
    resetTimerRef.current = window.setTimeout(() => {
      setResetState("idle");
      resetTimerRef.current = null;
    }, 4000);
  };

  return (
    <div className="scene-settings">
      <div className="scene-settings__header">
        <h2 className="scene-settings__heading">Appearance &amp; editor</h2>
        <p className="scene-settings__lede">
          Settings render in the focused theme. Use this scene to gauge form-density at full scale.
        </p>
      </div>

      <section className="scene-settings__row" aria-labelledby={`${displayNameId}-label`}>
        <div className="scene-settings__field">
          <label htmlFor={displayNameId} id={`${displayNameId}-label`}>
            Display name
          </label>
          <p className="scene-settings__hint">
            Shown next to your avatar in workspaces and review threads.
          </p>
        </div>
        <input
          id={displayNameId}
          name="display-name"
          type="text"
          autoComplete="name"
          spellCheck={false}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="scene-settings__input"
        />
      </section>

      <section className="scene-settings__row">
        <div className="scene-settings__field">
          <label htmlFor={defaultEditorId}>Default editor</label>
          <p className="scene-settings__hint">Used when opening files from a task or PR.</p>
        </div>
        <select
          id={defaultEditorId}
          name="default-editor"
          className="scene-settings__select"
          value={editor}
          onChange={(event) => setEditor(event.target.value)}
        >
          <option value="vscode">VS Code</option>
          <option value="zed">Zed</option>
          <option value="superset">Superset</option>
          <option value="vim">Neovim</option>
        </select>
      </section>

      <section className="scene-settings__row">
        <div className="scene-settings__field">
          <p className="scene-settings__hint scene-settings__hint--paired">
            Drives the catalog's preview when no explicit theme is selected.
          </p>
        </div>
        <fieldset
          className="scene-settings__group scene-settings__radios"
          // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: <fieldset role="radiogroup"> is the canonical pattern — implicit role on fieldset is "group", and screen readers announce the radiogroup role specifically.
          role="radiogroup"
        >
          <legend className="scene-settings__group-label">Theme mode</legend>
          {(
            [
              ["system", "Follow system"],
              ["light", "Light"],
              ["dark", "Dark"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="scene-settings__radio">
              <input
                type="radio"
                name={themeModeName}
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      </section>

      <section className="scene-settings__row">
        <div className="scene-settings__field">
          <p className="scene-settings__hint scene-settings__hint--paired">
            Toggle the editor niceties that follow your theme into Superset.
          </p>
        </div>
        <fieldset className="scene-settings__group scene-settings__checks">
          <legend className="scene-settings__group-label">Editor features</legend>
          <label className="scene-settings__check">
            <input
              type="checkbox"
              name={`${featuresName}-wrap`}
              checked={features.wordWrap}
              onChange={(event) =>
                setFeatures((current) => ({ ...current, wordWrap: event.target.checked }))
              }
            />
            <span>Soft word wrap</span>
          </label>
          <label className="scene-settings__check">
            <input
              type="checkbox"
              name={`${featuresName}-minimap`}
              checked={features.minimap}
              onChange={(event) =>
                setFeatures((current) => ({ ...current, minimap: event.target.checked }))
              }
            />
            <span>Show minimap</span>
          </label>
          <label className="scene-settings__check">
            <input
              type="checkbox"
              name={`${featuresName}-guides`}
              checked={features.indentGuides}
              onChange={(event) =>
                setFeatures((current) => ({ ...current, indentGuides: event.target.checked }))
              }
            />
            <span>Indent guides</span>
          </label>
        </fieldset>
      </section>

      <section className="scene-settings__row scene-settings__row--sample">
        <div className="scene-settings__field">
          <span className="scene-settings__group-label">Code sample</span>
          <p className="scene-settings__hint">
            Editor font · terminal syntax colors · gated foreground on background.
          </p>
        </div>
        <figure className="scene-settings__sample" aria-label="Code sample">
          <pre className="scene-settings__code">
            <code>
              <span className="scene-settings__code-line">
                <span className="scene-settings__code-keyword">export function</span>{" "}
                <span className="scene-settings__code-fn">applyTheme</span>(theme:{" "}
                <span className="scene-settings__code-type">SupersetTheme</span>) {"{"}
              </span>
              <span className="scene-settings__code-line">
                {"  "}root.style.setProperty(
                <span className="scene-settings__code-string">"--preview-ui-background"</span>,
                theme.ui.background);
              </span>
              <span className="scene-settings__code-line">{"}"}</span>
            </code>
          </pre>
        </figure>
      </section>

      <section className="scene-settings__row scene-settings__row--sample">
        <div className="scene-settings__field">
          <span className="scene-settings__group-label">Terminal sample</span>
          <p className="scene-settings__hint">
            Terminal background, prompt color, and warning/error palette.
          </p>
        </div>
        <figure className="scene-settings__sample" aria-label="Terminal sample">
          <div className="scene-settings__terminal" role="log">
            <div>
              <span className="scene-settings__terminal-prompt">$</span> pnpm themes:check-contrast
            </div>
            <div className="scene-settings__terminal-success">
              ok 7 pairs × 12 themes (zero warnings)
            </div>
            <div className="scene-settings__terminal-warning">warn 1 token below 4.5:1</div>
            <div className="scene-settings__terminal-error">error contrast ratio out of bounds</div>
          </div>
        </figure>
      </section>

      <section className="scene-settings__row scene-settings__row--actions">
        <div className="scene-settings__field">
          <span className="scene-settings__group-label">Danger zone</span>
          <p className="scene-settings__hint">
            Restores defaults across appearance, editor, and theme mode.
          </p>
        </div>
        <div className="scene-settings__destructive-cluster">
          <button
            type="button"
            className="scene-settings__destructive"
            data-state={resetState}
            aria-describedby={resetAnnouncementId}
            onClick={onResetClick}
          >
            <TrashIcon />
            <span>
              {resetState === "idle" && "Reset to defaults"}
              {resetState === "confirming" && "Click again to confirm"}
              {resetState === "done" && "Defaults restored"}
            </span>
          </button>
          <p id={resetAnnouncementId} className="sr-only" aria-live="polite">
            {resetState === "confirming"
              ? "Reset requires confirmation. Press the button again within four seconds, or wait for the prompt to clear."
              : resetState === "done"
                ? "Settings have been reset to defaults."
                : ""}
          </p>
        </div>
      </section>
    </div>
  );
}
