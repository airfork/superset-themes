import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopBar } from "./TopBar";

const meta = {
  title: "Chrome/TopBar",
  component: TopBar,
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onOpenPalette: () => {},
  },
} satisfies Meta<typeof TopBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    a11y: {
      test: "error",
    },
  },
};
