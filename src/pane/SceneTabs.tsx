export type SceneId = "workspace" | "settings";

interface SceneTabsProps {
  current: SceneId;
  onChange: (next: SceneId) => void;
}

const TABS: { value: SceneId; label: string }[] = [
  { value: "workspace", label: "Workspace" },
  { value: "settings", label: "Settings" },
];

export function SceneTabs({ current, onChange }: SceneTabsProps) {
  return (
    <div className="scene-tabs" role="tablist" aria-label="Pane scene">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          type="button"
          aria-selected={current === tab.value}
          tabIndex={current === tab.value ? 0 : -1}
          className="scene-tabs__tab"
          data-active={current === tab.value || undefined}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
