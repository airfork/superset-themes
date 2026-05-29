import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getCatalogThemeById } from "../data/fixtures";
import { FocusedThemeProvider } from "../theme/FocusedThemeProvider";
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
});
