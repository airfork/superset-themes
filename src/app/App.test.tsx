import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

beforeAll(() => {
  window.scrollTo = vi.fn();
});

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  // applyTheme writes data-theme-id/type on documentElement; clear it so the
  // first-paint seed in one test never leaks into the next.
  document.documentElement.removeAttribute("data-theme-id");
  document.documentElement.removeAttribute("data-theme-type");
});

describe("App", () => {
  it("renders the master/detail shell on the catalog route", async () => {
    render(<App />);

    expect(await screen.findByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /themes/i })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/Tokyo Night/);
  });

  it("hydrates the focused theme from the ?theme= search param", async () => {
    window.history.replaceState(null, "", "/?theme=solarized-light");

    render(<App />);

    expect(await screen.findByRole("heading", { name: /solarized light/i })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/Solarized Light/);
  });

  it("renders compare mode from a deep link with the baseline and candidate slots", async () => {
    window.history.replaceState(null, "", "/compare?a=aurora-light&b=aurora-dark&scene=workspace");

    render(<App />);

    expect(
      await screen.findByRole("region", { name: /baseline: aurora light/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /comparing: aurora dark/i })).toBeInTheDocument();
    // The chrome follows the baseline (slot A), so the document theme is aurora light.
    await waitFor(() =>
      expect(document.documentElement).toHaveAttribute("data-theme-id", "aurora-light"),
    );
    // The bottom bar reflects both compared slots.
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent(/aurora light/i);
    expect(footer).toHaveTextContent(/aurora dark/i);
  });

  it("opens the keyboard shortcuts dialog when ? is pressed on the catalog", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("banner");

    await user.keyboard("?");
    const dialog = await screen.findByRole("dialog", { name: /keyboard shortcuts/i });
    expect(dialog).toHaveTextContent(/pin the focused theme to compare/i);
  });

  it("opens shortcuts from the bottom-bar trigger and closes them on Escape", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("banner");

    await user.click(screen.getByRole("button", { name: /keyboard shortcuts/i }));
    expect(await screen.findByRole("dialog", { name: /keyboard shortcuts/i })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: /keyboard shortcuts/i })).not.toBeInTheDocument();
  });

  it("does not render the pin shortcut as a stray palette glyph", async () => {
    render(<App />);
    await screen.findByRole("banner");

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    const pinOption = await screen.findByRole("option", { name: /pin to compare/i });
    expect(within(pinOption).queryByText(".")).not.toBeInTheDocument();
  });

  it("renders the lab on the shared shell from catalog theme search params", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/lab?from=aurora-dark");

    render(<App />);

    // Wait on the lab-only source select so the assertion can't latch onto a
    // transient catalog tree the router renders mid-navigation.
    const select = await screen.findByRole("combobox", { name: /start from catalog theme/i });
    expect(select).toHaveValue("aurora-dark");

    // Lab shares the catalog shell: a Themes rail plus the focused-theme bottom bar.
    expect(screen.getByRole("complementary", { name: /themes/i })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/aurora dark/i);

    await user.selectOptions(select, "graphite-dark");

    // Reseeding remounts the lab with the new draft, morphing the chrome.
    expect(await screen.findByRole("heading", { name: /graphite dark/i })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/graphite dark/i);
  });
});
