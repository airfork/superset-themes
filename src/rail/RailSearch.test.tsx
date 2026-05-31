// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RailSearch } from "./RailSearch";

describe("RailSearch", () => {
  it("renders the current value", () => {
    render(<RailSearch value="dracula" onChange={() => {}} />);
    expect(screen.getByRole("textbox", { name: /filter by name/i })).toHaveValue("dracula");
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RailSearch value="" onChange={onChange} />);

    await user.type(screen.getByRole("textbox", { name: /filter by name/i }), "x");
    expect(onChange).toHaveBeenCalledWith("x");
  });

  it("labels the input 'Filter by name' to set it apart from the ⌘K palette", () => {
    render(<RailSearch value="" onChange={() => {}} />);
    const input = screen.getByRole("textbox", { name: /filter by name/i });
    expect(input).toHaveAttribute("placeholder", "Filter by name");
  });
});
