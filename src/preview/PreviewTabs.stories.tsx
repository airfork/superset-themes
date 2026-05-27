import type { Meta, StoryObj } from "@storybook/react-vite";
import { getThemeById } from "../data/fixtures";
import { PreviewTabs } from "./PreviewTabs";

const auroraLight = getThemeById("aurora-light");
const auroraDark = getThemeById("aurora-dark");
const graphiteDark = getThemeById("graphite-dark");

if (!auroraLight || !auroraDark || !graphiteDark) {
  throw new Error("Expected preview fixture themes to exist.");
}

const meta = {
  title: "Preview/Preview Tabs",
  component: PreviewTabs,
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PreviewTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WorkspaceDark: Story = {
  args: {
    theme: auroraDark,
  },
};

export const EditorLight: Story = {
  args: {
    initialTab: "editor",
    theme: auroraLight,
  },
};

export const TerminalDark: Story = {
  args: {
    initialTab: "terminal",
    theme: graphiteDark,
  },
};

export const DiffLight: Story = {
  args: {
    initialTab: "diff",
    theme: auroraLight,
  },
};

export const CommandPaletteDark: Story = {
  args: {
    initialTab: "command",
    theme: auroraDark,
  },
};

export const SettingsFormLight: Story = {
  args: {
    initialTab: "settings",
    theme: auroraLight,
  },
};
