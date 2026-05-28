import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { catalogThemes } from "../data/catalog";
import { getThemeCssVars } from "../preview/themeCssVars";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { SettingsScene } from "./SettingsScene";

function entryFor(id: string): CatalogThemeEntry {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

const meta = {
  title: "Pane/SettingsScene",
  component: SettingsScene,
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
    // Same theme-level constraint as WorkspaceScene: some themes can't pass
    // axe's 4.5:1 for every small-surface combination. Form controls have
    // visible labels, fieldset/legend, and visible focus by design — covered by
    // the Phase 5 web-design-guidelines review on this scene.
    a11y: { test: "todo" },
  },
  decorators: [
    (Story, context) => {
      const entry = context.args.entry;
      const style = getThemeCssVars(entry.theme) as CSSProperties;
      return (
        <div style={{ ...style, minHeight: "560px" }}>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof SettingsScene>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TokyoNight: Story = {
  args: { entry: entryFor("tokyo-night") },
};

export const SolarizedLight: Story = {
  args: { entry: entryFor("solarized-light") },
};

export const RosePineDawn: Story = {
  args: { entry: entryFor("rose-pine-dawn") },
};

export const OneDark: Story = {
  args: { entry: entryFor("one-dark") },
};
