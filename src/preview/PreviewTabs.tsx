import { useId, useState } from "react";
import type { SupersetTheme } from "../theme-core/themeTypes";
import { type TabOption, Tabs } from "../ui/Tabs";
import { PreviewFrame } from "./PreviewFrame";
import { PreviewSurface } from "./surfaces";

export type PreviewTabId = "workspace" | "editor" | "terminal" | "diff" | "command" | "settings";

export const PREVIEW_TABS = [
  { label: "Workspace", value: "workspace" },
  { label: "Editor", value: "editor" },
  { label: "Terminal", value: "terminal" },
  { label: "Diff", value: "diff" },
  { label: "Command Palette", value: "command" },
  { label: "Settings/Form", value: "settings" },
] as const satisfies readonly TabOption<PreviewTabId>[];

export const PREVIEW_TAB_LABELS = PREVIEW_TABS.map((tab) => tab.label);

export interface PreviewTabsProps {
  initialTab?: PreviewTabId;
  onTabChange?: (tab: PreviewTabId) => void;
  selectedTab?: PreviewTabId;
  theme: SupersetTheme;
}

export function PreviewTabs({
  initialTab = "workspace",
  onTabChange,
  selectedTab: controlledSelectedTab,
  theme,
}: PreviewTabsProps) {
  const idPrefix = useId();
  const [uncontrolledSelectedTab, setUncontrolledSelectedTab] = useState<PreviewTabId>(initialTab);
  const selectedTab = controlledSelectedTab ?? uncontrolledSelectedTab;
  const selectedTabLabel = PREVIEW_TABS.find((tab) => tab.value === selectedTab)?.label ?? "";
  const selectedPanelId = `${idPrefix}-${selectedTab}-panel`;

  const handleTabChange = (nextTab: PreviewTabId) => {
    if (controlledSelectedTab === undefined) {
      setUncontrolledSelectedTab(nextTab);
    }

    onTabChange?.(nextTab);
  };

  return (
    <div className="preview-tabs-shell">
      <div className="preview-tabs-shell__header">
        <div>
          <p className="preview-tabs-shell__eyebrow">{theme.type} theme</p>
          <h3>{theme.name}</h3>
        </div>
        <span className="preview-tabs-shell__meta">Superset surfaces</span>
      </div>
      <Tabs
        ariaLabel="Preview surfaces"
        className="preview-tabs"
        getPanelId={(tab) => `${idPrefix}-${tab}-panel`}
        getTabId={(tab) => `${idPrefix}-${tab}-tab`}
        onValueChange={handleTabChange}
        tabs={PREVIEW_TABS}
        value={selectedTab}
      />
      <PreviewFrame theme={theme}>
        <div
          aria-label={selectedTabLabel}
          aria-labelledby={`${idPrefix}-${selectedTab}-tab`}
          className="preview-tab-panel"
          id={selectedPanelId}
          role="tabpanel"
        >
          <PreviewSurface tab={selectedTab} theme={theme} />
        </div>
      </PreviewFrame>
    </div>
  );
}
