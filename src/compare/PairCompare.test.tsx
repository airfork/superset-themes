import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { PairCompare } from "./PairCompare";
import { DEFAULT_PAIRING_STATE, type PairingState } from "./pairing";

function StatefulPairCompare({ initialState }: { initialState: PairingState }) {
  const [state, setState] = useState(initialState);

  return <PairCompare entries={catalogThemes} onStateChange={setState} state={state} />;
}

describe("PairCompare", () => {
  it("renders empty light and dark slots", () => {
    render(<PairCompare entries={catalogThemes} state={DEFAULT_PAIRING_STATE} />);

    expect(screen.getByRole("region", { name: /light theme slot/i })).toHaveTextContent(
      /no light theme pinned/i,
    );
    expect(screen.getByRole("region", { name: /dark theme slot/i })).toHaveTextContent(
      /no dark theme pinned/i,
    );
  });

  it("renders a pinned light and dark theme side by side", () => {
    render(
      <PairCompare
        entries={catalogThemes}
        state={{
          darkThemeId: "aurora-dark",
          lightThemeId: "aurora-light",
          selectedPreviewTab: "workspace",
        }}
      />,
    );

    expect(screen.getByRole("region", { name: /light theme slot/i })).toHaveTextContent(
      /aurora light/i,
    );
    expect(screen.getByRole("region", { name: /dark theme slot/i })).toHaveTextContent(
      /aurora dark/i,
    );
  });

  it("syncs the selected preview tab across both slots", async () => {
    const user = userEvent.setup();
    render(
      <StatefulPairCompare
        initialState={{
          darkThemeId: "aurora-dark",
          lightThemeId: "aurora-light",
          selectedPreviewTab: "workspace",
        }}
      />,
    );

    const lightSlot = screen.getByRole("region", { name: /light theme slot/i });
    await user.click(within(lightSlot).getByRole("tab", { name: "Terminal" }));

    expect(within(lightSlot).getByRole("tabpanel", { name: "Terminal" })).toBeVisible();
    expect(
      within(screen.getByRole("region", { name: /dark theme slot/i })).getByRole("tabpanel", {
        name: "Terminal",
      }),
    ).toBeVisible();
  });
});
