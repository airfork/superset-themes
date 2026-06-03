import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getCatalogThemeById } from "../data/fixtures";
import { FocusedThemeProvider } from "../theme/FocusedThemeProvider";
import { exportThemeJson } from "../theme-core/exportTheme";
import { createDraftFromCatalogEntry } from "./draftTheme";
import { LabView } from "./LabView";

const auroraLight = getCatalogThemeById("aurora-light");

if (!auroraLight) {
  throw new Error("Expected aurora-light catalog entry.");
}

const renderLab = (onStartFromCatalog = vi.fn()) =>
  render(
    <FocusedThemeProvider>
      <LabView
        initialDraft={createDraftFromCatalogEntry(auroraLight)}
        onBackToCatalog={vi.fn()}
        onStartFromCatalog={onStartFromCatalog}
      />
    </FocusedThemeProvider>,
  );

describe("LabView", () => {
  it("renders the shared shell seeded from a catalog theme", () => {
    renderLab();

    expect(screen.getByRole("combobox", { name: /start from catalog theme/i })).toHaveValue(
      "aurora-light",
    );
    expect(screen.getByRole("heading", { name: auroraLight.theme.name })).toBeInTheDocument();
    expect(screen.getByText(/based on aurora-light/i)).toBeInTheDocument();
  });

  it("exposes a top-level page heading for the editor", () => {
    renderLab();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/theme bench/i);
  });

  it("announces the hue slider value with units for screen readers", () => {
    renderLab();

    expect(screen.getByRole("slider", { name: /hue/i })).toHaveAttribute(
      "aria-valuetext",
      "220 degrees",
    );
  });

  it("drives the focused theme from the draft", () => {
    renderLab();

    expect(document.documentElement.getAttribute("data-theme-id")).toBe("aurora-light");
    expect(screen.getByRole("contentinfo")).toHaveTextContent(auroraLight.theme.name);
  });

  it("reseeds from the catalog select", async () => {
    const user = userEvent.setup();
    const onStartFromCatalog = vi.fn();
    renderLab(onStartFromCatalog);

    await user.selectOptions(
      screen.getByRole("combobox", { name: /start from catalog theme/i }),
      "graphite-dark",
    );

    expect(onStartFromCatalog).toHaveBeenCalledWith("graphite-dark");
  });

  it("generates a draft from the seed and exposes a reroll-all control", async () => {
    const user = userEvent.setup();
    renderLab();

    await user.click(screen.getByRole("button", { name: /^generate$/i }));

    expect(screen.getByText(/draft, generated \(seed: preview\)/i)).toBeInTheDocument();
    // The catalog select drops back to the placeholder once the draft is no
    // longer catalog-sourced.
    expect(screen.getByRole("combobox", { name: /start from catalog theme/i })).toHaveValue("");
    // Reroll-all only appears once a seed-based draft exists.
    expect(screen.getByRole("button", { name: /reroll all/i })).toBeInTheDocument();
  });

  it("keeps Reroll all visible but disabled until a generated draft exists", async () => {
    const user = userEvent.setup();
    renderLab();

    expect(screen.getByRole("button", { name: /reroll all/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /^generate$/i }));

    expect(screen.getByRole("button", { name: /reroll all/i })).toBeEnabled();
  });

  it("imports a draft from pasted JSON", async () => {
    const user = userEvent.setup();
    renderLab();

    const graphite = getCatalogThemeById("graphite-dark");
    if (!graphite) {
      throw new Error("Expected graphite-dark catalog entry.");
    }

    await user.click(screen.getByText(/paste json/i));
    await user.click(screen.getByRole("textbox", { name: /paste theme json/i }));
    await user.paste(exportThemeJson(graphite.theme));
    await user.click(screen.getByRole("button", { name: /import pasted json/i }));

    expect(screen.getByText(/draft, imported/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: graphite.theme.name })).toBeInTheDocument();
  });

  it("undoes and redoes a generate through the history stack", async () => {
    const user = userEvent.setup();
    renderLab();

    // Undo/Redo are present but disabled before any change.
    expect(screen.getByRole("button", { name: /undo/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /redo/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /^generate$/i }));
    expect(screen.getByText(/draft, generated \(seed: preview\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /undo/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /undo/i }));

    // Restored to the catalog-sourced draft; redo now available.
    expect(screen.getByText(/based on aurora-light/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /start from catalog theme/i })).toHaveValue(
      "aurora-light",
    );
    expect(screen.getByRole("button", { name: /undo/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /redo/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /redo/i }));
    expect(screen.getByText(/draft, generated \(seed: preview\)/i)).toBeInTheDocument();
  });

  it("undoes and redoes with the keyboard", async () => {
    const user = userEvent.setup();
    renderLab();

    await user.click(screen.getByRole("button", { name: /^generate$/i }));
    expect(screen.getByText(/draft, generated \(seed: preview\)/i)).toBeInTheDocument();

    // Cmd+Z steps back to the catalog draft.
    await user.keyboard("{Meta>}z{/Meta}");
    expect(screen.getByText(/based on aurora-light/i)).toBeInTheDocument();

    // Cmd+Shift+Z steps forward again.
    await user.keyboard("{Meta>}{Shift>}z{/Shift}{/Meta}");
    expect(screen.getByText(/draft, generated \(seed: preview\)/i)).toBeInTheDocument();
  });

  it("leaves Cmd+Z to native text undo while a field is focused", async () => {
    const user = userEvent.setup();
    renderLab();

    await user.click(screen.getByRole("button", { name: /^generate$/i }));
    expect(screen.getByText(/draft, generated \(seed: preview\)/i)).toBeInTheDocument();

    // With the Seed input focused, Cmd+Z must not trigger the Lab's history
    // undo (the field keeps its own native undo). The draft must stay generated,
    // not revert to the catalog source.
    await user.click(screen.getByRole("textbox", { name: /seed/i }));
    await user.keyboard("{Meta>}z{/Meta}");

    expect(screen.getByText(/draft, generated/i)).toBeInTheDocument();
    expect(screen.queryByText(/based on aurora-light/i)).not.toBeInTheDocument();
  });
});
