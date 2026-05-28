import { type KeyboardEvent, useRef } from "react";

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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    const tab = TABS[index];
    const target = tabRefs.current[index];
    if (!tab || !target) {
      return;
    }
    target.focus();
    onChange(tab.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const activeIndex = TABS.findIndex((tab) => tab.value === current);
    if (activeIndex < 0) {
      return;
    }
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab((activeIndex - 1 + TABS.length) % TABS.length);
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab((activeIndex + 1) % TABS.length);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(TABS.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="scene-tabs"
      role="tablist"
      aria-label="Pane scene"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
    >
      {TABS.map((tab, index) => (
        <button
          key={tab.value}
          ref={(node) => {
            tabRefs.current[index] = node;
          }}
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
