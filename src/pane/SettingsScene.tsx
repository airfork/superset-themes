import { Trash2 } from "lucide-react";
import { useId, useState } from "react";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

interface SettingsSceneProps {
  entry: CatalogThemeEntry;
}

export function SettingsScene({ entry }: SettingsSceneProps) {
  const { theme } = entry;
  const displayNameId = useId();
  const defaultEditorId = useId();
  const themeModeName = `theme-mode-${useId()}`;
  const featuresName = `features-${useId()}`;

  const [displayName, setDisplayName] = useState(theme.name);
  const [editor, setEditor] = useState("vscode");
  const [mode, setMode] = useState<"system" | "light" | "dark">("system");
  const [features, setFeatures] = useState({
    wordWrap: true,
    minimap: false,
    indentGuides: true,
  });

  return (
    <div className="scene-settings">
      <header className="scene-settings__header">
        <h2 className="scene-settings__heading">Appearance &amp; editor</h2>
        <p className="scene-settings__lede">
          Settings render in the focused theme. Use this scene to gauge form-density at full scale.
        </p>
      </header>

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
          <span className="scene-settings__group-label">Theme mode</span>
          <p className="scene-settings__hint">
            Drives the catalog's preview when no explicit theme is selected.
          </p>
        </div>
        <div
          className="scene-settings__radios"
          // biome-ignore lint/a11y/useSemanticElements: radiogroup is the
          // appropriate role for a custom-styled radio cluster; <fieldset> has
          // implicit role="group" rather than "radiogroup", and screen readers
          // announce the cluster's purpose more accurately with this role.
          role="radiogroup"
          aria-label="Theme mode"
        >
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
        </div>
      </section>

      <section className="scene-settings__row">
        <div className="scene-settings__field">
          <span className="scene-settings__group-label">Editor features</span>
          <p className="scene-settings__hint">
            Toggle the editor niceties that follow your theme into Superset.
          </p>
        </div>
        <fieldset className="scene-settings__checks" aria-label="Editor features">
          <legend className="sr-only">Editor features</legend>
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
        <button type="button" className="scene-settings__destructive">
          <Trash2 aria-hidden="true" />
          <span>Reset to defaults</span>
        </button>
      </section>
    </div>
  );
}
