import type { Meta, StoryObj } from "@storybook/react-vite";
import { getCatalogThemeById } from "../data/fixtures";
import { ThemeCard } from "./ThemeCard";

const auroraLight = getCatalogThemeById("aurora-light");
const auroraDark = getCatalogThemeById("aurora-dark");
const graphiteDark = getCatalogThemeById("graphite-dark");

if (!auroraLight || !auroraDark || !graphiteDark) {
  throw new Error("Expected catalog fixture themes to exist.");
}

const meta = {
  title: "Catalog/Theme Card",
  component: ThemeCard,
  tags: ["test"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 340 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThemeCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LightTheme: Story = {
  args: {
    entry: auroraLight,
  },
};

export const DarkTheme: Story = {
  args: {
    entry: auroraDark,
  },
};

export const HighContrastDarkTheme: Story = {
  args: {
    entry: graphiteDark,
  },
};
