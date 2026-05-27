import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getCatalogThemeById } from "../data/fixtures";
import { ThemeDetail } from "./ThemeDetail";

const auroraLight = getCatalogThemeById("aurora-light");
const auroraDark = getCatalogThemeById("aurora-dark");

if (!auroraLight || !auroraDark) {
  throw new Error("Expected Aurora fixture catalog entries to exist.");
}

describe("ThemeDetail", () => {
  it("renders metadata, full preview tabs, and primary actions", () => {
    render(<ThemeDetail entry={auroraDark} />);

    expect(screen.getByRole("region", { name: /aurora dark details/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Aurora Dark" })).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: /preview surfaces/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pin dark/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /pin light/i })).toBeDisabled();
    expect(screen.getByRole("link", { name: /edit in lab/i })).toHaveAttribute(
      "href",
      "/lab?from=aurora-dark",
    );
    expect(screen.getByRole("link", { name: /download json/i })).toHaveAttribute(
      "download",
      "aurora-dark.json",
    );
  });

  it("copies export-clean theme JSON", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<ThemeDetail entry={auroraLight} />);

    await user.click(screen.getByRole("button", { name: /copy json/i }));

    expect(writeText).toHaveBeenCalledOnce();
    const payload = writeText.mock.calls[0]?.[0] as string;
    expect(JSON.parse(payload)).toMatchObject({
      id: "aurora-light",
      name: "Aurora Light",
      type: "light",
    });
    expect(payload).not.toContain("pairGroup");
  });
});
