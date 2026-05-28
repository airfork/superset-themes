import type { Meta, StoryObj } from "@storybook/react-vite";
import { catalogThemes } from "../data/catalog";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { RailRow } from "./RailRow";

function entryFor(id: string): CatalogThemeEntry {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

const meta = {
  title: "Rail/RailRow",
  component: RailRow,
  tags: ["test"],
  parameters: {
    layout: "padded",
  },
  args: {
    selected: false,
    pinned: false,
    variant: "basic",
  },
} satisfies Meta<typeof RailRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BasicDark: Story = {
  args: { entry: entryFor("dracula") },
  parameters: { a11y: { test: "error" } },
};

export const BasicLight: Story = {
  args: { entry: entryFor("solarized-light") },
  parameters: { a11y: { test: "error" } },
};

export const FeaturedDark: Story = {
  args: { entry: entryFor("tokyo-night"), variant: "featured" },
  parameters: { a11y: { test: "error" } },
};

export const FeaturedLight: Story = {
  args: { entry: entryFor("rose-pine-dawn"), variant: "featured" },
  parameters: { a11y: { test: "error" } },
};

export const Selected: Story = {
  args: { entry: entryFor("tokyo-night"), variant: "featured", selected: true },
  parameters: { a11y: { test: "error" } },
};

export const Pinned: Story = {
  args: { entry: entryFor("catppuccin-mocha"), pinned: true },
  parameters: { a11y: { test: "error" } },
};
