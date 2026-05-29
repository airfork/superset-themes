import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { getCatalogThemeById } from "../data/fixtures";
import { getThemeCssVars } from "../preview/themeCssVars";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { ColorField } from "./ColorField";

function entryFor(id: string): CatalogThemeEntry {
  const found = getCatalogThemeById(id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

interface ThemedColorFieldProps {
  label: string;
  themeId: string;
  value: string;
}

// ColorField reads `--preview-ui-*` tokens, so scope a focused theme onto a
// wrapper the same way the catalog scenes do.
function ThemedColorField({ label, themeId, value }: ThemedColorFieldProps) {
  const [current, setCurrent] = useState(value);
  const style = getThemeCssVars(entryFor(themeId).theme) as CSSProperties;

  return (
    <div
      style={{
        ...style,
        background: "var(--preview-ui-card)",
        maxWidth: "320px",
        padding: "16px",
      }}
    >
      <ColorField label={label} onChange={setCurrent} value={current} />
    </div>
  );
}

const meta = {
  title: "Lab/ColorField",
  component: ThemedColorField,
  tags: ["test"],
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Background",
    themeId: "tokyo-night",
    value: "#1a1b26",
  },
} satisfies Meta<typeof ThemedColorField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  parameters: { a11y: { test: "error" } },
};

export const Focused: Story = {
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /pick background color/i }));
  },
};

export const InvalidHex: Story = {
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hex = canvas.getByRole("textbox", { name: /background hex/i });
    await userEvent.clear(hex);
    await userEvent.type(hex, "nope");
    await userEvent.tab();
    await expect(hex).toHaveAttribute("aria-invalid", "true");
  },
};
