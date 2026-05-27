import {
  AlertTriangle,
  Check,
  ChevronDown,
  CircleDot,
  Download,
  FileCode2,
  FileJson,
  Folder,
  GitPullRequest,
  Import,
  Monitor,
  PanelRight,
  Play,
  Search,
  Settings,
  TerminalSquare,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { SupersetTheme } from "../theme-core/themeTypes";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { SegmentedControl } from "../ui/SegmentedControl";
import type { PreviewTabId } from "./PreviewTabs";

interface PreviewSurfaceProps {
  tab: PreviewTabId;
  theme: SupersetTheme;
}

interface EditorLine {
  active?: boolean;
  content: string;
  id: string;
  kind: "function" | "keyword" | "plain" | "string";
}

const editorLines: readonly EditorLine[] = [
  {
    content: 'import { getEditorTheme } from "shared/themes";',
    id: "import-theme",
    kind: "keyword",
  },
  { content: "", id: "blank-line", kind: "plain" },
  {
    content: "export function previewTheme(theme: Theme) {",
    id: "function-start",
    kind: "function",
  },
  {
    active: true,
    content: "  const editor = getEditorTheme(theme);",
    id: "active-editor-theme",
    kind: "plain",
  },
  { content: "  return editor.syntax.keyword;", id: "return-keyword", kind: "string" },
  { content: "}", id: "function-end", kind: "plain" },
];

const fileRows = [
  { depth: 0, icon: <Folder aria-hidden="true" />, name: "apps", selected: false },
  { depth: 1, icon: <Folder aria-hidden="true" />, name: "desktop", selected: false },
  {
    depth: 2,
    icon: <FileCode2 aria-hidden="true" />,
    name: "src/shared/themes/types.ts",
    selected: true,
  },
  { depth: 2, icon: <FileJson aria-hidden="true" />, name: "theme.json", selected: false },
] as const;

const ansiVars = [
  "--preview-terminal-black",
  "--preview-terminal-red",
  "--preview-terminal-green",
  "--preview-terminal-yellow",
  "--preview-terminal-blue",
  "--preview-terminal-magenta",
  "--preview-terminal-cyan",
  "--preview-terminal-white",
  "--preview-terminal-bright-black",
  "--preview-terminal-bright-red",
  "--preview-terminal-bright-green",
  "--preview-terminal-bright-yellow",
] as const;

function PreviewWindow({
  children,
  className,
  icon,
  title,
}: {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  title: string;
}) {
  return (
    <section className={["preview-window", className].filter(Boolean).join(" ")}>
      <div className="preview-window__toolbar">
        <span className="preview-window__title">
          {icon}
          {title}
        </span>
        <span className="preview-window__actions" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable preview panes need keyboard focus for axe. */}
      <section aria-label={`${title} content`} className="preview-window__body" tabIndex={0}>
        {children}
      </section>
    </section>
  );
}

function FileTree() {
  return (
    <div className="preview-file-tree">
      <label className="preview-search-row">
        <Search aria-hidden="true" />
        <span className="sr-only">Search files</span>
        <input autoComplete="off" name="preview-file-search" readOnly value="Search files" />
      </label>
      <div aria-label="Workspace file tree" className="preview-file-tree__rows" role="tree">
        {fileRows.map((row) => (
          <div
            aria-level={row.depth + 1}
            aria-selected={row.selected}
            className="preview-file-row"
            key={`${row.depth}-${row.name}`}
            role="treeitem"
            style={{ "--preview-file-depth": row.depth } as CSSProperties}
            tabIndex={row.selected ? 0 : -1}
          >
            {row.icon}
            <span>{row.name}</span>
          </div>
        ))}
      </div>
      <div className="preview-file-tree__empty">No matching files for token-map</div>
    </div>
  );
}

function CodeBlock() {
  return (
    <section aria-label="Theme source preview" className="preview-code">
      {editorLines.map((line, index) => (
        <div className="preview-code__line" data-active={line.active} key={line.id}>
          <span className="preview-code__gutter">{index + 1}</span>
          <code className={`preview-code__token preview-code__token--${line.kind}`}>
            {line.content || " "}
          </code>
        </div>
      ))}
      <div className="preview-code__search-highlight">selectionForeground</div>
      <div className="preview-code__cursor" aria-hidden="true" />
      <div className="preview-code__selection">editor.syntax.keyword</div>
    </section>
  );
}

function TerminalContent() {
  return (
    <div aria-label="Agent terminal output" className="preview-terminal" role="log">
      <div>
        <span className="preview-terminal__prompt">$</span> superset run codex --workspace
        theme-catalog
      </div>
      <div className="preview-terminal__muted">/Users/tunji/code/misc/superset-themes</div>
      <div className="preview-terminal__success">ok agent ready, attached to workspace</div>
      <div className="preview-terminal__warning">
        warning: 1 imported token needs contrast review
      </div>
      <div className="preview-terminal__error">error: destructiveForeground is below threshold</div>
      <div className="preview-terminal__selection">selected output: theme preview rebuilt</div>
      <fieldset className="preview-terminal__swatches">
        <legend className="sr-only">Terminal ANSI palette</legend>
        {ansiVars.map((colorVar) => (
          <span key={colorVar} style={{ background: `var(${colorVar})` }} />
        ))}
      </fieldset>
    </div>
  );
}

function WorkspaceSurface({ theme }: { theme: SupersetTheme }) {
  return (
    <div className="preview-workspace">
      <aside className="preview-workspace__sidebar" aria-label="Workspace sidebar">
        <div className="preview-workspace__brand">
          <CircleDot aria-hidden="true" />
          <span>Superset</span>
        </div>
        <nav aria-label="Workspace groups">
          <a aria-current="page" href="#workspace-main">
            Theme Catalog
          </a>
          <a href="#workspace-review">Review</a>
          <a href="#workspace-ports">Ports</a>
        </nav>
      </aside>
      <div className="preview-workspace__main" id="workspace-main">
        <div className="preview-workspace__topbar">
          <div aria-label="Tab groups" className="preview-group-strip" role="toolbar">
            <button type="button">Catalog</button>
            <button type="button">Lab</button>
            <button type="button" data-active>
              {theme.name}
            </button>
          </div>
          <IconButton icon={<Search aria-hidden="true" />} label="Open quick file search" />
        </div>
        <section aria-label="Agent presets" className="preview-presets-bar">
          <button type="button">Claude Code</button>
          <button type="button" data-active>
            Codex
          </button>
          <button type="button">OpenCode</button>
          <span>1 running, 2 paused</span>
        </section>
        <div className="preview-workspace__grid">
          <PreviewWindow icon={<FileCode2 aria-hidden="true" />} title="Files">
            <FileTree />
          </PreviewWindow>
          <PreviewWindow
            icon={<FileCode2 aria-hidden="true" />}
            title="apps/desktop/src/shared/themes/types.ts"
          >
            <CodeBlock />
          </PreviewWindow>
          <PreviewWindow icon={<TerminalSquare aria-hidden="true" />} title="Agent Terminal">
            <TerminalContent />
          </PreviewWindow>
          <PreviewWindow
            className="preview-window--context"
            icon={<PanelRight aria-hidden="true" />}
            title="Workspace context"
          >
            <div className="preview-context-panel">
              <div>
                <span>Agent</span>
                <strong>Codex running</strong>
              </div>
              <div>
                <span>Review</span>
                <strong>2 comments</strong>
              </div>
              <div>
                <span>Port</span>
                <strong>5173 ready</strong>
              </div>
              <div className="preview-browser-bar">
                <span>{`http://localhost:5173/themes/${theme.id}`}</span>
              </div>
            </div>
          </PreviewWindow>
        </div>
      </div>
    </div>
  );
}

function EditorSurface() {
  return (
    <div className="preview-split-surface">
      <PreviewWindow
        icon={<FileCode2 aria-hidden="true" />}
        title="apps/desktop/src/shared/themes/types.ts"
      >
        <CodeBlock />
      </PreviewWindow>
      <PreviewWindow icon={<Search aria-hidden="true" />} title="Search">
        <div className="preview-editor-panel">
          <label>
            Find
            <input
              autoComplete="off"
              name="preview-search-token"
              readOnly
              spellCheck={false}
              value="selectionForeground"
            />
          </label>
          <div className="preview-editor-panel__match">2 matches in themeCssVars.ts</div>
          <div className="preview-editor-panel__active">Active line: 4</div>
        </div>
      </PreviewWindow>
    </div>
  );
}

function TerminalSurface() {
  return (
    <PreviewWindow
      className="preview-window--terminal"
      icon={<TerminalSquare aria-hidden="true" />}
      title="xterm.js terminal"
    >
      <TerminalContent />
    </PreviewWindow>
  );
}

function DiffSurface() {
  return (
    <div className="preview-diff-surface">
      <PreviewWindow icon={<GitPullRequest aria-hidden="true" />} title="Changes">
        <div className="preview-changes">
          <div className="preview-changes__tabs">
            <button type="button" data-active>
              Diffs <span>4</span>
            </button>
            <button type="button">
              Review <span>2</span>
            </button>
          </div>
          <div className="preview-changes__section">
            <h4>Against main</h4>
            <button data-selected type="button">
              M src/preview/surfaces.tsx
            </button>
            <button type="button">A src/ui/Tabs.tsx</button>
          </div>
          <div className="preview-changes__section">
            <h4>Staged</h4>
            <button type="button">M docs/STATUS.md</button>
          </div>
          <div className="preview-changes__section">
            <h4>Unstaged</h4>
            <button type="button">M src/styles/global.css</button>
          </div>
        </div>
      </PreviewWindow>
      <PreviewWindow icon={<FileCode2 aria-hidden="true" />} title="Preview diff">
        <div className="preview-diff">
          <div className="preview-diff__line preview-diff__line--removed">
            - command palette mock
          </div>
          <div className="preview-diff__line preview-diff__line--added">
            + quick-open Superset surface
          </div>
          <div className="preview-diff__line preview-diff__line--modified">
            ~ terminal warning state
          </div>
          <div className="preview-diff__comment">Inline marker: contrast check requested</div>
        </div>
      </PreviewWindow>
    </div>
  );
}

function CommandSurface() {
  return (
    <div className="preview-command-surface">
      <section aria-label="Command palette" className="preview-command-palette">
        <div className="preview-command-palette__input">
          <Search aria-hidden="true" />
          <span>Open theme.json</span>
        </div>
        <div className="preview-command-palette__list">
          <button type="button" data-active>
            <FileJson aria-hidden="true" />
            Open theme.json
            <kbd>Cmd+O</kbd>
          </button>
          <button type="button">
            <TerminalSquare aria-hidden="true" />
            Restart selected agent terminal
            <kbd>Cmd+R</kbd>
          </button>
          <button type="button" disabled>
            <Monitor aria-hidden="true" />
            Open browser preview, unavailable
            <kbd>Cmd+B</kbd>
          </button>
        </div>
        <div className="preview-command-palette__empty">No commands for deploy prod</div>
      </section>
    </div>
  );
}

function SettingsSurface({ theme }: { theme: SupersetTheme }) {
  return (
    <div className="preview-settings-surface">
      <PreviewWindow icon={<Settings aria-hidden="true" />} title="Appearance">
        <form className="preview-form">
          <label>
            Theme name
            <input autoComplete="off" name="theme-name" readOnly value={theme.name} />
          </label>
          <div className="preview-field">
            Active mode
            <SegmentedControl
              ariaLabel="Active mode"
              options={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
              ]}
              value={theme.type}
            />
          </div>
          <div className="preview-field">
            Source
            <button className="preview-select" type="button">
              Catalog fixture
              <ChevronDown aria-hidden="true" />
            </button>
          </div>
          <label className="preview-checkbox">
            <input checked name="apply-terminal-palette" readOnly type="checkbox" />
            Apply terminal palette
          </label>
          <label className="preview-checkbox preview-checkbox--disabled">
            <input disabled name="sync-system-theme" readOnly type="checkbox" />
            Sync with system theme
          </label>
          <div className="preview-form__message preview-form__message--warning">
            <AlertTriangle aria-hidden="true" />
            Imported theme is missing editor overrides.
          </div>
          <div className="preview-form__message preview-form__message--success">
            <Check aria-hidden="true" />
            Terminal contrast passed.
          </div>
          <div className="preview-form__actions">
            <Button icon={<Import aria-hidden="true" />} variant="primary">
              Import theme
            </Button>
            <Button icon={<Download aria-hidden="true" />}>Download base</Button>
            <Button disabled variant="ghost">
              Publish marketplace
            </Button>
            <Button variant="destructive">Reset draft</Button>
          </div>
        </form>
      </PreviewWindow>
      <PreviewWindow icon={<Monitor aria-hidden="true" />} title="Ports and browser">
        <div className="preview-ports">
          <div className="preview-port-row">
            <Play aria-hidden="true" />
            <span>5173</span>
            <strong>Vite preview</strong>
          </div>
          <div className="preview-browser-bar">
            <span>{`http://localhost:5173/themes/${theme.id}`}</span>
          </div>
        </div>
      </PreviewWindow>
    </div>
  );
}

export function PreviewSurface({ tab, theme }: PreviewSurfaceProps) {
  switch (tab) {
    case "workspace":
      return <WorkspaceSurface theme={theme} />;
    case "editor":
      return <EditorSurface />;
    case "terminal":
      return <TerminalSurface />;
    case "diff":
      return <DiffSurface />;
    case "command":
      return <CommandSurface />;
    case "settings":
      return <SettingsSurface theme={theme} />;
  }
}
