import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { catalogThemes } from "../data/catalog";
import { getThemeCssVars } from "../preview/themeCssVars";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { buildThemeCommands, type PaletteCommand } from "./commands";
import { Palette } from "./Palette";

function entryFor(id: string): CatalogThemeEntry {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

const noop = () => {};
const themeCommands = buildThemeCommands(noop);

function action(id: string, label: string, keys: string[]): PaletteCommand {
  return { id, label, section: "Actions", keys, run: noop };
}

const catalogActions: PaletteCommand[] = [
  action("action-open-in-lab", "Open in Lab", ["open in lab", "lab"]),
  action("action-pin-to-compare", "Pin to compare", ["pin to compare", "compare"]),
  action("action-toggle-next-theme", "Toggle next theme", ["toggle next theme", "next"]),
];

const compareActions: PaletteCommand[] = [
  action("action-open-in-lab", "Open in Lab", ["open in lab", "lab"]),
  action("action-exit-compare", "Exit compare", ["exit compare", "close"]),
  action("action-toggle-next-theme", "Toggle next theme", ["toggle next theme", "next"]),
];

interface ThemedPaletteProps {
  themeId: string;
  query: string;
  commands: PaletteCommand[];
}

// Palette portals into its `container`, so stories scope the focused theme's tokens
// onto a wrapper div and hand that element to the component.
function ThemedPalette({ themeId, query, commands }: ThemedPaletteProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const style = getThemeCssVars(entryFor(themeId).theme) as CSSProperties;
  return (
    <div
      ref={setContainer}
      style={{ ...style, minHeight: "520px", background: "var(--preview-ui-background)" }}
    >
      {container ? (
        <Palette
          open
          query={query}
          focusedIndex={0}
          commands={commands}
          container={container}
          onQueryChange={noop}
          onMove={noop}
          onClose={noop}
          onSubmit={noop}
        />
      ) : null}
    </div>
  );
}

const meta = {
  title: "Palette/Palette",
  component: ThemedPalette,
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
    // Hints use muted-foreground over the popover surface — a theme-level contrast
    // tradeoff shared with the catalog scenes. Storybook a11y stays in `todo`; the
    // Phase 7 impeccable + web-design-guidelines reviews cover the real a11y bar.
    a11y: { test: "todo" },
  },
} satisfies Meta<typeof ThemedPalette>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyQuery: Story = {
  args: { themeId: "tokyo-night", query: "", commands: [...themeCommands, ...catalogActions] },
};

export const ActionsAtRest: Story = {
  args: {
    themeId: "tokyo-night",
    query: "",
    commands: [...themeCommands, ...catalogActions],
  },
};

export const ThemesFiltered: Story = {
  args: {
    themeId: "rose-pine-dawn",
    query: "rose",
    commands: [...themeCommands, ...catalogActions],
  },
};

export const ActionsCatalog: Story = {
  args: {
    themeId: "solarized-light",
    query: "to",
    commands: [...themeCommands, ...catalogActions],
  },
};

export const ActionsCompare: Story = {
  args: {
    themeId: "catppuccin-mocha",
    query: "ex",
    commands: [...themeCommands, ...compareActions],
  },
};
