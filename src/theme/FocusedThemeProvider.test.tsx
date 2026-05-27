// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { FocusedThemeProvider } from "./FocusedThemeProvider";
import { useFocusedTheme } from "./useFocusedTheme";

function Probe() {
  const { focused, setFocusedId } = useFocusedTheme();
  return (
    <>
      <output>{focused.theme.id}</output>
      <button type="button" onClick={() => setFocusedId("solarized-light")}>
        swap
      </button>
    </>
  );
}

describe("FocusedThemeProvider", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme-type");
    document.documentElement.removeAttribute("data-theme-id");
  });

  it("exposes the focused entry and updates :root vars when changed", async () => {
    render(
      <FocusedThemeProvider initialThemeId="tokyo-night">
        <Probe />
      </FocusedThemeProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("tokyo-night");
    expect(document.documentElement.getAttribute("data-theme-id")).toBe("tokyo-night");

    await userEvent.click(screen.getByRole("button", { name: "swap" }));

    expect(screen.getByRole("status")).toHaveTextContent("solarized-light");
    expect(document.documentElement.getAttribute("data-theme-id")).toBe("solarized-light");
  });

  it("falls back to the default focused theme when initial id is unknown", () => {
    render(
      <FocusedThemeProvider initialThemeId="this-id-does-not-exist">
        <Probe />
      </FocusedThemeProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("tokyo-night");
  });
});
