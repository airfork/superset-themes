import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { catalogThemes } from "../data/catalog";
import { getCatalogThemeById, getThemeById } from "../data/fixtures";
import { createDraftFromCatalogEntry } from "./draftTheme";
import { LabPage } from "./LabPage";

const auroraLightEntry = getCatalogThemeById("aurora-light");
const graphiteDark = getThemeById("graphite-dark");

if (!auroraLightEntry || !graphiteDark) {
  throw new Error("Expected lab fixture themes to exist.");
}

describe("LabPage", () => {
  it("renders a catalog draft and updates preview tokens", () => {
    render(
      <LabPage
        catalogEntries={catalogThemes}
        initialDraft={createDraftFromCatalogEntry(auroraLightEntry)}
        selectedCatalogThemeId="aurora-light"
      />,
    );

    expect(screen.getByRole("region", { name: /theme lab/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /start from catalog theme/i })).toHaveValue(
      "aurora-light",
    );
    expect(
      within(screen.getByRole("complementary", { name: /lab controls/i })).getByRole("heading", {
        name: /aurora light/i,
      }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("UI accent"), {
      target: { value: "#123456" },
    });

    expect(screen.getByLabelText("UI accent")).toHaveValue("#123456");
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /aurora light preview/i })).toHaveStyle(
      "--preview-ui-accent: #123456",
    );
  });

  it("starts from another catalog theme", async () => {
    const user = userEvent.setup();
    render(
      <LabPage
        catalogEntries={catalogThemes}
        initialDraft={createDraftFromCatalogEntry(auroraLightEntry)}
        selectedCatalogThemeId="aurora-light"
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: /start from catalog theme/i }),
      "graphite-dark",
    );

    expect(
      within(screen.getByRole("complementary", { name: /lab controls/i })).getByRole("heading", {
        name: /graphite dark/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/draft clean/i)).toBeInTheDocument();
  });

  it("shows contrast validation warnings inline", () => {
    render(<LabPage initialDraft={createDraftFromCatalogEntry(auroraLightEntry)} />);

    fireEvent.change(screen.getByLabelText("UI foreground"), {
      target: { value: auroraLightEntry.theme.ui.background },
    });

    expect(screen.getByText(/contrast issues/i)).toBeInTheDocument();
    expect(screen.getByText(/ui foreground on background/i)).toBeInTheDocument();
  });

  it("imports valid JSON and reports invalid JSON", async () => {
    const user = userEvent.setup();
    render(<LabPage initialDraft={createDraftFromCatalogEntry(auroraLightEntry)} />);

    fireEvent.change(screen.getByLabelText("Import theme JSON"), {
      target: { value: "{ nope" },
    });
    await user.click(screen.getByRole("button", { name: "Import JSON" }));

    expect(screen.getByText(/invalid json/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Import theme JSON"), {
      target: { value: JSON.stringify(graphiteDark) },
    });
    await user.click(screen.getByRole("button", { name: "Import JSON" }));

    expect(
      within(screen.getByRole("complementary", { name: /lab controls/i })).getByRole("heading", {
        name: /graphite dark/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/invalid json/i)).not.toBeInTheDocument();
  });

  it("copies export-clean draft JSON", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<LabPage initialDraft={createDraftFromCatalogEntry(auroraLightEntry)} />);

    await user.click(screen.getByRole("button", { name: "Copy JSON" }));

    const payload = writeText.mock.calls[0]?.[0] as string;
    expect(JSON.parse(payload)).toMatchObject({
      id: "aurora-light",
      type: "light",
    });
    expect(payload).not.toContain("pairGroup");
  });
});
