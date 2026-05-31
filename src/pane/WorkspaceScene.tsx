import {
  ChevronDown,
  ChevronsUpDown,
  Circle,
  CircleHelp,
  ClipboardList,
  Clock,
  Columns2,
  FolderPlus,
  Laptop,
  Layers,
  Play,
  Plus,
  RadioTower,
  Settings,
  X,
} from "lucide-react";
import { useId } from "react";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";

interface WorkspaceSceneProps {
  entry: CatalogThemeEntry;
}

type BranchKind = "main" | "worktree";

interface ProjectBranch {
  name: string;
  kind: BranchKind;
  active?: boolean;
}

interface AvatarSpec {
  letter: string;
  color: string;
}

interface Project {
  name: string;
  count: number;
  avatar: AvatarSpec;
  branches?: ProjectBranch[];
}

const projects: Project[] = [
  {
    name: "inbox-pro",
    count: 1,
    avatar: { letter: "I", color: "oklch(0.58 0.15 252)" },
  },
  {
    name: "linear-clone",
    count: 2,
    avatar: { letter: "L", color: "oklch(0.55 0.18 295)" },
    branches: [
      { name: "main", kind: "main" },
      {
        name: "Refactor task scheduler queue",
        kind: "worktree",
        active: true,
      },
    ],
  },
  {
    name: "pulse-monitor",
    count: 2,
    avatar: { letter: "P", color: "oklch(0.6 0.13 178)" },
    branches: [
      { name: "main", kind: "main" },
      {
        name: "Add Postgres exporter shim",
        kind: "worktree",
      },
    ],
  },
];

// Real Anthropic Claude mark — extracted from Superset v1.12.1 via CDP.
function ClaudeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#D97757"
        fillRule="nonzero"
        d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"
      />
    </svg>
  );
}

// Real OpenAI Codex mark — extracted from Superset v1.12.1 via CDP.
function CodexIcon() {
  return (
    <svg
      viewBox="0 0 721 721"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M304.246 295.411V249.828C304.246 245.989 305.687 243.109 309.044 241.191L400.692 188.412C413.167 181.215 428.042 177.858 443.394 177.858C500.971 177.858 537.44 222.482 537.44 269.982C537.44 273.34 537.44 277.179 536.959 281.018L441.954 225.358C436.197 222 430.437 222 424.68 225.358L304.246 295.411ZM518.245 472.945V364.024C518.245 357.304 515.364 352.507 509.608 349.149L389.174 279.096L428.519 256.543C431.877 254.626 434.757 254.626 438.115 256.543L529.762 309.323C556.154 324.679 573.905 357.304 573.905 388.971C573.905 425.436 552.315 459.024 518.245 472.941V472.945ZM275.937 376.982L236.592 353.952C233.235 352.034 231.794 349.154 231.794 345.315V239.756C231.794 188.416 271.139 149.548 324.4 149.548C344.555 149.548 363.264 156.268 379.102 168.262L284.578 222.964C278.822 226.321 275.942 231.119 275.942 237.838V376.986L275.937 376.982ZM360.626 425.922L304.246 394.255V327.083L360.626 295.416L417.002 327.083V394.255L360.626 425.922ZM396.852 571.789C376.698 571.789 357.989 565.07 342.151 553.075L436.674 498.374C442.431 495.017 445.311 490.219 445.311 483.499V344.352L485.138 367.382C488.495 369.299 489.936 372.179 489.936 376.018V481.577C489.936 532.917 450.109 571.785 396.852 571.785V571.789ZM283.134 464.79L191.486 412.01C165.094 396.654 147.343 364.029 147.343 332.362C147.343 295.416 169.415 262.309 203.48 248.393V357.791C203.48 364.51 206.361 369.308 212.117 372.665L332.074 442.237L292.729 464.79C289.372 466.707 286.491 466.707 283.134 464.79ZM277.859 543.48C223.639 543.48 183.813 502.695 183.813 452.314C183.813 448.475 184.294 444.636 184.771 440.797L279.295 495.498C285.051 498.856 290.812 498.856 296.568 495.498L417.002 425.927V471.509C417.002 475.349 415.562 478.229 412.204 480.146L320.557 532.926C308.081 540.122 293.206 543.48 277.854 543.48H277.859ZM396.852 600.576C454.911 600.576 503.37 559.313 514.41 504.612C568.149 490.696 602.696 440.315 602.696 388.976C602.696 355.387 588.303 322.762 562.392 299.25C564.791 289.173 566.231 279.096 566.231 269.024C566.231 200.411 510.571 149.067 446.274 149.067C433.322 149.067 420.846 150.984 408.37 155.305C386.775 134.192 357.026 120.758 324.4 120.758C266.342 120.758 217.883 162.02 206.843 216.721C153.104 230.637 118.557 281.018 118.557 332.357C118.557 365.946 132.95 398.571 158.861 422.083C156.462 432.16 155.022 442.237 155.022 452.309C155.022 520.922 210.682 572.266 274.978 572.266C287.931 572.266 300.407 570.349 312.883 566.028C334.473 587.141 364.222 600.576 396.852 600.576Z"
      />
    </svg>
  );
}

interface SessionTab {
  title: string;
  active?: boolean;
}

const sessionTabs: SessionTab[] = [
  { title: "Workspace setup" },
  { title: "john@host" },
  { title: "Scheduler queue refactor", active: true },
];

const activeSessionTitle = "Scheduler queue refactor";
const terminalOutput = `> refactor the task scheduler queue so retries flow through dispatcher.backoff()

● Mapping the current shape first — three files own scheduling and the worker
  reaches into the queue directly. Cleanest path: route every retry through
  dispatcher.backoff() so the worker only owns the happy path.

● Bash(rg -n "scheduler" src --type ts | head -30)
   ⎿ src/scheduler/queue.ts:14      export class TaskQueue { … }
     src/scheduler/queue.ts:62      private flush() { … }
     src/scheduler/dispatcher.ts:31 retry(job, delay) { … }
     src/scheduler/worker.ts:18     tightLoop() { … }
     … +14 lines (ctrl+o to expand)

● Update(src/scheduler/queue.ts)
   ⎿ One queue per priority tier; jobs carry a typed discriminated payload.

● Update(src/scheduler/dispatcher.ts)
   ⎿ backoff() now owns retry scheduling and returns a next-tick promise.

● Update(src/scheduler/worker.ts)
   ⎿ tightLoop removed; worker awaits dispatcher.next().

● Bash(pnpm test scheduler)
   ⎿ ✓ queue       · 8 passed in 0.4s
     ✓ dispatcher  · 5 passed in 0.3s
     ✓ worker      · 1 passed in 0.5s
     14 passed total in 1.2s

● Bash(pnpm typecheck && pnpm lint)
   ⎿ ✓ tsc --noEmit — clean
     ✓ biome check . — no findings

▌ Done. One queue per priority tier; retries flow through dispatcher.backoff().
  All 14 tests green; the old tight-loop in worker.ts is gone.
`;

function Avatar({ spec }: { spec: AvatarSpec }) {
  return (
    <svg
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="9" cy="9" r="9" fill={spec.color} />
      <text
        x="9"
        y="12.6"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fontFamily="inherit"
        fill="white"
      >
        {spec.letter}
      </text>
    </svg>
  );
}

export function WorkspaceScene({ entry }: WorkspaceSceneProps) {
  const { theme } = entry;
  const threadId = useId();
  const agentTabId = useId();

  return (
    <div className="scene-workspace">
      <aside className="scene-workspace__rail">
        <button type="button" className="scene-workspace__team" aria-label="Switch team">
          <span className="scene-workspace__team-mark">JT</span>
          <span className="scene-workspace__team-name">John's Team</span>
          <ChevronsUpDown aria-hidden="true" className="scene-workspace__team-chevron" />
        </button>
        <nav aria-label="Workspaces" className="scene-workspace__nav">
          <a aria-current="page" href="#workspaces">
            <Layers aria-hidden="true" />
            <span>Workspaces</span>
          </a>
          <a href="#automations">
            <Clock aria-hidden="true" />
            <span>Automations</span>
          </a>
          <a href="#tasks">
            <ClipboardList aria-hidden="true" />
            <span>Tasks & PRs</span>
          </a>
          <a href="#new-workspace" className="scene-workspace__new-workspace">
            <Plus aria-hidden="true" />
            <span>New Workspace</span>
            <FolderPlus aria-hidden="true" className="scene-workspace__new-workspace-trailing" />
          </a>
        </nav>
        <div className="scene-workspace__rail-divider" aria-hidden="true" />
        <div className="scene-workspace__projects">
          {projects.map((project) => (
            <div key={project.name} className="scene-workspace__project">
              <div className="scene-workspace__project-header">
                <span className="scene-workspace__project-avatar" aria-hidden="true">
                  <Avatar spec={project.avatar} />
                </span>
                <span className="scene-workspace__project-name">{project.name}</span>
                <span className="scene-workspace__project-count">{project.count}</span>
              </div>
              {project.branches ? (
                <ul className="scene-workspace__branches">
                  {project.branches.map((branch) => (
                    <li key={branch.name} data-active={branch.active || undefined}>
                      <span
                        className="scene-workspace__branch-icon"
                        data-kind={branch.kind}
                        aria-hidden="true"
                      >
                        {branch.kind === "main" ? <Laptop /> : <Circle />}
                      </span>
                      <span className="scene-workspace__branch-name">{branch.name}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
        <div className="scene-workspace__footer">
          <a href="#ports" className="scene-workspace__footer-row">
            <RadioTower aria-hidden="true" />
            <span>Ports</span>
            <span className="scene-workspace__footer-meta">1</span>
          </a>
          <div className="scene-workspace__footer-row scene-workspace__footer-row--settings">
            <a href="#settings" className="scene-workspace__settings-link">
              <Settings aria-hidden="true" />
              <span>Settings</span>
            </a>
            <button type="button" className="scene-workspace__help-button" aria-label="Help">
              <CircleHelp aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <section
        className="scene-workspace__main"
        aria-label={`${theme.name} workspace`}
        aria-describedby={threadId}
      >
        {/* Session tab strip */}
        <div className="scene-workspace__sessions">
          {sessionTabs.map((tab) => (
            <div
              key={tab.title}
              className="scene-workspace__session"
              data-active={tab.active || undefined}
            >
              <button type="button" className="scene-workspace__session-title">
                <span>{tab.title}</span>
              </button>
              <button
                type="button"
                aria-label={`Close ${tab.title}`}
                className="scene-workspace__session-close"
              >
                <X aria-hidden="true" />
              </button>
            </div>
          ))}
          <button type="button" aria-label="New session" className="scene-workspace__session-new">
            <Plus aria-hidden="true" />
          </button>
        </div>

        {/* Agent / Run bar */}
        <div className="scene-workspace__tabbar" id={agentTabId}>
          <div className="scene-workspace__tabs">
            <button
              type="button"
              aria-label="Workspace settings"
              className="scene-workspace__tabs-gear"
            >
              <Settings aria-hidden="true" />
            </button>
            <span className="scene-workspace__tabs-separator" aria-hidden="true" />
            <button type="button" className="scene-workspace__tab" data-active>
              <span className="scene-workspace__tab-icon">
                <ClaudeIcon />
              </span>
              <span>Claude</span>
            </button>
            <button type="button" className="scene-workspace__tab">
              <span className="scene-workspace__tab-icon">
                <CodexIcon />
              </span>
              <span>Codex</span>
            </button>
          </div>
          <div className="scene-workspace__runrow">
            <div className="scene-workspace__run-group">
              <button type="button" className="scene-workspace__run">
                <Play aria-hidden="true" className="scene-workspace__run-icon" />
                <span>Run</span>
                <kbd className="scene-workspace__kbd">⌘G</kbd>
              </button>
              <button
                type="button"
                aria-label="Open run menu"
                className="scene-workspace__run-chevron"
              >
                <ChevronDown aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-header: active session title with split / close actions */}
        <div className="scene-workspace__subheader">
          <span className="scene-workspace__subheader-icon" aria-hidden="true">
            <ClaudeIcon />
          </span>
          <button type="button" className="scene-workspace__subheader-title">
            <span>{activeSessionTitle}</span>
            <ChevronDown aria-hidden="true" />
          </button>
          <div className="scene-workspace__subheader-actions">
            <button type="button" aria-label="Split view" className="scene-workspace__icon-button">
              <Columns2 aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Close session"
              className="scene-workspace__icon-button"
            >
              <X aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Terminal content area — fake Claude Code session output */}
        <div className="scene-workspace__terminal" role="log" aria-live="polite" id={threadId}>
          <textarea
            aria-label="Terminal output"
            autoComplete="off"
            className="scene-workspace__terminal-output"
            name="workspace-terminal-output"
            readOnly
            spellCheck={false}
            value={terminalOutput}
          />
          <div className="scene-workspace__activity">
            <div className="scene-workspace__activity-status">
              <span aria-hidden="true" className="scene-workspace__activity-icon">
                ✱
              </span>
              <span className="scene-workspace__activity-verb">Metamorphosing…</span>
              <span className="scene-workspace__activity-meta">(1m 14s · ↓ 3.6k tokens)</span>
            </div>
            <div className="scene-workspace__activity-tip">
              <span aria-hidden="true" className="scene-workspace__activity-tip-glyph">
                ⎿
              </span>
              <span>
                Tip: Use /btw to ask a quick side question without interrupting Claude's current
                work
              </span>
            </div>
          </div>
          <div className="scene-workspace__prompt">
            <span aria-hidden="true" className="scene-workspace__prompt-glyph">
              ›
            </span>
            <span aria-hidden="true" className="scene-workspace__terminal-cursor" />
          </div>
          <div className="scene-workspace__statusbar">
            <span className="scene-workspace__statusbar-perm">
              <span aria-hidden="true">»»</span> bypass permissions on{" "}
              <span className="scene-workspace__statusbar-dim">
                (shift+tab to cycle) · esc to interrupt
              </span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
