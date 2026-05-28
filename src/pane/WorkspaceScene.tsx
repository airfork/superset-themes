import {
  Boxes,
  ChevronDown,
  CornerDownLeft,
  GitBranch,
  Layers,
  ListTodo,
  PanelRight,
  Plug,
  Settings,
  Sparkles,
} from "lucide-react";
import { useId } from "react";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

interface WorkspaceSceneProps {
  entry: CatalogThemeEntry;
}

interface ProjectBranch {
  name: string;
  diff: string;
  active?: boolean;
}

interface Project {
  name: string;
  initial: string;
  branches?: ProjectBranch[];
  muted?: boolean;
}

const projects: Project[] = [
  {
    name: "superset-themes",
    initial: "S",
    branches: [
      { name: "feat/x", diff: "+13k", active: true },
      { name: "docs", diff: "+103" },
    ],
  },
  { name: "snake-off", initial: "S", muted: true },
];

export function WorkspaceScene({ entry }: WorkspaceSceneProps) {
  const { theme } = entry;
  const threadId = useId();
  const inputId = useId();
  const agentTabId = useId();

  return (
    <div className="scene-workspace">
      <aside className="scene-workspace__rail">
        <div className="scene-workspace__team">
          <span className="scene-workspace__team-mark">T</span>
          <span>Team</span>
        </div>
        <nav aria-label="Workspaces" className="scene-workspace__nav">
          <a aria-current="page" href="#workspaces">
            <Boxes aria-hidden="true" />
            <span>Workspaces</span>
          </a>
          <a href="#automations">
            <Sparkles aria-hidden="true" />
            <span>Automations</span>
          </a>
          <a href="#tasks">
            <ListTodo aria-hidden="true" />
            <span>Tasks & PRs</span>
          </a>
        </nav>
        <div className="scene-workspace__projects">
          {projects.map((project) => (
            <div
              key={project.name}
              className="scene-workspace__project"
              data-muted={project.muted || undefined}
            >
              <div className="scene-workspace__project-header">
                <span className="scene-workspace__project-mark">{project.initial}</span>
                <span className="scene-workspace__project-name">{project.name}</span>
              </div>
              {project.branches ? (
                <ul className="scene-workspace__branches">
                  {project.branches.map((branch) => (
                    <li key={branch.name} data-active={branch.active || undefined}>
                      <span className="scene-workspace__branch-dot" aria-hidden="true" />
                      <span className="scene-workspace__branch-name">{branch.name}</span>
                      <span className="scene-workspace__branch-diff">{branch.diff}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
        <div className="scene-workspace__footer">
          <a href="#ports">
            <Plug aria-hidden="true" />
            <span>Ports</span>
            <span className="scene-workspace__footer-meta">5174</span>
          </a>
          <a href="#settings">
            <Settings aria-hidden="true" />
            <span>Settings</span>
          </a>
        </div>
      </aside>

      <section
        className="scene-workspace__thread"
        aria-label={`${theme.name} thread`}
        aria-describedby={threadId}
      >
        <header className="scene-workspace__thread-header">
          <span className="scene-workspace__branch-chip">
            <GitBranch aria-hidden="true" />
            <button type="button" className="scene-workspace__branch-button">
              <span>feat/x</span>
              <ChevronDown aria-hidden="true" />
            </button>
          </span>
          <span className="scene-workspace__thread-title" id={threadId}>
            Redesign theme catalog rail
          </span>
        </header>

        <div className="scene-workspace__run-row">
          <span className="scene-workspace__run-agent">Codex</span>
          <button type="button" className="scene-workspace__run-button">
            <span>Run</span>
            <kbd>⌘G</kbd>
            <ChevronDown aria-hidden="true" />
          </button>
          <span className="scene-workspace__run-task">Redesign theme</span>
        </div>

        <div
          className="scene-workspace__agent-tabs"
          role="tablist"
          aria-label="Agent picker"
          id={agentTabId}
        >
          <button type="button" role="tab" aria-selected="true">
            <Layers aria-hidden="true" />
            <span>Claude</span>
          </button>
          <button type="button" role="tab" aria-selected="false">
            <Layers aria-hidden="true" />
            <span>Codex</span>
          </button>
        </div>

        <div className="scene-workspace__messages" role="log" aria-live="polite">
          <p className="scene-workspace__message">
            Cool. Here's the full anatomy of the new master/detail shell: a featured-first rail, a
            Superset-style pane, and a bottom bar that reports the focused theme's contrast.
          </p>
          <pre className="scene-workspace__codeblock">
            <code>{`> the rail structure
- Featured (5)
- Light, Dark sections
- accent dots stay self-colored`}</code>
          </pre>
          <p className="scene-workspace__permhint">
            <span aria-hidden="true">»»</span>
            <span>bypass perms on (shift+tab)</span>
          </p>
        </div>

        <form className="scene-workspace__input" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor={inputId} className="sr-only">
            Message {theme.name}
          </label>
          <span className="scene-workspace__input-prompt" aria-hidden="true">
            ›
          </span>
          <input
            id={inputId}
            type="text"
            name="thread-message"
            autoComplete="off"
            spellCheck={false}
            placeholder="Ask Claude to keep iterating…"
          />
          <button type="submit" className="scene-workspace__input-send">
            <span className="sr-only">Send</span>
            <CornerDownLeft aria-hidden="true" />
          </button>
        </form>
      </section>

      <div className="scene-workspace__right">
        <button
          type="button"
          className="scene-workspace__right-toggle"
          aria-label="Open right panel"
          aria-expanded="false"
        >
          <PanelRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
