import type { Meta, StoryObj } from "@storybook/react-vite";
import { catalogThemes } from "../data/catalog";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { BottomBar } from "./BottomBar";

function entryFor(id: string): CatalogThemeEntry {
  const entry = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!entry) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return entry;
}

const meta = {
  title: "Chrome/BottomBar",
  component: BottomBar,
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BottomBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TokyoNight: Story = {
  args: { entry: entryFor("tokyo-night") },
  parameters: { a11y: { test: "error" } },
};

export const SolarizedLight: Story = {
  args: { entry: entryFor("solarized-light") },
  parameters: { a11y: { test: "error" } },
};

export const CatppuccinMocha: Story = {
  args: { entry: entryFor("catppuccin-mocha") },
  parameters: { a11y: { test: "error" } },
};
