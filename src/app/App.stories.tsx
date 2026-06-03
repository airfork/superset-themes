import type { Meta, StoryObj } from "@storybook/react-vite";
import { App } from "./App";

const meta = {
  title: "App/Catalog Shell",
  component: App,
  tags: ["test"],
  decorators: [
    (Story) => {
      // App seeds its focused theme from data-theme-id (the first-paint script's
      // pick). Storybook runs no such script and stories share a document, so clear
      // any leaked attribute to render the deterministic default theme.
      if (typeof document !== "undefined") {
        document.documentElement.removeAttribute("data-theme-id");
      }
      return <Story />;
    },
  ],
  parameters: {
    a11y: {
      test: "error",
    },
    layout: "fullscreen",
  },
} satisfies Meta<typeof App>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Scaffold: Story = {};
