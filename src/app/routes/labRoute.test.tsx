import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FocusedThemeProvider } from "../../theme/FocusedThemeProvider";
import { LabRouteView, parseLabRouteSearch } from "./labRoute";

function renderLabRoute(search: Parameters<typeof LabRouteView>[0]["search"]) {
  return render(
    <FocusedThemeProvider>
      <LabRouteView onBackToCatalog={vi.fn()} onStartFromCatalog={vi.fn()} search={search} />
    </FocusedThemeProvider>,
  );
}

describe("parseLabRouteSearch", () => {
  it("keeps only a non-empty from param", () => {
    expect(parseLabRouteSearch({ from: "tokyo-night" })).toEqual({ from: "tokyo-night" });
    expect(parseLabRouteSearch({ from: " " })).toEqual({});
    expect(parseLabRouteSearch({ from: 12 })).toEqual({});
  });
});

describe("LabRouteView", () => {
  it("defaults to Superset Light so default tweaks start from the baseline", () => {
    renderLabRoute({});

    expect(screen.getByRole("combobox", { name: /start from catalog theme/i })).toHaveValue(
      "superset-light",
    );
    expect(screen.getByRole("heading", { name: /superset light/i })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/superset light/i);
  });
});
