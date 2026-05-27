import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { CatalogPage } from "./CatalogPage";

describe("CatalogPage", () => {
  it("renders compact cards for the fixture catalog", () => {
    render(
      <CatalogPage
        entries={catalogThemes}
        pinHrefForTheme={(entry) => `/compare?${entry.theme.type}=${entry.theme.id}`}
      />,
    );

    expect(screen.getByRole("region", { name: /theme catalog/i })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /search themes/i })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /aurora light/i })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /aurora dark/i })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /graphite dark/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pin light aurora light/i })).toHaveAttribute(
      "href",
      "/compare?light=aurora-light",
    );
  });

  it("filters by light and dark theme type", async () => {
    const user = userEvent.setup();
    render(<CatalogPage entries={catalogThemes} />);

    await user.click(screen.getByRole("radio", { name: "Dark" }));

    expect(screen.queryByRole("article", { name: /aurora light/i })).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: /aurora dark/i })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /graphite dark/i })).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Light" }));

    expect(screen.getByRole("article", { name: /aurora light/i })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /aurora dark/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /graphite dark/i })).not.toBeInTheDocument();
  });

  it("searches metadata and shows an empty state", async () => {
    const user = userEvent.setup();
    render(<CatalogPage entries={catalogThemes} />);

    await user.type(screen.getByRole("searchbox", { name: /search themes/i }), "terminal-rich");

    expect(screen.getByRole("article", { name: /aurora dark/i })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /aurora light/i })).not.toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox", { name: /search themes/i }));
    await user.type(screen.getByRole("searchbox", { name: /search themes/i }), "nope");

    expect(screen.getByText(/no themes match/i)).toBeInTheDocument();
  });

  it("combines select filters and sort order", async () => {
    const user = userEvent.setup();
    render(<CatalogPage entries={catalogThemes} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Contrast" }), "high");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Terminal palette" }),
      "balanced",
    );

    expect(screen.getByRole("article", { name: /graphite dark/i })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /aurora dark/i })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "Sort" }), "accentHue");
    await user.selectOptions(screen.getByRole("combobox", { name: "Contrast" }), "all");
    await user.selectOptions(screen.getByRole("combobox", { name: "Terminal palette" }), "all");

    const resultList = screen.getByRole("list", { name: /catalog results/i });
    const cards = within(resultList).getAllByRole("article");
    expect(cards.map((card) => card.getAttribute("aria-label"))).toEqual([
      "Graphite Dark",
      "Gruvbox Dark",
      "Aurora Light",
      "Aurora Dark",
      "Nord",
      "Solarized Light",
      "Solarized Dark",
      "One Dark",
      "Catppuccin Mocha",
      "Tokyo Night",
      "Dracula",
      "Rosé Pine Dawn",
    ]);
  });
});
