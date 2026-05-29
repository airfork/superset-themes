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

    expect(screen.getByText(/draft — generated, seed: preview/i)).toBeInTheDocument();
    // The catalog select drops back to the placeholder once the draft is no
    // longer catalog-sourced.
    expect(screen.getByRole("combobox", { name: /start from catalog theme/i })).toHaveValue("");
    // Reroll-all only appears once a seed-based draft exists.
    expect(screen.getByRole("button", { name: /reroll all/i })).toBeInTheDocument();
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

    expect(screen.getByText(/draft — imported/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: graphite.theme.name })).toBeInTheDocument();
  });
});
