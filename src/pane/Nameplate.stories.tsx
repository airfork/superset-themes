import type { Meta, StoryObj } from "@storybook/react-vite";
import { catalogThemes } from "../data/catalog";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { Nameplate } from "./Nameplate";

function entryFor(id: string): CatalogThemeEntry {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

const meta = {
  title: "Pane/Nameplate",
  component: Nameplate,
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onPin: () => {},
  },
} satisfies Meta<typeof Nameplate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TokyoNight: Story = {
  args: { entry: entryFor("tokyo-night") },
  parameters: { a11y: { test: "error" } },
};

export const RosePineDawn: Story = {
  args: { entry: entryFor("rose-pine-dawn") },
  parameters: { a11y: { test: "error" } },
};
